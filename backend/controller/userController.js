const userService = require('../service/userService');
const { asyncHandler, ValidationError, AuthenticationError, NotFoundError, ConflictError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

// User registration
const register = asyncHandler(async (req, res) => {
  const { username, email, password, displayName } = req.body;
  
  // Validate required fields
  if (!username || !email || !password || !displayName) {
    throw new ValidationError('Username, email, password, and displayName are required');
  }
  
  logger.info({
    message: 'User registration attempt',
    username,
    email,
    ip: req.ip,
  });
  
  const user = await userService.registerUser({ username, email, password, displayName });
  
  logger.info({
    message: 'User registered successfully',
    userId: user.id,
    username: user.username,
  });
  
  res.status(201).json({ 
    success: true,
    message: 'User registered successfully', 
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt
    }
  });
});

// User login
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  // Validate required fields
  if (!username || !password) {
    throw new ValidationError('Username and password are required');
  }
  
  logger.info({
    message: 'User login attempt',
    username,
    ip: req.ip,
  });
  
  const result = await userService.loginUser({ username, password });
  
  logger.info({
    message: 'User login successful',
    userId: result.user.id,
    username: result.user.username,
  });
  
  res.json({ 
    success: true,
    message: 'Login successful', 
    ...result 
  });
});

// Get user profile
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id; // From auth middleware
  
  logger.debug({
    message: 'Profile request',
    userId,
    ip: req.ip,
  });
  
  const user = await userService.getUserById(userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;
  
  // Remove sensitive fields that shouldn't be updated via this endpoint
  delete updateData.id;
  delete updateData.username;
  delete updateData.email;
  
  logger.info({
    message: 'Profile update attempt',
    userId,
    updateFields: Object.keys(updateData),
    ip: req.ip,
  });
  
  const user = await userService.updateUserProfile(userId, updateData);
  
  logger.info({
    message: 'Profile updated successfully',
    userId,
    updateFields: Object.keys(updateData),
  });
  
  res.json({ 
    success: true,
    message: 'Profile updated successfully', 
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      preferences: user.preferences,
      updatedAt: user.updatedAt
    }
  });
});

// Update user preferences
const updatePreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const preferences = req.body;
  
  logger.info({
    message: 'Preferences update attempt',
    userId,
    preferenceKeys: Object.keys(preferences),
    ip: req.ip,
  });
  
  const user = await userService.updateUserPreferences(userId, preferences);
  
  logger.info({
    message: 'Preferences updated successfully',
    userId,
    preferenceKeys: Object.keys(preferences),
  });
  
  res.json({ 
    success: true,
    message: 'Preferences updated successfully', 
    user: {
      id: user.id,
      preferences: user.preferences,
      updatedAt: user.updatedAt
    }
  });
});

// Get user watch history
const getWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 20, offset = 0 } = req.query;
  
  logger.debug({
    message: 'Watch history request',
    userId,
    limit,
    offset,
    ip: req.ip,
  });
  
  const history = await userService.getUserWatchHistory(userId, { limit, offset });
  
  res.json({
    success: true,
    history: history.rows,
    pagination: {
      total: history.count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < history.count
    }
  });
});

// Add watch history entry
const addWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { videoId, watchTime, watchPercentage, completed, liked } = req.body;
  
  // Validate required fields
  if (!videoId || watchTime === undefined) {
    throw new ValidationError('VideoId and watchTime are required');
  }
  
  logger.debug({
    message: 'Watch history entry added',
    userId,
    videoId,
    watchTime,
    watchPercentage,
    completed,
    liked,
    ip: req.ip,
  });
  
  const historyEntry = await userService.addWatchHistory(userId, videoId, {
    watchTime,
    watchPercentage,
    completed,
    liked
  });
  
  res.status(201).json({ 
    success: true,
    message: 'Watch history updated', 
    entry: historyEntry 
  });
});

// Verify token (for testing)
const verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    throw new ValidationError('Token is required');
  }
  
  logger.debug({
    message: 'Token verification attempt',
    ip: req.ip,
  });
  
  const user = await userService.verifyToken(token);
  
  res.json({ 
    success: true,
    message: 'Token is valid', 
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName
    }
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  updatePreferences,
  getWatchHistory,
  addWatchHistory,
  verifyToken
};
