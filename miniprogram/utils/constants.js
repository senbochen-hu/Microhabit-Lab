/**
 * 鼓励语文案池
 */

const encouragementTexts = [
  '今天,只需要完成这些小小的动作,就足够了。',
  '小小的30秒,也在一点点改变未来。',
  '不求完美,坚持一点点就好。',
  '每一个微小的行动,都是在为自己投资。',
  '今天的你,又向目标迈进了一小步。',
  '不要小看这些小动作,它们会带来大改变。',
  '做一点点,总比什么都不做要好。',
  '保持简单,保持轻松,保持前进。',
  '你已经开始了,这就是最大的成功。',
  '一天一点点,习惯就会慢慢形成。'
];

/**
 * 触发器选项
 */
const triggerOptions = [
  { label: '刷牙后', value: '刷牙后' },
  { label: '上班路上', value: '上班路上' },
  { label: '午饭后', value: '午饭后' },
  { label: '下班到家后', value: '下班到家后' },
  { label: '睡前', value: '睡前' },
  { label: '其他', value: 'other' }
];

/**
 * 习惯分类
 */
const habitCategories = [
  { label: '全部', value: 'all' },
  { label: '健康', value: 'health' },
  { label: '学习', value: 'study' },
  { label: '情绪', value: 'emotion' },
  { label: '效率', value: 'efficiency' }
];

/**
 * 分类图标映射(可使用emoji或图片)
 */
const categoryIcons = {
  health: '💚',
  study: '📚',
  emotion: '😊',
  efficiency: '⚡'
};

/**
 * 分类名称映射
 */
const categoryNames = {
  health: '健康',
  study: '学习',
  emotion: '情绪',
  efficiency: '效率'
};

/**
 * 会员权益列表
 */
const memberBenefits = [
  '无限创建习惯(最多20个同时进行)',
  '解锁全部精选微习惯模板',
  '查看完整21天打卡记录',
  '获得详细数据分析与建议',
  '添加个人实验备注'
];

/**
 * 打卡成功文案池
 */
const checkInSuccessTexts = [
  '已记录,做得很好!',
  '太棒了,又完成一次!',
  '继续保持,你很棒!',
  '做得很好,坚持下去!',
  '又打卡了,真不错!'
];

module.exports = {
  encouragementTexts,
  triggerOptions,
  habitCategories,
  categoryIcons,
  categoryNames,
  memberBenefits,
  checkInSuccessTexts
};
