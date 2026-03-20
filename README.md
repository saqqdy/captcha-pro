<div style="text-align: center;" align="center">

# captcha-pro

A lightweight behavioral captcha library with slider puzzle, click verification, and invisible captcha support

[![NPM version][npm-image]][npm-url]
[![Codacy Badge][codacy-image]][codacy-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]
[![gzip][gzip-image]][gzip-url]
[![License][license-image]][license-url]

[![Sonar][sonar-image]][sonar-url]

</div>

<div style="text-align: center; margin-bottom: 20px;" align="center">

### **[Change Log](./CHANGELOG.md)** · **[简体中文](./README_CN.md)**

**[Online Demo](https://stackblitz.com/github/saqqdy/captcha-pro?file=examples/html/index.html)**

</div>

## Features

### Captcha Types

- 🧩 **Slider Captcha** - Puzzle verification with random shapes (square/triangle/trapezoid/pentagon), decoy holes with random rotation
- 🖱️ **Click Captcha** - Text click verification with 200+ Chinese vocabulary support, no duplicate characters per word, random decoy characters, prompt images for anti-bot
- 👻 **Invisible Captcha** - Risk-based invisible verification, behavior tracking and analysis
- 📦 **Popup Captcha** - Modal popup wrapper for slider and click captcha, trigger by element click or programmatically

### Verification Modes

- 🎯 **Frontend Mode** - Pure frontend verification, no backend required
- 🌐 **Backend Mode** - Server-side verification with image generation

### Security Features

- 🔐 **Data Encryption** - AES-GCM encryption to prevent data tampering
- ⏱️ **Timestamp Validation** - Prevent replay attacks
- 🚦 **Rate Limiting** - Prevent API abuse (60 requests/min by default)
- 🚫 **IP Blacklist** - Block malicious IPs with temporary/permanent blocking
- 🛡️ **Brute-Force Protection** - Detect and block brute-force attacks

### Other Features

- 📊 **Statistics API** - Track verification success rates, timing, and distances
- 🌍 **i18n Support** - Built-in internationalization (zh-CN, en-US), auto-detect browser language
- 🚀 **Framework Agnostic** - Works with Vue, React, Angular, or vanilla JS
- 📦 **Lightweight** - ~35KB minified, no dependencies
- 🖼️ **Custom Images** - Support custom background and slider images
- 📱 **Mobile Friendly** - Full touch events support
- ♿ **Accessibility** - ARIA attributes, keyboard navigation support
- 🌐 **IE11+ Support** - Requires Promise polyfill

## Installing

```bash
# use pnpm
$ pnpm install captcha-pro

# use npm
$ npm install captcha-pro --save

# use yarn
$ yarn add captcha-pro
```

## Usage

### Slider Captcha

```html
<div id="slider-captcha"></div>

<script type="module">
  import { SliderCaptcha } from 'captcha-pro'

  const captcha = new SliderCaptcha({
    el: '#slider-captcha',
    width: 300,
    height: 170,
    precision: 5,
    showRefresh: true,
    onSuccess: () => console.log('Verification passed!'),
    onFail: () => console.log('Verification failed!')
  })

  // Get captcha data
  const data = captcha.getData()
  console.log('Target position:', data.target)

  // Get statistics
  const stats = captcha.getStatistics()
  console.log('Success rate:', stats.successRate + '%')

  // Reset or destroy
  captcha.reset()
  captcha.destroy()
</script>
```

### Click Captcha

```html
<div id="click-captcha"></div>

<script type="module">
  import { ClickCaptcha } from 'captcha-pro'

  const captcha = new ClickCaptcha({
    el: '#click-captcha',
    width: 300,
    height: 170,
    count: 3,
    onSuccess: () => console.log('Verification passed!')
  })

  // Get clicked points
  const points = captcha.getClickPoints()
</script>
```

### Popup Captcha

```html
<button id="submit-btn">Submit</button>

<script type="module">
  import { PopupCaptcha } from 'captcha-pro'

  const popup = new PopupCaptcha({
    trigger: '#submit-btn',
    type: 'slider', // 'slider' | 'click'
    modal: {
      title: 'Security Verification',
      maskClosable: true,    // Click mask to close
      escClosable: true,     // Press ESC to close
      showClose: true,       // Show close button
    },
    captchaOptions: {
      width: 300,
      height: 170,
      precision: 5,
    },
    autoClose: true,
    closeDelay: 500,
    onSuccess: () => console.log('Verification passed!'),
    onOpen: () => console.log('Popup opened'),
    onClose: () => console.log('Popup closed')
  })

  // Programmatic control
  popup.show()         // Show popup
  popup.hide()         // Hide popup
  popup.isVisible()    // Get visibility state
  popup.getCaptcha()   // Get inner captcha instance
</script>
```

### Invisible Captcha

```html
<button id="submit-btn">Submit</button>

<script type="module">
  import { InvisibleCaptcha } from 'captcha-pro'

  const captcha = new InvisibleCaptcha({
    el: '#submit-btn',
    trigger: 'click',
    riskAssessment: {
      threshold: 0.7, // Show challenge if risk score > 0.7
      behaviorCheck: {
        minInteractionTime: 500,
        trackAnalysis: true
      }
    },
    challengeType: 'slider', // 'slider' | 'click'
    onChallenge: () => console.log('Showing captcha challenge...'),
    onSuccess: () => form.submit(),
    onFail: () => console.log('Verification failed')
  })

  // Get risk score
  const score = captcha.getRiskScore()
</script>
```

### Security Features

```javascript
import { SliderCaptcha, decryptCaptchaData } from 'captcha-pro'

// With AES-GCM encryption for backend verification
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

    // Send to backend
    await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify(encryptedData)
    })
  }
})

// Backend verification example (Node.js)
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

### Backend Verification Mode

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

### Statistics API

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

### Custom Images

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

### Factory Functions

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

### Internationalization (i18n)

captcha-pro supports internationalization with built-in Chinese (zh-CN) and English (en-US) translations.

```javascript
import { SliderCaptcha, setLocale, getLocale, t } from 'captcha-pro'

// Set language globally
setLocale('en-US')

// Get current locale
console.log(getLocale()) // 'en-US'

// Or set locale per component
const captcha = new SliderCaptcha({
  el: '#captcha',
  locale: 'en-US',  // Component-level locale
})

// Get translated text
console.log(t('slider.success')) // 'Verification passed'
```

By default, captcha-pro auto-detects browser language. Chinese browsers show Chinese text, others show English.

### Browser Direct Import (IIFE)

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

## Backend Server Demos

Demo implementations are provided in the `server/` directory to help you integrate captcha-pro with your backend:

| Directory | Framework | Port | Description |
|-----------|-----------|------|-------------|
| `server/node` | Express 5 | 3001 | Node.js backend demo |
| `server/java` | Spring Boot 3 | 8080 | Java backend demo |
| `server/go` | Gin | 8082 | Go backend demo |

> **Note**: These are reference implementations, not published packages. Copy the code you need into your own backend project.

### Quick Start (Node.js Demo)

```bash
cd server/node
pnpm install
pnpm dev
```

Server runs at `http://localhost:3001`. See each server directory's README for more details.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/captcha` | Generate captcha image |
| POST | `/api/captcha/verify` | Verify captcha |
| GET | `/api/health` | Health check |
| GET | `/api/info` | Server info |

### Generate Captcha

**GET** `/api/captcha?type=slider&width=300&height=170`

Query Parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `slider` | Captcha type: `slider` or `click` |
| `width` | number | `300` | Image width |
| `height` | number | `170` | Image height |
| `precision` | number | `5` | Verification precision |
| `clickCount` | number | `3` | Click count (for click type) |

Response:

```json
{
  "success": true,
  "data": {
    "captchaId": "uuid-string",
    "type": "slider",
    "bgImage": "data:image/png;base64,...",
    "sliderImage": "data:image/png;base64,...",
    "sliderY": 42,
    "width": 300,
    "height": 170,
    "expiresAt": 1700000000000
  }
}
```

### Click Captcha Response

For click captcha type, the response includes:

```json
{
  "success": true,
  "data": {
    "captchaId": "uuid-string",
    "type": "click",
    "bgImage": "data:image/png;base64,...",
    "clickTexts": ["春", "暖", "花"],
    "clickCharImages": ["data:image/png;base64,...", ...],
    "width": 300,
    "height": 170,
    "expiresAt": 1700000000000
  }
}
```

### Verify Captcha

**POST** `/api/captcha/verify`

Request Body:

```json
{
  "captchaId": "uuid-string",
  "type": "slider",
  "target": [123]
}
```

Response:

```json
{
  "success": true,
  "message": "Verification successful",
  "data": { "verifiedAt": 1700000000000 }
}
```

### Security Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/security/status/:ip` | Get IP security status |
| GET | `/api/security/blacklist` | Get blacklist entries |
| POST | `/api/security/blacklist` | Add IP to blacklist |
| DELETE | `/api/security/blacklist/:ip` | Remove IP from blacklist |

### Environment Variables (Demo Servers)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` (Node.js) / `8080` (Java) / `8082` (Go) | Server port |
| `HOST` | `localhost` | Server host |
| `SECRET_KEY` | `captcha-pro-secret-key` | AES-GCM encryption key |
| `EXPIRE_TIME` | `60000` | Captcha expire time (ms) |
| `TIMESTAMP_TOLERANCE` | `60000` | Timestamp tolerance (ms) |

### Frontend Integration with Backend

```javascript
import { SliderCaptcha } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
    verify: 'http://localhost:3001/api/captcha/verify'
  },
  onSuccess: () => console.log('Backend verification passed!')
})
```

## API Reference

### SliderCaptcha Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `el` | `string \| HTMLElement` | - | Container element or selector |
| `bgImage` | `string` | - | Background image URL |
| `sliderImage` | `string` | - | Slider image URL |
| `width` | `number` | `300` | Container width |
| `height` | `number` | `170` | Container height |
| `sliderWidth` | `number` | `42` | Slider piece width |
| `sliderHeight` | `number` | `42` | Slider piece height |
| `precision` | `number` | `5` | Verification precision (px) |
| `showRefresh` | `boolean` | `true` | Show refresh button |
| `className` | `string` | `'captcha-slider'` | Custom class name |
| `verifyMode` | `'frontend' \| 'backend'` | `'frontend'` | Verification mode |
| `backendVerify` | `BackendVerifyOptions` | - | Backend verification config |
| `security` | `SecurityOptions` | - | Security options |
| `onSuccess` | `() => void` | - | Success callback |
| `onFail` | `() => void` | - | Fail callback |
| `onRefresh` | `() => void` | - | Refresh callback |

### ClickCaptcha Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `el` | `string \| HTMLElement` | - | Container element or selector |
| `width` | `number` | `300` | Container width |
| `height` | `number` | `170` | Container height |
| `count` | `number` | `3` | Number of click points |
| `showRefresh` | `boolean` | `true` | Show refresh button |
| `className` | `string` | `'captcha-click'` | Custom class name |
| `verifyMode` | `'frontend' \| 'backend'` | `'frontend'` | Verification mode |
| `backendVerify` | `BackendVerifyOptions` | - | Backend verification config |
| `security` | `SecurityOptions` | - | Security options |
| `onSuccess` | `() => void` | - | Success callback |
| `onFail` | `() => void` | - | Fail callback |
| `onRefresh` | `() => void` | - | Refresh callback |

### InvisibleCaptcha Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `el` | `string \| HTMLElement` | - | Trigger element or selector |
| `trigger` | `'click' \| 'submit' \| 'focus'` | `'click'` | Trigger event |
| `riskAssessment` | `RiskAssessmentOptions` | - | Risk assessment config |
| `challengeType` | `'slider' \| 'click'` | `'slider'` | Challenge captcha type |
| `challengeOptions` | `object` | - | Options for challenge captcha |
| `onChallenge` | `() => void` | - | Called when challenge is shown |
| `onSuccess` | `() => void` | - | Success callback |
| `onFail` | `() => void` | - | Fail callback |

### PopupCaptcha Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `trigger` | `string \| HTMLElement` | - | Trigger element or selector |
| `type` | `'slider' \| 'click'` | `'slider'` | Captcha type |
| `captchaOptions` | `object` | - | Options for inner captcha |
| `modal` | `PopupModalOptions` | - | Modal options |
| `autoClose` | `boolean` | `true` | Auto close on success |
| `closeDelay` | `number` | `500` | Delay before close (ms) |
| `onOpen` | `() => void` | - | Called when popup opens |
| `onClose` | `() => void` | - | Called when popup closes |
| `onSuccess` | `() => void` | - | Success callback |
| `onFail` | `() => void` | - | Fail callback |

### PopupModalOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | - | Modal title |
| `maskClosable` | `boolean` | `true` | Click mask to close |
| `escClosable` | `boolean` | `true` | Press ESC to close |
| `showClose` | `boolean` | `true` | Show close button |

### SecurityOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `secretKey` | `string` | - | Secret key for AES-GCM encryption |
| `enableSign` | `boolean` | `false` | Enable data signing |
| `timestampTolerance` | `number` | `60000` | Timestamp tolerance (ms) |

### BackendVerifyOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `getCaptcha` | `string \| Function` | - | URL or function to get captcha |
| `verify` | `string \| Function` | - | URL or function to verify captcha |
| `headers` | `object` | - | Request headers |
| `timeout` | `number` | `10000` | Request timeout (ms) |

### Instance Methods

| Method | Description |
|--------|-------------|
| `verify(data)` | Manually verify captcha |
| `reset()` | Reset captcha state |
| `refresh()` | Generate new captcha |
| `destroy()` | Destroy captcha instance |
| `getData()` | Get captcha data |
| `getSignedData()` | Get signed data for backend verification |
| `getStatistics()` | Get verification statistics |
| `resetStatistics()` | Reset statistics |

### PopupCaptcha Instance Methods

| Method | Description |
|--------|-------------|
| `show()` | Show popup modal |
| `hide()` | Hide popup modal |
| `isVisible()` | Get visibility state |
| `getCaptcha()` | Get inner captcha instance |
| `destroy()` | Destroy popup instance |

### InvisibleCaptcha Instance Methods

| Method | Description |
|--------|-------------|
| `getRiskScore()` | Get current risk score (0-1) |
| `showChallenge()` | Manually show challenge |
| `destroy()` | Destroy instance |

## Build Outputs

| File | Format | Size | Use Case |
|------|--------|------|----------|
| `index.mjs` | ESM | 35KB | Bundlers (webpack, vite, rollup) |
| `index.cjs` | CommonJS | 36KB | Node.js, older bundlers |
| `index.global.js` | IIFE | 57KB | Browser (development) |
| `index.global.min.js` | IIFE | 34KB | Browser (production) |

## Browser Support

| ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) |
| --- | --- | --- | --- | --- |
| Chrome ✓ | Firefox ✓ | Safari ✓ | Opera ✓ | IE 11+ ✓ |

