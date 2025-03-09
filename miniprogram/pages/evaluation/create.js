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
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/orders/${this.data.orderId}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        }
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
    const res = await wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    });

    const images = [...this.data.images, ...res.tempFilePaths];
    if (images.length > 3) {
      wx.showToast({
        title: '最多上传3张图片',
        icon: 'none'
      });
      return;
    }

    this.setData({ images });
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
        const uploadRes = await wx.uploadFile({
          url: `${app.globalData.baseUrl}/upload`,
          filePath: image,
          name: 'file',
          header: {
            'Authorization': `Bearer ${wx.getStorageSync('token')}`
          }
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

      const res = await wx.request({
        url: `${app.globalData.baseUrl}/evaluations`,
        method: 'POST',
        data: evaluationData,
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        }
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
}));