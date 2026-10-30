# Web 快速开始

本指南帮助你在 5 分钟内在 Web 项目中集成 captcha-pro。

## 📋 前置要求

- Node.js 18+
- 包管理器：pnpm / npm / yarn

---

## 🚀 快速集成

### 1. 安装

```bash
pnpm add @captcha-pro/core
```

### 2. 基础使用

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
        console.log('验证通过!')
        // 提交表单或继续操作
      },
      onFail: () => {
        console.log('验证失败!')
      }
    })
  </script>
</body>
</html>
```

### 3. 点选验证码

```html
<div id="click-captcha"></div>

<script type="module">
  import { ClickCaptcha } from '@captcha-pro/core'

  const captcha = new ClickCaptcha({
    el: '#click-captcha',
    count: 3,  // 点击次数
    onSuccess: () => {
      console.log('验证通过!')
    }
  })
</script>
```

### 4. 弹窗验证码

```html
<button id="submit-btn">提交</button>

<script type="module">
  import { PopupCaptcha } from '@captcha-pro/core'

  const popup = new PopupCaptcha({
    trigger: '#submit-btn',
    type: 'slider',
    modal: {
      title: '安全验证'
    },
    onSuccess: () => {
      console.log('验证通过!')
    }
  })
</script>
```

---

## 🎨 自定义配置

### 自定义图片

```javascript
new SliderCaptcha({
  el: '#captcha',
  bgImage: '/path/to/background.jpg',
  sliderImage: '/path/to/slider.png',
  width: 300,
  height: 200
})
```

### 自定义精度

```javascript
new SliderCaptcha({
  el: '#captcha',
  precision: 5  // 验证精度（像素）
})
```

### 国际化

```javascript
import { SliderCaptcha, setLocale } from '@captcha-pro/core'

// 全局设置
setLocale('en-US')

// 或组件级别
new SliderCaptcha({
  el: '#captcha',
  locale: 'zh-CN'
})
```

---

## 🔐 后端验证

### 前端配置

```javascript
new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: '/api/captcha?type=slider',
    verify: '/api/captcha/verify'
  },
  onSuccess: () => {
    console.log('后端验证通过!')
  }
})
```

### 后端示例（Node.js）

```bash
# 启动后端服务
cd server/node
pnpm install
pnpm dev
```

服务运行在 `http://localhost:3001`

---

## 📦 构建输出

| 文件 | 格式 | 大小 | 用途 |
|------|------|------|------|
| `index.mjs` | ESM | 35KB | 打包工具 (webpack/vite/rollup) |
| `index.cjs` | CommonJS | 36KB | Node.js / 旧打包工具 |
| `index.global.js` | IIFE | 57KB | 浏览器（开发）|
| `index.global.min.js` | IIFE | 34KB | 浏览器（生产）|

### 浏览器直接引用

```html
<script src="https://unpkg.com/@captcha-pro/core/dist/index.global.min.js"></script>
<script>
  const captcha = new CaptchaPro.SliderCaptcha({
    el: '#captcha',
    onSuccess: () => alert('验证通过!')
  })
</script>
```

---

## 🔗 相关链接

- [前端集成完整指南](../guides/frontend-integration.md)
- [API 参考手册](../api/)
- [配置选项详解](../api/options.md)
- [在线示例](https://stackblitz.com/github/saqqdy/captcha-pro?file=examples/html/index.html)