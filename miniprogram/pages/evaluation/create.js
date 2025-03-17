const app = getApp();

Page({
  data: {
    orderId: null,
    order: null,
    rating: 0,
    taste: 0,
    service: 0,
    content: '',
    images: [],
    loading: false,
    error: null
  },

  onLoad(options) {
    this.setData({ orderId: options.id });
    this.loadOrderDetail();
  },

  async loadOrderDetail() {
    try {
      this.setData({ loading: true, error: null });
      const res = await app.request({
        url: `/orders/${this.data.orderId}`,
        method: 'GET'
      });

      if (res.statusCode === 200) {
        this.setData({ order: res.data });
      } else {
        this.setData({ error: '获取订单信息失败' });
      }
    } catch (err) {
      this.setData({ error: '网络错误，请稍后重试' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onRatingChange(e) {
    const { type } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({ [type]: value });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  async chooseImage() {
    try {
      const res = await wx.chooseImage({
        count: 3,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });

      // 检查文件大小
      for (const tempFilePath of res.tempFilePaths) {
        const fileInfo = await wx.getFileInfo({
          filePath: tempFilePath
        });
        
        if (fileInfo.size > 2 * 1024 * 1024) { // 2MB限制
          wx.showToast({
            title: '图片大小不能超过2MB',
            icon: 'none'
          });
          return;
        }
      }

      const images = [...this.data.images, ...res.tempFilePaths];
      if (images.length > 3) {
        wx.showToast({
          title: '最多上传3张图片',
          icon: 'none'
        });
        return;
      }

      this.setData({ images });
    } catch (error) {
      console.error('选择图片失败:', error);
      wx.showToast({
        title: '选择图片失败，请重试',
        icon: 'none'
      });
    }
  },

  removeImage(e) {
    const { index } = e.currentTarget.dataset;
    const images = [...this.data.images];
    images.splice(index, 1);
    this.setData({ images });
  },

  async submitEvaluation() {
    if (this.data.rating === 0) {
      wx.showToast({
        title: '请选择总体评分',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      // 上传图片
      const uploadedImages = [];
      for (const image of this.data.images) {
        const uploadRes = await new Promise((resolve, reject) => {
          wx.uploadFile({
            url: `${app.globalData.baseUrl}/upload`,
            filePath: image,
            name: 'file',
            header: {
              'Authorization': `Bearer ${wx.getStorageSync('token')}`
            },
            success: (res) => {
              if (res.statusCode === 401) {
                wx.removeStorageSync('token');
                wx.navigateTo({
                  url: '/pages/login/index'
                });
                reject(new Error('登录已过期，请重新登录'));
              } else if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(res);
              } else {
                reject(new Error(res.data?.message || `上传失败：${res.statusCode}`));
              }
            },
            fail: (err) => {
              reject(new Error(err.errMsg || '上传失败，请稍后重试'));
            }
          });
        });
        const { url } = JSON.parse(uploadRes.data);
        uploadedImages.push(url);
      }

      // 提交评价
      const evaluationData = {
        orderId: this.data.orderId,
        rating: this.data.rating,
        taste: this.data.taste || this.data.rating,
        service: this.data.service || this.data.rating,
        content: this.data.content,
        images: uploadedImages
      };

      const res = await app.request({
        url: '/evaluations',
        method: 'POST',
        data: evaluationData
      });

      if (res.statusCode === 201) {
        wx.showToast({
          title: '评价成功',
          icon: 'success'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: res.data.message || '评价失败',
          icon: 'none'
        });
      }
    } catch (err) {
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});