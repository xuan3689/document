// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    baseUrl: '/api'
  },
  request(options) {
    const baseUrl = this.globalData.baseUrl
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        url: options.url.startsWith('http') ? options.url : `${baseUrl}${options.url}`,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            const errorMsg = res.data?.message || `请求失败：${res.statusCode}`
            reject(new Error(errorMsg))
          }
        },
        fail: (err) => {
          console.error('网络请求失败:', err)
          if (err.errMsg.includes('request:fail')) {
            reject(new Error('服务器连接失败，请检查网络设置或稍后重试'))
          } else {
            reject(new Error(err.errMsg || '请求失败，请稍后重试'))
          }
        }
      })
    })
  }
})
