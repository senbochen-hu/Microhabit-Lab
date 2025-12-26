# 数据库初始化指南

## 📋 前提条件

- 已在微信开发者工具中开通云开发
- 环境ID: `cloud1-0g29mlsv3d4ca637`
- 有权限访问云开发控制台

---

## 🚀 初始化步骤

### Step 1: 创建数据库集合

进入 [微信云开发控制台](https://console.cloud.tencent.com/tcb) → 选择对应环境 → 数据库

#### 1.1 创建 `users` 集合

```
集合名称: users
```

**添加以下字段（可选，系统会自动创建）：**
- `_id`: 字符串 (自动)
- `register_time`: 日期
- `last_login_time`: 日期
- `member_status`: 数字 (默认值: 0)
- `member_expire_time`: 日期

**设置权限规则：**

```javascript
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

---

#### 1.2 创建 `habit_templates` 集合

```
集合名称: habit_templates
```

**添加字段：**
- `_id`: 字符串 (自动)
- `name`: 字符串
- `category`: 字符串
- `default_trigger`: 字符串
- `description`: 字符串
- `is_active`: 布尔值

**设置权限规则（所有人可读，仅管理员可写）：**

```javascript
{
  "read": true,
  "write": false
}
```

---

#### 1.3 创建 `user_habits` 集合

```
集合名称: user_habits
```

**添加字段：**
- `_id`: 字符串 (自动)
- `template_id`: 字符串 (可选)
- `name`: 字符串
- `trigger`: 字符串
- `target_times_per_day`: 数字
- `start_date`: 字符串 (YYYY-MM-DD)
- `cycle_days`: 数字
- `status`: 字符串 (in_progress/finished)
- `created_at`: 日期
- `updated_at`: 日期

**设置权限规则：**

```javascript
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

---

#### 1.4 创建 `habit_logs` 集合

```
集合名称: habit_logs
```

**添加字段：**
- `_id`: 字符串 (自动)
- `user_habit_id`: 字符串
- `date`: 字符串 (YYYY-MM-DD)
- `times`: 数字
- `created_at`: 日期
- `updated_at`: 日期

**设置权限规则：**

```javascript
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

---

### Step 2: 导入初始数据

#### 2.1 导入预设习惯模板

进入 `habit_templates` 集合 → 点击"添加记录"

**使用以下数据导入（共20条）：**

**健康类（7条）：**

1. **早起喝水**
```json
{
  "name": "每天早上刷牙后喝 1 大口水",
  "category": "health",
  "default_trigger": "刷牙后",
  "description": "补充夜间流失的水分，帮助身体启动新的一天",
  "is_active": true
}
```

2. **站立活动**
```json
{
  "name": "每坐满 1 小时，就站起来活动 1 分钟",
  "category": "health",
  "default_trigger": "工作或学习满 1 小时后",
  "description": "久坐伤身，短暂站起和走动可以缓解脊椎和肌肉压力",
  "is_active": true
}
```

3. **下班楼梯**
```json
{
  "name": "下班路上多走一层楼梯（向上或向下都可以）",
  "category": "health",
  "default_trigger": "下班离开公司时",
  "description": "利用通勤时间做一点轻运动，对心肺有帮助，门槛极低",
  "is_active": true
}
```

4. **肩颈放松**
```json
{
  "name": "坐着时做 3 次缓慢的肩颈绕圈放松",
  "category": "health",
  "default_trigger": "感觉肩颈僵硬时",
  "description": "久坐电脑前的人常见问题，简短拉伸可以缓解酸痛",
  "is_active": true
}
```

5. **晚上少食**
```json
{
  "name": "晚餐时刻，刻意少吃一口主食就放下筷子",
  "category": "health",
  "default_trigger": "吃晚饭时",
  "description": "减少晚间热量摄入，帮助维持体重，不是节食而是习惯调整",
  "is_active": true
}
```

6. **喝水提醒**
```json
{
  "name": "每次吃饭后喝半杯水",
  "category": "health",
  "default_trigger": "每餐饭后",
  "description": "帮助消化，保持身体水分充足，每天喝够 6-8 杯水的一部分来源",
  "is_active": true
}
```

7. **午睡呼吸**
```json
{
  "name": "午饭后做 1 分钟腹式呼吸",
  "category": "health",
  "default_trigger": "午饭后",
  "description": "缓解午后疲劳，增加氧气摄入，改善大脑清晰度",
  "is_active": true
}
```

**学习类（5条）：**

8. **单词背诵**
```json
{
  "name": "每天背 5 个英文单词",
  "category": "study",
  "default_trigger": "早饭后或晚饭后",
  "description": "每周 35 个新单词，1 个月 140 个，一年可累积新词汇库",
  "is_active": true
}
```

9. **阅读打卡**
```json
{
  "name": "每天读 3 页书（任意类别）",
  "category": "study",
  "default_trigger": "睡前",
  "description": "每月近 100 页，一年 1200 页，也许一年能完整读 2-3 本书",
  "is_active": true
}
```

10. **知识笔记**
```json
{
  "name": "每天记一条有趣的知识点或感悟",
  "category": "study",
  "default_trigger": "下班后或睡前",
  "description": "建立个人知识库，每年 365 条碎片化学习沉淀",
  "is_active": true
}
```

11. **课程学习**
```json
{
  "name": "每天学 10 分钟线上课程（Coursera/得到等）",
  "category": "study",
  "default_trigger": "通勤路上或午休时间",
  "description": "利用碎片时间学新技能，每月 5 小时，一年 60 小时专项学习",
  "is_active": true
}
```

12. **写作练习**
```json
{
  "name": "每天写 50 字的日记或反思",
  "category": "study",
  "default_trigger": "睡前",
  "description": "建立思考习惯，每月 1500 字，一年下来有个人成长日志库",
  "is_active": true
}
```

**情绪类（4条）：**

13. **感恩记录**
```json
{
  "name": "每天记一件值得感恩的小事",
  "category": "emotion",
  "default_trigger": "睡前",
  "description": "调整心态，培养感恩心，改善情绪和睡眠质量",
  "is_active": true
}
```

14. **冥想冥想**
```json
{
  "name": "每天做 5 分钟冥想或深呼吸",
  "category": "emotion",
  "default_trigger": "早起或晚睡前",
  "description": "缓解压力和焦虑，提高专注力和心理素质",
  "is_active": true
}
```

15. **运动放松**
```json
{
  "name": "每天伸展瑜伽 5 分钟",
  "category": "emotion",
  "default_trigger": "早起后或工作累时",
  "description": "释放紧张，放松身心，增强身体柔韧性",
  "is_active": true
}
```

16. **音乐享受**
```json
{
  "name": "每天听 1 首喜欢的歌曲或音乐",
  "category": "emotion",
  "default_trigger": "工作间隙或通勤时",
  "description": "音乐疗法，改善情绪，增加生活美感和快乐",
  "is_active": true
}
```

**效率类（4条）：**

17. **番茄工作法**
```json
{
  "name": "每天使用番茄工作法（25 分钟专注 + 5 分钟休息）至少 1 轮",
  "category": "efficiency",
  "default_trigger": "开始工作或学习时",
  "description": "提高专注力和工作效率，减少拖延和分心",
  "is_active": true
}
```

18. **优先事项**
```json
{
  "name": "每天早上列出当天 3 个最重要的事",
  "category": "efficiency",
  "default_trigger": "早上打开电脑或手机前",
  "description": "聚焦目标，避免被琐事淹没，提高决策效率",
  "is_active": true
}
```

19. **信息整理**
```json
{
  "name": "每晚整理一次工作/学习的文件和思路",
  "category": "efficiency",
  "default_trigger": "下班或学习结束时",
  "description": "养成整理习惯，减少明天找东西的时间浪费，思路更清晰",
  "is_active": true
}
```

20. **无手机时间**
```json
{
  "name": "每天至少有 30 分钟的无手机时间",
  "category": "efficiency",
  "default_trigger": "晚饭时或睡前 1 小时",
  "description": "减少信息污染，保护眼睛，提高生活专注度和睡眠质量",
  "is_active": true
}
```

---

### Step 3: 配置云函数权限

#### 3.1 云函数访问数据库权限

云函数默认有完全访问数据库权限，无需额外配置。

#### 3.2 检查云函数环境变量

在云开发控制台 → 云函数中，为支付相关函数配置环境变量：

**createPayment 云函数**（可选，如果要启用支付）：

```
SUB_MCH_ID: [你的商户号ID]
SUB_MCH_SECRET: [你的商户号密钥]
```

> ⚠️ 如果暂未配置商户号，小程序会自动禁用支付按钮

---

## ✅ 验证初始化成功

1. **进入小程序首页**
   - 应该能看到"今日习惯"为空，提示"从习惯库看看"

2. **进入习惯库页面**
   - 应该能看到分类筛选（全部/健康/学习/情绪/效率）
   - 应该能看到 20 条预设习惯模板

3. **创建一个习惯**
   - 点击"去习惯库看看" → 选择一个习惯 → 点击"添加"
   - 应该成功添加并返回首页

4. **打卡测试**
   - 在首页应该看到新添加的习惯
   - 点击打卡按钮，应该看到"已记录，做得很好！"的提示

5. **进入数据页**
   - 应该看到"进行中"为 1，其他统计数据更新

---

## 🛠️ 常见问题

### Q1: 数据库集合创建失败？
**A**: 检查是否开通了云开发，确保环境 ID 正确。

### Q2: 导入数据显示错误？
**A**: 检查 JSON 格式是否正确，字段名是否匹配。

### Q3: 小程序无法访问数据库？
**A**: 检查权限规则是否配置正确，确保不是 `"write": false` 阻止了写操作。

### Q4: 支付无法正常工作？
**A**: 这是正常的，因为需要配置商户号。使用 `showMembershipGuide` 会自动检测并显示"待配置商户"提示。

---

## 📝 权限规则说明

### `users` 集合权限

```javascript
// 每个用户只能读写自己的数据
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

### `user_habits` 和 `habit_logs` 权限

```javascript
// 云函数访问（通过云函数中间层）
// 前端 SDK 访问需要验证 _openid
{
  "read": "doc._openid == auth.openid",
  "write": "doc._openid == auth.openid"
}
```

### `habit_templates` 权限

```javascript
// 所有人可读，仅后台管理可写
{
  "read": true,
  "write": false
}
```

---

## 🎯 下一步

初始化完成后：

1. ✅ 在微信开发者工具中编译运行
2. ✅ 测试创建、打卡、查看数据流程
3. ✅ 根据测试结果调整 UI/交互
4. ✅ 准备上线（编写隐私政策、用户协议等）

