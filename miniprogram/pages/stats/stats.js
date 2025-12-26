// pages/stats/stats.js
const permission = require('../../utils/permission.js');

Page({
  data: {
    stats: {
      inProgress: 0,
      finished: 0,
      maxStreak: 0
    },
    weeklyTrend: {
      avgRate: 0,
      data: []
    },
    monthlyTrend: {
      avgRate: 0,
      data: []
    },
    memberInfo: {
      isMember: false,
      title: '解锁微习惯会员',
      desc: '无限习惯 · 完整数据 · 详细报告'
    },
    showTrendModal: false,
    selectedTrendData: {}
  },

  onShow () {
    this.loadStats();
    this.updateMemberInfo();
  },

  async loadStats () {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getStats'
      });

      if (res.result.code === 0) {
        this.setData({
          stats: {
            inProgress: res.result.data.inProgress,
            finished: res.result.data.finished,
            maxStreak: res.result.data.maxStreak
          },
          weeklyTrend: res.result.data.weeklyTrend || this.data.weeklyTrend,
          monthlyTrend: res.result.data.monthlyTrend || this.data.monthlyTrend
        });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  updateMemberInfo () {
    const isMember = permission.isMember();
    const statusText = permission.getMemberStatusText();

    this.setData({
      'memberInfo.isMember': isMember,
      'memberInfo.title': isMember ? '会员特权' : '解锁微习惯会员',
      'memberInfo.desc': isMember ? statusText : '无限习惯 · 完整数据 · 详细报告'
    });
  },

  goToMembership () {
    wx.navigateTo({
      url: '/pages/membership/membership'
    });
  },

  formatDateLabel (dateStr) {
    // 返回 MM/DD 以便展示
    const parts = dateStr.split('-');
    return `${parts[1]}/${parts[2]}`;
  },

  /**
   * 点击趋势条查看详情
   */
  showTrendDetail (e) {
    const { date, rate, completed, active } = e.currentTarget.dataset;
    this.setData({
      showTrendModal: true,
      selectedTrendData: {
        date,
        rate: parseInt(rate),
        completed: parseInt(completed),
        active: parseInt(active),
        formattedDate: this.formatDetailDate(date)
      }
    });
  },

  /**
   * 关闭趋势详情弹窗
   */
  closeTrendModal () {
    this.setData({ showTrendModal: false });
  },

  /**
   * 格式化详情日期显示
   */
  formatDetailDate (dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${year}年${month}月${day}日`;
  }
});
