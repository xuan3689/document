const sequelize = require('../config/database');
const Canteen = require('../models/canteen');
const Window = require('../models/window');
const Dish = require('../models/dish');

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

    // 创建示例菜品数据
    const window1 = await Window.findOne({ where: { name: '川湘风味' } });
    const window2 = await Window.findOne({ where: { name: '粤式炒饭' } });
    const window3 = await Window.findOne({ where: { name: '面食坊' } });

    // 川湘风味窗口的菜品
    await Dish.create({
      windowId: window1.id,
      name: '麻婆豆腐',
      price: 12.00,
      description: '经典川菜，麻辣鲜香',
      category: '川菜',
      imageUrl: 'https://example.com/dishes/mapo-tofu.jpg',
      status: 'available',
      remainingQuantity: 50
    });

    await Dish.create({
      windowId: window1.id,
      name: '剁椒鱼头',
      price: 38.00,
      description: '湖南特色菜，鲜辣可口',
      category: '湘菜',
      imageUrl: 'https://example.com/dishes/fish-head.jpg',
      status: 'available',
      remainingQuantity: 20
    });

    // 粤式炒饭窗口的菜品
    await Dish.create({
      windowId: window2.id,
      name: '扬州炒饭',
      price: 15.00,
      description: '经典粤式炒饭，配料丰富',
      category: '主食',
      imageUrl: 'https://example.com/dishes/yangzhou-rice.jpg',
      status: 'available',
      remainingQuantity: 100
    });

    await Dish.create({
      windowId: window2.id,
      name: '叉烧饭',
      price: 18.00,
      description: '香甜可口的叉烧配上喷香米饭',
      category: '主食',
      imageUrl: 'https://example.com/dishes/char-siu-rice.jpg',
      status: 'available',
      remainingQuantity: 80
    });

    // 面食坊窗口的菜品
    await Dish.create({
      windowId: window3.id,
      name: '牛肉拉面',
      price: 16.00,
      description: '手工拉面配上鲜美牛肉',
      category: '面食',
      imageUrl: 'https://example.com/dishes/beef-noodles.jpg',
      status: 'available',
      remainingQuantity: 60
    });

    await Dish.create({
      windowId: window3.id,
      name: '炸酱面',
      price: 14.00,
      description: '传统北方炸酱面，浓香可口',
      category: '面食',
      imageUrl: 'https://example.com/dishes/zhajiang-noodles.jpg',
      status: 'available',
      remainingQuantity: 70
    });

    console.log('示例数据创建成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

initializeDatabase();