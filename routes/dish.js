const express = require('express');
const router = express.Router();
const Dish = require('../models/dish');
const { authenticateToken } = require('../middleware/auth');

// 获取特定窗口的所有菜品
router.get('/window/:windowId', async (req, res) => {
  try {
    const dishes = await Dish.findAll({
      where: { windowId: req.params.windowId },
      attributes: ['id', 'name', 'price', 'description', 'imageUrl', 
                  'category', 'status', 'rating', 'dailyLimit', 'remainingQuantity', 'tags']
    });
    res.json(dishes);
  } catch (error) {
    console.error('获取菜品列表失败:', error);
    res.status(500).json({ message: '获取菜品列表失败' });
  }
});

// 获取特定菜品详情
router.get('/:id', async (req, res) => {
  try {
    const dish = await Dish.findByPk(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: '菜品不存在' });
    }
    res.json(dish);
  } catch (error) {
    console.error('获取菜品详情失败:', error);
    res.status(500).json({ message: '获取菜品详情失败' });
  }
});

// 创建新菜品（需要管理员权限）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      windowId,
      name,
      price,
      description,
      imageUrl,
      category,
      tags,
      dailyLimit
    } = req.body;

    const dish = await Dish.create({
      windowId,
      name,
      price,
      description,
      imageUrl,
      category,
      tags,
      dailyLimit,
      remainingQuantity: dailyLimit
    });

    res.status(201).json({
      message: '菜品创建成功',
      dish
    });
  } catch (error) {
    console.error('创建菜品失败:', error);
    res.status(500).json({ message: '创建菜品失败' });
  }
});

// 更新菜品信息（需要管理员权限）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const dish = await Dish.findByPk(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: '菜品不存在' });
    }

    const updates = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      category: req.body.category,
      tags: req.body.tags,
      status: req.body.status,
      dailyLimit: req.body.dailyLimit,
      remainingQuantity: req.body.remainingQuantity
    };

    await dish.update(updates);
    res.json({ message: '菜品信息更新成功', dish });
  } catch (error) {
    console.error('更新菜品信息失败:', error);
    res.status(500).json({ message: '更新菜品信息失败' });
  }
});

// 更新菜品状态和剩余数量
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, remainingQuantity } = req.body;
    const dish = await Dish.findByPk(req.params.id);

    if (!dish) {
      return res.status(404).json({ message: '菜品不存在' });
    }

    await dish.update({
      status: status || dish.status,
      remainingQuantity: remainingQuantity !== undefined ? remainingQuantity : dish.remainingQuantity
    });

    res.json({
      message: '菜品状态更新成功',
      status: dish.status,
      remainingQuantity: dish.remainingQuantity
    });
  } catch (error) {
    console.error('更新菜品状态失败:', error);
    res.status(500).json({ message: '更新菜品状态失败' });
  }
});

// 删除菜品（需要管理员权限）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const dish = await Dish.findByPk(req.params.id);
    if (!dish) {
      return res.status(404).json({ message: '菜品不存在' });
    }

    await dish.destroy();
    res.json({ message: '菜品删除成功' });
  } catch (error) {
    console.error('删除菜品失败:', error);
    res.status(500).json({ message: '删除菜品失败' });
  }
});

// 按类别获取菜品
router.get('/category/:category', async (req, res) => {
  try {
    const dishes = await Dish.findAll({
      where: { 
        category: req.params.category,
        status: 'available'
      },
      attributes: ['id', 'name', 'price', 'description', 'imageUrl', 
                  'rating', 'remainingQuantity', 'tags']
    });
    res.json(dishes);
  } catch (error) {
    console.error('获取分类菜品失败:', error);
    res.status(500).json({ message: '获取分类菜品失败' });
  }
});

module.exports = router;