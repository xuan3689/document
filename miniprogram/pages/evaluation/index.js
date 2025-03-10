const app = getApp();

Page({
  data: {
    evaluations: [],
    stats: {
      totalCount: 0,
      averageRating: 0
    },
    loading: false,
    currentPage: 1,
    hasMore: true,
    targetType: '',
    targetId: ''
  },

  onLoad(options) {
    this.setData({
      targetType: options.type,
      targetId: options.id
    });
    this.loadEvaluations();
    this.loadStats();
  },

  async loadEvaluations() {
    if (this.data.loading || !this.data.hasMore) return;

    try {
      this.setData({ loading: true });
      const res = await app.request({
        url: `/api/evaluations/${this.data.targetType}/${this.data.targetId}`,
        method: 'GET',
        data: {
          page: this.data.currentPage,
          limit: 10
        }
      });

      this.setData({
        evaluations: [...this.data.evaluations, ...res.evaluations],
        currentPage: res.currentPage,
        hasMore: res.currentPage < res.totalPages
      });
    } catch (error) {
      wx.showToast({
        title: '加载评价失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadStats() {
    try {
      const res = await app.request({
        url: `/api/evaluations/${this.data.targetType}/${this.data.targetId}/stats`,
        method: 'GET'
      });

      this.setData({
        stats: res
      });
    } catch (error) {
      console.error('获取评价统计失败:', error);
    }
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({
        currentPage: this.data.currentPage + 1
      }, () => {
        this.loadEvaluations();
      });
    }
  },

  navigateToCreate() {
    wx.navigateTo({
      url: `/pages/evaluation/create?type=${this.data.targetType}&id=${this.data.targetId}`
    });
  }
});