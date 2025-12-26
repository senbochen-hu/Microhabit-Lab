const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * 打卡
 * @param {String} user_habit_id 习惯ID
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { user_habit_id } = event;

  try {
    if (!user_habit_id) {
      return {
        code: -1,
        message: '习惯ID不能为空'
      };
    }

    // 查询习惯信息
    const { data: habits } = await db.collection('user_habits')
      .where({
        _id: user_habit_id,
        _openid: openid
      })
      .get();

    if (habits.length === 0) {
      return {
        code: -1,
        message: '习惯不存在'
      };
    }

    const habit = habits[0];

    if (habit.status !== 'in_progress') {
      return {
        code: -1,
        message: '该习惯已结束'
      };
    }

    // 获取今天日期
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // 查询今日打卡记录
    const { data: logs } = await db.collection('habit_logs')
      .where({
        user_habit_id: user_habit_id,
        date: today
      })
      .get();

    let newTimes = 1;

    if (logs.length === 0) {
      // 今天第一次打卡,创建记录
      await db.collection('habit_logs').add({
        data: {
          _openid: openid,
          user_habit_id: user_habit_id,
          date: today,
          times: 1,
          created_at: now,
          updated_at: now
        }
      });
      newTimes = 1;
    } else {
      // 已有打卡记录,次数+1
      const log = logs[0];

      if (log.times >= habit.target_times_per_day) {
        return {
          code: 1002,
          message: '今日已完成目标次数',
          data: {
            times: log.times,
            target: habit.target_times_per_day
          }
        };
      }

      newTimes = log.times + 1;

      await db.collection('habit_logs')
        .doc(log._id)
        .update({
          data: {
            times: newTimes,
            updated_at: now
          }
        });
    }

    return {
      code: 0,
      message: '打卡成功',
      data: {
        times: newTimes,
        target: habit.target_times_per_day,
        is_completed: newTimes >= habit.target_times_per_day
      }
    };
  } catch (error) {
    console.error('logHabit error:', error);
    return {
      code: -1,
      message: '打卡失败',
      error: error.message
    };
  }
};
