// app.js
App({
  onLaunch () {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // 此处请填写环境 ID, 环境 ID 可打开云控制台查看
        // TODO: 在微信开发者工具中开通云开发后,替换为实际的环境ID
        env: 'cloud1-0g29mlsv3d4ca637',
        traceUser: true,
      });
    }

    // 获取用户信息
    this.initUser();
  },

  globalData: {
    userInfo: null,
    memberStatus: 0,
    memberExpireTime: null
  },

  /**
   * 初始化用户
   */
  async initUser () {
    try {
      const res = await wx.cloud.callFunction({
        name: 'initUser'
      });

      if (res.result.code === 0) {
        const userData = res.result.data;
        this.globalData.userInfo = userData;
        this.globalData.memberStatus = userData.member_status;
        this.globalData.memberExpireTime = userData.member_expire_time;
      }
    } catch (error) {
      console.error('初始化用户失败:', error);
    }
  },

  /**
   * 检查会员状态
   */
  checkMemberStatus () {
    const { memberStatus, memberExpireTime } = this.globalData;

    if (memberStatus === 0) {
      return false;
    }

    // 检查是否过期
    if (memberExpireTime && new Date(memberExpireTime) < new Date()) {
      this.globalData.memberStatus = 0;
      return false;
    }

    return true;
  }
});
