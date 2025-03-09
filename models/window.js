const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Window extends Model {}

Window.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  canteenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Canteens',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'break'),
    defaultValue: 'closed'
  },
  queueLength: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  averageWaitTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '平均等待时间（分钟）'
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  operationHours: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '营业时间，格式：09:00-14:00,16:30-20:00'
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
  modelName: 'Window',
  indexes: [
    {
      name: 'idx_window_canteen',
      fields: ['canteenId']
    },
    {
      name: 'idx_window_status',
      fields: ['status']
    }
  ]
});

module.exports = Window;