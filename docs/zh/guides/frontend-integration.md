# 前端集成指南

本指南帮助你在前端项目中集成 captcha-pro。

## 📋 目录

- [安装](#安装)
- [基础使用](#基础使用)
- [验证模式](#验证模式)
- [高级配置](#高级配置)
- [事件处理](#事件处理)
- [实例方法](#实例方法)

## 安装

```bash
# Web
pnpm add @captcha-pro/core

# Vue 3
pnpm add @captcha-pro/vue

# React
pnpm add @captcha-pro/react
```

## 基础使用

### Web (Vanilla JS)

```html
<div id="captcha"></div>
<script type="module">
  import { SliderCaptcha } from '@captcha-pro/core'

  const captcha = new SliderCaptcha({
    el: '#captcha',
    width: 300,
    height: 170,
    onSuccess: () => console.log('验证通过!'),
    onFail: () => console.log('验证失败!')
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

const onSuccess = () => console.log('验证通过!')
const onFail = () => console.log('验证失败!')
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
      onSuccess={() => console.log('验证通过!')}
      onFail={() => console.log('验证失败!')}
    />
  )
}
```

## 验证模式

### 前端验证模式（默认）

纯前端验证，无需后端支持：

```javascript
new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'frontend', // 默认值
  onSuccess: () => form.submit()
})
```

### 后端验证模式

配合后端 API 进行验证：

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

## 高级配置

### 自定义图片

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

### 安全配置

```javascript
import { SliderCaptcha, decryptCaptchaData } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    secretKey: 'your-secret-key',  // 与后端共享
    enableSign: true,
    timestampTolerance: 60000      // 60 秒
  },
  onSuccess: async () => {
    // 获取加密数据用于后端验证
    const encryptedData = await captcha.getSignedData()

    // 发送到后端
    await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify(encryptedData)
    })
  }
})
```

### 国际化

```javascript
import { SliderCaptcha, setLocale } from '@captcha-pro/core'

// 全局设置语言
setLocale('en-US')

// 或组件级别设置
new SliderCaptcha({
  el: '#captcha',
  locale: 'zh-CN'
})
```

## 事件处理

```javascript
const captcha = new SliderCaptcha({
  el: '#captcha',
  onSuccess: () => {
    console.log('验证通过')
    form.submit()
  },
  onFail: () => {
    console.log('验证失败')
  },
  onRefresh: () => {
    console.log('用户点击刷新')
  }
})
```

## 实例方法

```javascript
const captcha = new SliderCaptcha({ el: '#captcha' })

// 获取验证数据
const data = captcha.getData()
console.log('目标位置:', data.target)

// 获取统计数据
const stats = captcha.getStatistics()
console.log('成功率:', stats.successRate + '%')
console.log('平均验证时间:', stats.avgVerifyTime + 'ms')

// 重置验证码
captcha.reset()

// 刷新验证码
captcha.refresh()

// 销毁实例
captcha.destroy()
```

## 点选验证码

```javascript
import { ClickCaptcha } from '@captcha-pro/core'

const captcha = new ClickCaptcha({
  el: '#click-captcha',
  width: 300,
  height: 170,
  count: 3, // 点击次数
  onSuccess: () => console.log('验证通过!')
})

// 获取点击的点
const points = captcha.getClickPoints()
```

## 弹窗验证码

```javascript
import { PopupCaptcha } from '@captcha-pro/core'

const popup = new PopupCaptcha({
  trigger: '#submit-btn',
  type: 'slider', // 'slider' | 'click'
  modal: {
    title: '安全验证',
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
  onSuccess: () => console.log('验证通过!'),
  onOpen: () => console.log('弹窗打开'),
  onClose: () => console.log('弹窗关闭')
})

// 编程式控制
popup.show()         // 显示弹窗
popup.hide()         // 隐藏弹窗
popup.isVisible()    // 获取可见状态
popup.getCaptcha()   // 获取内部验证码实例
```

## 无感验证码

```javascript
import { InvisibleCaptcha } from '@captcha-pro/core'

const captcha = new InvisibleCaptcha({
  el: '#submit-btn',
  trigger: 'click',
  riskAssessment: {
    threshold: 0.7, // 风险分数 > 0.7 时显示挑战
    behaviorCheck: {
      minInteractionTime: 500,
      trackAnalysis: true
    }
  },
  challengeType: 'slider', // 'slider' | 'click'
  onChallenge: () => console.log('显示验证码挑战...'),
  onSuccess: () => form.submit(),
  onFail: () => console.log('验证失败')
})

// 获取风险分数
const score = captcha.getRiskScore()
```

## 🔗 相关链接

- [API 参考手册](../api/)
- [配置选项详解](../api/options.md)
- [后端集成指南](./backend-integration.md)
- [安全特性详解](./security.md)