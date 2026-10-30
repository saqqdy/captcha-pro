# Frontend Integration Guide

This guide helps you integrate captcha-pro into your frontend project.

## 📋 Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Verification Modes](#verification-modes)
- [Advanced Configuration](#advanced-configuration)
- [Event Handling](#event-handling)
- [Instance Methods](#instance-methods)

## Installation

```bash
# Web
pnpm add @captcha-pro/core

# Vue 3
pnpm add @captcha-pro/vue

# React
pnpm add @captcha-pro/react
```

## Basic Usage

### Web (Vanilla JS)

```html
<div id="captcha"></div>
<script type="module">
  import { SliderCaptcha } from '@captcha-pro/core'

  const captcha = new SliderCaptcha({
    el: '#captcha',
    width: 300,
    height: 170,
    onSuccess: () => console.log('Passed!'),
    onFail: () => console.log('Failed!')
  })
</script>
```

### Vue 3

```vue
<template>
  <SliderCaptcha
    :width="300"
    :height="170"
    @success="onSuccess"
    @fail="onFail"
  />
</template>

<script setup lang="ts">
import { SliderCaptcha } from '@captcha-pro/vue'

const onSuccess = () => console.log('Passed!')
const onFail = () => console.log('Failed!')
</script>
```

### React

```tsx
import { SliderCaptcha } from '@captcha-pro/react'

function App() {
  return (
    <SliderCaptcha
      width={300}
      height={170}
      onSuccess={() => console.log('Passed!')}
      onFail={() => console.log('Failed!')}
    />
  )
}
```

## Verification Modes

### Frontend Verification Mode (Default)

Pure frontend verification, no backend required:

```javascript
new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'frontend', // default
  onSuccess: () => form.submit()
})
```

### Backend Verification Mode

Verification with a backend API:

```javascript
new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: '/api/captcha',
    verify: '/api/captcha/verify',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 10000
  },
  onSuccess: () => form.submit()
})
```

## Advanced Configuration

### Custom Images

```javascript
new SliderCaptcha({
  el: '#captcha',
  bgImage: '/path/to/background.jpg',
  sliderImage: '/path/to/slider.png',
  width: 300,
  height: 200,
  sliderWidth: 60,
  sliderHeight: 60
})
```

### Security Configuration

```javascript
import { SliderCaptcha, decryptCaptchaData } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    secretKey: 'your-secret-key',  // shared with backend
    enableSign: true,
    timestampTolerance: 60000      // 60 seconds
  },
  onSuccess: async () => {
    // Get encrypted data for backend verification
    const encryptedData = await captcha.getSignedData()

    // Send to backend
    await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify(encryptedData)
    })
  }
})
```

### Internationalization

```javascript
import { SliderCaptcha, setLocale } from '@captcha-pro/core'

// Set language globally
setLocale('en-US')

// Or set at the component level
new SliderCaptcha({
  el: '#captcha',
  locale: 'zh-CN'
})
```

## Event Handling

```javascript
const captcha = new SliderCaptcha({
  el: '#captcha',
  onSuccess: () => {
    console.log('Passed')
    form.submit()
  },
  onFail: () => {
    console.log('Failed')
  },
  onRefresh: () => {
    console.log('User clicked refresh')
  }
})
```

## Instance Methods

```javascript
const captcha = new SliderCaptcha({ el: '#captcha' })

// Get verification data
const data = captcha.getData()
console.log('Target position:', data.target)

// Get statistics
const stats = captcha.getStatistics()
console.log('Success rate:', stats.successRate + '%')
console.log('Average verify time:', stats.avgVerifyTime + 'ms')

// Reset the captcha
captcha.reset()

// Refresh the captcha
captcha.refresh()

// Destroy the instance
captcha.destroy()
```

## Click Captcha

```javascript
import { ClickCaptcha } from '@captcha-pro/core'

const captcha = new ClickCaptcha({
  el: '#click-captcha',
  width: 300,
  height: 170,
  count: 3, // number of clicks
  onSuccess: () => console.log('Passed!')
})

// Get clicked points
const points = captcha.getClickPoints()
```

## Popup Captcha

```javascript
import { PopupCaptcha } from '@captcha-pro/core'

const popup = new PopupCaptcha({
  trigger: '#submit-btn',
  type: 'slider', // 'slider' | 'click'
  modal: {
    title: 'Security Verification',
    maskClosable: true,
    escClosable: true,
    showClose: true
  },
  captchaOptions: {
    width: 300,
    height: 170
  },
  autoClose: true,
  closeDelay: 500,
  onSuccess: () => console.log('Passed!'),
  onOpen: () => console.log('Popup opened'),
  onClose: () => console.log('Popup closed')
})

// Programmatic control
popup.show()         // show the popup
popup.hide()         // hide the popup
popup.isVisible()    // get visibility state
popup.getCaptcha()   // get the internal captcha instance
```

## Invisible Captcha

```javascript
import { InvisibleCaptcha } from '@captcha-pro/core'

const captcha = new InvisibleCaptcha({
  el: '#submit-btn',
  trigger: 'click',
  riskAssessment: {
    threshold: 0.7, // show challenge when risk score > 0.7
    behaviorCheck: {
      minInteractionTime: 500,
      trackAnalysis: true
    }
  },
  challengeType: 'slider', // 'slider' | 'click'
  onChallenge: () => console.log('Showing captcha challenge...'),
  onSuccess: () => form.submit(),
  onFail: () => console.log('Failed')
})

// Get risk score
const score = captcha.getRiskScore()
```

## 🔗 Related Links

- [API Reference](../api/README.md)
- [Options](../api/options.md)
- [Backend Integration Guide](./backend-integration.md)
- [Security Features](./security.md)
