const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
    const auth = req.headers['authorization'];
    
    console.log('Auth Header:', auth); // Debug log
    
    if (!auth) {
        return res.status(403).json({ 
            message: 'Unauthorized, JWT token is required',
            success: false 
        });
    }
    
    try {
        const token = auth.split(' ')[1]; // Extract token from "Bearer TOKEN"
        console.log('Token:', token); // Debug log
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded:', decoded); // Debug log
        
        req.user = decoded;
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        return res.status(403).json({ 
            message: 'Unauthorized, JWT token is invalid or expired',
            success: false 
        });
    }
};

module.exports = ensureAuthenticated;
