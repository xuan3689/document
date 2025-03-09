const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Canteen extends Model {}

Canteen.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  openTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  closeTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('open', 'closed', 'maintenance'),
    defaultValue: 'closed'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  averageRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
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
  modelName: 'Canteen',
  indexes: [
    {
      name: 'idx_canteen_status',
      fields: ['status']
    }
  ]
});

module.exports = Canteen;