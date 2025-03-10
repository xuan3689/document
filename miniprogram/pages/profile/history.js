const app = getApp();

Page({
  data: {
    history: [],
    loading: false,
    currentPage: 1,
    hasMore: true,
    targetType: ''
  },

  onLoad(options) {
    this.setData({
      targetType: options.type || ''
    });
    this.loadHistory();
  },

  async loadHistory() {
    if (this.data.loading || !this.data.hasMore) return;

    try {
      this.setData({ loading: true });
      const res = await app.request({
        url: '/api/user/history',
        method: 'GET',
        data: {
          page: this.data.currentPage,
          limit: 10,
          targetType: this.data.targetType
        }
      });

      this.setData({
        history: [...this.data.history, ...res.history],
        currentPage: res.currentPage,
        hasMore: res.currentPage < res.totalPages
      });
    } catch (error) {
      wx.showToast({
        title: '加载历史记录失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async clearHistory() {
    try {
      await app.request({
        url: '/api/user/history',
        method: 'DELETE',
        data: {
          targetType: this.data.targetType
        }
      });

      this.setData({
        history: [],
        currentPage: 1,
        hasMore: false
      });

      wx.showToast({
        title: '清除历史记录成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '清除历史记录失败',
        icon: 'none'
      });
    }
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({
        currentPage: this.data.currentPage + 1
      }, () => {
        this.loadHistory();
      });
    }
  },

  onPullDownRefresh() {
    this.setData({
      history: [],
      currentPage: 1,
      hasMore: true
    }, () => {
      this.loadHistory().then(() => {
        wx.stopPullDownRefresh();
      });
    });
  },

  navigateToDetail(e) {
    const { type, id } = e.currentTarget.dataset;
    const urls = {
      dish: '/pages/dish/detail',
      window: '/pages/window/detail',
      canteen: '/pages/canteen/detail'
    };

    wx.navigateTo({
      url: `${urls[type]}?id=${id}`
    });
  }
});