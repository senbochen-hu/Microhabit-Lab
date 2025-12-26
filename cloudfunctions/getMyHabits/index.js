const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

/**
 * 获取用户的所有习惯
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 查询用户创建的所有习惯
    const { data: habits } = await db.collection('user_habits')
      .where({
        _openid: openid
      })
      .orderBy('created_at', 'desc')
      .get();

    return {
      code: 0,
      message: 'success',
      data: habits
    };
  } catch (error) {
    console.error('获取用户习惯失败:', error);
    return {
      code: -1,
      message: error.message || '获取习惯列表失败',
      error
    };
  }
};