> **Note for IE11**: Requires Promise polyfill.

## Development

```bash
# Clone and install
git clone https://github.com/saqqdy/captcha-pro.git
cd captcha-pro
pnpm install

# Build, test, lint
pnpm build
pnpm test
pnpm lint

# Run backend server
cd server/node && pnpm dev
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/captcha-pro.svg?style=flat-square
[npm-url]: https://npmjs.org/package/captcha-pro
[codacy-image]: https://app.codacy.com/project/badge/Grade/f70d4880e4ad4f40aa970eb9ee9d0696
[codacy-url]: https://www.codacy.com/gh/saqqdy/captcha-pro/dashboard?utm_source=github.com&utm_medium=referral&utm_content=saqqdy/captcha-pro&utm_campaign=Badge_Grade
[codecov-image]: https://img.shields.io/codecov/c/github/saqqdy/captcha-pro.svg?style=flat-square
[codecov-url]: https://codecov.io/github/saqqdy/captcha-pro?branch=master
[download-image]: https://img.shields.io/npm/dm/captcha-pro.svg?style=flat-square
[download-url]: https://npmjs.org/package/captcha-pro
[gzip-image]: http://img.badgesize.io/https://unpkg.com/captcha-pro/dist/index.global.min.js?compression=gzip&label=gzip%20size:%20JS
[gzip-url]: http://img.badgesize.io/https://unpkg.com/captcha-pro/dist/index.global.min.js?compression=gzip&label=gzip%20size:%20JS
[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: LICENSE
[sonar-image]: https://sonarcloud.io/api/project_badges/quality_gate?project=saqqdy_captcha-pro
[sonar-url]: https://sonarcloud.io/dashboard?id=saqqdy_captcha-pro
