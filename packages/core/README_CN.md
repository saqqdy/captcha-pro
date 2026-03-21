# @captcha/core

Captcha Pro 核心包 - 一个轻量级、框架无关的行为验证码库。

## 安装

```bash
pnpm add @captcha/core
```

## 使用

### 滑动拼图验证码

```javascript
import { SliderCaptcha } from '@captcha/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  width: 300,
  height: 170,
  precision: 5,
  onSuccess: () => console.log('验证通过!'),
  onFail: () => console.log('验证失败!')
})

// API 方法
captcha.refresh()
captcha.reset()
captcha.destroy()
captcha.getData()
captcha.getStatistics()
```

### 点选文字验证码

```javascript
import { ClickCaptcha } from '@captcha/core'

const captcha = new ClickCaptcha({
  el: '#captcha',
  width: 300,
  height: 170,
  count: 3,
  onSuccess: () => console.log('验证通过!')
})
```

### 弹窗验证码

```javascript
import { PopupCaptcha } from '@captcha/core'

const popup = new PopupCaptcha({
  trigger: '#submit-btn',
  type: 'slider',
  onSuccess: () => console.log('验证通过!')
})

popup.show()
popup.hide()
```

### 智能无感验证

```javascript
import { InvisibleCaptcha } from '@captcha/core'

const captcha = new InvisibleCaptcha({
  el: '#submit-btn',
  trigger: 'click',
  riskAssessment: { threshold: 0.7 },
  onSuccess: () => form.submit()
})
```

## 安全特性

```javascript
import { aesEncrypt, aesDecrypt, decryptCaptchaData, validateTimestamp } from '@captcha/core'

// 加密
const encrypted = await aesEncrypt(data, secretKey)
const decrypted = await aesDecrypt(encrypted, secretKey)

// 时间戳验证
if (validateTimestamp(timestamp, 60000)) {
  // 有效
}
```

## API 参考

完整 API 文档请参阅 [主 README](../../README_CN.md)。

## 许可证

MIT
