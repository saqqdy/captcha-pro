# HTML Captcha Demo

Vanilla JavaScript example demonstrating captcha-pro core library usage.

**[简体中文](./README_CN.md)**

## Quick Start

### Local Development

1. Serve the file locally:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

2. Open `http://localhost:8080` in browser

### Online Demo

- [StackBlitz](https://stackblitz.com/github/saqqdy/captcha-pro?file=examples/html/index.html)
- [CodeSandbox](https://codesandbox.io/p/github/saqqdy/captcha-pro/master?file=examples/html/index.html)

## Features Demonstrated

- **SliderCaptcha** - Drag slider verification
- **ClickCaptcha** - Click character verification
- **PopupCaptcha** - Modal popup wrapper
- **InvisibleCaptcha** - Risk-based invisible verification
- **Backend Verification** - Server-side validation
- **Custom Images** - Use your own images
- **IE11 Support** - Legacy browser support with polyfill

## Usage

### Basic Setup

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/captcha-pro/dist/index.global.min.js"></script>
</head>
<body>
  <div id="captcha"></div>
  <script>
    const captcha = new CaptchaPro.SliderCaptcha({
      el: '#captcha',
      width: 300,
      height: 170,
      onSuccess: () => alert('Passed!')
    })
  </script>
</body>
</html>
```

### Click Captcha
  
```html
<div id="click-captcha"></div>
<script>
  const clickCaptcha = new CaptchaPro.ClickCaptcha({
    el: '#click-captcha',
    width: 300,
    height: 170,
    count: 3,
    onSuccess: () => alert('Passed!')
  })
</script>
```

### Popup Captcha

```html
<button id="submit-btn">Submit</button>
<script>
  const popup = new CaptchaPro.PopupCaptcha({
    trigger: '#submit-btn',
    type: 'slider',
    captchaOptions: {
      width: 300,
      height: 170
    },
    onSuccess: () => alert('Passed!')
  })
</script>
```

### Backend Verification

```html
<script>
  const captcha = new CaptchaPro.SliderCaptcha({
    el: '#captcha',
    verifyMode: 'backend',
    backendVerify: {
      getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
      verify: 'http://localhost:3001/api/captcha/verify'
    },
    onSuccess: () => alert('Backend verified!')
  })
</script>
```

### IE11 Support

```html
<!--[if IE]>
<script src="https://cdn.jsdelivr.net/npm/core-js-bundle/minified.js"></script>
<![endif]-->
<script src="https://unpkg.com/captcha-pro/dist/index.global.min.js"></script>
```

## API Methods

```javascript
// Get captcha data
const data = captcha.getData()
console.log('Target position:', data.target)

// Get statistics
const stats = captcha.getStatistics()
console.log('Success rate:', stats.successRate + '%')

// Reset or refresh
captcha.reset()
captcha.refresh()

// Destroy
captcha.destroy()
```

## Backend Server

To test backend verification, start the demo server:

```bash
# From project root
cd server/node
pnpm install
pnpm dev
```

Server runs at `http://localhost:3001`

## License

MIT
