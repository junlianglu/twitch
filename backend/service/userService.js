const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../entity/User');
const UserWatchHistory = require('../entity/UserWatchHistory');

// User registration
async function registerUser(userData) {
  const { username, email, password, displayName } = userData;
  
  // Check if user already exists
  const existingUser = await User.findOne({
    where: {
      [require('sequelize').Op.or]: [{ username }, { email }]
    }
  });
  
  if (existingUser) {
    throw new Error('Username or email already exists');
  }
  
  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  // Create user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    displayName,
    preferredCategories: [],
    preferredLanguages: [],
    recommendationPreferences: {}
  });
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
}

// User login
async function loginUser(credentials) {
  const { username, password } = credentials;
  
  // Find user by username or email
  const user = await User.findOne({
    where: {
      [require('sequelize').Op.or]: [
        { username },
        { email: username }
      ]
    }
  });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }
  
  // Update last login
  await user.update({ lastLoginAt: new Date() });
  
  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = user.toJSON();
  return { user: userWithoutPassword, token };
}

// Get user by ID
async function getUserById(id) {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
  return user;
}

// Update user profile
async function updateUserProfile(id, updateData) {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Hash password if it's being updated
  if (updateData.password) {
    const saltRounds = 12;
    updateData.password = await bcrypt.hash(updateData.password, saltRounds);
  }
  
  await user.update(updateData);
  
  const { password: _, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
}

// Update user preferences for recommendations
async function updateUserPreferences(id, preferences) {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error('User not found');
  }
  
  const allowedFields = [
    'preferredCategories',
    'preferredLanguages',
    'watchHistoryEnabled',
    'recommendationPreferences'
  ];
  
  const updateData = {};
  allowedFields.forEach(field => {
    if (preferences[field] !== undefined) {
      updateData[field] = preferences[field];
    }
  });
  
  await user.update(updateData);
  
  const { password: _, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
}

// Get user watch history
async function getUserWatchHistory(userId, options = {}) {
  const { limit = 20, offset = 0 } = options;
  
  const history = await UserWatchHistory.findAll({
    where: { userId },
    include: [{
      model: require('../entity/Video'),
      as: 'video',
      include: [{
        model: require('../entity/Channel'),
        as: 'channel',
        attributes: ['id', 'name']
      }]
    }],
    order: [['watchedAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  return history;
}

// Add watch history entry
async function addWatchHistory(userId, videoId, watchData) {
  const { watchTime, watchPercentage, completed, liked } = watchData;
  
  // Check if entry already exists for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingEntry = await UserWatchHistory.findOne({
    where: {
      userId,
      videoId,
      watchedAt: {
        [require('sequelize').Op.gte]: today
      }
    }
  });
  
  if (existingEntry) {
    // Update existing entry
    await existingEntry.update({
      watchTime: Math.max(existingEntry.watchTime, watchTime),
      watchPercentage: Math.max(existingEntry.watchPercentage, watchPercentage),
      completed: existingEntry.completed || completed,
      liked: liked !== undefined ? liked : existingEntry.liked
    });
    return existingEntry;
  } else {
    // Create new entry
    return await UserWatchHistory.create({
      userId,
      videoId,
      watchTime,
      watchPercentage,
      completed,
      liked,
      watchedAt: new Date()
    });
  }
}

// Verify JWT token
async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await getUserById(decoded.userId);
    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
  updateUserPreferences,
  getUserWatchHistory,
  addWatchHistory,
  verifyToken
};
