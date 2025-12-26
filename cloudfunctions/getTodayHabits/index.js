const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

/**
 * 获取今日习惯列表
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 获取今天日期 YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // 查询所有进行中的习惯
    const { data: habits } = await db.collection('user_habits')
      .where({
        _openid: openid,
        status: 'in_progress',
        start_date: _.lte(today)  // 开始日期 <= 今天
      })
      .orderBy('created_at', 'asc')
      .get();

    // 检查哪些习惯周期已结束
    const endedHabits = [];
    const activeHabits = [];

    for (let habit of habits) {
      const endDate = calculateEndDate(habit.start_date, habit.cycle_days);

      if (today > endDate) {
        // 周期已结束
        endedHabits.push({
          ...habit,
          end_date: endDate,
          is_ended: true
        });
      } else {
        activeHabits.push(habit);
      }
    }

    // 为活跃习惯查询今日打卡记录
    for (let habit of activeHabits) {
      const { data: logs } = await db.collection('habit_logs')
        .where({
          user_habit_id: habit._id,
          date: today
        })
        .get();

      habit.today_times = logs.length > 0 ? logs[0].times : 0;
      habit.is_completed = habit.today_times >= habit.target_times_per_day;

      // 计算周期进度
      const daysPassed = getDaysBetween(habit.start_date, today) + 1;
      habit.progress = {
        current: daysPassed,
        total: habit.cycle_days
      };
    }

    return {
      code: 0,
      message: '获取成功',
      data: {
        habits: activeHabits,
        ended_habits: endedHabits,
        today: today
      }
    };
  } catch (error) {
    console.error('getTodayHabits error:', error);
    return {
      code: -1,
      message: '获取失败',
      error: error.message
    };
  }
};

// 辅助函数:计算结束日期
function calculateEndDate (startDate, cycleDays) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + cycleDays - 1);
  return date.toISOString().split('T')[0];
}

// 辅助函数:计算天数差
function getDaysBetween (startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
