const sequelize = require('../config/database');
const Canteen = require('../models/canteen');
const Window = require('../models/window');

async function initializeDatabase() {
  try {
    // 先删除所有表
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('数据库表创建成功');

    // 创建示例食堂数据
    const canteen1 = await Canteen.create({
      name: '第一食堂',
      location: '校园东区',
      openTime: '07:00',
      closeTime: '20:00',
      imageUrl: 'https://example.com/canteen1.jpg',
      status: 'open',
      description: '校园东区主要食堂，提供多种特色菜品',
      totalSeats: 500,
      availableSeats: 300
    });

    const canteen2 = await Canteen.create({
      name: '第二食堂',
      location: '校园西区',
      openTime: '06:30',
      closeTime: '21:00',
      imageUrl: 'https://example.com/canteen2.jpg',
      status: 'open',
      description: '校园西区主要食堂，环境优美',
      totalSeats: 400,
      availableSeats: 250
    });

    // 创建示例窗口数据
    await Window.create({
      canteenId: canteen1.id,
      name: '川湘风味',
      description: '提供各种川菜湘菜',
      status: 'open',
      queueLength: 5,
      averageWaitTime: 10,
      rating: 4.5,
      imageUrl: 'https://example.com/window1.jpg',
      operationHours: '10:00-19:30'
    });

    await Window.create({
      canteenId: canteen1.id,
      name: '粤式炒饭',
      description: '正宗广东口味',
      status: 'open',
      queueLength: 3,
      averageWaitTime: 5,
      rating: 4.3,
      imageUrl: 'https://example.com/window2.jpg',
      operationHours: '10:30-19:00'
    });

    await Window.create({
      canteenId: canteen2.id,
      name: '面食坊',
      description: '各种特色面食',
      status: 'open',
      queueLength: 8,
      averageWaitTime: 15,
      rating: 4.7,
      imageUrl: 'https://example.com/window3.jpg',
      operationHours: '10:00-20:00'
    });

    console.log('示例数据创建成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

initializeDatabase();