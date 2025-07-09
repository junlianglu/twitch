const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const User = require('./User');
const Video = require('./Video');

const UserWatchHistory = sequelize.define('UserWatchHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  videoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Videos',
      key: 'id',
    },
  },
  watchTime: {
    type: DataTypes.INTEGER, // seconds watched
    allowNull: false,
  },
  watchPercentage: {
    type: DataTypes.FLOAT, // percentage of video watched
    validate: {
      min: 0,
      max: 100,
    },
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  liked: {
    type: DataTypes.BOOLEAN,
    defaultValue: null, // null = no action, true = liked, false = disliked
  },
  watchedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Define associations
UserWatchHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserWatchHistory.belongsTo(Video, { foreignKey: 'videoId', as: 'video' });

User.hasMany(UserWatchHistory, { foreignKey: 'userId', as: 'watchHistory' });
Video.hasMany(UserWatchHistory, { foreignKey: 'videoId', as: 'viewers' });

module.exports = UserWatchHistory; 