# API 参考

captcha-pro 暴露四个验证码类、共享选项类型与实例方法。

## 类

| 类 | 描述 |
|-------|-------------|
| `SliderCaptcha` | 滑动拼图验证 |
| `ClickCaptcha` | 点选文字验证 |
| `PopupCaptcha` | 滑动 / 点选的模态包装器 |
| `InvisibleCaptcha` | 基于风险评估的隐形验证 |

## 工厂函数

```javascript
import {
  createSliderCaptcha,
  createClickCaptcha,
  createInvisibleCaptcha,
  createPopupCaptcha
} from '@captcha-pro/core'
```

## 辅助函数

| 函数 | 描述 |
|----------|-------------|
| `setLocale(locale)` | 设置全局语言（`zh-CN` / `en-US`） |
| `getLocale()` | 获取当前语言 |
| `t(key)` | 获取翻译文本 |
| `decryptCaptchaData(signature, secretKey)` | 解密 AES-GCM 签名数据（后端） |
| `validateTimestamp(timestamp, tolerance)` | 按容差校验时间戳（后端） |

## 章节

- [选项](/zh/api/options) — 所有选项表（各类型 + 共享类型）
- [方法](/zh/api/methods) — 所有实例方法
