const jwt = require('jsonwebtoken');

// Genrate JWT token
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRETKEY, { expiresIn: '1d' });
};

module.exports = { generateToken };