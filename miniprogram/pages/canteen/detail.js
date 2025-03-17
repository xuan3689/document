const app = getApp();

Page({
  data: {
    canteenId: null,
    canteen: null,
    windows: [],
    loading: true,
    error: null,
    crowdedness: null,
    isFavorite: false,
    dishes: [],
    filteredDishes: [],
    priceRanges: ['全部', '0-20元', '20-40元', '40元以上'],
    selectedPriceRange: '全部',
    cuisineTypes: [
      { id: 1, name: '全部', selected: true },
      { id: 2, name: '川菜', selected: false },
      { id: 3, name: '粤菜', selected: false },
      { id: 4, name: '湘菜', selected: false },
      { id: 5, name: '面食', selected: false }
    ]
  },

  onLoad(options) {
    this.setData({ canteenId: options.id });
    this.loadCanteenDetail();
    this.loadCrowdedness();
    this.checkFavoriteStatus();
    this.loadDishes();
  },

  onPullDownRefresh() {
    this.loadCanteenDetail();
    this.loadCrowdedness();
    this.loadDishes();
  },

  async loadCanteenDetail() {
    try {
      this.setData({ loading: true, error: null });
      const { request } = require('../../utils/util');
      const res = await request({
        url: `${app.globalData.baseUrl}/canteens/${this.data.canteenId}`,
        method: 'GET'
      });

      this.setData({
        canteen: res,
        windows: res.Windows.map(window => ({
          ...window,
          statusText: this.getWindowStatusText(window.status)
        }))
      });
    } catch (err) {
      console.error('加载食堂详情失败:', err);
      this.setData({ error: err.message || '网络错误，请稍后重试' });
    } finally {
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  async loadCrowdedness() {
    try {
      const res = await wx.request({
        url: `${app.globalData.baseUrl}/canteens/${this.data.canteenId}/crowdedness`,
        method: 'GET'
      });

      if (res.statusCode === 200) {
        this.setData({ crowdedness: res.data });
      }
    } catch (err) {
      console.error('获取拥挤度信息失败:', err);
    }
  },

  getWindowStatusText(status) {
    const statusMap = {
      open: '营业中',
      closed: '已关闭',
      break: '休息中'
    };
    return statusMap[status] || '未知状态';
  },

  navigateToWindow(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/window/detail?id=${id}`
    });
  },

  async checkFavoriteStatus() {
    try {
      const res = await app.request({
        url: `/api/user/favorites/check`,
        method: 'GET',
        data: {
          targetId: this.data.canteenId,
          targetType: 'canteen'
        }
      });
      this.setData({ isFavorite: res.isFavorite });
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  },

  async loadDishes() {
    try {
      const dishes = [
        {
          id: 1,
          name: '麻婆豆腐',
          price: 15,
          rating: 4.5,
          imageUrl: '/assets/images/dishes/mapo-tofu.jpg',
          cuisineType: 2
        },
        {
          id: 2,
          name: '白切鸡',
          price: 28,
          rating: 4.8,
          imageUrl: '/assets/images/dishes/white-cut-chicken.jpg',
          cuisineType: 3
        },
        {
          id: 3,
          name: '剁椒鱼头',
          price: 45,
          rating: 4.6,
          imageUrl: '/assets/images/dishes/fish-head.jpg',
          cuisineType: 4
        },
        {
          id: 4,
          name: '牛肉面',
          price: 18,
          rating: 4.7,
          imageUrl: '/assets/images/dishes/beef-noodles.jpg',
          cuisineType: 5
        }
      ];
      this.setData({ dishes, filteredDishes: dishes });
    } catch (err) {
      console.error('加载菜品失败:', err);
    }
  },

  onPriceRangeChange(e) {
    const selectedPriceRange = this.data.priceRanges[e.detail.value];
    this.setData({ selectedPriceRange });
    this.filterDishes();
  },

  onCuisineSelect(e) {
    const { id } = e.currentTarget.dataset;
    const cuisineTypes = this.data.cuisineTypes.map(type => ({
      ...type,
      selected: type.id === id
    }));
    this.setData({ cuisineTypes });
    this.filterDishes();
  },

  filterDishes() {
    let filtered = [...this.data.dishes];
    
    // 按价格筛选
    if (this.data.selectedPriceRange !== '全部') {
      const [min, max] = this.data.selectedPriceRange.split('-').map(num => parseInt(num));
      filtered = filtered.filter(dish => {
        if (this.data.selectedPriceRange === '40元以上') {
          return dish.price >= 40;
        }
        return dish.price >= min && dish.price < max;
      });
    }

    // 按菜系筛选
    const selectedCuisine = this.data.cuisineTypes.find(type => type.selected);
    if (selectedCuisine && selectedCuisine.name !== '全部') {
      filtered = filtered.filter(dish => dish.cuisineType === selectedCuisine.id);
    }

    this.setData({ filteredDishes: filtered });
  },

  navigateToDish(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/dish/detail?id=${id}`
    });
  },

  async toggleFavorite() {
    try {
      if (this.data.isFavorite) {
        await app.request({
          url: `/api/user/favorites/${this.data.canteenId}`,
          method: 'DELETE'
        });
      } else {
        await app.request({
          url: '/api/user/favorites',
          method: 'POST',
          data: {
            targetId: this.data.canteenId,
            targetType: 'canteen'
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
  }
});