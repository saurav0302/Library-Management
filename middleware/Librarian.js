// middleware/Librarian.js

const isLibrarian = (req, res, next) => {
    if (!req.user || req.user.role !== 'Librarian') {
        return res.status(403).json({ message: "Access denied. Librarian rights required" });
    }
    next();
};

module.exports = isLibrarian;