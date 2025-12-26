const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * 支付成功后更新会员状态
 * - 会员标记: member_status = 1
 * - 会员有效期: 当前时间起 + 31 天
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  const now = new Date();
  const expire = new Date();
  expire.setDate(now.getDate() + 31);

  try {
    await db.collection('users').where({ _openid: openid }).update({
      data: {
        member_status: 1,
        member_expire_time: expire,
        updated_at: db.serverDate()
      }
    });

    // 返回新的会员信息给前端
    return {
      code: 0,
      message: '会员已生效',
      data: {
        member_status: 1,
        member_expire_time: expire.toISOString()
      }
    };
  } catch (error) {
    console.error('activateMembership error:', error);
    return {
      code: -1,
      message: '更新会员状态失败',
      error: error.message
    };
  }
};
