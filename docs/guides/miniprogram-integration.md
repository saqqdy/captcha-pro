# Mini-program Integration Guide

This guide details how to integrate captcha-pro across various mini-program platforms.

## 📋 Table of Contents

- [WeChat Mini-program](#wechat-mini-program)
- [Taro Framework](#taro-framework)
- [uni-app Framework](#uni-app-framework)
- [Domain Configuration](#domain-configuration)
- [HTTPS Requirements](#https-requirements)
- [Debugging Tips](#debugging-tips)

---

## WeChat Mini-program

### Installation

```bash
pnpm add @captcha-pro/weixin
```

### Using the Slider Captcha

**WXML:**

```xml
<view class="container">
  <captcha-slider
    width="{{300}}"
    height="{{170}}"
    precision="{{5}}"
    bind:success="onSuccess"
    bind:fail="onFail"
  />
</view>
```

**JS:**

```javascript
Page({
  data: {
    width: 300,
    height: 170,
    precision: 5
  },

  onSuccess() {
    console.log('Passed!')
  },

  onFail() {
    console.log('Failed!')
  }
})
```

---

## Taro Framework

### React Version

```bash
pnpm add @captcha-pro/taro-react
```

```tsx
import { SliderCaptcha } from '@captcha-pro/taro-react'

export default function Index() {
  const handleSuccess = () => {
    console.log('Passed!')
  }

  return (
    <SliderCaptcha
      width={300}
      height={170}
      onSuccess={handleSuccess}
    />
  )
}
```

---

## uni-app Framework

```bash
pnpm add @captcha-pro/uniapp-vue
```

```vue
<template>
  <view>
    <SliderCaptcha
      :width="300"
      :height="170"
      @success="onSuccess"
    />
  </view>
</template>

<script setup>
import { SliderCaptcha } from '@captcha-pro/uniapp-vue'

const onSuccess = () => {
  console.log('Passed!')
}
</script>
```

---

## Domain Configuration

Configure the legitimate domain in the WeChat Official Account platform:

1. Log in to the WeChat Official Account platform
2. Development Management → Development Settings → Server Domain
3. Add `https://your-domain.com`

---

## HTTPS Requirements

### Certificate Requirements

- Must be a valid SSL certificate
- Self-signed certificates are not supported
- Must support TLS 1.2+

---

## Debugging Tips

### Development Environment

In the WeChat Developer Tools:

**Settings → Project Settings → Do not verify legitimate domains**

⚠️ Production environments must configure legitimate domains.

---

## 🔗 Related Links

- [Mini-program Quick Start](../quick-start/miniprogram.md)
- [Mini-program Platform Guide](../platforms/miniprogram.md)
- [Backend Integration Guide](./backend-integration.md)
