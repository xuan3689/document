const express = require('express');
const router = express.Router();
const Canteen = require('../models/canteen');
const Window = require('../models/window');
const { authenticateToken } = require('../middleware/auth');

// 获取所有食堂列表
router.get('/', async (req, res) => {
  try {
    const canteens = await Canteen.findAll({
      attributes: ['id', 'name', 'location', 'openTime', 'closeTime', 'imageUrl', 
                  'status', 'description', 'totalSeats', 'availableSeats', 'averageRating']
    });
    res.json(canteens);
  } catch (error) {
    console.error('获取食堂列表失败:', error);
    res.status(500).json({ message: '获取食堂列表失败' });
  }
});

// 获取特定食堂详情
router.get('/:id', async (req, res) => {
  try {
    const canteen = await Canteen.findByPk(req.params.id, {
      include: [{
        model: Window,
        attributes: ['id', 'name', 'status', 'queueLength', 'averageWaitTime']
      }]
    });

    if (!canteen) {
      return res.status(404).json({ message: '食堂不存在' });
    }

    res.json(canteen);
  } catch (error) {
    console.error('获取食堂详情失败:', error);
    res.status(500).json({ message: '获取食堂详情失败' });
  }
});

// 更新食堂信息（需要管理员权限）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const canteen = await Canteen.findByPk(req.params.id);
    if (!canteen) {
      return res.status(404).json({ message: '食堂不存在' });
    }

    const updates = {
      name: req.body.name,
      location: req.body.location,
      openTime: req.body.openTime,
      closeTime: req.body.closeTime,
      imageUrl: req.body.imageUrl,
      status: req.body.status,
      description: req.body.description,
      totalSeats: req.body.totalSeats,
      availableSeats: req.body.availableSeats
    };

    await canteen.update(updates);
    res.json({ message: '食堂信息更新成功', canteen });
  } catch (error) {
    console.error('更新食堂信息失败:', error);
    res.status(500).json({ message: '更新食堂信息失败' });
  }
});

// 更新食堂座位信息
router.patch('/:id/seats', authenticateToken, async (req, res) => {
  try {
    const { availableSeats } = req.body;
    const canteen = await Canteen.findByPk(req.params.id);

    if (!canteen) {
      return res.status(404).json({ message: '食堂不存在' });
    }

    if (availableSeats > canteen.totalSeats) {
      return res.status(400).json({ message: '可用座位数不能超过总座位数' });
    }

    await canteen.update({ availableSeats });
    res.json({ message: '座位信息更新成功', availableSeats });
  } catch (error) {
    console.error('更新座位信息失败:', error);
    res.status(500).json({ message: '更新座位信息失败' });
  }
});

// 获取食堂繁忙程度
router.get('/:id/crowdedness', async (req, res) => {
  try {
    const canteen = await Canteen.findByPk(req.params.id);
    if (!canteen) {
      return res.status(404).json({ message: '食堂不存在' });
    }

    const occupancyRate = ((canteen.totalSeats - canteen.availableSeats) / canteen.totalSeats) * 100;
    let crowdedness;

    if (occupancyRate < 30) {
      crowdedness = '空闲';
    } else if (occupancyRate < 60) {
      crowdedness = '适中';
    } else if (occupancyRate < 90) {
      crowdedness = '繁忙';
    } else {
      crowdedness = '拥挤';
    }

    res.json({
      occupancyRate: Math.round(occupancyRate),
      crowdedness,
      availableSeats: canteen.availableSeats,
      totalSeats: canteen.totalSeats
    });
  } catch (error) {
    console.error('获取食堂繁忙程度失败:', error);
    res.status(500).json({ message: '获取食堂繁忙程度失败' });
  }
});

module.exports = router;