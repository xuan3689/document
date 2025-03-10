const app = getApp();

Page({
  data: {
    canteenId: null,
    canteen: null,
    windows: [],
    loading: true,
    error: null,
    crowdedness: null,
    isFavorite: false
  },

  onLoad(options) {
    this.setData({ canteenId: options.id });
    this.loadCanteenDetail();
    this.loadCrowdedness();
    this.checkFavoriteStatus();
  },

  onPullDownRefresh() {
    this.loadCanteenDetail();
    this.loadCrowdedness();
  },

  async loadCanteenDetail() {
    try {
      this.setData({ loading: true, error: null });
      const { request } = require('../../utils/util');
      const res = await request({
        url: `${app.globalData.baseUrl}/canteens/${this.data.canteenId}`,
        method: 'GET'
      });

      this.setData({
        canteen: res,
        windows: res.Windows.map(window => ({
          ...window,
          statusText: this.getWindowStatusText(window.status)
        }))
      });
    } catch (err) {
      console.error('加载食堂详情失败:', err);
      this.setData({ error: err.message || '网络错误，请稍后重试' });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  async loadCrowdedness() {
    try {
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/canteens/${this.data.canteenId}/crowdedness`,
        method: 'GET'
      });

      if (res.statusCode === 200) {
        this.setData({ crowdedness: res.data });
      }
    } catch (err) {
      console.error('获取拥挤度信息失败:', err);
    }
  },

  getWindowStatusText(status) {
    const statusMap = {
      open: '营业中',
      closed: '已关闭',
      break: '休息中'
    };
    return statusMap[status] || '未知状态';
  },

  navigateToWindow(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/window/detail?id=${id}`
    });
  },

  async checkFavoriteStatus() {
    try {
      const res = await app.request({
        url: `/api/user/favorites/check`,
        method: 'GET',
        data: {
          targetId: this.data.canteenId,
          targetType: 'canteen'
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
          url: `/api/user/favorites/${this.data.canteenId}`,
          method: 'DELETE'
        });
      } else {
        await app.request({
          url: '/api/user/favorites',
          method: 'POST',
          data: {
            targetId: this.data.canteenId,
            targetType: 'canteen'
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