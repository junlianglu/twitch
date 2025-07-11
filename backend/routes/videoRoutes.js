const express = require('express');
const router = express.Router();
const videoController = require('../controller/videoController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/', videoController.getAllVideos);
router.get('/search', videoController.searchVideos);
router.get('/trending', videoController.getTrendingVideos);
router.get('/category/:category', videoController.getVideosByCategory);
router.get('/channel/:channelId', videoController.getVideosByChannel);
router.get('/:id', videoController.getVideoById);
router.get('/:id/stats', videoController.getVideoStats);

// Protected routes (authentication required)
router.post('/', authMiddleware, videoController.createVideo);
router.put('/:id', authMiddleware, videoController.updateVideo);
router.delete('/:id', authMiddleware, videoController.deleteVideo);
router.post('/:id/views', videoController.incrementViews); // Public for view tracking
router.post('/:id/like', authMiddleware, videoController.toggleLike);
router.get('/user/watched', authMiddleware, videoController.getUserWatchedVideos);

// Recommendation routes (authentication required)
router.get('/recommendations', authMiddleware, videoController.getRecommendations);
router.get('/user/recommendations', authMiddleware, videoController.getUserRecommendations);

module.exports = router; 