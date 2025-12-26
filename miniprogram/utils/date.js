/**
 * 日期格式化工具
 */

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date} date 日期对象
 * @returns {String} 格式化后的日期字符串
 */
function formatDate (date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 获取今天的日期字符串
 * @returns {String} YYYY-MM-DD
 */
function getToday () {
  return formatDate(new Date());
}

/**
 * 获取星期几的中文
 * @param {Date} date 日期对象
 * @returns {String} 如: 周一
 */
function getWeekDay (date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekDays[date.getDay()];
}

/**
 * 获取日期显示文本
 * @param {Date} date 日期对象
 * @returns {String} 如: 2025-12-26 周五
 */
function getDateDisplay (date) {
  if (!date) date = new Date();
  return `${formatDate(date)} ${getWeekDay(date)}`;
}

/**
 * 计算两个日期之间的天数差
 * @param {String|Date} startDate 开始日期
 * @param {String|Date} endDate 结束日期
 * @returns {Number} 天数差
 */
function getDaysBetween (startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * 增加天数
 * @param {String|Date} date 日期
 * @param {Number} days 要增加的天数
 * @returns {String} 新日期 YYYY-MM-DD
 */
function addDays (date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * 检查日期是否在范围内
 * @param {String} date 要检查的日期
 * @param {String} startDate 开始日期
 * @param {String} endDate 结束日期
 * @returns {Boolean}
 */
function isDateInRange (date, startDate, endDate) {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
}

/**
 * 生成日期数组
 * @param {String} startDate 开始日期
 * @param {Number} days 天数
 * @returns {Array} 日期数组
 */
function generateDateArray (startDate, days) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    dates.push(addDays(startDate, i));
  }
  return dates;
}

module.exports = {
  formatDate,
  getToday,
  getWeekDay,
  getDateDisplay,
  getDaysBetween,
  addDays,
  isDateInRange,
  generateDateArray
};
