# 快速开始

## 安装

根据你的平台安装对应的包：

```bash
# 核心包（Web / 原生 JS）
pnpm add captcha-pro

# Vue 2
pnpm add captcha-pro-vue2

# Vue 3
pnpm add captcha-pro-vue

# React
pnpm add captcha-pro-react

# 小程序（微信 / uni-app / Taro）
pnpm add captcha-pro-mp
```

原生平台详见[多平台](/zh/platforms/)。

```bash
# Flutter — 添加到 pubspec.yaml
captcha_pro: ^1.1.0

# Android — 添加到 build.gradle
implementation 'com.captcha.pro:captcha-sdk:1.1.0'

# iOS — CocoaPods
pod 'CaptchaPro', '~> 1.1.0'
```

## 第一个验证码

```html
<div id="captcha"></div>

<script type="module">
  import { SliderCaptcha } from 'captcha-pro'

  const captcha = new SliderCaptcha({
    el: '#captcha',
    width: 300,
    height: 170,
    onSuccess: () => console.log('验证通过!'),
    onFail: () => console.log('验证失败!')
  })
</script>
```

## 环境要求

- **Node.js**：`>=18`
- **浏览器**：Chrome、Firefox、Safari、Opera、IE 11+（IE11 需 Promise polyfill）
- **包体积**：约 35KB 压缩后，无运行时依赖

## 构建产物

| 文件 | 格式 | 大小 | 用途 |
|------|------|------|------|
| `index.mjs` | ESM | 35KB | 打包工具（webpack、vite、rollup） |
| `index.cjs` | CommonJS | 36KB | Node.js、旧版打包工具 |
| `index.global.js` | IIFE | 57KB | 浏览器（开发版） |
| `index.global.min.js` | IIFE | 34KB | 浏览器（生产版） |

## 下一步

- [基础用法](/zh/guide/basic-usage) — 滑动、点选、弹窗、无感的示例
- [进阶用法](/zh/guide/advanced-usage) — 安全、后端模式、统计、多语言
- [验证码类型](/zh/components/) — 各类型的选项与方法
