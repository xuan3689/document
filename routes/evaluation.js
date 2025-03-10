const express = require('express');
const router = express.Router();
const Evaluation = require('../models/evaluation');
const { authenticateToken } = require('../middleware/auth');

// 创建评价
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { targetType, targetId, content, rating, images } = req.body;
    const userId = req.user.id;

    const evaluation = await Evaluation.create({
      userId,
      targetType,
      targetId,
      content,
      rating,
      images: images || [],
      status: 'pending'
    });

    res.status(201).json({
      message: '评价创建成功',
      evaluation
    });
  } catch (error) {
    console.error('创建评价失败:', error);
    res.status(500).json({ message: '创建评价失败' });
  }
});

// 获取评价列表
router.get('/:targetType/:targetId', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const evaluations = await Evaluation.findAndCountAll({
      where: {
        targetType,
        targetId,
        status: 'approved'
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      evaluations: evaluations.rows,
      total: evaluations.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(evaluations.count / limit)
    });
  } catch (error) {
    console.error('获取评价列表失败:', error);
    res.status(500).json({ message: '获取评价列表失败' });
  }
});

// 获取评价统计
router.get('/:targetType/:targetId/stats', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const stats = await Evaluation.findAll({
      where: {
        targetType,
        targetId,
        status: 'approved'
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalCount'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']
      ]
    });

    res.json({
      totalCount: stats[0].get('totalCount'),
      averageRating: parseFloat(stats[0].get('averageRating')).toFixed(1)
    });
  } catch (error) {
    console.error('获取评价统计失败:', error);
    res.status(500).json({ message: '获取评价统计失败' });
  }
});

// 更新评价状态（管理员权限）
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const evaluation = await Evaluation.findByPk(req.params.id);

    if (!evaluation) {
      return res.status(404).json({ message: '评价不存在' });
    }

    await evaluation.update({ status });
    res.json({ message: '评价状态更新成功', evaluation });
  } catch (error) {
    console.error('更新评价状态失败:', error);
    res.status(500).json({ message: '更新评价状态失败' });
  }
});

// 获取用户的评价列表
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const evaluations = await Evaluation.findAndCountAll({
      where: {
        userId: req.params.userId
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      evaluations: evaluations.rows,
      total: evaluations.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(evaluations.count / limit)
    });
  } catch (error) {
    console.error('获取用户评价列表失败:', error);
    res.status(500).json({ message: '获取用户评价列表失败' });
  }
});

module.exports = router;