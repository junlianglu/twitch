// utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Token expiration time (e.g., 1 hour)
const TOKEN_EXPIRY = '1h';

/**
 * Generates a JWT token for the given payload.
 * @param {Object} payload - Data to encode in the token (e.g., user ID).
 * @returns {string} - Signed JWT token.
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * @param {string} token - JWT token to verify.
 * @returns {Object} - Decoded payload if valid.
 * @throws {Error} - If token is invalid or expired.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Middleware-style function to decode token without throwing.
 * @param {string} token - JWT token to decode.
 * @returns {Object|null} - Decoded payload or null if invalid.
 */
function decodeToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};