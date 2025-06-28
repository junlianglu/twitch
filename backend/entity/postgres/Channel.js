const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/sequelize');

const Channel = sequelize.define('Channel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
});

module.exports = Channel;
