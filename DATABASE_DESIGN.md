# 微习惯实验室 - 数据库设计文档

## 集合概览

| 集合名 | 说明 | 记录数预估 |
|--------|------|-----------|
| users | 用户信息与会员状态 | 取决于用户量 |
| habit_templates | 预设微习惯模板 | 20条(初始) |
| user_habits | 用户创建的习惯 | 每用户3-20条 |
| habit_logs | 每日打卡记录 | 每习惯每天1条 |

---

## 1. users 集合

**说明**: 存储用户基本信息和会员状态

**字段定义**:

```json
{
  "_id": "自动生成",
  "_openid": "用户的微信OpenID(云开发自动)",
  "register_time": "2025-12-26T10:00:00.000Z",
  "last_login_time": "2025-12-26T10:00:00.000Z",
  "member_status": 0,              // 0=普通用户, 1=会员
  "member_expire_time": null,      // 会员到期时间,非会员为null
  "created_at": "2025-12-26T10:00:00.000Z",
  "updated_at": "2025-12-26T10:00:00.000Z"
}
```

**索引**:
- `_openid`: 唯一索引
- `member_status`: 普通索引(用于会员统计)

**权限**:
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

---

## 2. habit_templates 集合

**说明**: 系统预设的微习惯模板库

**字段定义**:

```json
{
  "_id": "自动生成",
  "name": "每天早上刷牙后喝 1 大口水",
  "category": "health",            // health/study/emotion/efficiency
  "default_trigger": "刷牙后",
  "description": "补充夜间流失的水分,帮助身体"启动新的一天"。",
  "is_active": true,               // 是否启用
  "created_at": "2025-12-26T10:00:00.000Z"
}
```

**分类枚举**:
- `health`: 健康类
- `study`: 学习类
- `emotion`: 情绪类
- `efficiency`: 效率类

**索引**:
- `category`: 普通索引
- `is_active`: 普通索引

**权限**:
```json
{
  "read": true,          // 所有人可读
  "write": false         // 仅管理员可写
}
```

---

## 3. user_habits 集合

**说明**: 用户创建的习惯记录

**字段定义**:

```json
{
  "_id": "自动生成",
  "_openid": "用户OpenID",
  "template_id": "habit_templates._id 或 null",
  "name": "刷牙后喝一口水",
  "trigger": "刷牙后",
  "target_times_per_day": 1,       // 每天目标次数
  "start_date": "2025-12-26",      // YYYY-MM-DD
  "cycle_days": 21,                // 周期天数
  "status": "in_progress",         // in_progress/finished
  "note": "",                      // 用户备注(会员功能)
  "created_at": "2025-12-26T10:00:00.000Z",
  "updated_at": "2025-12-26T10:00:00.000Z"
}
```

**状态枚举**:
- `in_progress`: 进行中
- `finished`: 已结束/暂停

**索引**:
- `_openid`: 普通索引
- `status`: 普通索引
- `start_date`: 普通索引
- 复合索引: `(_openid, status)`

**权限**:
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

**业务规则**:
- 免费用户: 同时进行中的习惯(status=in_progress)最多3个
- 会员用户: 最多20个
- `end_date` = `start_date` + `cycle_days` - 1 (计算得出)

---

## 4. habit_logs 集合

**说明**: 每日打卡记录

**字段定义**:

```json
{
  "_id": "自动生成",
  "_openid": "用户OpenID",
  "user_habit_id": "user_habits._id",
  "date": "2025-12-26",            // YYYY-MM-DD
  "times": 1,                      // 当日打卡次数
  "created_at": "2025-12-26T10:05:00.000Z",
  "updated_at": "2025-12-26T10:05:00.000Z"
}
```

**索引**:
- `_openid`: 普通索引
- `user_habit_id`: 普通索引
- `date`: 普通索引
- 复合索引: `(user_habit_id, date)` 唯一索引

