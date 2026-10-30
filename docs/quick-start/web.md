# Web Quick Start

This guide helps you integrate captcha-pro into a Web project in 5 minutes.

## 📋 Prerequisites

- Node.js 18+
- Package manager: pnpm / npm / yarn

---

## 🚀 Quick Integration

### 1. Install

```bash
pnpm add @captcha-pro/core
```

### 2. Basic Usage

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>Captcha Pro Demo</title>
</head>
<body>
  <div id="captcha"></div>

  <script type="module">
    import { SliderCaptcha } from '@captcha-pro/core'

    const captcha = new SliderCaptcha({
      el: '#captcha',
      width: 300,
      height: 170,
      onSuccess: () => {
        console.log('Verification passed!')
        // submit the form or continue
      },
      onFail: () => {
        console.log('Verification failed!')
      }
    })
  </script>
</body>
</html>
```

### 3. Click Captcha

```html
<div id="click-captcha"></div>

<script type="module">
  import { ClickCaptcha } from '@captcha-pro/core'

  const captcha = new ClickCaptcha({
    el: '#click-captcha',
    count: 3,  // click count
    onSuccess: () => {
      console.log('Verification passed!')
    }
  })
</script>
```

### 4. Popup Captcha

```html
<button id="submit-btn">Submit</button>

<script type="module">
  import { PopupCaptcha } from '@captcha-pro/core'

  const popup = new PopupCaptcha({
    trigger: '#submit-btn',
    type: 'slider',
    modal: {
      title: 'Security Verification'
    },
    onSuccess: () => {
      console.log('Verification passed!')
    }
  })
</script>
```

---

## 🎨 Custom Configuration

### Custom Images

```javascript
new SliderCaptcha({
  el: '#captcha',
  bgImage: '/path/to/background.jpg',
  sliderImage: '/path/to/slider.png',
  width: 300,
  height: 200
})
```

### Custom Precision

```javascript
new SliderCaptcha({
  el: '#captcha',
  precision: 5  // verification precision (pixels)
})
```

### Internationalization

```javascript
import { SliderCaptcha, setLocale } from '@captcha-pro/core'

// global setting
setLocale('en-US')

// or per-component
new SliderCaptcha({
  el: '#captcha',
  locale: 'zh-CN'
})
```

---

## 🔐 Backend Verification

### Frontend Configuration

```javascript
new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: '/api/captcha?type=slider',
    verify: '/api/captcha/verify'
  },
  onSuccess: () => {
    console.log('Backend verification passed!')
  }
})
```

### Backend Example (Node.js)

```bash
# start the backend service
cd server/node
pnpm install
pnpm dev
```

The service runs at `http://localhost:3001`

---

## 📦 Build Outputs

| File | Format | Size | Use Case |
|------|--------|------|----------|
| `index.mjs` | ESM | 35KB | Bundlers (webpack/vite/rollup) |
| `index.cjs` | CommonJS | 36KB | Node.js / older bundlers |
| `index.global.js` | IIFE | 57KB | Browser (development) |
| `index.global.min.js` | IIFE | 34KB | Browser (production) |

### Use Directly in the Browser

```html
<script src="https://unpkg.com/@captcha-pro/core/dist/index.global.min.js"></script>
<script>
  const captcha = new CaptchaPro.SliderCaptcha({
    el: '#captcha',
    onSuccess: () => alert('Verification passed!')
  })
</script>
```

---

## 🔗 Related Links

- [Frontend Integration Guide](../guides/frontend-integration.md)
- [API Reference](../api/README.md)
- [Configuration Options](../api/options.md)
- [Online Examples](https://stackblitz.com/github/saqqdy/captcha-pro?file=examples/html/index.html)
