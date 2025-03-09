const app = getApp();

Page({
  data: {
    orders: [],
    loading: true,
    error: null,
    currentPage: 1,
    hasMore: true
  },

  onLoad() {
    this.loadOrders();
  },

  onPullDownRefresh() {
    this.setData({
      currentPage: 1,
      hasMore: true,
      orders: []
    });
    this.loadOrders();
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadOrders();
    }
  },

  async loadOrders() {
    if (this.data.loading) return;

    try {
      this.setData({ loading: true, error: null });
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/orders`,
        method: 'GET',
        data: {
          page: this.data.currentPage,
          limit: 10
        },
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        }
      });

      if (res.statusCode === 200) {
        const formattedOrders = res.data.orders.map(order => ({
          ...order,
          statusText: this.getOrderStatusText(order.status),
          statusClass: this.getOrderStatusClass(order.status),
          formattedTime: this.formatTime(order.createdAt)
        }));

        this.setData({
          orders: [...this.data.orders, ...formattedOrders],
          currentPage: this.data.currentPage + 1,
          hasMore: formattedOrders.length === 10
        });
      } else {
        this.setData({ error: '获取订单列表失败' });
      }
    } catch (err) {
      this.setData({ error: '网络错误，请稍后重试' });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  getOrderStatusText(status) {
    const statusMap = {
      pending: '待支付',
      paid: '已支付',
      preparing: '准备中',
      ready: '待取餐',
      completed: '已完成',
      cancelled: '已取消'
    };
    return statusMap[status] || '未知状态';
  },

  getOrderStatusClass(status) {
    const classMap = {
      pending: 'status-pending',
      paid: 'status-paid',
      preparing: 'status-preparing',
      ready: 'status-ready',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return classMap[status] || 'status-unknown';
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  navigateToOrderDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/detail?id=${id}`
    });
  },

  async cancelOrder(e) {
    const { id, index } = e.currentTarget.dataset;

    try {
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/orders/${id}/cancel`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        }
      });

      if (res.statusCode === 200) {
        const orders = [...this.data.orders];
        orders[index].status = 'cancelled';
        orders[index].statusText = this.getOrderStatusText('cancelled');
        orders[index].statusClass = this.getOrderStatusClass('cancelled');

        this.setData({ orders });
        wx.showToast({
          title: '订单已取消',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: res.data.message || '取消订单失败',
          icon: 'none'
        });
      }
    } catch (err) {
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none'
      });
    }
  }
}));