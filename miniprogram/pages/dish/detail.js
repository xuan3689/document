const app = getApp();

Page({
  data: {
    dishId: null,
    dish: null,
    loading: true,
    error: null,
    isFavorite: false
  },

  onLoad(options) {
    this.setData({ dishId: options.id });
    this.loadDishDetail();
    this.checkFavoriteStatus();
  },

  async loadDishDetail() {
    try {
      this.setData({ loading: true, error: null });
      const { request } = require('../../utils/util');
      const res = await request({
        url: `${app.globalData.baseUrl}/dishes/${this.data.dishId}`,
        method: 'GET'
      });

      this.setData({
        dish: {
          ...res,
          statusText: res.status === 'available' ? '可购买' : '已售完'
        }
      });
    } catch (err) {
      console.error('加载菜品详情失败:', err);
      this.setData({ error: '获取菜品信息失败，请稍后重试' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async checkFavoriteStatus() {
    try {
      const res = await app.request({
        url: `/api/user/favorites/check`,
        method: 'GET',
        data: {
          targetId: this.data.dishId,
          targetType: 'dish'
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
          url: `/api/user/favorites/${this.data.dishId}`,
          method: 'DELETE'
        });
      } else {
        await app.request({
          url: '/api/user/favorites',
          method: 'POST',
          data: {
            targetId: this.data.dishId,
            targetType: 'dish'
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
  },

  addToCart() {
    if (this.data.dish.status !== 'available') {
      wx.showToast({
        title: '该菜品已售完',
        icon: 'none'
      });
      return;
    }

    const dish = {
      id: this.data.dish.id,
      name: this.data.dish.name,
      price: this.data.dish.price,
      image: this.data.dish.image
    };

    wx.navigateTo({
      url: `/pages/order/create?windowId=${this.data.dish.windowId}&dishes=${JSON.stringify([dish])}`
    });
  },

  onShareAppMessage() {
    return {
      title: `${this.data.dish?.name || '菜品详情'} - 校园食堂`,
      path: `/pages/dish/detail?id=${this.data.dishId}`
    };
  }
});