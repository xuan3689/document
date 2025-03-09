// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    loading: false,
    error: null,
    canteens: []
  },
  bindViewTap() {
    const canteenId = this.data.canteens[0]?.id;
    if (canteenId) {
      wx.navigateTo({
        url: `../canteen/detail?id=${canteenId}`
      });
    } else {
      wx.showToast({
        title: '暂无食堂信息',
        icon: 'none'
      });
    }
  },
  navigateToCanteen(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../canteen/detail?id=${id}`
    });
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onLoad() {
    this.loadCanteens();
  },

  onPullDownRefresh() {
    this.loadCanteens();
  },

  async loadCanteens() {
    try {
      this.setData({ loading: true, error: null });
      const app = getApp();
      const { request } = require('../../utils/util');
      const canteens = await request({
        url: `${app.globalData.baseUrl}/canteens`,
        method: 'GET'
      });

      this.setData({
        canteens: canteens.map(canteen => ({
          ...canteen,
          statusText: this.getStatusText(canteen.status),
          statusClass: this.getStatusClass(canteen.status)
        }))
      });
    } catch (err) {
      console.error('加载食堂数据失败:', err);
      this.setData({ error: err.message || '网络错误，请稍后重试' });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  getStatusText(status) {
    const statusMap = {
      open: '营业中',
      closed: '已关闭',
      busy: '繁忙',
      maintenance: '维护中'
    };
    return statusMap[status] || '未知状态';
  },

  getStatusClass(status) {
    const classMap = {
      open: 'status-open',
      closed: 'status-closed',
      busy: 'status-busy',
      maintenance: 'status-maintenance'
    };
    return classMap[status] || 'status-unknown';
  },

  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
})
