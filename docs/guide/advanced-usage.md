# Advanced Usage

## Security Features

captcha-pro provides AES-GCM encryption, timestamp validation, and signing to prevent data tampering and replay attacks.

```javascript
import { SliderCaptcha, decryptCaptchaData } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    secretKey: 'your-secret-key',  // Shared with backend
    enableSign: true,
    timestampTolerance: 60000      // 60 seconds
  },
  onSuccess: async () => {
    // Get encrypted data for backend verification
    const encryptedData = await captcha.getSignedData()
    // encryptedData contains: type, target, timestamp, nonce, encrypted data

    await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify(encryptedData)
    })
  }
})
```

### Backend Verification Example (Node.js)

```javascript
import { decryptCaptchaData, validateTimestamp } from 'captcha-pro'

async function verifyCaptcha(encryptedData, secretKey) {
  try {
    // Decrypt data
    const data = await decryptCaptchaData(encryptedData.signature, secretKey)

    // Check timestamp
    if (!validateTimestamp(data.timestamp, 60000)) {
      return { valid: false, error: 'Timestamp expired' }
    }

    return { valid: true, data }
  } catch (error) {
    return { valid: false, error: 'Invalid encrypted data' }
  }
}
```

## Backend Verification Mode

Instead of frontend-only verification, you can delegate to a backend that generates and verifies captcha images.

```javascript
import { SliderCaptcha } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend', // 'frontend' (default) or 'backend'
  backendVerify: {
    getCaptcha: '/api/captcha/get',
    verify: '/api/captcha/verify',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 10000
  },
  onSuccess: () => console.log('Backend verification passed!'),
  onFail: () => console.log('Verification failed')
})
```

See the [Backend](/backend/) section for reference server implementations in Node.js, Java, and Go.

## Statistics API

Track verification success rates, timing, and drag distances.

```javascript
const captcha = new SliderCaptcha({ el: '#captcha' })

// After some verifications...
const stats = captcha.getStatistics()
console.log({
  totalAttempts: stats.totalAttempts,
  successCount: stats.successCount,
  failCount: stats.failCount,
  successRate: stats.successRate + '%',
  avgVerifyTime: stats.avgVerifyTime + 'ms',
  avgDragTime: stats.avgDragTime + 'ms',
  avgDragDistance: stats.avgDragDistance + 'px'
})

// Reset statistics
captcha.resetStatistics()
```

## Custom Images

Provide your own background and slider images instead of the auto-generated ones.

```javascript
import { SliderCaptcha } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha',
  bgImage: '/path/to/background.jpg',
  sliderImage: '/path/to/slider.png', // Optional, auto-generated if not provided
  width: 300,
  height: 200,
  sliderWidth: 60,
  sliderHeight: 60,
  onSuccess: () => console.log('Verification passed!')
})
```

## Factory Functions

Prefer factory functions over `new` for terser setup:

```javascript
import {
  createSliderCaptcha,
  createClickCaptcha,
  createInvisibleCaptcha,
  createPopupCaptcha
} from 'captcha-pro'

const slider = createSliderCaptcha({ el: '#slider' })
const click = createClickCaptcha({ el: '#click' })
const invisible = createInvisibleCaptcha({ el: '#btn' })
const popup = createPopupCaptcha({ type: 'slider' })
```

## Browser Direct Import (IIFE)

For projects without a bundler, use the global IIFE build:

```html
<head>
  <!-- IE11 needs Promise polyfill -->
  <!--[if IE]>
  <script src="https://cdn.jsdelivr.net/npm/core-js-bundle/minified.js"></script>
  <![endif]-->
  <script src="https://unpkg.com/captcha-pro/dist/index.global.min.js"></script>
</head>
<body>
  <div id="captcha"></div>
  <script>
    const captcha = new CaptchaPro.SliderCaptcha({
      el: '#captcha',
      onSuccess: () => alert('Success!')
    })
  </script>
</body>
```
