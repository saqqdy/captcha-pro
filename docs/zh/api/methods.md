# 方法

## 验证码实例方法

`SliderCaptcha` 与 `ClickCaptcha` 共享：

| 方法 | 描述 |
|--------|-------------|
| `verify(data)` | 手动验证 |
| `reset()` | 重置验证码状态 |
| `refresh()` | 生成新的验证码 |
| `destroy()` | 销毁验证码实例 |
| `getData()` | 获取验证码数据 |
| `getSignedData()` | 获取带签名的数据用于后端验证 |
| `getStatistics()` | 获取验证统计 |
| `resetStatistics()` | 重置统计数据 |

## PopupCaptcha 实例方法

| 方法 | 描述 |
|--------|-------------|
| `show()` | 显示弹窗 |
| `hide()` | 隐藏弹窗 |
| `isVisible()` | 获取可见状态 |
| `getCaptcha()` | 获取内部验证码实例 |
| `destroy()` | 销毁弹窗实例 |

## InvisibleCaptcha 实例方法

| 方法 | 描述 |
|--------|-------------|
| `getRiskScore()` | 获取当前风险分数（0-1） |
| `showChallenge()` | 手动显示挑战 |
| `destroy()` | 销毁实例 |

## 统计数据结构

`getStatistics()` 返回：

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| `totalAttempts` | `number` | 总验证次数 |
| `successCount` | `number` | 成功次数 |
| `failCount` | `number` | 失败次数 |
| `successRate` | `number` | 成功率（0-100） |
| `avgVerifyTime` | `number` | 平均验证耗时（毫秒） |
| `avgDragTime` | `number` | 平均拖动耗时（毫秒） |
| `avgDragDistance` | `number` | 平均拖动距离（像素） |
