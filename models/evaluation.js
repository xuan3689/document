const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Evaluation extends Model {}

Evaluation.init({
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
    type: DataTypes.ENUM('canteen', 'window', 'dish'),
    allowNull: false
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  images: {
    type: DataTypes.STRING,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('images');
      return rawValue ? rawValue.split(',') : [];
    },
    set(val) {
      this.setDataValue('images', val.join(','));
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
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
  modelName: 'Evaluation',
  indexes: [
    {
      name: 'idx_evaluation_user',
      fields: ['userId']
    },
    {
      name: 'idx_evaluation_target',
      fields: ['targetType', 'targetId']
    }
  ]
});

module.exports = Evaluation;