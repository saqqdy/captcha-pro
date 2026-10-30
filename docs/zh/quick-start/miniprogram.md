# 小程序快速开始

本指南帮助你在 5 分钟内在小程序项目中集成 captcha-pro。

## 📋 前置要求

- Node.js 18+
- 微信开发者工具 / Taro / uni-app
- 包管理器：pnpm / npm / yarn

---

## 🚀 微信小程序

### 1. 安装

```bash
pnpm add @captcha-pro/weixin
```

### 2. 使用

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
    console.log('验证通过!')
    // 提交表单或继续操作
  },

  onFail() {
    console.log('验证失败!')
  }
})
```

### 3. 点选验证码

**WXML:**

```xml
<captcha-click
  count="{{3}}"
  bind:success="onSuccess"
/>
```

---

## 🚀 Taro (React)

### 1. 安装

```bash
pnpm add @captcha-pro/taro-react
```

### 2. 使用

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

## 🚀 Taro (Vue)

### 1. 安装

```bash
pnpm add @captcha-pro/taro-vue
```

### 2. 使用

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

## 🚀 uni-app (Vue)

### 1. 安装

```bash
pnpm add @captcha-pro/uniapp-vue
```

### 2. 使用

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

## 🎨 自定义配置

### 自定义图片

```xml
<!-- 微信小程序 -->
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

### 自定义精度

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

## 🔐 后端验证

小程序验证码**必须使用后端验证模式**，因为前端无法生成验证码图片。

### 后端配置

```xml
<!-- 微信小程序 -->
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

### 启动后端服务

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

## 📝 注意事项

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

- [小程序集成完整指南](../guides/miniprogram-integration.md)
- [后端集成指南](../guides/backend-integration.md)
- [API 参考手册](../api/)
- [微信小程序示例](https://github.com/saqqdy/captcha-pro/blob/master/examples/weixin/README.md)
- [Taro 示例](https://github.com/saqqdy/captcha-pro/blob/master/examples/taro-react/README.md)
- [uni-app 示例](https://github.com/saqqdy/captcha-pro/blob/master/examples/uniapp-vue/README.md)