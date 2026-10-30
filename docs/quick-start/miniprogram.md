# Mini-Program Quick Start

This guide helps you integrate captcha-pro into a mini-program project in 5 minutes.

## 📋 Prerequisites

- Node.js 18+
- WeChat DevTools / Taro / uni-app
- Package manager: pnpm / npm / yarn

---

## 🚀 WeChat Mini-Program

### 1. Install

```bash
pnpm add @captcha-pro/weixin
```

### 2. Usage

**WXML:**

```xml
<view class="container">
  <captcha-slider
    width="{{300}}"
    height="{{170}}"
    bind:success="onSuccess"
    bind:fail="onFail"
  />
</view>
```

**JS:**

```javascript
// pages/index/index.js
Page({
  onSuccess() {
    console.log('Verification passed!')
    // submit the form or continue
  },

  onFail() {
    console.log('Verification failed!')
  }
})
```

### 3. Click Captcha

**WXML:**

```xml
<captcha-click
  count="{{3}}"
  bind:success="onSuccess"
/>
```

---

## 🚀 Taro (React)

### 1. Install

```bash
pnpm add @captcha-pro/taro-react
```

### 2. Usage

```tsx
import { SliderCaptcha } from '@captcha-pro/taro-react'

export default function Index() {
  const handleSuccess = () => {
    console.log('Verification passed!')
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

## 🚀 Taro (Vue)

### 1. Install

```bash
pnpm add @captcha-pro/taro-vue
```

### 2. Usage

```vue
<template>
  <SliderCaptcha
    :width="300"
    :height="170"
    @success="onSuccess"
  />
</template>

<script setup>
import { SliderCaptcha } from '@captcha-pro/taro-vue'

const onSuccess = () => {
  console.log('Verification passed!')
}
</script>
```

---

## 🚀 uni-app (Vue)

### 1. Install

```bash
pnpm add @captcha-pro/uniapp-vue
```

### 2. Usage

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
  console.log('Verification passed!')
}
</script>
```

---

## 🎨 Custom Configuration

### Custom Images

```xml
<!-- WeChat Mini-Program -->
<captcha-slider
  bg-image="/path/to/background.jpg"
  bind:success="onSuccess"
/>
```

```tsx
// Taro (React)
<SliderCaptcha
  bgImage={require('/path/to/background.jpg')}
  onSuccess={handleSuccess}
/>
```

```vue
<!-- Taro / uni-app (Vue) -->
<SliderCaptcha
  bg-image="/path/to/background.jpg"
  @success="onSuccess"
/>
```

### Custom Precision

```xml
<captcha-slider precision="{{5}}" bind:success="onSuccess" />
```

```tsx
<SliderCaptcha precision={5} onSuccess={handleSuccess} />
```

```vue
<SliderCaptcha :precision="5" @success="onSuccess" />
```

---

## 🔐 Backend Verification

Mini-program captchas **must use backend verification mode**, because the frontend cannot generate captcha images.

### Backend Configuration

```xml
<!-- WeChat Mini-Program -->
<captcha-slider
  verify-mode="backend"
  backend-verify="{{{
    getCaptcha: 'https://your-domain.com/api/captcha',
    verify: 'https://your-domain.com/api/captcha/verify'
  }}}"
  bind:success="onSuccess"
/>
```

```tsx
// Taro (React)
<SliderCaptcha
  verifyMode="backend"
  backendVerify={{
    getCaptcha: 'https://your-domain.com/api/captcha',
    verify: 'https://your-domain.com/api/captcha/verify'
  }}
  onSuccess={handleSuccess}
/>
```

```vue
<!-- Taro / uni-app (Vue) -->
<SliderCaptcha
  verify-mode="backend"
  :backend-verify="{
    getCaptcha: 'https://your-domain.com/api/captcha',
    verify: 'https://your-domain.com/api/captcha/verify'
  }"
  @success="onSuccess"
/>
```

### Start the Backend Service

```bash
# Node.js
cd server/node
pnpm install
pnpm dev

# Java
cd server/java
./gradlew bootRun

# Go
cd server/go
go run main.go
```

---

## 📝 Notes

### 1. Domain Configuration

Configure the allowed domains in the WeChat Official Account platform:

```
https://your-domain.com
```

### 2. HTTPS Requirement

Mini-programs require backend interfaces to use HTTPS.

### 3. Image Paths

Image paths in mini-programs must use **absolute paths** or **network paths**.

---

## 🔗 Related Links

- [Mini-Program Integration Guide](../guides/miniprogram-integration.md)
- [Backend Integration Guide](../guides/backend-integration.md)
- [API Reference](../api/README.md)
- [WeChat Mini-Program Example](https://github.com/saqqdy/captcha-pro/blob/master/examples/weixin/README.md)
- [Taro Example](https://github.com/saqqdy/captcha-pro/blob/master/examples/taro-react/README.md)
- [uni-app Example](https://github.com/saqqdy/captcha-pro/blob/master/examples/uniapp-vue/README.md)
