const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Dish extends Model {}

Dish.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  windowId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Windows',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('tags');
      return rawValue ? rawValue.split(',') : [];
    },
    set(val) {
      this.setDataValue('tags', val.join(','));
    }
  },
  status: {
    type: DataTypes.ENUM('available', 'sold_out', 'off_shelf'),
    defaultValue: 'available'
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  dailyLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '每日限量'
  },
  remainingQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '当日剩余数量'
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
  modelName: 'Dish',
  indexes: [
    {
      name: 'idx_dish_window',
      fields: ['windowId']
    },
    {
      name: 'idx_dish_category',
      fields: ['category']
    },
    {
      name: 'idx_dish_status',
      fields: ['status']
    }
  ]
});

module.exports = Dish;