/**
 * 全局错误处理工具函数
 */

/**
 * 显示错误信息
 * @param {string} message 错误信息
 * @param {boolean} showIcon 是否显示图标
 */
function showError (message, showIcon = true) {
  wx.showToast({
    title: message || '出错了，请稍后重试',
    icon: showIcon ? 'none' : undefined,
    duration: 2000
  });
}

/**
 * 显示网络错误提示
 */
function showNetworkError () {
  showError('网络异常，请检查连接');
}

/**
 * 显示加载中状态
 * @param {string} title 提示文案
 */
function showLoading (title = '加载中...') {
  wx.showLoading({
    title,
    mask: true
  });
}

/**
 * 隐藏加载状态
 */
function hideLoading () {
  wx.hideLoading();
}

/**
 * 处理云函数调用错误
 * @param {Error} error 错误对象
 * @param {string} functionName 云函数名
 */
function handleCloudFunctionError (error, functionName = '') {
  console.error(`[Cloud Function Error] ${functionName}:`, error);

  if (error.errCode === 'SYSTEM_ERR') {
    showNetworkError();
  } else if (error.message && error.message.indexOf('timeout') > -1) {
    showError('请求超时，请检查网络');
  } else if (error.message) {
    showError(error.message);
  } else {
    showError('操作失败，请稍后重试');
  }
}

/**
 * 处理API调用错误
 * @param {Error} error 错误对象
 * @param {string} apiName API名称
 */
function handleAPIError (error, apiName = '') {
  console.error(`[API Error] ${apiName}:`, error);
  showNetworkError();
}

/**
 * 显示确认对话框
 * @param {Object} options 配置选项
 */
async function showConfirmDialog (options = {}) {
  const {
    title = '确认',
    content = '确定要继续吗？',
    confirmText = '确认',
    cancelText = '取消'
  } = options;

  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText,
      cancelText,
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
}

module.exports = {
  showError,
  showNetworkError,
  showLoading,
  hideLoading,
  handleCloudFunctionError,
  handleAPIError,
  showConfirmDialog
};
