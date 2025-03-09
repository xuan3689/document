require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// 导入路由
const authRoutes = require('./routes/auth');
const canteenRoutes = require('./routes/canteen');
const windowRoutes = require('./routes/window');
const dishRoutes = require('./routes/dish');

// 导入模型
const User = require('./models/user');
const Canteen = require('./models/canteen');
const Window = require('./models/window');
const Dish = require('./models/dish');
const Evaluation = require('./models/evaluation');

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功');
    // 同步数据库模型
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('数据库模型同步成功');
  })
  .catch(err => {
    console.error('数据库连接或同步失败:', err);
  });

// 设置模型关联
Canteen.hasMany(Window, { foreignKey: 'canteenId' });
Window.belongsTo(Canteen, { foreignKey: 'canteenId' });

Window.hasMany(Dish, { foreignKey: 'windowId' });
Dish.belongsTo(Window, { foreignKey: 'windowId' });

User.hasMany(Evaluation, { foreignKey: 'userId' });
Evaluation.belongsTo(User, { foreignKey: 'userId' });

// 路由配置
app.get('/', (req, res) => {
  res.json({ message: '欢迎使用校园食堂就餐小程序API' });
});

// 注册API路由
app.use('/api/auth', authRoutes);
app.use('/api/canteens', canteenRoutes);
app.use('/api/windows', windowRoutes);
app.use('/api/dishes', dishRoutes);

// 处理404错误
app.use((req, res) => {
  res.status(404).json({ message: '请求的资源不存在' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app;