const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * 创建习惯
 * @param {String} name 习惯名称
 * @param {String} trigger 触发器
 * @param {Number} target_times_per_day 每天目标次数
 * @param {String} template_id 模板ID(可选)
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { name, trigger, target_times_per_day = 1, template_id = null } = event;

  try {
    // 参数校验
    if (!name || !trigger) {
      return {
        code: -1,
        message: '习惯名称和触发器不能为空'
      };
    }

    if (name.length > 30) {
      return {
        code: -1,
        message: '习惯名称不能超过30个字'
      };
    }

    // 检查用户会员状态
    const { data: users } = await db.collection('users')
      .where({ _openid: openid })
      .get();

    if (users.length === 0) {
      return {
        code: -1,
        message: '用户不存在'
      };
    }

    const user = users[0];
    const isMember = user.member_status === 1;

    // 检查进行中的习惯数量
    const { total: inProgressCount } = await db.collection('user_habits')
      .where({
        _openid: openid,
        status: 'in_progress'
      })
      .count();

    const limit = isMember ? 20 : 3;

    if (inProgressCount >= limit) {
      return {
        code: 1001,  // 特殊code表示超出限制
        message: isMember ? '已达到习惯数量上限' : '免费用户最多同时进行3个习惯',
        data: {
          current: inProgressCount,
          limit: limit,
          is_member: isMember
        }
      };
    }

    // 创建习惯
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const result = await db.collection('user_habits').add({
      data: {
        _openid: openid,
        template_id: template_id,
        name: name,
        trigger: trigger,
        target_times_per_day: target_times_per_day,
        start_date: today,
        cycle_days: 21,
        status: 'in_progress',
        note: '',
        created_at: now,
        updated_at: now
      }
    });

    return {
      code: 0,
      message: '创建成功',
      data: {
        _id: result._id,
        name: name
      }
    };
  } catch (error) {
    console.error('createHabit error:', error);
    return {
      code: -1,
      message: '创建失败',
      error: error.message
    };
  }
};
