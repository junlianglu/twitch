const videoService = require('../service/videoService');
const recommendationService = require('../service/recommendationService');

// Get all videos with filtering and pagination
async function getAllVideos(req, res) {
  try {
    const { 
      status, 
      channelId, 
      category, 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    } = req.query;
    
    const options = { status, channelId, category, limit, offset, sortBy, sortOrder };
    const videos = await videoService.getAllVideos(options);
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get video by ID
async function getVideoById(req, res) {
  try {
    const video = await videoService.getVideoById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Create a new video
async function createVideo(req, res) {
  try {
    const videoData = req.body;
    
    // Validate required fields
    if (!videoData.title || !videoData.videoUrl || !videoData.channelId) {
      return res.status(400).json({ 
        error: 'Title, videoUrl, and channelId are required' 
      });
    }
    
    const video = await videoService.createVideo(videoData);
    res.status(201).json({ message: 'Video created successfully', video });
  } catch (error) {
    if (error.message === 'Channel not found') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Update video
async function updateVideo(req, res) {
  try {
    const videoId = req.params.id;
    const updateData = req.body;
    
    const video = await videoService.updateVideo(videoId, updateData);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({ message: 'Video updated successfully', video });
  } catch (error) {
    if (error.message === 'Channel not found') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Delete video
async function deleteVideo(req, res) {
  try {
    const success = await videoService.deleteVideo(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Increment video views
async function incrementViews(req, res) {
  try {
    const video = await videoService.incrementViews(req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({ message: 'View count updated', views: video.views });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Like/unlike video
async function toggleLike(req, res) {
  try {
    const { action } = req.body;
    const userId = req.user?.id;
    
    if (!action || !['like', 'unlike', 'dislike', 'undislike'].includes(action)) {
      return res.status(400).json({ 
        error: 'Action must be like, unlike, dislike, or undislike' 
      });
    }
    
    const video = await videoService.toggleLike(req.params.id, userId, action);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({ 
      message: `${action} successful`, 
      likes: video.likes, 
      dislikes: video.dislikes 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Search videos
async function searchVideos(req, res) {
  try {
    const { q, limit, offset } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const videos = await videoService.searchVideos(q, { limit, offset });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get videos by channel
async function getVideosByChannel(req, res) {
  try {
    const { channelId } = req.params;
    const { limit, offset, status } = req.query;
    
    const videos = await videoService.getVideosByChannel(channelId, { 
      limit, 
      offset, 
      status 
    });
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get trending videos
async function getTrendingVideos(req, res) {
  try {
    const { limit } = req.query;
    const videos = await videoService.getTrendingVideos(limit);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get videos by category
async function getVideosByCategory(req, res) {
  try {
    const { category } = req.params;
    const { limit, offset } = req.query;
    
    const videos = await videoService.getVideosByCategory(category, { limit, offset });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get user's watched videos
async function getUserWatchedVideos(req, res) {
  try {
    const userId = req.user.id;
    const { limit, offset } = req.query;
    
    const videos = await videoService.getUserWatchedVideos(userId, { limit, offset });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get video statistics
async function getVideoStats(req, res) {
  try {
    const stats = await videoService.getVideoStats(req.params.id);
    
    if (!stats) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get personalized recommendations
async function getRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const { limit, algorithm } = req.query;
    
    const recommendations = await recommendationService.getRecommendations(userId, { 
      limit, 
      algorithm 
    });
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get user's recent recommendations
async function getUserRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const { limit } = req.query;
    
    const recommendations = await recommendationService.getUserRecommendations(userId, limit);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
  getVideoStats,
  getRecommendations,
  getUserRecommendations
}; 