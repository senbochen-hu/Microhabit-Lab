const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

/**
 * 创建支付订单 (月度会员 6.6 元)
 * 注意: 需在云开发控制台配置商户号、密钥和支付回调安全域名。
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 请在云开发控制台绑定支付商户, 并填入子商户号
    const subMchId = process.env.SUB_MCH_ID || '';
    if (!subMchId) {
      return {
        code: -1,
        message: '缺少商户号配置 (SUB_MCH_ID)'
      };
    }

    const outTradeNo = `mhl-${Date.now()}`;

    const result = await cloud.cloudPay.unifiedOrder({
      body: '微习惯会员(月度)',
      outTradeNo,
      spbillCreateIp: '127.0.0.1',
      subMchId,
      totalFee: 660, // 金额单位: 分, 6.6元
      envId: process.env.TCB_ENV,
      functionName: 'activateMembership', // 支付回调时触发
      tradeType: 'JSAPI',
      openid
    });

    return {
      code: 0,
      message: '下单成功',
      data: result.payment // 前端 wx.requestPayment 直接使用
    };
  } catch (error) {
    console.error('createPayment error:', error);
    return {
      code: -1,
      message: '下单失败',
      error: error.message
    };
  }
};
