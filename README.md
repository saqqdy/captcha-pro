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

### **[Documentation](https://www.saqqdy.com/captcha-pro)** · **[Change Log](./CHANGELOG.md)** · **[简体中文](./README_CN.md)**

</div>

## Features

- 🧩 **Slider Captcha** - Puzzle-style slider verification with random shapes (square/triangle/trapezoid/pentagon)
- 🖱️ **Click Captcha** - Text click verification with Chinese vocabulary support
- 👻 **Invisible Captcha** - Risk-based invisible verification
- 📦 **Popup Captcha** - Modal popup wrapper for slider and click captcha (NEW)
- 🖥️ **Backend Server** - Express 5 backend with server-side image generation
- 🔐 **Security Features** - HMAC-SHA256 signature, timestamp validation
- 📊 **Statistics API** - Track verification success rates and timing
- 🌐 **Backend Mode** - Optional server-side verification support
- 🚀 **Framework Agnostic** - Works with Vue, React, Angular, or vanilla JS
- 📦 **Lightweight** - ~35KB minified, no dependencies
- 🎨 **Customizable** - Flexible options for styling and behavior
- 📱 **Mobile Friendly** - Full touch events support
- 🎯 **Decoy Holes** - Anti-bot deceptive holes with random rotation
- 🖼️ **Enhanced Backgrounds** - Gradient backgrounds with decorative patterns

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

### Slider Captcha (Puzzle)

```html
<div id="slider-captcha"></div>

<script type="module">
  import { SliderCaptcha } from 'captcha-pro'

  const captcha = new SliderCaptcha({
    el: '#slider-captcha',
    width: 280,
    height: 155,
    precision: 5,
    showRefresh: true,
    onSuccess: () => {
      console.log('Verification passed!')
    },
    onFail: () => {
      console.log('Verification failed!')
    }
  })

  // Get captcha data
  const data = captcha.getData()
  console.log('Target position:', data.target)

  // Manual verification
  const isValid = captcha.verify([150]) // x position

  // Get statistics
  const stats = captcha.getStatistics()
  console.log('Success rate:', stats.successRate + '%')

  // Reset captcha
  captcha.reset()

  // Destroy captcha
  captcha.destroy()
</script>
```

### Click Captcha (Text Click)

```html
<div id="click-captcha"></div>

<script type="module">
  import { ClickCaptcha } from 'captcha-pro'

  const captcha = new ClickCaptcha({
    el: '#click-captcha',
    width: 280,
    height: 155,
    count: 3,
    text: 'ABC', // Optional, auto-generated if not provided
    showRefresh: true,
    onSuccess: () => {
      console.log('Verification passed!')
    },
    onFail: () => {
      console.log('Verification failed!')
    }
  })

  // Get clicked points
  const points = captcha.getClickPoints()
</script>
```

### Invisible Captcha (New in v1.0)

Risk-based verification that only shows a challenge when necessary:

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
    onChallenge: () => {
      console.log('Showing captcha challenge...')
    },
    onSuccess: () => {
      console.log('Passed! Submitting form...')
      form.submit()
    }
  })

  // Get risk score
  const score = captcha.getRiskScore()
</script>
```

### Popup Captcha (New in v1.0)

Modal popup wrapper for slider and click captcha:

```html
<button id="submit-btn">Submit</button>

<script type="module">
  import { PopupCaptcha } from 'captcha-pro'

  // Create popup with trigger button
  const popup = new PopupCaptcha({
    trigger: '#submit-btn',    // Button that triggers the popup
    type: 'slider',            // 'slider' | 'click'
    modal: {
      title: 'Security Verification',
      maskClosable: true,      // Click mask to close
      escClosable: true,       // ESC key to close
      showClose: true,         // Show close button
    },
    captchaOptions: {          // Captcha options (popup size adapts to captcha size)
      width: 300,
      height: 170,
      precision: 5,
      showRefresh: true,
    },
    autoClose: true,           // Auto close on success
    closeDelay: 500,           // Delay before close (ms)
    onOpen: () => {
      console.log('Popup opened')
    },
    onClose: () => {
      console.log('Popup closed')
    },
    onSuccess: () => {
      console.log('Verification passed!')
      // Submit form or continue
    },
    onFail: () => {
      console.log('Verification failed')
    }
  })

  // Or trigger programmatically
  // popup.show()
  // popup.hide()
  // popup.isVisible()
  // popup.getCaptcha() // Get inner captcha instance
</script>
```

### Security Features (New in v1.0)

#### Data Signature

Add HMAC-SHA256 signature for backend verification:

```javascript
import { SliderCaptcha } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    secretKey: 'your-secret-key', // Shared with backend
    enableSign: true,
    timestampTolerance: 60000 // 60 seconds
  },
  onSuccess: async () => {
    // Get signed data for backend verification
    const signedData = await captcha.getSignedData()
    // signedData contains: type, target, timestamp, nonce, signature

    // Send to backend
    await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify(signedData)
    })
  }
})
```

#### Backend Verification (Node.js Example)

```javascript
import { createHmac } from 'crypto'

