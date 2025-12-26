// pages/create-habit/create-habit.js
const util = require('../../utils/util.js');
const permission = require('../../utils/permission.js');
const constants = require('../../utils/constants.js');

Page({
  data: {
    mode: 'create', // create | edit
    habitId: '',
    pageTitle: '新建微习惯',
    triggerOptions: constants.triggerOptions,
    formData: {
      name: '',
      trigger: '',
      customTrigger: '',
      target_times_per_day: 1
    },
    canSubmit: false
  },

  onLoad (options) {
    if (options.id) {
      // 编辑模式
      this.setData({
        mode: 'edit',
        habitId: options.id,
        pageTitle: '调整习惯'
      });
      this.loadHabitDetail(options.id);
    } else if (options.template_id) {
      // 从模板创建
      this.loadTemplate(options.template_id);
    }
  },

  /**
   * 加载习惯详情(编辑模式)
   */
  async loadHabitDetail (habitId) {
    try {
      util.showLoading('加载中...');

      const res = await wx.cloud.callFunction({
        name: 'getHabitDetail',
        data: { user_habit_id: habitId }
      });

      util.hideLoading();

      if (res.result.code === 0) {
        const habit = res.result.data.habit;
        this.setData({
          formData: {
            name: habit.name,
            trigger: habit.trigger,
            customTrigger: '',
            target_times_per_day: habit.target_times_per_day
          }
        }, () => {
          this.validateForm();
        });
      }
    } catch (error) {
      util.hideLoading();
      util.showToast('加载失败');
    }
  },

  /**
   * 从模板加载
   */
  async loadTemplate (templateId) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('habit_templates').doc(templateId).get();

      if (res.data) {
        this.setData({
          formData: {
            name: res.data.name,
            trigger: res.data.default_trigger,
            customTrigger: '',
            target_times_per_day: 1
          }
        }, () => {
          this.validateForm();
        });
      }
    } catch (error) {
      console.error('加载模板失败:', error);
    }
  },

  /**
   * 习惯名称输入
   */
  handleNameInput (e) {
    this.setData({
      'formData.name': e.detail.value
    }, () => {
      this.validateForm();
    });
  },

  /**
   * 触发器选择
   */
  handleTriggerSelect (e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      'formData.trigger': value
    }, () => {
      this.validateForm();
    });
  },

  /**
   * 自定义触发器输入
   */
  handleCustomTriggerInput (e) {
    this.setData({
      'formData.customTrigger': e.detail.value
    }, () => {
      this.validateForm();
    });
  },

  /**
   * 频次选择
   */
  handleFrequencySelect (e) {
    const value = parseInt(e.currentTarget.dataset.value);
    this.setData({
      'formData.target_times_per_day': value
    });
  },

  /**
   * 表单校验
   */
  validateForm () {
    const { name, trigger, customTrigger } = this.data.formData;

    let isValid = false;

    if (name.trim().length > 0) {
      if (trigger === 'other') {
        isValid = customTrigger.trim().length > 0;
      } else {
        isValid = trigger.length > 0;
      }
    }

    this.setData({ canSubmit: isValid });
  },

  /**
   * 提交表单
   */
  async handleSubmit () {
    if (!this.data.canSubmit) {
      return;
    }

    const { name, trigger, customTrigger, target_times_per_day } = this.data.formData;
    const finalTrigger = trigger === 'other' ? customTrigger : trigger;

    // 编辑模式
    if (this.data.mode === 'edit') {
      await this.updateHabit(finalTrigger);
      return;
    }

    // 创建模式
    try {
      util.showLoading('创建中...');

      const res = await wx.cloud.callFunction({
        name: 'createHabit',
        data: {
          name: name.trim(),
          trigger: finalTrigger,
          target_times_per_day: target_times_per_day
        }
      });

      util.hideLoading();

      if (res.result.code === 0) {
        util.showToast('新习惯已加入今日列表', 'success');

        // 延迟返回,让用户看到成功提示
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else if (res.result.code === 1001) {
        // 超出习惯数量限制
        permission.showMembershipGuide('habit_limit');
      } else {
        util.showToast(res.result.message);
      }
    } catch (error) {
      util.hideLoading();
      util.showToast('创建失败,请重试');
      console.error('创建习惯失败:', error);
    }
  },

  /**
   * 更新习惯
   */
  async updateHabit (finalTrigger) {
    const { name, target_times_per_day } = this.data.formData;

    try {
      util.showLoading('保存中...');

      const res = await wx.cloud.callFunction({
        name: 'updateHabitStatus',
        data: {
          user_habit_id: this.data.habitId,
          action: 'update',
          updates: {
            name: name.trim(),
            trigger: finalTrigger,
            target_times_per_day: target_times_per_day
          }
        }
      });

      util.hideLoading();

      if (res.result.code === 0) {
        util.showToast('保存成功', 'success');
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        util.showToast(res.result.message);
      }
    } catch (error) {
      util.hideLoading();
      util.showToast('保存失败,请重试');
    }
  },

  /**
   * 取消
   */
  handleCancel () {
    wx.navigateBack();
  }
});
