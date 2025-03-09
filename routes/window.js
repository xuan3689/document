const express = require('express');
const router = express.Router();
const Window = require('../models/window');
const Dish = require('../models/dish');
const { authenticateToken } = require('../middleware/auth');

// 获取特定食堂的所有窗口
router.get('/canteen/:canteenId', async (req, res) => {
  try {
    const windows = await Window.findAll({
      where: { canteenId: req.params.canteenId },
      attributes: ['id', 'name', 'description', 'status', 'queueLength', 
                  'averageWaitTime', 'rating', 'imageUrl', 'operationHours']
    });
    res.json(windows);
  } catch (error) {
    console.error('获取窗口列表失败:', error);
    res.status(500).json({ message: '获取窗口列表失败' });
  }
});

// 获取特定窗口详情
router.get('/:id', async (req, res) => {
  try {
    const window = await Window.findByPk(req.params.id, {
      include: [{
        model: Dish,
        attributes: ['id', 'name', 'price', 'description', 'imageUrl', 
                    'category', 'status', 'rating', 'dailyLimit', 'remainingQuantity']
      }]
    });

    if (!window) {
      return res.status(404).json({ message: '窗口不存在' });
    }

    res.json(window);
  } catch (error) {
    console.error('获取窗口详情失败:', error);
    res.status(500).json({ message: '获取窗口详情失败' });
  }
});

// 更新窗口信息（需要管理员权限）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const window = await Window.findByPk(req.params.id);
    if (!window) {
      return res.status(404).json({ message: '窗口不存在' });
    }

    const updates = {
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
      imageUrl: req.body.imageUrl,
      operationHours: req.body.operationHours
    };

    await window.update(updates);
    res.json({ message: '窗口信息更新成功', window });
  } catch (error) {
    console.error('更新窗口信息失败:', error);
    res.status(500).json({ message: '更新窗口信息失败' });
  }
});

// 更新窗口队列信息
router.patch('/:id/queue', authenticateToken, async (req, res) => {
  try {
    const { queueLength, averageWaitTime } = req.body;
    const window = await Window.findByPk(req.params.id);

    if (!window) {
      return res.status(404).json({ message: '窗口不存在' });
    }

    await window.update({ 
      queueLength: queueLength || window.queueLength,
      averageWaitTime: averageWaitTime || window.averageWaitTime
    });

    res.json({
      message: '队列信息更新成功',
      queueLength: window.queueLength,
      averageWaitTime: window.averageWaitTime
    });
  } catch (error) {
    console.error('更新队列信息失败:', error);
    res.status(500).json({ message: '更新队列信息失败' });
  }
});

// 获取窗口当前状态
router.get('/:id/status', async (req, res) => {
  try {
    const window = await Window.findByPk(req.params.id, {
      attributes: ['id', 'name', 'status', 'queueLength', 'averageWaitTime', 'operationHours']
    });

    if (!window) {
      return res.status(404).json({ message: '窗口不存在' });
    }

    // 解析营业时间
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const timeRanges = window.operationHours.split(',');
    let isInOperationHours = false;

    for (const range of timeRanges) {
      const [start, end] = range.split('-');
      if (currentTimeString >= start && currentTimeString <= end) {
        isInOperationHours = true;
        break;
      }
    }

    res.json({
      id: window.id,
      name: window.name,
      status: window.status,
      isOpen: window.status === 'open' && isInOperationHours,
      queueLength: window.queueLength,
      averageWaitTime: window.averageWaitTime,
      estimatedWaitTime: window.queueLength * window.averageWaitTime,
      operationHours: window.operationHours
    });
  } catch (error) {
    console.error('获取窗口状态失败:', error);
    res.status(500).json({ message: '获取窗口状态失败' });
  }
});

module.exports = router;