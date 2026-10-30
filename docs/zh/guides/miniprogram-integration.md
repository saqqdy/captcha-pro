# 小程序集成完整指南

本指南详细说明如何在各类小程序平台中集成 captcha-pro。

## 📋 目录

- [微信小程序](#微信小程序)
- [Taro 框架](#taro-框架)
- [uni-app 框架](#uni-app-框架)
- [域名配置](#域名配置)
- [HTTPS 要求](#https-要求)
- [调试技巧](#调试技巧)

---

## 微信小程序

### 安装

```bash
pnpm add @captcha-pro/weixin
```

### 使用滑块验证码

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
    console.log('验证通过!')
  },

  onFail() {
    console.log('验证失败!')
  }
})
```

---

## Taro 框架

### React 版本

```bash
pnpm add @captcha-pro/taro-react
```

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

## uni-app 框架

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
  console.log('验证通过!')
}
</script>
```

---

## 域名配置

在微信公众平台配置合法域名：

1. 登录微信公众平台
2. 开发管理 → 开发设置 → 服务器域名
3. 添加 `https://your-domain.com`

---

## HTTPS 要求

### 证书要求

- 必须是有效的 SSL 证书
- 不支持自签名证书
- 必须支持 TLS 1.2+

---

## 调试技巧

### 开发环境

在微信开发者工具中：

**设置 → 项目设置 → 不校验合法域名**

⚠️ 生产环境必须配置合法域名。

---

## 🔗 相关链接

- [小程序快速开始](../quick-start/miniprogram.md)
- [小程序平台集成指南](../platforms/mini-programs.md)
- [后端集成指南](./backend-integration.md)