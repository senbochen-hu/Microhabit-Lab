const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * 初始化习惯模板数据
 * 一次性导入20条预设微习惯模板
 * 注意: 此云函数执行一次后可以删除
 */
exports.main = async (event, context) => {
  try {
    // 检查是否已经导入过
    const { total } = await db.collection('habit_templates').count();

    if (total > 0) {
      return {
        code: 1,
        message: '数据已存在,无需重复导入',
        data: { existing_count: total }
      };
    }

    // 20条习惯模板数据
    const templates = [
      // 健康类 (7条)
      {
        name: '每天早上刷牙后喝 1 大口水',
        category: 'health',
        default_trigger: '刷牙后',
        description: '补充夜间流失的水分,帮助身体"启动新的一天"。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '每坐满 1 小时,就站起来活动 1 分钟',
        category: 'health',
        default_trigger: '工作或学习满 1 小时后',
        description: '久坐伤身,短暂站起和走动可以缓解脊椎和肌肉压力。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '下班路上多走一层楼梯(向上或向下都可以)',
        category: 'health',
        default_trigger: '下班离开公司时',
        description: '利用通勤时间做一点轻运动,对心肺有帮助,门槛极低。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '坐着时做 3 次缓慢的肩颈绕圈放松',
        category: 'health',
        default_trigger: '感觉肩颈僵硬时',
        description: '久坐电脑前的人常见问题,简短拉伸可以缓解酸痛。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '晚餐时刻,刻意少吃一口主食就放下筷子',
        category: 'health',
        default_trigger: '吃晚餐到最后几口时',
        description: '每晚减少一点点摄入,比一开始就严格节食更容易坚持。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '刷完牙后就不再吃任何零食或夜宵',
        category: 'health',
        default_trigger: '睡前刷牙后',
        description: '把"刷牙"作为一天饮食结束的标志,有助于控制体重和保护牙齿。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '外出时,刻意停下 1 分钟抬头看看天空和阳光',
        category: 'health',
        default_trigger: '白天外出或走到窗边时',
        description: '短暂接触自然光有助于调节生物钟和情绪。',
        is_active: true,
        created_at: new Date()
      },

      // 学习类 (5条)
      {
        name: '每天找一个固定时间,至少翻开书并读 1 页',
        category: 'study',
        default_trigger: '吃完晚饭后',
        description: '把"开始读"的门槛降到极低,比设定 30 分钟更容易坐下来。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '每天在同一时间,记住 1 个新单词或新概念',
        category: 'study',
        default_trigger: '睡前躺下前',
        description: '日积月累,每天 1 个,也是一年 300+ 的进步。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '打开电脑后,先看 1 分钟学习资料再干别的',
        category: 'study',
        default_trigger: '每天第一次打开电脑时',
        description: '利用"开机"这一触发器,把学习排在娱乐之前。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '上课或开会前,先把笔记本翻到新的一页准备记录',
        category: 'study',
        default_trigger: '每次上课或开会前',
        description: '提前准备记录空间,让自己更愿意做笔记和思考。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '睡前用 1 句话写下今天学到的一个新点',
        category: 'study',
        default_trigger: '睡前关灯前',
        description: '简单回顾帮助加深记忆,让每一天都有小收获。',
        is_active: true,
        created_at: new Date()
      },

      // 情绪类 (4条)
      {
        name: '感觉紧张或烦躁时,停下来做 3 次深呼吸',
        category: 'emotion',
        default_trigger: '情绪波动明显时',
        description: '深呼吸是最简单的情绪缓冲动作,有助于稳定心率和大脑。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '睡前写下今天让你感到一点点开心或感激的一件小事',
        category: 'emotion',
        default_trigger: '睡前刷手机结束后',
        description: '培养"看见好事"的注意力,对长期心情有积极影响。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '想发火前,先在心里数到 3 再决定要不要说出口',
        category: 'emotion',
        default_trigger: '准备说重话或吵架前',
        description: '给情绪反应多 1 秒缓冲,很多冲动会自然减弱。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '照镜子时,对自己说一句肯定或鼓励的话',
        category: 'emotion',
        default_trigger: '早晨洗脸或刷牙时',
        description: '自我肯定是建立自信的重要方式之一,从一句小小的鼓励开始。',
        is_active: true,
        created_at: new Date()
      },

      // 效率类 (4条)
      {
        name: '每天早上写下今天最重要要完成的 1 件事',
        category: 'efficiency',
        default_trigger: '开始工作或学习前',
        description: '让一天至少有一个明确的"优先级 1",避免忙乱。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '每次离开座位前,用 10 秒整理桌面',
        category: 'efficiency',
        default_trigger: '准备离开工位/书桌时',
        description: '微小的整理动作可以长期保持工作环境整洁,减轻心里负担。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '解锁手机后,先处理 1 条真正重要的消息再刷其他内容',
        category: 'efficiency',
        default_trigger: '每次解锁手机准备刷社交软件时',
        description: '把注意力优先给重要信息,而不是被娱乐内容瞬间占满。',
        is_active: true,
        created_at: new Date()
      },
      {
        name: '睡前把明天要穿的衣服和包提前准备好',
        category: 'efficiency',
        default_trigger: '刷完牙准备睡觉时',
        description: '减少早晨的决策疲劳,让起床后节奏更顺畅。',
        is_active: true,
        created_at: new Date()
      }
    ];

    // 批量插入
    const result = await db.collection('habit_templates').add({
      data: templates
    });

    console.log('导入成功:', result);

    return {
      code: 0,
      message: '导入成功',
      data: {
        count: templates.length,
        ids: result._ids
      }
    };
  } catch (error) {
    console.error('导入失败:', error);
    return {
      code: -1,
      message: '导入失败',
      error: error.message
    };
  }
};
