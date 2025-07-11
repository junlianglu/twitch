const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const Channel = require('./Channel');
const User = require('./User');

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in seconds
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  dislikes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('public', 'private', 'unlisted'),
    defaultValue: 'public',
  },
  channelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Channels',
      key: 'id',
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Define associations
Video.belongsTo(Channel, { foreignKey: 'channelId', as: 'channel' });
Channel.hasMany(Video, { foreignKey: 'channelId', as: 'videos' });

// Many-to-many relationship for recommendations
Video.belongsToMany(User, { 
  through: 'UserWatchHistory', 
  foreignKey: 'videoId', 
  as: 'viewers' 
});
User.belongsToMany(Video, { 
  through: 'UserWatchHistory', 
  foreignKey: 'userId', 
  as: 'watchedVideos' 
});

module.exports = Video; 