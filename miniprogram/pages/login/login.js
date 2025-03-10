const app = getApp();

Page({
  data: {
    username: '',
    password: '',
    loading: false,
    error: null
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  async handleLogin() {
    if (!this.data.username || !this.data.password) {
      this.setData({ error: '请输入用户名和密码' });
      return;
    }

    try {
      this.setData({ loading: true, error: null });
      const { request } = require('../../utils/util');
      const res = await request({
        url: `${app.globalData.baseUrl}/auth/login`,
        method: 'POST',
        data: {
          username: this.data.username,
          password: this.data.password
        }
      });

      // 存储用户信息和token
      wx.setStorageSync('token', res.token);
      wx.setStorageSync('userInfo', res.userInfo);
      
      // 返回上一页或跳转到首页
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack();
      } else {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    } catch (err) {
      console.error('登录失败:', err);
      this.setData({
        error: err.message || '登录失败，请稍后重试'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  navigateToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  }
});