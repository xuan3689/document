const app = getApp();

Page({
  data: {
    canteenId: null,
    canteen: null,
    windows: [],
    loading: true,
    error: null,
    crowdedness: null
  },

  onLoad(options) {
    this.setData({ canteenId: options.id });
    this.loadCanteenDetail();
    this.loadCrowdedness();
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
  }
});