const jwt = require('jsonwebtoken');

// Middleware to check if the user is authenticated
const auth = async (req, res, next) => {
   
    // First check request headers has authorization or not 
    const authorization = req.headers.authorization;
    if(!authorization) return res.status(401).json({message : 'Token Not Found'});

    // Extract the jwt token from the request headers
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({message : 'Unauthorized'});
    try {
         //Verify the JWT token
        const decoded = jwt.verify(token,process.env.JWT_SECRETKEY)

        // Attetch user info to the req obj
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({message : 'Invailid token'})
    }
};



module.exports = { auth };  
