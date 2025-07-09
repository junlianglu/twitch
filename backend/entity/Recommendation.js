const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const User = require('./User');
const Video = require('./Video');

const Recommendation = sequelize.define('Recommendation', {
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
  score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 1,
    },
  },
  algorithm: {
    type: DataTypes.STRING, // 'collaborative', 'content-based', 'hybrid'
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING, // 'similar to watched', 'trending', 'category match'
  },
  position: {
    type: DataTypes.INTEGER, // position in recommendation list
  },
  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  expiresAt: {
    type: DataTypes.DATE, // when recommendation becomes stale
  },
});

// Define associations
Recommendation.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Recommendation.belongsTo(Video, { foreignKey: 'videoId', as: 'video' });

User.hasMany(Recommendation, { foreignKey: 'userId', as: 'recommendations' });
Video.hasMany(Recommendation, { foreignKey: 'videoId', as: 'recommendedTo' });

module.exports = Recommendation; 