// middleware/admin.js

const isLibrarian = (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).json({ message: "Access denied. Admin rights required" });
    }
    next()
};

module.exports = isLibrarian;