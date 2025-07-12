const Video = require('../entity/Video');
const Channel = require('../entity/Channel');
const UserWatchHistory = require('../entity/UserWatchHistory');
const { Op } = require('sequelize');

// Get all videos with filtering and pagination
async function getAllVideos(options = {}) {
  const { 
    status, 
    channelId, 
    category, 
    limit = 20, 
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'DESC'
  } = options;
  
  const where = {};
  if (status) where.status = status;
  if (channelId) where.channelId = channelId;
  if (category) where.category = category;
  
  return await Video.findAll({
    where,
    include: [{
      model: Channel,
      as: 'channel',
      attributes: ['id', 'name', 'description']
    }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [[sortBy, sortOrder]]
  });
}

// Get video by ID with channel information
async function getVideoById(id) {
  return await Video.findByPk(id, {
    include: [{
      model: Channel,
      as: 'channel',
      attributes: ['id', 'name', 'description']
    }]
  });
}

// Create a new video
async function createVideo(data) {
  // Verify channel exists
  const channel = await Channel.findByPk(data.channelId);
  if (!channel) {
    throw new Error('Channel not found');
  }
  
  return await Video.create(data);
}

// Update video
async function updateVideo(id, data) {
  const video = await Video.findByPk(id);
  if (!video) return null;
  
  // If channelId is being updated, verify the channel exists
  if (data.channelId) {
    const channel = await Channel.findByPk(data.channelId);
    if (!channel) {
      throw new Error('Channel not found');
    }
  }
  
  return await video.update(data);
}

// Delete video
async function deleteVideo(id) {
  const video = await Video.findByPk(id);
  if (!video) return null;
  await video.destroy();
  return true;
}

// Increment video views
async function incrementViews(id) {
  const video = await Video.findByPk(id);
  if (!video) return null;
  
  video.views += 1;
  return await video.save();
}

// Like/unlike video
async function toggleLike(id, userId, action) {
  const video = await Video.findByPk(id);
  if (!video) return null;
  
  if (action === 'like') {
    video.likes += 1;
  } else if (action === 'unlike') {
    video.likes = Math.max(0, video.likes - 1);
  } else if (action === 'dislike') {
    video.dislikes += 1;
  } else if (action === 'undislike') {
    video.dislikes = Math.max(0, video.dislikes - 1);
  }
  
  return await video.save();
}

// Search videos by title or description
async function searchVideos(query, options = {}) {
  const { limit = 20, offset = 0 } = options;
  
  return await Video.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } }
      ],
      status: 'public'
    },
    include: [{
      model: Channel,
      as: 'channel',
      attributes: ['id', 'name', 'description']
    }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['views', 'DESC'], ['createdAt', 'DESC']]
  });
}

// Get videos by channel
async function getVideosByChannel(channelId, options = {}) {
  const { limit = 20, offset = 0, status = 'public' } = options;
  
  return await Video.findAll({
    where: { 
      channelId,
      status 
    },
    include: [{
      model: Channel,
      as: 'channel',
      attributes: ['id', 'name', 'description']
    }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']]
  });
}

// Get trending videos
async function getTrendingVideos(limit = 10) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return await Video.findAll({
    where: {
      createdAt: { [Op.gte]: oneWeekAgo },
      status: 'public'
    },
    include: [{
      model: Channel,
      as: 'channel',
      attributes: ['id', 'name', 'description']
    }],
    order: [['views', 'DESC'], ['likes', 'DESC']],
    limit: parseInt(limit)
  });
}

// Get videos by category
async function getVideosByCategory(category, options = {}) {
  const { limit = 20, offset = 0 } = options;
  
  return await Video.findAll({
    where: { 
      category,
      status: 'public'
    },
    include: [{
      model: Channel,
      as: 'channel',
      attributes: ['id', 'name', 'description']
    }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['views', 'DESC'], ['createdAt', 'DESC']]
  });
}

// Get user's watched videos
async function getUserWatchedVideos(userId, options = {}) {
  const { limit = 20, offset = 0 } = options;
  
  return await UserWatchHistory.findAll({
    where: { userId },
    include: [{
      model: Video,
      as: 'video',
      include: [{
        model: Channel,
        as: 'channel',
        attributes: ['id', 'name', 'description']
      }]
    }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['watchedAt', 'DESC']]
  });
}

// Get video statistics
async function getVideoStats(videoId) {
  const video = await Video.findByPk(videoId);
  if (!video) return null;
  
  const watchHistory = await UserWatchHistory.findAll({
    where: { videoId }
  });
  
  const totalWatchTime = watchHistory.reduce((sum, entry) => sum + entry.watchTime, 0);
  const averageWatchTime = watchHistory.length > 0 ? totalWatchTime / watchHistory.length : 0;
  const completionRate = watchHistory.filter(entry => entry.completed).length / watchHistory.length;
  
  return {
    videoId,
    views: video.views,
    likes: video.likes,
    dislikes: video.dislikes,
    totalWatchTime,
    averageWatchTime,
    completionRate,
    totalWatchers: watchHistory.length
  };
}

module.exports = {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  incrementViews,
  toggleLike,
  searchVideos,
  getVideosByChannel,
  getTrendingVideos,
  getVideosByCategory,
  getUserWatchedVideos,
  getVideoStats
}; 