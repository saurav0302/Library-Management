const express = require('express')
const router = express.Router()
const Book = require('./../Model/books')
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
        // const books = await Book.insertMany(data);
        const book = await Book.create(data);
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

// Export the router
module.exports = router