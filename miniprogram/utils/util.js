const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const request = async (options) => {
  let retries = 0

  while (retries < MAX_RETRIES) {
    try {
      // 检查网络状态
      const networkType = await new Promise((resolve, reject) => {
        wx.getNetworkType({
          success: res => resolve(res.networkType),
          fail: err => reject(new Error('获取网络状态失败'))
        })
      })

      if (networkType === 'none') {
        throw new Error('当前无网络连接')
      }

      const res = await new Promise((resolve, reject) => {
        wx.request({
          ...options,
          success: resolve,
          fail: reject
        })
      })

      if (res.statusCode >= 200 && res.statusCode < 300) {
        return res.data
      } else {
        throw new Error(`请求失败：${res.statusCode} - ${res.data?.message || '未知错误'}`)
      }
    } catch (err) {
      retries++
      if (retries === MAX_RETRIES) {
        throw new Error(`网络请求失败：${err.message || '未知错误'}`)
      }
      console.warn(`请求失败，正在进行第${retries}次重试...`)
      await sleep(RETRY_DELAY)
    }
  }
}

module.exports = {
  formatTime,
  request
}
