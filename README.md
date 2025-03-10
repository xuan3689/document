# 校园食堂小程序后端服务

## 项目简介

本项目是一个基于Node.js和微信小程序的校园食堂就餐系统，旨在为校园师生提供便捷的食堂就餐体验。通过本系统，用户可以查看食堂信息、窗口状态、菜品详情，进行评价等操作。

## 功能特点

- 🏢 **食堂管理**：支持多个食堂的信息管理，包括位置、营业时间、座位情况等
- 🪟 **窗口管理**：展示各个窗口的实时状态、排队情况和等待时间
- 🍜 **菜品管理**：提供丰富的菜品信息，包括价格、库存和分类等
- 👤 **用户系统**：支持手机号注册登录，微信一键登录
- ⭐ **评价系统**：用户可对食堂、窗口和菜品进行评分和评价
- 📊 **实时数据**：展示实时排队长度、剩余座位等信息

## 技术栈

- **后端框架**：Express.js
- **数据库**：MySQL
- **ORM**：Sequelize
- **认证**：JWT + bcrypt
- **API**：RESTful API
- **前端**：微信小程序

## 快速开始

### 环境要求

- Node.js >= 14
- MySQL >= 5.7
- 微信开发者工具

### 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd canteen-miniprogram
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
- 复制 `.env.example` 为 `.env`
- 修改数据库配置和其他必要设置

4. 初始化数据库
```bash
node scripts/init-db.js
```

5. 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

### 小程序配置

1. 使用微信开发者工具打开 `miniprogram` 目录
2. 配置小程序的 AppID
3. 修改 `miniprogram/config.js` 中的服务器地址

## API 文档

### 用户相关
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- GET /api/auth/profile - 获取用户信息

### 食堂相关
- GET /api/canteens - 获取食堂列表
- GET /api/canteens/:id - 获取食堂详情

### 窗口相关
- GET /api/windows - 获取窗口列表
- GET /api/windows/:id - 获取窗口详情

### 菜品相关
- GET /api/dishes - 获取菜品列表
- GET /api/dishes/:id - 获取菜品详情

## 项目结构

```
├── config/          # 配置文件
├── middleware/      # 中间件
├── models/          # 数据模型
├── routes/          # 路由控制器
├── scripts/         # 脚本文件
├── miniprogram/     # 小程序代码
└── app.js          # 应用入口
```

## 贡献指南

1. Fork 本仓库
2. 创建新的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 开源协议

本项目采用 MIT 协议开源，详见 [LICENSE](./LICENSE) 文件。

## 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。