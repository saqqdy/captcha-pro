# Web Platform Integration Guide

This guide details how to use captcha-pro in a Web project.

## 📋 Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Advanced Configuration](#advanced-configuration)
- [TypeScript Support](#typescript-support)
- [Browser Compatibility](#browser-compatibility)

---

## Installation

### NPM (Recommended)

```bash
# pnpm
pnpm add @captcha-pro/core

# npm
npm install @captcha-pro/core

# yarn
yarn add @captcha-pro/core
```

### CDN

```html
<!-- Latest -->
<script src="https://unpkg.com/@captcha-pro/core/dist/index.global.min.js"></script>

<!-- Pinned version -->
<script src="https://unpkg.com/@captcha-pro/core@2.2.0/dist/index.global.min.js"></script>

<!-- Usage -->
<script>
  const captcha = new CaptchaPro.SliderCaptcha({
    el: '#captcha',
    onSuccess: () => alert('Passed!')
  })
</script>
```

---

## Basic Usage

### Slider Captcha

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slider Captcha Example</title>
  <style>
    #captcha {
      margin: 50px auto;
      width: 300px;
    }
  </style>
</head>
<body>
  <div id="captcha"></div>

  <script type="module">
    import { SliderCaptcha } from '@captcha-pro/core'

    const captcha = new SliderCaptcha({
      el: '#captcha',
      width: 300,
      height: 170,
      precision: 5,
      showRefresh: true,
      onSuccess: () => {
        console.log('Passed!')
        // proceed with form submission or other actions
      },
      onFail: () => {
        console.log('Failed, please retry')
      },
      onRefresh: () => {
        console.log('User clicked refresh')
      }
    })

    // Instance methods
    console.log('Captcha data:', captcha.getData())
  </script>
</body>
</html>
```

### Click Captcha

```html
<div id="click-captcha"></div>

<script type="module">
  import { ClickCaptcha } from '@captcha-pro/core'

  const captcha = new ClickCaptcha({
    el: '#click-captcha',
    width: 300,
    height: 170,
    count: 3,
    onSuccess: () => {
      console.log('Passed!')
    }
  })

  // Get click coordinates
  const points = captcha.getClickPoints()
  console.log('Click points:', points)
</script>
```

### Popup Captcha

```html
<button id="submit-btn">Submit</button>

<script type="module">
  import { PopupCaptcha } from '@captcha-pro/core'

  const popup = new PopupCaptcha({
    trigger: '#submit-btn',
    type: 'slider',  // 'slider' | 'click'
    modal: {
      title: 'Security Verification',
      maskClosable: true,
      escClosable: true,
      showClose: true
    },
    captchaOptions: {
      width: 300,
      height: 170,
      precision: 5
    },
    autoClose: true,
    closeDelay: 500,
    onSuccess: () => {
      console.log('Passed!')
    },
    onOpen: () => {
      console.log('Popup opened')
    },
    onClose: () => {
      console.log('Popup closed')
    }
  })

  // Programmatic control
  // popup.show()
  // popup.hide()
  // popup.isVisible()
  // popup.getCaptcha()
</script>
```

---

## Advanced Configuration

### Custom Images

```javascript
import { SliderCaptcha } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  bgImage: '/path/to/background.jpg',
  sliderImage: '/path/to/slider.png',  // optional
  width: 300,
  height: 200,
  sliderWidth: 60,
  sliderHeight: 60,
  onSuccess: () => console.log('Passed!')
})
```

### Backend Verification Mode

```javascript
const captcha = new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: '/api/captcha?type=slider',
    verify: '/api/captcha/verify',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 10000
  },
  onSuccess: () => {
    console.log('Backend verification passed!')
    form.submit()
  }
})
```

### Data Encryption

```javascript
import { SliderCaptcha, decryptCaptchaData } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    secretKey: 'your-secret-key',  // shared with backend
    enableSign: true,
    timestampTolerance: 60000
  },
  onSuccess: async () => {
    // Get encrypted data
    const encryptedData = await captcha.getSignedData()

    // Send to backend
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encryptedData)
    })

    const result = await response.json()
    if (result.valid) {
      console.log('Passed!')
    }
  }
})
```

### Internationalization

```javascript
import { SliderCaptcha, setLocale, getLocale, t } from '@captcha-pro/core'

// Set global locale
setLocale('en-US')

// Get current locale
console.log(getLocale())  // 'en-US'

// Get translated text
console.log(t('slider.success'))  // 'Verification passed'

// Component-level override
const captcha = new SliderCaptcha({
  el: '#captcha',
  locale: 'zh-CN'
})
```

### Statistics

```javascript
const captcha = new SliderCaptcha({ el: '#captcha' })

// After several verifications...
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

// Reset statistics
captcha.resetStatistics()
```

---

## TypeScript Support

captcha-pro ships full TypeScript type definitions.

```typescript
import {
  SliderCaptcha,
  ClickCaptcha,
  PopupCaptcha,
  InvisibleCaptcha,
  SliderCaptchaOptions,
  ClickCaptchaOptions,
  PopupCaptchaOptions,
  InvisibleCaptchaOptions,
  StatisticsData,
  BackendVerifyOptions,
  SecurityOptions
} from '@captcha-pro/core'

// Type-safe configuration
const options: SliderCaptchaOptions = {
  el: '#captcha',
  width: 300,
  height: 170,
  precision: 5,
  onSuccess: () => console.log('Passed!')
}

const captcha = new SliderCaptcha(options)

// Type-safe method calls
const data = captcha.getData()
const stats: StatisticsData = captcha.getStatistics()
```

---

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Latest | Full support |
| Firefox | ✅ Latest | Full support |
| Safari | ✅ Latest | Full support |
| Edge | ✅ Latest | Full support |
| IE 11 | ⚠️ 11+ | Requires Promise polyfill |

### IE 11 Support

```html
<!--[if IE]>
<script src="https://cdn.jsdelivr.net/npm/core-js-bundle/minified.js"></script>
<![endif]-->
<script src="https://unpkg.com/@captcha-pro/core/dist/index.global.min.js"></script>
```

---

## 🔗 Related Links

- [Web Quick Start](../quick-start/web)
- [Frontend Integration](../guides/frontend-integration)
- [API Reference](../api/)
- [Options](../api/options)
- [Online Example](https://stackblitz.com/github/saqqdy/captcha-pro?file=examples/html/index.html)
