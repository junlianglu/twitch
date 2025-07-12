const User = require('../entity/User');
const Video = require('../entity/Video');
const UserWatchHistory = require('../entity/UserWatchHistory');
const Recommendation = require('../entity/Recommendation');
const { Op } = require('sequelize');

// Get personalized video recommendations for a user
async function getRecommendations(userId, options = {}) {
  const { limit = 20, algorithm = 'hybrid' } = options;
  
  try {
    // Get user preferences
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    let recommendedVideos = [];
    
    switch (algorithm) {
      case 'content-based':
        recommendedVideos = await getContentBasedRecommendations(user, limit);
        break;
      case 'collaborative':
        recommendedVideos = await getCollaborativeRecommendations(userId, limit);
        break;
      case 'hybrid':
      default:
        recommendedVideos = await getHybridRecommendations(user, userId, limit);
        break;
    }
    
    // Store recommendations for tracking
    await storeRecommendations(userId, recommendedVideos, algorithm);
    
    return recommendedVideos;
  } catch (error) {
    throw error;
  }
}

// Content-based filtering based on user preferences and watch history
async function getContentBasedRecommendations(user, limit) {
  const userPreferences = user.preferredCategories || [];
  const userLanguages = user.preferredLanguages || [];
  
  // Get videos that match user preferences
  const whereClause = {
    status: 'public'
  };
  
  // Add category filter if user has preferences
  if (userPreferences.length > 0) {
    whereClause.category = { [Op.in]: userPreferences };
  }
  
  // Add language filter if user has preferences
  if (userLanguages.length > 0) {
    whereClause.language = { [Op.in]: userLanguages };
  }
  
  const videos = await Video.findAll({
    where: whereClause,
    include: [{
      model: require('../entity/Channel'),
      as: 'channel',
      attributes: ['id', 'name', 'description']
    }],
    order: [['views', 'DESC'], ['createdAt', 'DESC']],
    limit: limit
  });
  
  return videos;
}

// Collaborative filtering based on similar users
async function getCollaborativeRecommendations(userId, limit) {
  // Get users with similar watch history
  const similarUsers = await UserWatchHistory.findAll({
    where: { userId: { [Op.ne]: userId } },
    attributes: ['userId'],
    include: [{
      model: Video,
      as: 'video',
      where: { status: 'public' }
    }],
    group: ['userId'],
    order: [[require('sequelize').fn('COUNT', require('sequelize').col('videoId')), 'DESC']],
    limit: 10
  });
  
  const similarUserIds = similarUsers.map(entry => entry.userId);
  
  // Get videos watched by similar users that current user hasn't watched
  const recommendedVideos = await Video.findAll({
    include: [{
      model: UserWatchHistory,
      as: 'viewers',
      where: { 
        userId: { [Op.in]: similarUserIds },
        userId: { [Op.ne]: userId }
      },
      required: true
    }, {
      model: require('../entity/Channel'),
      as: 'channel',
      attributes: ['id', 'name', 'description']
    }],
    where: { status: 'public' },
    order: [['views', 'DESC']],
    limit: limit
  });
  
  return recommendedVideos;
}

// Hybrid approach combining content-based and collaborative filtering
async function getHybridRecommendations(user, userId, limit) {
  const contentBased = await getContentBasedRecommendations(user, Math.ceil(limit * 0.6));
  const collaborative = await getCollaborativeRecommendations(userId, Math.ceil(limit * 0.4));
  
  // Combine and deduplicate
  const allVideos = [...contentBased, ...collaborative];
  const uniqueVideos = allVideos.filter((video, index, self) => 
    index === self.findIndex(v => v.id === video.id)
  );
  
  return uniqueVideos.slice(0, limit);
}

// Store recommendations for tracking and analytics
async function storeRecommendations(userId, videos, algorithm) {
  const recommendations = videos.map((video, index) => ({
    userId,
    videoId: video.id,
    score: 1 - (index / videos.length), // Simple scoring based on position
    algorithm,
    reason: `Recommended via ${algorithm} filtering`,
    position: index + 1,
    generatedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }));
  
  // Clear old recommendations for this user
  await Recommendation.destroy({
    where: { 
      userId,
      algorithm,
      expiresAt: { [Op.lt]: new Date() }
    }
  });
  
  // Store new recommendations
  await Recommendation.bulkCreate(recommendations);
}

// Get trending videos (not personalized)
async function getTrendingVideos(limit = 20) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return await Video.findAll({
    where: {
      status: 'public',
      createdAt: { [Op.gte]: oneWeekAgo }
    },
    include: [{
      model: require('../entity/Channel'),
      as: 'channel',
      attributes: ['id', 'name', 'description']
    }],
    order: [['views', 'DESC'], ['likes', 'DESC']],
    limit: limit
  });
}

// Get user's recent recommendations
async function getUserRecommendations(userId, limit = 20) {
  return await Recommendation.findAll({
    where: { 
      userId,
      expiresAt: { [Op.gt]: new Date() }
    },
    include: [{
      model: Video,
      as: 'video',
      include: [{
        model: require('../entity/Channel'),
        as: 'channel',
        attributes: ['id', 'name', 'description']
      }]
    }],
    order: [['score', 'DESC']],
    limit: limit
  });
}

module.exports = {
  getRecommendations,
  getTrendingVideos,
  getUserRecommendations,
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getHybridRecommendations
}; 