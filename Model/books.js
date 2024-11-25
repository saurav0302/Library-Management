const mongoose = require('mongoose');

// Define the Book Schema
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Fiction', 'Non-Fiction', 'Science', 'Biography', 'Fantasy', 'History', 'Self-Help'], // Enum for book categories
        trim: true
    },
    publicationYear: {
        type: Number,
        required: true
    },
    summary: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the Book model
const Book = mongoose.model('BookCatelog', bookSchema);

// Export the Book model
module.exports = Book;
