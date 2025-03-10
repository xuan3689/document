const express = require('express');
const router = express.Router();
const Favorite = require('../models/favorite');
const History = require('../models/history');
const { authenticateToken } = require('../middleware/auth');

// 添加收藏
router.post('/favorites', authenticateToken, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.user.id;

    const [favorite, created] = await Favorite.findOrCreate({
      where: { userId, targetType, targetId },
      defaults: { userId, targetType, targetId }
    });

    if (!created) {
      return res.status(400).json({ message: '该项目已在收藏列表中' });
    }

    res.status(201).json({
      message: '添加收藏成功',
      favorite
    });
  } catch (error) {
    console.error('添加收藏失败:', error);
    res.status(500).json({ message: '添加收藏失败' });
  }
});

// 获取收藏列表
router.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, targetType } = req.query;
    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };
    
    if (targetType) {
      where.targetType = targetType;
    }

    const favorites = await Favorite.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      favorites: favorites.rows,
      total: favorites.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(favorites.count / limit)
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({ message: '获取收藏列表失败' });
  }
});

// 取消收藏
router.delete('/favorites/:id', authenticateToken, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!favorite) {
      return res.status(404).json({ message: '收藏记录不存在' });
    }

    await favorite.destroy();
    res.json({ message: '取消收藏成功' });
  } catch (error) {
    console.error('取消收藏失败:', error);
    res.status(500).json({ message: '取消收藏失败' });
  }
});

// 记录浏览历史
router.post('/history', authenticateToken, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.user.id;

    const [history, created] = await History.findOrCreate({
      where: { userId, targetType, targetId },
      defaults: { userId, targetType, targetId }
    });

    if (!created) {
      await history.update({
        viewCount: history.viewCount + 1,
        lastViewedAt: new Date()
      });
    }

    res.status(201).json({
      message: '浏览记录已保存',
      history
    });
  } catch (error) {
    console.error('保存浏览记录失败:', error);
    res.status(500).json({ message: '保存浏览记录失败' });
  }
});

// 获取浏览历史
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, targetType } = req.query;
    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };
    
    if (targetType) {
      where.targetType = targetType;
    }

    const history = await History.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastViewedAt', 'DESC']]
    });

    res.json({
      history: history.rows,
      total: history.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(history.count / limit)
    });
  } catch (error) {
    console.error('获取浏览历史失败:', error);
    res.status(500).json({ message: '获取浏览历史失败' });
  }
});

// 清除浏览历史
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    const { targetType } = req.query;
    const where = { userId: req.user.id };
    
    if (targetType) {
      where.targetType = targetType;
    }

    await History.destroy({ where });
    res.json({ message: '浏览历史已清除' });
  } catch (error) {
    console.error('清除浏览历史失败:', error);
    res.status(500).json({ message: '清除浏览历史失败' });
  }
});

module.exports = router;