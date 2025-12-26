const constants = require('../../utils/constants.js');

Page({
  data: {
    habitId: '',
    habit: null,
    categoryName: '',
    stats: {
      completed_days: 0,
      total_days: 21,
      completion_rate: 0,
      max_streak: 0,
      progress: {
        current: 1,
        total: 21,
        percentage: 0
      }
    },
    calendar: [],
    advice: '',
    loading: true,
    selectedDate: null,
    selectedDateData: null,
    showDateModal: false
  },

  onLoad (options) {
    const { id } = options;
    if (!id) {
      wx.showToast({ title: '缺少习惯ID', icon: 'none' });
      return;
    }

    this.setData({ habitId: id });
    this.loadDetail();
  },

  onPullDownRefresh () {
    this.loadDetail().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadDetail () {
    this.setData({ loading: true });
    try {
      const res = await wx.cloud.callFunction({
        name: 'getHabitDetail',
        data: { user_habit_id: this.data.habitId }
      });

      if (res.result.code === 0) {
        const { habit, stats, calendar, advice } = res.result.data;
        const categoryName = this.getCategoryName(habit.category);
        this.setData({
          habit,
          categoryName,
          stats,
          calendar,
          advice,
          loading: false
        });
      } else {
        wx.showToast({ title: res.result.message || '获取失败', icon: 'none' });
        this.setData({ loading: false });
      }
    } catch (error) {
      console.error('加载详情失败', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  getCategoryName (value) {
    return constants.categoryNames[value] || value || '习惯';
  },

  /**
   * 点击日历日期查看详情
   */
  selectCalendarDay (e) {
    const { date, completed, times } = e.currentTarget.dataset;
    const [year, month, day] = date.split('-');
    const formatDate = `${month}月${day}日`;

    this.setData({
      selectedDate: date,
      selectedDateData: {
        date: formatDate,
        day,
        completed: completed === 'true' || completed === true,
        times: parseInt(times) || 0,
        targetTimes: this.data.habit.target_times_per_day
      },
      showDateModal: true
    });
  },

  /**
   * 关闭日期详情弹窗
   */
  closeDateModal () {
    this.setData({ showDateModal: false });
  }
});
