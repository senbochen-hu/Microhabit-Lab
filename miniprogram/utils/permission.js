/**
 * 权限检查工具
 */

const app = getApp();

/**
 * 检查用户是否是会员
 * @returns {Boolean}
 */
function isMember () {
  return app.checkMemberStatus();
}

/**
 * 检查用户习惯数量限制
 * @param {Number} currentCount 当前习惯数量
 * @returns {Object} { allowed: Boolean, limit: Number }
 */
function checkHabitLimit (currentCount) {
  const memberStatus = isMember();
  const limit = memberStatus ? 20 : 3;

  return {
    allowed: currentCount < limit,
    limit: limit,
    current: currentCount,
    isMember: memberStatus
  };
}

/**
 * 检查数据访问权限
 * @param {String} dataType 数据类型: 'full_chart', 'report', 'templates'
 * @returns {Boolean}
 */
function checkDataAccess (dataType) {
  const memberStatus = isMember();

  // 会员可以访问所有数据
  if (memberStatus) {
    return true;
  }

  // 免费用户限制
  const freeAccess = {
    'basic_chart': true,      // 基础7天图表
    'full_chart': false,      // 完整21天图表
    'report': false,          // 完整报告
    'templates': false,       // 全部模板
    'note': false            // 备注功能
  };

  return freeAccess[dataType] !== undefined ? freeAccess[dataType] : false;
}

/**
 * 显示会员引导弹窗
 * @param {String} reason 引导原因
 */
function showMembershipGuide (reason) {
  let title = '解锁更多功能';
  let content = '';

  switch (reason) {
    case 'habit_limit':
      title = '已经很棒了!';
      content = '一次想改太多习惯,大多数人会失败。免费版最多同时进行3个习惯。\n\n如果你已经适应微习惯方式,可以开通会员,系统管理更多小实验。';
      break;
    case 'full_chart':
      title = '查看完整数据';
      content = '开通会员可以查看完整21天打卡记录,掌握更全面的习惯养成轨迹。';
      break;
    case 'templates':
      title = '解锁全部习惯库';
      content = '开通会员可以使用全部精选微习惯模板,更快找到适合自己的习惯。';
      break;
    default:
      content = '开通会员解锁更多功能,帮助你更好地培养微习惯。';
  }

  wx.showModal({
    title: title,
    content: content,
    confirmText: '了解会员',
    cancelText: '暂不需要',
    success (res) {
      if (res.confirm) {
        wx.navigateTo({
          url: '/pages/membership/membership'
        });
      }
    }
  });
}

/**
 * 获取会员状态文本
 * @returns {String}
 */
function getMemberStatusText () {
  const { memberStatus, memberExpireTime } = app.globalData;

  if (memberStatus === 0) {
    return '免费用户';
  }

  if (memberExpireTime) {
    const expireDate = new Date(memberExpireTime);
    const now = new Date();

    if (expireDate < now) {
      return '会员已过期';
    }

    const year = expireDate.getFullYear();
    const month = String(expireDate.getMonth() + 1).padStart(2, '0');
    const day = String(expireDate.getDate()).padStart(2, '0');

    return `会员有效期至 ${year}-${month}-${day}`;
  }

  return '会员';
}

module.exports = {
  isMember,
  checkHabitLimit,
  checkDataAccess,
  showMembershipGuide,
  getMemberStatusText
};
