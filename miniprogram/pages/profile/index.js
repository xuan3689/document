const app = getApp();

Page({
  data: {
    userInfo: null,
    loading: false
  },

  onLoad() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (token) {
      this.loadUserInfo();
    }
  },

  async loadUserInfo() {
    try {
      this.setData({ loading: true });
      const res = await app.request({
        url: '/api/user/profile',
        method: 'GET'
      });
      this.setData({ userInfo: res });
    } catch (error) {
      console.error('加载用户信息失败:', error);
      if (error.statusCode === 401) {
        // token过期或无效，清除登录状态
        wx.removeStorageSync('token');
        wx.removeStorageSync('userInfo');
        this.setData({ userInfo: null });
      } else {
        wx.showToast({
          title: '加载用户信息失败',
          icon: 'none'
        });
      }
    } finally {
      this.setData({ loading: false });
    }
  },

  async handleWxLogin() {
    try {
      // 获取用户信息授权
      const { code } = await wx.login();
      const userInfoRes = await wx.getUserProfile({
        desc: '用于完善用户资料'
      });

      // 发送登录请求
      const loginRes = await app.request({
        url: '/api/auth/wx-login',
        method: 'POST',
        data: {
          code,
          userInfo: userInfoRes.userInfo
        }
      });

      // 保存登录信息
      wx.setStorageSync('token', loginRes.token);
      wx.setStorageSync('userInfo', loginRes.userInfo);
      
      // 更新页面显示
      this.setData({ userInfo: loginRes.userInfo });

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('微信登录失败:', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    }
  },

  navigateToFavorites() {
    wx.navigateTo({
      url: '/pages/profile/favorites'
    });
  },

  navigateToHistory() {
    wx.navigateTo({
      url: '/pages/profile/history'
    });
  },

  navigateToOrders() {
    wx.navigateTo({
      url: '/pages/order/list'
    });
  },

  onPullDownRefresh() {
    this.loadUserInfo().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});