const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class History extends Model {}

History.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  targetType: {
    type: DataTypes.ENUM('dish', 'window', 'canteen'),
    allowNull: false
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  lastViewedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'History',
  indexes: [
    {
      name: 'idx_history_user',
      fields: ['userId']
    },
    {
      name: 'idx_history_target',
      fields: ['targetType', 'targetId']
    },
    {
      name: 'idx_history_last_viewed',
      fields: ['lastViewedAt']
    }
  ]
});

module.exports = History;