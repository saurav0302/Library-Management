const express = require('express');
const router = express.Router();
const User = require('../Model/user');
const { generateToken } = require('../utils/genrateTokens');
const { auth} = require('../middleware/jwt');


// Sign up the User 
router.post('/signup', async (req, res) => {
    try {
        const data = req.body;

        // Check if user is trying to sign up as an Admin
        if (data.userRole === 'Admin') {
            const adminUser = await User.findOne({ userRole: 'Admin' });
            if (adminUser) {
                return res.status(400).json({ error: 'An Admin already exists. You cannot sign up as Admin.' });
            }
        }

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


// See the user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update the user profile password
router.put('/profile/password', auth, async (req, res) => {
    try {
        const userID = req.user.userId;
        const{currentPassword, newPassword} = req.body

        // Find user by id 
        const user = await User.findById(userID)

        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error : 'Invalid username and password !'});
        }
        
        user.password = newPassword;
        await user.save();

        res.status(200).json({message:'password is updated!'});

    } catch (error) {
        console.log(error);
        res.status(500).json({error : "Server side issues"});
    }
});






module.exports = router;


