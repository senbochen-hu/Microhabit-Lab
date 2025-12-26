/**
 * 21天实验周期管理工具
 */

const dateUtil = require('./date.js');

/**
 * 计算实验结束日期
 * @param {String} startDate 开始日期 YYYY-MM-DD
 * @param {Number} cycleDays 周期天数,默认21
 * @returns {String} 结束日期 YYYY-MM-DD
 */
function calculateEndDate (startDate, cycleDays = 21) {
  return dateUtil.addDays(startDate, cycleDays - 1);
}

/**
 * 检查实验周期是否结束
 * @param {Object} habit 习惯对象
 * @returns {Boolean}
 */
function isCycleEnded (habit) {
  if (habit.status !== 'in_progress') {
    return false;
  }

  const today = dateUtil.getToday();
  const endDate = calculateEndDate(habit.start_date, habit.cycle_days);

  return today > endDate;
}

/**
 * 获取周期进度
 * @param {Object} habit 习惯对象
 * @returns {Object} { current: Number, total: Number, percentage: Number }
 */
function getCycleProgress (habit) {
  const today = dateUtil.getToday();
  const startDate = habit.start_date;
  const cycleDays = habit.cycle_days || 21;
  const endDate = calculateEndDate(startDate, cycleDays);

  let current = dateUtil.getDaysBetween(startDate, today) + 1;

  // 如果已经超过结束日期
  if (today > endDate) {
    current = cycleDays;
  }

  // 确保current不会小于1或大于total
  current = Math.max(1, Math.min(current, cycleDays));

  return {
    current: current,
    total: cycleDays,
    percentage: Math.round((current / cycleDays) * 100)
  };
}

/**
 * 计算完成率
 * @param {Array} logs 打卡记录数组
 * @param {Number} totalDays 总天数
 * @returns {Object} { completedDays: Number, totalDays: Number, rate: Number }
 */
function calculateCompletionRate (logs, totalDays = 21) {
  const completedDays = logs.filter(log => log.times >= 1).length;
  const rate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return {
    completedDays,
    totalDays,
    rate
  };
}

/**
 * 生成建议文案
 * @param {Number} completionRate 完成率百分比
 * @returns {String}
 */
function generateAdvice (completionRate) {
  if (completionRate >= 80) {
    return '你做得非常棒!这个习惯已经初步建立,可以考虑轻微增加一点难度,比如延长时间或增加频次。';
  } else if (completionRate >= 50) {
    return '不错的开始!如果有些天容易忘记,可以调整触发器的时间,或者给自己设置一个更明显的提醒。';
  } else {
    return '看起来这个习惯有点难度。建议把动作再拆小一点,比如从"5分钟"改成"1分钟",或者换一个更容易的触发时机。';
  }
}

/**
 * 计算最长连续天数
 * @param {Array} logs 打卡记录数组(需按日期排序)
 * @param {String} startDate 开始日期
 * @param {Number} days 总天数
 * @returns {Number}
 */
function calculateMaxStreak (logs, startDate, days = 21) {
  // 生成日期数组
  const dateArray = dateUtil.generateDateArray(startDate, days);

  // 创建日期到完成状态的映射
  const completionMap = {};
  logs.forEach(log => {
    completionMap[log.date] = log.times >= 1;
  });

  let maxStreak = 0;
  let currentStreak = 0;

  dateArray.forEach(date => {
    if (completionMap[date]) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  return maxStreak;
}

/**
 * 检查今天是否已完成
 * @param {Array} logs 今日打卡记录
 * @param {Number} targetTimes 目标次数
 * @returns {Boolean}
 */
function isTodayCompleted (logs, targetTimes = 1) {
  if (!logs || logs.length === 0) {
    return false;
  }

  const today = dateUtil.getToday();
  const todayLog = logs.find(log => log.date === today);

  return todayLog && todayLog.times >= targetTimes;
}

module.exports = {
  calculateEndDate,
  isCycleEnded,
  getCycleProgress,
  calculateCompletionRate,
  generateAdvice,
  calculateMaxStreak,
  isTodayCompleted
};
