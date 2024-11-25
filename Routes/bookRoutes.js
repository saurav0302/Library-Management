const express = require('express')
const router = express.Router()
const Book = require('./../Model/books')
const User = require('./../Model/user')
const {auth} = require('./../middleware/jwt')
const isLibrarian = require('./../middleware/Librarian')

// Get All Books
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Add the Book Only librarian can access
router.post('/', auth, isLibrarian, async (req, res) => {
    const data = req.body;
    try {
        // i have to create a many books
        const books = await Book.insertMany(data);
        // const book = await Book.create(data);
        res.status(201).json(books);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})
    

// Update the Book only librarian can access
router.put('/:id', auth, isLibrarian, async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const book = await Book.findByIdAndUpdate(id, data, { new: true });
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

// Delete the Book only librarian can access
router.delete('/:id', auth, isLibrarian, async (req, res) => {
    try {
        const id = req.params.id;
        const book = await Book.findByIdAndDelete(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

// Manage book categories and genres
router.get('/categories/:categorytype', auth, async (req, res) => {
    const categories = ['Fiction', 'Non-Fiction', 'Science', 'Biography', 'Fantasy', 'History', 'Self-Help'];
    const categoryType = req.params.categorytype;
    if (categories.includes(categoryType)) {
        const books = await Book.find({ category: categoryType });
        res.json(books);
    } else {
        res.status(400).json({ error: 'Invalid category type' });
    }
})


// Borrow a book and update the book and user
router.post('/borrow/:id', auth, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.userId;

        // Find the book first
        const book = await Book.findById(bookId);
        
        // Check if book exists and is available
        if (!book || book.borrowed) {
            return res.status(400).json({ error: 'Book is not available for borrowing' });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update book status and user borrowedBooks
        book.borrowed = true;
        user.borrowedBooks.push({bookId: book._id, title: book.title});

        // Remove the book from reservedBooks if it's in the list
        const reservedIndex = user.reserveBooks.findIndex(
            (reservedBook) => reservedBook.bookId.equals(book._id)
        );
        if (reservedIndex !== -1) {
            user.reserveBooks.splice(reservedIndex, 1);
        }
        if(user.reserveBooks.includes({bookId: book._id, title: book.title})){
            user.reserveBooks.pull({bookId: book._id, title: book.title});
        }

        await book.save();
        await user.save();

        res.json({ message: 'Book borrowed successfully',
            borrowedBook: {
                bookId: book._id,
                title: book.title
        } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Return a book and update the book and user
router.post('/return/:id', auth, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.userId ;
        
        // Find the book first
        const book = await Book.findById(bookId);
        
        // Check if book exists and is borrowed
        if (!book || !book.borrowed) {
            return res.status(400).json({ error: 'Book is not borrowed' });
        }

        // Find the user    
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update book status and user borrowedBooks        
        book.borrowed = false;
        user.borrowedBooks.pull({bookId: book._id, title: book.title});

        await book.save();        
        await user.save();

        res.json({ message: 'Book returned successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Reserve a book and update the user
router.post('/reserve/:id', auth, async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.userId;

        // Find the book first
        const book = await Book.findById(bookId);

        // Check if book exists and is available
        if (!book) {            
            return res.status(400).json({ error: 'Book is not available for reservation' });
        }

        // Check if book is not buy
        if(!book.borrowed){
            return res.status(400).json({ error: 'You can buy the book no need the reservation' });
        }
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }    

        // Update book status and user reservedBooks
        user.reserveBooks.push({bookId: book._id, title: book.title});

        await book.save();
        await user.save();

        res.json({ message: 'Book reserved successfully',
            reservedBook: {
                bookId: book._id,
                title: book.title
        } });
    } catch (error) {        
        res.status(500).json({ error: error.message });
    }
});

// Return the book details with the search route
router.get('/search', async (req, res) => {
    try {
        const { title, author, category } = req.query;
        const query = {};

        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }

        if (author) {
            query.author = { $regex: author, $options: 'i' };
        }

        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }
        console.log(query);
        const books = await Book.find(query);
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });    
    }
});


// Return the book details with the filter route 
router.get('/filter', async (req, res) => {
    try {
        const { availability } = req.query;
        const query = {};
       
        if (availability === 'true') {
            query.borrowed = false;
        } else if (availability === 'false') {
            query.borrowed = true;
        }
        const books = await Book.find(query);
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export the router
module.exports = router