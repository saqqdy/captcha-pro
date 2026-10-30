# API 参考手册

本手册详细说明 captcha-pro 的所有 API 接口和配置选项。

## 📋 目录

- [验证码类型](#验证码类型)
- [通用配置](#通用配置)
- [实例方法](#实例方法)
- [事件回调](#事件回调)
- [工具函数](#工具函数)

## 验证码类型

### SliderCaptcha - 滑块验证码

```typescript
import { SliderCaptcha } from '@captcha-pro/core'

const captcha = new SliderCaptcha(options: SliderCaptchaOptions)
```

### ClickCaptcha - 点选验证码

```typescript
import { ClickCaptcha } from '@captcha-pro/core'

const captcha = new ClickCaptcha(options: ClickCaptchaOptions)
```

### PopupCaptcha - 弹窗验证码

```typescript
import { PopupCaptcha } from '@captcha-pro/core'

const popup = new PopupCaptcha(options: PopupCaptchaOptions)
```

### InvisibleCaptcha - 无感验证码

```typescript
import { InvisibleCaptcha } from '@captcha-pro/core'

const captcha = new InvisibleCaptcha(options: InvisibleCaptchaOptions)
```

## 通用配置

所有验证码类型共享以下基础配置：

```typescript
interface BaseCaptchaOptions {
  // 容器
  el: string | HTMLElement  // 必填：容器元素或选择器

  // 尺寸
  width?: number     // 默认：300
  height?: number    // 默认：170

  // 行为
  showRefresh?: boolean  // 默认：true
  className?: string     // 默认：'captcha-*'

  // 验证模式
  verifyMode?: 'frontend' | 'backend'  // 默认：'frontend'
  backendVerify?: BackendVerifyOptions

  // 安全
  security?: SecurityOptions

  // 国际化
  locale?: 'zh-CN' | 'en-US'

  // 回调
  onSuccess?: () => void
  onFail?: () => void
  onRefresh?: () => void
}
```

## 实例方法

### 通用方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `verify(data)` | 手动验证 | `boolean` |
| `reset()` | 重置验证码状态 | `void` |
| `refresh()` | 生成新验证码 | `void` |
| `destroy()` | 销毁实例 | `void` |
| `getData()` | 获取验证数据 | `object` |
| `getSignedData()` | 获取加密数据（用于后端验证） | `Promise<object>` |
| `getStatistics()` | 获取统计数据 | `StatisticsData` |
| `resetStatistics()` | 重置统计数据 | `void` |

### SliderCaptcha 专属方法

```typescript
// 获取滑块目标位置
const data = captcha.getData()
console.log('目标 X 坐标:', data.target)

// 获取统计数据
const stats = captcha.getStatistics()
console.log({
  totalAttempts: stats.totalAttempts,
  successCount: stats.successCount,
  failCount: stats.failCount,
  successRate: stats.successRate,
  avgVerifyTime: stats.avgVerifyTime,
  avgDragTime: stats.avgDragTime,
  avgDragDistance: stats.avgDragDistance
})
```

### ClickCaptcha 专属方法

```typescript
// 获取用户点击的点
const points = captcha.getClickPoints()
console.log('点击坐标:', points)
// [{ x: 123, y: 45 }, { x: 234, y: 67 }, ...]
```

### PopupCaptcha 专属方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `show()` | 显示弹窗 | `void` |
| `hide()` | 隐藏弹窗 | `void` |
| `isVisible()` | 获取可见状态 | `boolean` |
| `getCaptcha()` | 获取内部验证码实例 | `SliderCaptcha \| ClickCaptcha` |

### InvisibleCaptcha 专属方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `getRiskScore()` | 获取风险分数（0-1） | `number` |
| `showChallenge()` | 手动显示挑战 | `void` |

## 事件回调

```typescript
const captcha = new SliderCaptcha({
  el: '#captcha',

  // 验证通过
  onSuccess: () => {
    console.log('验证通过')
  },

  // 验证失败
  onFail: () => {
    console.log('验证失败')
  },

  // 刷新验证码
  onRefresh: () => {
    console.log('用户点击刷新')
  }
})
```

## 工具函数

### setLocale - 设置语言

```typescript
import { setLocale, getLocale, t } from '@captcha-pro/core'

// 全局设置语言
setLocale('en-US')

// 获取当前语言
console.log(getLocale())  // 'en-US'

// 获取翻译文本
console.log(t('slider.success'))  // 'Verification passed'
```

### decryptCaptchaData - 解密验证数据

```typescript
import { decryptCaptchaData, validateTimestamp } from '@captcha-pro/core'

// 后端解密数据
async function verifyCaptcha(encryptedData, secretKey) {
  try {
    // 解密
    const data = await decryptCaptchaData(encryptedData.signature, secretKey)

    // 验证时间戳
    if (!validateTimestamp(data.timestamp, 60000)) {
      return { valid: false, error: 'Timestamp expired' }
    }

    return { valid: true, data }
  } catch (error) {
    return { valid: false, error: 'Invalid encrypted data' }
  }
}
```

### Factory 函数

```typescript
import {
  createSliderCaptcha,
  createClickCaptcha,
  createInvisibleCaptcha,
  createPopupCaptcha
} from '@captcha-pro/core'

const slider = createSliderCaptcha({ el: '#slider' })
const click = createClickCaptcha({ el: '#click' })
const invisible = createInvisibleCaptcha({ el: '#btn' })
const popup = createPopupCaptcha({ type: 'slider' })
```

## 类型定义

### StatisticsData

```typescript
interface StatisticsData {
  totalAttempts: number      // 总尝试次数
  successCount: number       // 成功次数
  failCount: number          // 失败次数
  successRate: number        // 成功率（百分比）
  avgVerifyTime: number      // 平均验证时间（毫秒）
  avgDragTime: number        // 平均拖动时间（毫秒，仅滑块）
  avgDragDistance: number    // 平均拖动距离（像素，仅滑块）
}
```

### BackendVerifyOptions

```typescript
interface BackendVerifyOptions {
  getCaptcha: string | Function  // URL 或函数：获取验证码
  verify: string | Function      // URL 或函数：验证用户输入
  headers?: object               // 请求头
  timeout?: number               // 超时时间（毫秒），默认 10000
}
```

### SecurityOptions

```typescript
interface SecurityOptions {
  secretKey?: string         // AES-GCM 加密密钥
  enableSign?: boolean       // 启用签名，默认 false
  timestampTolerance?: number // 时间戳容差（毫秒），默认 60000
}
```

## 🔗 相关链接

- [配置选项详解](./options.md)
- [前端集成指南](../guides/frontend-integration.md)
- [后端集成指南](../guides/backend-integration.md)