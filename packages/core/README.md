# @captcha/core

Core package for Captcha Pro - A lightweight, framework-agnostic behavioral captcha library.

**[简体中文](./README_CN.md)**

## Installation

```bash
pnpm add @captcha/core
```

## Usage

### Slider Captcha

```javascript
import { SliderCaptcha } from '@captcha/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  width: 300,
  height: 170,
  precision: 5,
  onSuccess: () => console.log('Passed!'),
  onFail: () => console.log('Failed!')
})

// API
captcha.refresh()
captcha.reset()
captcha.destroy()
captcha.getData()
captcha.getStatistics()
```

### Click Captcha

```javascript
import { ClickCaptcha } from '@captcha/core'

const captcha = new ClickCaptcha({
  el: '#captcha',
  width: 300,
  height: 170,
  count: 3,
  onSuccess: () => console.log('Passed!')
})
```

### Popup Captcha

```javascript
import { PopupCaptcha } from '@captcha/core'

const popup = new PopupCaptcha({
  trigger: '#submit-btn',
  type: 'slider',
  onSuccess: () => console.log('Passed!')
})

popup.show()
popup.hide()
```

### Invisible Captcha

```javascript
import { InvisibleCaptcha } from '@captcha/core'

const captcha = new InvisibleCaptcha({
  el: '#submit-btn',
  trigger: 'click',
  riskAssessment: { threshold: 0.7 },
  onSuccess: () => form.submit()
})
```

## Security

```javascript
import { aesEncrypt, aesDecrypt, decryptCaptchaData, validateTimestamp } from '@captcha/core'

// Encryption
const encrypted = await aesEncrypt(data, secretKey)
const decrypted = await aesDecrypt(encrypted, secretKey)

// Timestamp validation
if (validateTimestamp(timestamp, 60000)) {
  // Valid
}
```

## API Reference

See [main README](../../README.md) for complete API documentation.

## License

MIT