**权限**:
```json
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

**业务规则**:
- 每个习惯每天一条记录
- `times` 不能超过 `user_habits.target_times_per_day`
- `times >= 1` 视为当天完成

---

## 初始数据

### habit_templates 初始数据

需要导入20条预设微习惯模板,分类如下:

- **健康类 (health)**: 7条
  - 早起喝水
  - 每小时站立
  - 走楼梯
  - 肩颈放松
  - 晚餐少吃一口
  - 刷牙后不吃东西
  - 晒太阳

- **学习类 (study)**: 5条
  - 打开书翻1页
  - 记1个单词
  - 开机先看学习资料
  - 准备笔记本
  - 每天总结1句话

- **情绪类 (emotion)**: 4条
  - 深呼吸3次
  - 写1句感谢
  - 生气前数到3
  - 对自己说鼓励的话

- **效率类 (efficiency)**: 4条
  - 写下最重要的事
  - 离开前整理桌面
  - 先处理重要消息
  - 准备明天的衣服

详细数据参考: `微习惯实验室-首发微习惯库20条.md`

---

## 数据导入脚本

创建 `cloudfunctions/initTemplates/index.js`:

```javascript
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const templates = [
    // 在此添加20条模板数据
    {
      name: "每天早上刷牙后喝 1 大口水",
      category: "health",
      default_trigger: "刷牙后",
      description: "补充夜间流失的水分,帮助身体"启动新的一天"。",
      is_active: true,
      created_at: new Date()
    },
    // ... 其余19条
  ];

  try {
    const result = await db.collection('habit_templates').add({
      data: templates
    });
    return { code: 0, message: '导入成功', data: result };
  } catch (error) {
    return { code: -1, message: '导入失败', error };
  }
};
```

---

## 查询示例

### 1. 获取今日习惯

```javascript
// 云函数中
const db = cloud.database();
const _ = db.command;
const today = '2025-12-26';

// 查询进行中的习惯
const { data: habits } = await db.collection('user_habits')
  .where({
    _openid: openid,
    status: 'in_progress',
    start_date: _.lte(today)  // 开始日期 <= 今天
  })
  .get();

// 对每个习惯查询今日打卡记录
for (let habit of habits) {
  const { data: logs } = await db.collection('habit_logs')
    .where({
      user_habit_id: habit._id,
      date: today
    })
    .get();

  habit.today_times = logs.length > 0 ? logs[0].times : 0;
}
```

### 2. 获取习惯完成情况

```javascript
// 获取某个习惯最近21天的打卡记录
const { data: logs } = await db.collection('habit_logs')
  .where({
    user_habit_id: habitId,
    date: _.gte(startDate).and(_.lte(endDate))
  })
  .orderBy('date', 'asc')
  .get();

// 计算完成率
const completedDays = logs.filter(log => log.times >= 1).length;
const completionRate = Math.round((completedDays / 21) * 100);
```

### 3. 统计数据

```javascript
// 进行中的习惯数量
const { total: inProgressCount } = await db.collection('user_habits')
  .where({
    _openid: openid,
    status: 'in_progress'
  })
  .count();

// 已完成的实验数量
const { total: finishedCount } = await db.collection('user_habits')
  .where({
    _openid: openid,
    status: 'finished'
  })
  .count();
```

---

## 数据备份建议

1. **定期备份**: 每周备份云数据库
2. **用户数据导出**: 提供用户数据导出功能
3. **日志归档**: 超过90天的logs可以归档

---

## 性能优化建议

1. **合理使用索引**: 已在上方定义的索引都应该创建
2. **分页查询**: 数据量大时使用 `limit` 和 `skip`
3. **聚合查询**: 复杂统计使用云函数聚合
4. **缓存策略**: 模板数据可以缓存到小程序本地

---

## 数据安全

1. **权限控制**: 严格按照上述权限规则设置
2. **数据校验**: 云函数中进行数据格式校验
3. **防刷机制**: 同一习惯每天打卡次数限制
4. **敏感数据**: 不存储用户真实姓名、手机号等敏感信息

---

更新日期: 2025-12-26
