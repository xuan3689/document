const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Favorite extends Model {}

Favorite.init({
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
  modelName: 'Favorite',
  indexes: [
    {
      name: 'idx_favorite_user',
      fields: ['userId']
    },
    {
      name: 'idx_favorite_target',
      fields: ['targetType', 'targetId']
    },
    {
      unique: true,
      fields: ['userId', 'targetType', 'targetId']
    }
  ]
});

module.exports = Favorite;