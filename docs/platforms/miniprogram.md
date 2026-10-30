# 小程序平台集成指南

本指南详细说明如何在微信小程序 / Taro / uni-app 中使用 captcha-pro。

## 📋 目录

- [微信小程序](#微信小程序)
- [Taro (React)](#taro-react)
- [Taro (Vue)](#taro-vue)
- [uni-app](#uni-app)
- [注意事项](#注意事项)

---

## 微信小程序

### 安装

```bash
pnpm add @captcha-pro/weixin
```

### 滑块验证码

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
Page({
  onSuccess() {
    console.log('验证通过!')
  },

  onFail() {
    console.log('验证失败!')
  }
})
```

---

## Taro (React)

### 安装

```bash
pnpm add @captcha-pro/taro-react
```

### 使用

```tsx
import { SliderCaptcha } from '@captcha-pro/taro-react'

export default function Index() {
  const handleSuccess = () => {
    console.log('验证通过!')
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

## Taro (Vue)

### 安装

```bash
pnpm add @captcha-pro/taro-vue
```

### 使用

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
  console.log('验证通过!')
}
</script>
```

---

## uni-app

### 安装

```bash
pnpm add @captcha-pro/uniapp-vue
```

### 使用

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
  console.log('验证通过!')
}
</script>
```

---

## 注意事项

### 1. 域名配置

在微信公众平台配置合法域名：

```
https://your-domain.com
```

### 2. HTTPS 要求

小程序要求后端接口必须使用 HTTPS。

### 3. 图片路径

小程序中的图片路径需要使用**绝对路径**或**网络路径**。

---

## 🔗 相关链接

- [小程序快速开始](../quick-start/miniprogram.md)
- [后端集成指南](../guides/backend-integration.md)
- [API 参考手册](../api/README.md)