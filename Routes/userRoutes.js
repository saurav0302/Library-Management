const express = require('express');
const router = express.Router();
const User = require('../Model/user');

const {generateToken, auth} = require('../middleware/jwt');


// Sign up the User 
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        // directly use the creat method so this is do save it also so we dont do the create new user and then save
        const user = (await User.create(data)); 

        const payload = { userId: user._id, role: user.userRole };
        const token = generateToken(payload);
        res.cookie('token', token, { httpOnly: true, secure: true });
        res.status(201).json({user,token});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login the User 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid Email' });
        }
        if (!(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid Password' });
        }
        const payload = { userId: user._id , role: user.userRole};
        const token = generateToken(payload);
        res.cookie('token', token, { httpOnly: true, secure: true });
        res.status(200).json({token: token});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});






module.exports = router;


