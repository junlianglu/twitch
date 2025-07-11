const express = require('express');
const router = express.Router();
const recommendationController = require('../controller/recommendationController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/trending', recommendationController.getTrendingVideos);

// Protected routes (authentication required)
router.get('/', authMiddleware, recommendationController.getRecommendations);
router.get('/user', authMiddleware, recommendationController.getUserRecommendations);
router.get('/content-based', authMiddleware, recommendationController.getContentBasedRecommendations);
router.get('/collaborative', authMiddleware, recommendationController.getCollaborativeRecommendations);
router.get('/hybrid', authMiddleware, recommendationController.getHybridRecommendations);
router.get('/analytics', authMiddleware, recommendationController.getRecommendationAnalytics);
router.get('/performance', authMiddleware, recommendationController.getRecommendationPerformance);
router.put('/preferences', authMiddleware, recommendationController.updateRecommendationPreferences);

module.exports = router; 