// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const { decodeToken } = require('../utils/jwtUtils');

/**
 * Middleware to protect routes and verify JWT tokens from Authorization headers.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = decodeToken(token);

  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // Attach decoded user data to request for use in controllers
  req.user = decoded;
  next();
}

module.exports = authenticateToken;