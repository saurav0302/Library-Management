const express = require('express')
const router = express.Router()
const User = require('../Model/user');
const isAdmin = require('../middleware/admin');
//const { auth } = require('../middleware/jwt'); by bearer
const { auth} = require('../middleware/jwt-cookies'); // by cookies

// Get all the users
router.get('/users', auth, isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Specific user
router.get('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})  

// Delete the user
router.delete('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: "user deleted successfully"});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// Statistics
router.get('/statistics', auth, isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        const totalUsers = users.length;
        const totalAdmins = users.filter(user => user.userRole === 'Admin').length;
        const totalLibrarians = users.filter(user => user.userRole === 'Librarian').length;
        const totalUsersCount = users.filter(user => user.userRole === 'Library Patron').length;
        res.json({ TotalUsers : totalUsers, Admins: totalAdmins, Librarians : totalLibrarians, LibraryPatrons : totalUsersCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})


module.exports = router
