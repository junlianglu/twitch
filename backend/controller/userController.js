const userService = require('../service/userService');

// User registration
async function register(req, res) {
  try {
    const { username, email, password, displayName } = req.body;
    
    // Validate required fields
    if (!username || !email || !password || !displayName) {
      return res.status(400).json({ 
        error: 'Username, email, password, and displayName are required' 
      });
    }
    
    const user = await userService.registerUser({ username, email, password, displayName });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    if (error.message === 'Username or email already exists') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// User login
async function login(req, res) {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }
    
    const result = await userService.loginUser({ username, password });
    res.json({ message: 'Login successful', ...result });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Get user profile
async function getProfile(req, res) {
  try {
    const userId = req.user.id; // From auth middleware
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update user profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.id;
    delete updateData.username;
    delete updateData.email;
    
    const user = await userService.updateUserProfile(userId, updateData);
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Update user preferences
async function updatePreferences(req, res) {
  try {
    const userId = req.user.id;
    const preferences = req.body;
    
    const user = await userService.updateUserPreferences(userId, preferences);
    res.json({ message: 'Preferences updated successfully', user });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Get user watch history
async function getWatchHistory(req, res) {
  try {
    const userId = req.user.id;
    const { limit, offset } = req.query;
    
    const history = await userService.getUserWatchHistory(userId, { limit, offset });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Add watch history entry
async function addWatchHistory(req, res) {
  try {
    const userId = req.user.id;
    const { videoId, watchTime, watchPercentage, completed, liked } = req.body;
    
    // Validate required fields
    if (!videoId || watchTime === undefined) {
      return res.status(400).json({ 
        error: 'VideoId and watchTime are required' 
      });
    }
    
    const historyEntry = await userService.addWatchHistory(userId, videoId, {
      watchTime,
      watchPercentage,
      completed,
      liked
    });
    
    res.status(201).json({ message: 'Watch history updated', entry: historyEntry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Verify token (for testing)
async function verifyToken(req, res) {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const user = await userService.verifyToken(token);
    res.json({ message: 'Token is valid', user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

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
