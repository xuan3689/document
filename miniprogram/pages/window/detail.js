const app = getApp();

Page({
  data: {
    windowId: null,
    window: null,
    dishes: [],
    loading: true,
    error: null,
    isFavorite: false
  },

  onLoad(options) {
    this.setData({ windowId: options.id });
    this.loadWindowDetail();
    this.checkFavoriteStatus();
  },

  onPullDownRefresh() {
    this.loadWindowDetail();
  },

  async loadWindowDetail() {
    try {
      this.setData({ loading: true, error: null });
      const { request } = require('../../utils/util');
      const windowRes = await request({
        url: `${app.globalData.baseUrl}/windows/${this.data.windowId}`,
        method: 'GET'
      });
      const dishesRes = await request({
        url: `${app.globalData.baseUrl}/dishes/window/${this.data.windowId}`,
        method: 'GET'
      });

      // 处理营业时间显示
      const timeRanges = windowRes.operationHours.split(',');
      const formattedHours = timeRanges.join('\n');

      // 对菜品按类别分组
      const groupedDishes = this.groupDishesByCategory(dishesRes);

      this.setData({
        window: {
          ...windowRes,
          formattedHours,
          statusText: this.getStatusText(windowRes.status)
        },
        dishes: groupedDishes
      });
    } catch (err) {
      console.error('加载窗口详情失败:', err);
      this.setData({ error: '获取窗口信息失败，请稍后重试' });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  getStatusText(status) {
    const statusMap = {
      open: '营业中',
      closed: '已关闭',
      break: '休息中'
    };
    return statusMap[status] || '未知状态';
  },

  groupDishesByCategory(dishes) {
    const groups = {};
    dishes.forEach(dish => {
      if (!groups[dish.category]) {
        groups[dish.category] = [];
      }
      groups[dish.category].push({
        ...dish,
        statusText: dish.status === 'available' ? '可购买' : '已售完'
      });
    });
    return Object.entries(groups).map(([category, items]) => ({
      category,
      items
    }));
  },

  navigateToDish(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/dish/detail?id=${id}`
    });
  },

  onShareAppMessage() {
    return {
      title: `${this.data.window?.name || '窗口详情'} - 校园食堂`,
      path: `/pages/window/detail?id=${this.data.windowId}`
    };
  },

  async checkFavoriteStatus() {
    try {
      const res = await app.request({
        url: `/api/user/favorites/check`,
        method: 'GET',
        data: {
          targetId: this.data.windowId,
          targetType: 'window'
        }
      });
      this.setData({ isFavorite: res.isFavorite });
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  },

  async toggleFavorite() {
    try {
      if (this.data.isFavorite) {
        await app.request({
          url: `/api/user/favorites/${this.data.windowId}`,
          method: 'DELETE'
        });
      } else {
        await app.request({
          url: '/api/user/favorites',
          method: 'POST',
          data: {
            targetId: this.data.windowId,
            targetType: 'window'
          }
        });
      }

      this.setData({ isFavorite: !this.data.isFavorite });
      wx.showToast({
        title: this.data.isFavorite ? '收藏成功' : '取消收藏成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: this.data.isFavorite ? '取消收藏失败' : '收藏失败',
        icon: 'none'
      });
    }
  }
});