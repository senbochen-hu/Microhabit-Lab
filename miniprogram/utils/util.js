/**
 * 通用工具函数
 */

/**
 * 显示Toast提示
 * @param {String} title 提示文字
 * @param {String} icon 图标类型: success, error, loading, none
 */
function showToast (title, icon = 'none') {
  wx.showToast({
    title,
    icon,
    duration: 2000
  });
}

/**
 * 显示Loading
 * @param {String} title 加载文字
 */
function showLoading (title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  });
}

/**
 * 隐藏Loading
 */
function hideLoading () {
  wx.hideLoading();
}

/**
 * 显示确认对话框
 * @param {String} title 标题
 * @param {String} content 内容
 * @returns {Promise}
 */
function showConfirm (title, content) {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success (res) {
        if (res.confirm) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail (err) {
        reject(err);
      }
    });
  });
}

/**
 * 防抖函数
 * @param {Function} fn 要执行的函数
 * @param {Number} delay 延迟时间(ms)
 */
function debounce (fn, delay = 500) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param {Function} fn 要执行的函数
 * @param {Number} interval 间隔时间(ms)
 */
function throttle (fn, interval = 1000) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 随机获取数组中的一个元素
 * @param {Array} arr 数组
 * @returns {*}
 */
function randomItem (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 格式化数字(千分位)
 * @param {Number} num 数字
 * @returns {String}
 */
function formatNumber (num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 深拷贝
 * @param {*} obj 要拷贝的对象
 * @returns {*}
 */
function deepClone (obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj);
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  const clonedObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj;
}

/**
 * 字符串截断
 * @param {String} str 字符串
 * @param {Number} maxLength 最大长度
 * @param {String} suffix 后缀,默认'...'
 * @returns {String}
 */
function truncate (str, maxLength, suffix = '...') {
  if (!str || str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + suffix;
}

module.exports = {
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  debounce,
  throttle,
  randomItem,
  formatNumber,
  deepClone,
  truncate
};
