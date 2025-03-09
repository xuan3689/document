const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME || 'canteen_db', 
                               process.env.DB_USER || 'root', 
                               process.env.DB_PASSWORD || 'password', {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

module.exports = sequelize;