const recommendationService = require('../service/recommendationService');
const userService = require('../service/userService');

// Get personalized video recommendations
async function getRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const { limit, algorithm, category, language } = req.query;
    
    // Validate algorithm parameter
    const validAlgorithms = ['content-based', 'collaborative', 'hybrid'];
    if (algorithm && !validAlgorithms.includes(algorithm)) {
      return res.status(400).json({ 
        error: 'Invalid algorithm. Must be content-based, collaborative, or hybrid' 
      });
    }
    
    const options = { 
      limit: parseInt(limit) || 20, 
      algorithm: algorithm || 'hybrid',
      category,
      language
    };
    
    const recommendations = await recommendationService.getRecommendations(userId, options);
    
    res.json({
      message: 'Recommendations retrieved successfully',
      algorithm: options.algorithm,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Get trending videos (not personalized)
async function getTrendingVideos(req, res) {
  try {
    const { limit, timeframe } = req.query;
    
    // Validate timeframe parameter
    const validTimeframes = ['day', 'week', 'month'];
    if (timeframe && !validTimeframes.includes(timeframe)) {
      return res.status(400).json({ 
        error: 'Invalid timeframe. Must be day, week, or month' 
      });
    }
    
    const videos = await recommendationService.getTrendingVideos(parseInt(limit) || 10);
    
    res.json({
      message: 'Trending videos retrieved successfully',
      timeframe: timeframe || 'week',
      count: videos.length,
      videos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get user's recent recommendations
async function getUserRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const { limit, algorithm } = req.query;
    
    const recommendations = await recommendationService.getUserRecommendations(
      userId, 
      parseInt(limit) || 20
    );
    
    res.json({
      message: 'User recommendations retrieved successfully',
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get content-based recommendations
async function getContentBasedRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const { limit, category, language } = req.query;
    
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const recommendations = await recommendationService.getContentBasedRecommendations(
      user, 
      parseInt(limit) || 20
    );
    
    res.json({
      message: 'Content-based recommendations retrieved successfully',
      algorithm: 'content-based',
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get collaborative recommendations
async function getCollaborativeRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const { limit } = req.query;
    
    const recommendations = await recommendationService.getCollaborativeRecommendations(
      userId, 
      parseInt(limit) || 20
    );
    
    res.json({
      message: 'Collaborative recommendations retrieved successfully',
      algorithm: 'collaborative',
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get hybrid recommendations
async function getHybridRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const { limit, contentWeight = 0.6 } = req.query;
    
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const recommendations = await recommendationService.getHybridRecommendations(
      user, 
      userId, 
      parseInt(limit) || 20
    );
    
    res.json({
      message: 'Hybrid recommendations retrieved successfully',
      algorithm: 'hybrid',
      contentWeight: parseFloat(contentWeight),
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get recommendation analytics for a user
async function getRecommendationAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const { timeframe = '30' } = req.query; // days
    
    // Get user's recent recommendations
    const recentRecommendations = await recommendationService.getUserRecommendations(userId, 100);
    
    // Calculate analytics
    const analytics = {
      totalRecommendations: recentRecommendations.length,
      algorithmsUsed: {},
      averageScore: 0,
      topCategories: {},
      recommendationFrequency: {}
    };
    
    if (recentRecommendations.length > 0) {
      // Count algorithms used
      recentRecommendations.forEach(rec => {
        const algo = rec.algorithm || 'unknown';
        analytics.algorithmsUsed[algo] = (analytics.algorithmsUsed[algo] || 0) + 1;
      });
      
      // Calculate average score
      const totalScore = recentRecommendations.reduce((sum, rec) => sum + (rec.score || 0), 0);
      analytics.averageScore = totalScore / recentRecommendations.length;
      
      // Get top categories from recommended videos
      const videoCategories = recentRecommendations
        .filter(rec => rec.video && rec.video.category)
        .map(rec => rec.video.category);
      
      videoCategories.forEach(category => {
        analytics.topCategories[category] = (analytics.topCategories[category] || 0) + 1;
      });
      
      // Recommendation frequency by date
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (parseInt(timeframe) * 24 * 60 * 60 * 1000));
      
      const recentRecs = recentRecommendations.filter(rec => 
        new Date(rec.generatedAt) >= thirtyDaysAgo
      );
      
      analytics.recommendationFrequency = {
        total: recentRecs.length,
        averagePerDay: recentRecs.length / parseInt(timeframe)
      };
    }
    
    res.json({
      message: 'Recommendation analytics retrieved successfully',
      timeframe: `${timeframe} days`,
      analytics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update user recommendation preferences
async function updateRecommendationPreferences(req, res) {
  try {
    const userId = req.user.id;
    const preferences = req.body;
    
    // Validate preferences
    const validFields = [
      'preferredCategories',
      'preferredLanguages',
      'watchHistoryEnabled',
      'recommendationPreferences'
    ];
    
    const invalidFields = Object.keys(preferences).filter(field => !validFields.includes(field));
    if (invalidFields.length > 0) {
      return res.status(400).json({ 
        error: `Invalid fields: ${invalidFields.join(', ')}` 
      });
    }
    
    const user = await userService.updateUserPreferences(userId, preferences);
    
    res.json({
      message: 'Recommendation preferences updated successfully',
      user: {
        id: user.id,
        preferredCategories: user.preferredCategories,
        preferredLanguages: user.preferredLanguages,
        watchHistoryEnabled: user.watchHistoryEnabled,
        recommendationPreferences: user.recommendationPreferences
      }
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Get recommendation performance metrics
async function getRecommendationPerformance(req, res) {
  try {
    const userId = req.user.id;
    const { algorithm, timeframe = '7' } = req.query; // days
    
    // Get user's recommendations for the specified algorithm and timeframe
    const recentRecommendations = await recommendationService.getUserRecommendations(userId, 1000);
    
    const now = new Date();
    const daysAgo = new Date(now.getTime() - (parseInt(timeframe) * 24 * 60 * 60 * 1000));
    
    const filteredRecommendations = recentRecommendations.filter(rec => {
      const recDate = new Date(rec.generatedAt);
      return recDate >= daysAgo && (!algorithm || rec.algorithm === algorithm);
    });
    
    // Calculate performance metrics
    const performance = {
      totalRecommendations: filteredRecommendations.length,
      averageScore: 0,
      scoreDistribution: {
        high: 0,    // 0.8-1.0
        medium: 0,  // 0.5-0.79
        low: 0      // 0-0.49
      },
      algorithmBreakdown: {},
      topReasons: {}
    };
    
    if (filteredRecommendations.length > 0) {
      // Calculate average score
      const totalScore = filteredRecommendations.reduce((sum, rec) => sum + (rec.score || 0), 0);
      performance.averageScore = totalScore / filteredRecommendations.length;
      
      // Score distribution
      filteredRecommendations.forEach(rec => {
        const score = rec.score || 0;
        if (score >= 0.8) performance.scoreDistribution.high++;
        else if (score >= 0.5) performance.scoreDistribution.medium++;
        else performance.scoreDistribution.low++;
      });
      
      // Algorithm breakdown
      filteredRecommendations.forEach(rec => {
        const algo = rec.algorithm || 'unknown';
        performance.algorithmBreakdown[algo] = (performance.algorithmBreakdown[algo] || 0) + 1;
      });
      
      // Top recommendation reasons
      filteredRecommendations.forEach(rec => {
        if (rec.reason) {
          performance.topReasons[rec.reason] = (performance.topReasons[rec.reason] || 0) + 1;
        }
      });
    }
    
    res.json({
      message: 'Recommendation performance metrics retrieved successfully',
      timeframe: `${timeframe} days`,
      algorithm: algorithm || 'all',
      performance
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getRecommendations,
  getTrendingVideos,
  getUserRecommendations,
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getHybridRecommendations,
  getRecommendationAnalytics,
  updateRecommendationPreferences,
  getRecommendationPerformance
}; 