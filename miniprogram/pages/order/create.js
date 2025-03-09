const app = getApp();

Page({
  data: {
    windowId: null,
    window: null,
    selectedDishes: [],
    totalAmount: 0,
    remark: '',
    loading: false,
    error: null
  },

  onLoad(options) {
    this.setData({ windowId: options.windowId });
    if (options.dishes) {
      try {
        const dishes = JSON.parse(options.dishes);
        this.setData({
          selectedDishes: dishes.map(dish => ({
            ...dish,
            quantity: 1
          })),
          totalAmount: dishes.reduce((sum, dish) => sum + dish.price, 0)
        });
      } catch (err) {
        console.error('解析菜品数据失败:', err);
      }
    }
    this.loadWindowDetail();
  },

  async loadWindowDetail() {
    try {
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/windows/${this.data.windowId}/status`,
        method: 'GET'
      });

      if (res.statusCode === 200) {
        this.setData({ window: res.data });
      } else {
        this.setData({ error: '获取窗口信息失败' });
      }
    } catch (err) {
      this.setData({ error: '网络错误，请稍后重试' });
    }
  },

  updateDishQuantity(e) {
    const { index, type } = e.currentTarget.dataset;
    const dishes = [...this.data.selectedDishes];
    const dish = dishes[index];

    if (type === 'increase') {
      dish.quantity++;
    } else if (type === 'decrease' && dish.quantity > 1) {
      dish.quantity--;
    }

    const totalAmount = dishes.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    this.setData({
      selectedDishes: dishes,
      totalAmount
    });
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

  async submitOrder() {
    if (this.data.selectedDishes.length === 0) {
      wx.showToast({
        title: '请选择至少一个菜品',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const orderData = {
        windowId: this.data.windowId,
        dishes: this.data.selectedDishes.map(dish => ({
          dishId: dish.id,
          quantity: dish.quantity
        })),
        remark: this.data.remark,
        totalAmount: this.data.totalAmount
      };

      const res = await wx.request({
        url: `${app.globalData.baseUrl}/orders`,
        method: 'POST',
        data: orderData,
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        }
      });

      if (res.statusCode === 201) {
        wx.showToast({
          title: '下单成功',
          icon: 'success'
        });
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/order/detail?id=${res.data.id}`
          });
        }, 1500);
      } else {
        wx.showToast({
          title: res.data.message || '下单失败',
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