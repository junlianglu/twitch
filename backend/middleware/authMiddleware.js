// middleware/authMiddleware.js

const userService = require('../service/userService');

async function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access token required' 
      });
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token and get user
    const user = await userService.verifyToken(token);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
}

module.exports = authMiddleware;