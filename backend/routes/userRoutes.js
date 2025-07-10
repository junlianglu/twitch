const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/verify-token', userController.verifyToken);

// Protected routes (authentication required)
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/preferences', authMiddleware, userController.updatePreferences);
router.get('/watch-history', authMiddleware, userController.getWatchHistory);
router.post('/watch-history', authMiddleware, userController.addWatchHistory);

module.exports = router;