function verifyCaptcha(data, secretKey) {
  // Check timestamp
  const now = Date.now()
  if (Math.abs(now - data.timestamp) > 60000) {
    return { valid: false, error: 'Timestamp expired' }
  }

  // Verify signature
  const message = `${data.type}|${JSON.stringify(data.target)}|${data.timestamp}|${data.nonce}`
  const expectedSign = createHmac('sha256', secretKey)
    .update(message)
    .digest('hex')

  if (expectedSign !== data.signature) {
    return { valid: false, error: 'Invalid signature' }
  }

  return { valid: true }
}
```

### Backend Verification Mode (New in v1.0)

Configure captcha to verify with backend API:

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
  onSuccess: () => {
    console.log('Backend verification passed!')
  }
})
```

## Backend Server (@captcha-pro/server)

The `@captcha-pro/server` package provides a complete backend solution for generating and verifying captcha images on the server side.

### Installation

```bash
# use pnpm
$ pnpm install @captcha-pro/server

# use npm
$ npm install @captcha-pro/server --save

# use yarn
$ yarn add @captcha-pro/server
```

### Quick Start

```bash
# Start development server
cd server/node
pnpm install
pnpm dev
```

The server will start at `http://localhost:3001`.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/captcha` | Generate captcha image |
| POST | `/api/captcha/verify` | Verify captcha |
| GET | `/api/health` | Health check |
| GET | `/api/info` | Server info |

### Generate Captcha

**GET** `/api/captcha?type=slider&width=280&height=155`

Query Parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `slider` | Captcha type: slider, click |
| `width` | number | `280` | Image width |
| `height` | number | `155` | Image height |
| `precision` | number | `5` | Verification precision |
| `clickCount` | number | `3` | Click count (for click type) |
| `clickText` | string | - | Custom click text |

Response:

```json
{
  "success": true,
  "data": {
    "captchaId": "uuid-string",
    "type": "slider",
    "bgImage": "data:image/png;base64,...",
    "sliderImage": "data:image/png;base64,...",
    "width": 280,
    "height": 155,
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
  "data": {
    "verifiedAt": 1700000000000
  }
}
```

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
  onSuccess: () => {
    console.log('Backend verification passed!')
  }
})
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `HOST` | `localhost` | Server host |
| `SECRET_KEY` | `captcha-pro-secret-key` | Secret key for signing |
| `EXPIRE_TIME` | `60000` | Captcha expire time (ms) |
| `TIMESTAMP_TOLERANCE` | `60000` | Timestamp tolerance (ms) |

### Statistics API (New in v1.0)

Track verification statistics:

```javascript
const captcha = new SliderCaptcha({ el: '#captcha' })

// After some verifications...
const stats = captcha.getStatistics()
console.log('Statistics:', {
  totalAttempts: stats.totalAttempts,
  successCount: stats.successCount,
  failCount: stats.failCount,
  successRate: stats.successRate + '%',
  avgVerifyTime: stats.avgVerifyTime + 'ms',
  avgDragDistance: stats.avgDragDistance + 'px'
})

// Reset statistics
captcha.resetStatistics()
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
const popup = createPopupCaptcha({ type: 'slider', onSuccess: () => {} })
```

### Use with Custom Images

```javascript
import { SliderCaptcha } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha',
  bgImage: '/path/to/background.jpg',
  sliderImage: '/path/to/slider.png', // Optional
  width: 300,
  height: 200,
  sliderWidth: 60,
  sliderHeight: 60,
  onSuccess: () => {
    // Handle success
  }
})
```

### Import in Browser (IIFE)

```html
<head>
  <!-- For IE11 support, include Promise polyfill first -->
  <!--[if IE]>
  <script src="https://cdn.jsdelivr.net/npm/core-js-bundle/minified.js"></script>
  <![endif]-->

  <!-- Import captcha-pro library -->
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
| `bgImage` | `string` | - | Background image URL |
| `width` | `number` | `300` | Container width |
| `height` | `number` | `170` | Container height |
| `count` | `number` | `3` | Number of click points |
| `text` | `string` | - | Custom text to click |
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
| `secretKey` | `string` | - | Secret key for HMAC-SHA256 signing |
| `enableSign` | `boolean` | `false` | Enable data signing |
| `timestampTolerance` | `number` | `60000` | Timestamp tolerance (ms) |

### Instance Methods

| Method | Description |
|--------|-------------|
| `verify(data)` | Manually verify captcha |
| `reset()` | Reset captcha state |
| `refresh()` | Generate new captcha |
| `destroy()` | Destroy captcha instance |
| `getData()` | Get captcha data (target values) |
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

## Build Outputs

| File | Format | Size | Use Case |
|------|--------|------|----------|
| `index.mjs` | ESM | 35KB | Bundlers (webpack, vite, rollup) |
| `index.cjs` | CommonJS | 36KB | Node.js, older bundlers |
| `index.global.js` | IIFE | 57KB | Browser (development, with sourcemap) |
| `index.global.min.js` | IIFE | 34KB | Browser (production, minified) |

## Browser Support

| ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) |
| --- | --- | --- | --- | --- |
| Chrome ✓ | Firefox ✓ | Safari ✓ | Opera ✓ | IE 11+ ✓ |

> **Note for IE11**: Requires Promise polyfill. Include `core-js` or `polyfill.io` before loading captcha-pro.

## Development

```bash
# Clone the repository
git clone https://github.com/saqqdy/captcha-pro.git

# Enter directory
cd captcha-pro

# Install dependencies
pnpm install

# Build project
pnpm build

# Run tests
pnpm test

# Run lint
pnpm lint

# View demo
# Open examples/html/index.html in browser
```

## Support & Issues

Please open an issue [here](https://github.com/saqqdy/captcha-pro/issues).

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
