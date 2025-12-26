const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * 获取统计数据
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 读取用户的所有习惯(进行中/已完成)
    const { data: habits } = await db.collection('user_habits')
      .where({ _openid: openid })
      .get();

    const inProgress = habits.filter(h => h.status === 'in_progress').length;
    const finished = habits.filter(h => h.status === 'finished').length;

    // 计算最长连续天数(遍历每个习惯周期内的打卡)
    const maxStreak = await calculateMaxStreakAcrossHabits(habits, openid);

    // 构建近7天/30天趋势
    const today = getToday();
    const weeklyTrend = await buildTrend(openid, habits, 7, today);
    const monthlyTrend = await buildTrend(openid, habits, 30, today);

    return {
      code: 0,
      message: '获取成功',
      data: {
        inProgress,
        finished,
        maxStreak,
        weeklyTrend,
        monthlyTrend
      }
    };
  } catch (error) {
    console.error('getStats error:', error);
    return {
      code: -1,
      message: '获取失败',
      error: error.message
    };
  }
};

function getToday () {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays (dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isActiveOnDate (habit, dateStr) {
  if (habit.status !== 'in_progress') return false;
  const cycleDays = habit.cycle_days || 21;
  const endDate = addDays(habit.start_date, cycleDays - 1);
  return habit.start_date <= dateStr && dateStr <= endDate;
}

async function buildTrend (openid, habits, rangeDays, todayStr) {
  const startDate = addDays(todayStr, -(rangeDays - 1));

  // 拉取时间范围内的打卡记录
  const logsRes = await db.collection('habit_logs')
    .where({
      _openid: openid,
      date: _.gte(startDate).and(_.lte(todayStr))
    })
    .get();

  const logs = logsRes.data || [];
  const data = [];

  for (let i = 0; i < rangeDays; i++) {
    const date = addDays(startDate, i);
    const activeCount = habits.filter(h => isActiveOnDate(h, date)).length;
    const completedSet = new Set(logs.filter(l => l.date === date && l.times >= 1).map(l => l.user_habit_id));
    const completed = completedSet.size;
    const rate = activeCount > 0 ? Math.round((completed / activeCount) * 100) : 0;

    data.push({ date, completed, active: activeCount, rate });
  }

  const avgRate = data.length ? Math.round(data.reduce((sum, d) => sum + d.rate, 0) / data.length) : 0;
  return { avgRate, data };
}

async function calculateMaxStreakAcrossHabits (habits, openid) {
  let maxStreak = 0;

  for (const habit of habits) {
    const cycleDays = habit.cycle_days || 21;
    const endDate = addDays(habit.start_date, cycleDays - 1);

    const { data: logs } = await db.collection('habit_logs')
      .where({
        _openid: openid,
        user_habit_id: habit._id,
        date: _.gte(habit.start_date).and(_.lte(endDate))
      })
      .orderBy('date', 'asc')
      .get();

    const streak = calculateMaxStreak(logs, habit.start_date, cycleDays, habit.target_times_per_day || 1);
    maxStreak = Math.max(maxStreak, streak);
  }

  return maxStreak;
}

function calculateMaxStreak (logs, startDate, days, targetTimes) {
  const dates = [];
  const start = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const completionMap = {};
  logs.forEach(log => {
    completionMap[log.date] = log.times >= targetTimes;
  });

  let maxStreak = 0;
  let currentStreak = 0;

  dates.forEach(date => {
    if (completionMap[date]) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  return maxStreak;
}
