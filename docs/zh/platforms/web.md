# Web 平台集成指南

本指南详细说明如何在 Web 项目中使用 captcha-pro。

## 📋 目录

- [安装方式](#安装方式)
- [基础使用](#基础使用)
- [进阶配置](#进阶配置)
- [TypeScript 支持](#typescript-支持)
- [浏览器兼容性](#浏览器兼容性)

---

## 安装方式

### NPM 安装（推荐）

```bash
# 使用 pnpm
pnpm add @captcha-pro/core

# 使用 npm
npm install @captcha-pro/core

# 使用 yarn
yarn add @captcha-pro/core
```

### CDN 引用

```html
<!-- 最新版本 -->
<script src="https://unpkg.com/@captcha-pro/core/dist/index.global.min.js"></script>

<!-- 指定版本 -->
<script src="https://unpkg.com/@captcha-pro/core@2.3.0/dist/index.global.min.js"></script>

<!-- 使用 -->
<script>
  const captcha = new CaptchaPro.SliderCaptcha({
    el: '#captcha',
    onSuccess: () => alert('验证通过!')
  })
</script>
```

---

## 基础使用

### 滑块验证码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>滑块验证码示例</title>
  <style>
    #captcha {
      margin: 50px auto;
      width: 300px;
    }
  </style>
</head>
<body>
  <div id="captcha"></div>

  <script type="module">
    import { SliderCaptcha } from '@captcha-pro/core'

    const captcha = new SliderCaptcha({
      el: '#captcha',
      width: 300,
      height: 170,
      precision: 5,
      showRefresh: true,
      onSuccess: () => {
        console.log('验证通过!')
        // 继续提交表单或其他操作
      },
      onFail: () => {
        console.log('验证失败，请重试')
      },
      onRefresh: () => {
        console.log('用户点击刷新')
      }
    })

    // 实例方法示例
    console.log('验证数据:', captcha.getData())
  </script>
</body>
</html>
```

### 点选验证码

```html
<div id="click-captcha"></div>

<script type="module">
  import { ClickCaptcha } from '@captcha-pro/core'

  const captcha = new ClickCaptcha({
    el: '#click-captcha',
    width: 300,
    height: 170,
    count: 3,  // 点击次数
    onSuccess: () => {
      console.log('验证通过!')
    }
  })

  // 获取点击坐标
  const points = captcha.getClickPoints()
  console.log('点击坐标:', points)
</script>
```

### 弹窗验证码

```html
<button id="submit-btn">提交</button>

<script type="module">
  import { PopupCaptcha } from '@captcha-pro/core'

  const popup = new PopupCaptcha({
    trigger: '#submit-btn',
    type: 'slider',  // 'slider' | 'click'
    modal: {
      title: '安全验证',
      maskClosable: true,    // 点击遮罩关闭
      escClosable: true,     // 按 ESC 关闭
      showClose: true        // 显示关闭按钮
    },
    captchaOptions: {
      width: 300,
      height: 170,
      precision: 5
    },
    autoClose: true,
    closeDelay: 500,
    onSuccess: () => {
      console.log('验证通过!')
    },
    onOpen: () => {
      console.log('弹窗打开')
    },
    onClose: () => {
      console.log('弹窗关闭')
    }
  })

  // 编程式控制
  // popup.show()         // 显示弹窗
  // popup.hide()         // 隐藏弹窗
  // popup.isVisible()    // 获取可见状态
  // popup.getCaptcha()   // 获取内部验证码实例
</script>
```

---

## 进阶配置

### 自定义图片

```javascript
import { SliderCaptcha } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  bgImage: '/path/to/background.jpg',      // 背景图片
  sliderImage: '/path/to/slider.png',       // 滑块图片（可选）
  width: 300,
  height: 200,
  sliderWidth: 60,
  sliderHeight: 60,
  onSuccess: () => console.log('验证通过!')
})
```

### 后端验证模式

```javascript
const captcha = new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: '/api/captcha?type=slider',
    verify: '/api/captcha/verify',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 10000  // 10 秒超时
  },
  onSuccess: () => {
    console.log('后端验证通过!')
    form.submit()
  }
})
```

### 数据加密

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
    // 获取加密数据
    const encryptedData = await captcha.getSignedData()

    // 发送到后端
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encryptedData)
    })

    const result = await response.json()
    if (result.valid) {
      console.log('验证通过!')
    }
  }
})
```

### 国际化

```javascript
import { SliderCaptcha, setLocale, getLocale, t } from '@captcha-pro/core'

// 全局设置语言
setLocale('en-US')

// 获取当前语言
console.log(getLocale())  // 'en-US'

// 获取翻译文本
console.log(t('slider.success'))  // 'Verification passed'

// 组件级别设置
const captcha = new SliderCaptcha({
  el: '#captcha',
  locale: 'zh-CN'  // 覆盖全局设置
})
```

### 统计数据

```javascript
const captcha = new SliderCaptcha({ el: '#captcha' })

// 在几次验证后...
const stats = captcha.getStatistics()
console.log({
  totalAttempts: stats.totalAttempts,      // 总尝试次数
  successCount: stats.successCount,         // 成功次数
  failCount: stats.failCount,               // 失败次数
  successRate: stats.successRate,           // 成功率（百分比）
  avgVerifyTime: stats.avgVerifyTime,       // 平均验证时间（毫秒）
  avgDragTime: stats.avgDragTime,           // 平均拖动时间（毫秒）
  avgDragDistance: stats.avgDragDistance    // 平均拖动距离（像素）
})

// 重置统计
captcha.resetStatistics()
```

---

## TypeScript 支持

captcha-pro 提供完整的 TypeScript 类型定义。

```typescript
import {
  SliderCaptcha,
  ClickCaptcha,
  PopupCaptcha,
  InvisibleCaptcha,
  SliderCaptchaOptions,
  ClickCaptchaOptions,
  PopupCaptchaOptions,
  InvisibleCaptchaOptions,
  StatisticsData,
  BackendVerifyOptions,
  SecurityOptions
} from '@captcha-pro/core'

// 类型安全的配置
const options: SliderCaptchaOptions = {
  el: '#captcha',
  width: 300,
  height: 170,
  precision: 5,
  onSuccess: () => console.log('通过!')
}

const captcha = new SliderCaptcha(options)

// 类型安全的方法调用
const data = captcha.getData()
const stats: StatisticsData = captcha.getStatistics()
```

---

## 浏览器兼容性

| 浏览器 | 支持版本 | 备注 |
|--------|---------|------|
| Chrome | ✅ 最新 | 完全支持 |
| Firefox | ✅ 最新 | 完全支持 |
| Safari | ✅ 最新 | 完全支持 |
| Edge | ✅ 最新 | 完全支持 |
| IE 11 | ⚠️ 11+ | 需要 Promise polyfill |

### IE 11 支持

```html
<!--[if IE]>
<script src="https://cdn.jsdelivr.net/npm/core-js-bundle/minified.js"></script>
<![endif]-->
<script src="https://unpkg.com/@captcha-pro/core/dist/index.global.min.js"></script>
```

---

## 🔗 相关链接

- [Web 快速开始](../quick-start/web)
- [前端集成指南](../guides/frontend-integration)
- [API 参考手册](../api/)
- [配置选项详解](../api/options)
- [在线示例](https://stackblitz.com/github/saqqdy/captcha-pro?file=examples/html/index.html)
