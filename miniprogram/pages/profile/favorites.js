const app = getApp();

Page({
  data: {
    favorites: [],
    loading: false,
    currentPage: 1,
    hasMore: true,
    targetType: ''
  },

  onLoad(options) {
    this.setData({
      targetType: options.type || ''
    });
    this.loadFavorites();
  },

  async loadFavorites() {
    if (this.data.loading || !this.data.hasMore) return;

    try {
      this.setData({ loading: true });
      const res = await app.request({
        url: '/api/user/favorites',
        method: 'GET',
        data: {
          page: this.data.currentPage,
          limit: 10,
          targetType: this.data.targetType
        }
      });

      this.setData({
        favorites: [...this.data.favorites, ...res.favorites],
        currentPage: res.currentPage,
        hasMore: res.currentPage < res.totalPages
      });
    } catch (error) {
      wx.showToast({
        title: '加载收藏失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async cancelFavorite(e) {
    const { id } = e.currentTarget.dataset;
    try {
      await app.request({
        url: `/api/user/favorites/${id}`,
        method: 'DELETE'
      });

      this.setData({
        favorites: this.data.favorites.filter(item => item.id !== id)
      });

      wx.showToast({
        title: '取消收藏成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '取消收藏失败',
        icon: 'none'
      });
    }
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({
        currentPage: this.data.currentPage + 1
      }, () => {
        this.loadFavorites();
      });
    }
  },

  onPullDownRefresh() {
    this.setData({
      favorites: [],
      currentPage: 1,
      hasMore: true
    }, () => {
      this.loadFavorites().then(() => {
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