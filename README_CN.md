<div align="center">

# captcha-pro

**跨平台行为验证码 · 30KB 极致轻量**

滑块拼图 · 文字点选 · 无感验证 · 弹窗模式

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![gzip][gzip-image]][gzip-url]
[![License][license-image]][license-url]

[![Codacy Badge][codacy-image]][codacy-url]
[![Test coverage][codecov-image]][codecov-url]
[![Sonar][sonar-image]][sonar-url]

**[在线演示](https://stackblitz.com/github/saqqdy/captcha-pro?file=examples/html/index.html)** ·
**[完整文档](#-文档导航)** ·
**[更新日志](./CHANGELOG.md)** ·
**[English](./README.md)**

</div>

---

## ✨ 核心特性

| 验证类型 | 说明 | 适用场景 |
|---------|------|---------|
| 🧩 **滑块验证** | 拼图验证，支持多种形状（方/三角/梯形/五边形） | 通用场景 |
| 🖱️ **点选验证** | 文字点选，200+ 中文词库，随机干扰字符 | 防机器人 |
| 👻 **无感验证** | 风险评估触发，行为追踪分析 | 低风险用户 |
| 📦 **弹窗验证** | 滑块/点选的弹窗包装，支持多种触发方式 | 按钮触发 |

**技术亮点：**

- 🚀 **极致轻量** - 30KB minified，零依赖
- 🌍 **多平台支持** - Web / Vue / React / 小程序 / Flutter / Android / iOS
- 🔐 **安全加固** - AES-GCM 加密、时间戳校验、频率限制、IP 黑名单
- ♿ **无障碍访问** - WCAG 2.2 AA 级别，完整键盘操作支持
- 🌐 **国际化** - 中英文双语，自动检测浏览器语言
- 🎨 **高度定制** - 自定义图片、主题、文案
- 🌓 **暗色模式** - 自动跟随系统主题，无需手动切换

---

## 📦 三秒上手

### 安装

```bash
# Web（原生 JS）
pnpm add @captcha-pro/core

# Vue 3
pnpm add @captcha-pro/vue

# React
pnpm add @captcha-pro/react

# 微信小程序
pnpm add @captcha-pro/weixin

# Taro（React）
pnpm add @captcha-pro/taro-react

# Flutter
# pubspec.yaml: captcha_pro: ^2.3.0

# Android
# implementation 'com.captcha.pro:captcha-sdk:2.3.0'

# iOS
# pod 'CaptchaPro', '~> 2.3.0'
```

### 最简示例

```html
<!-- Web -->
<div id="captcha"></div>
<script type="module">
  import { SliderCaptcha } from '@captcha-pro/core'
  new SliderCaptcha({ el: '#captcha', onSuccess: () => console.log('通过!') })
</script>
```

```vue
<!-- Vue 3 -->
<template>
  <SliderCaptcha @success="onSuccess" />
</template>
<script setup>
import { SliderCaptcha } from '@captcha-pro/vue'
const onSuccess = () => console.log('通过!')
</script>
```

```tsx
// React
import { SliderCaptcha } from '@captcha-pro/react'
export default () => <SliderCaptcha onSuccess={() => console.log('通过!')} />
```

---

## 🌍 多平台支持

captcha-pro 支持 **14+ 平台**，API 一致，无缝切换：

| 平台 | 包名 | 文档 |
|------|------|------|
| Web (原生 JS) | `@captcha-pro/core` | [使用指南](./docs/platforms/web.md) |
| Vue 3 | `@captcha-pro/vue` | [使用指南](./docs/platforms/vue3.md) |
| Vue 2 | `@captcha-pro/vue2` | [使用指南](./docs/platforms/vue.md) |
| React | `@captcha-pro/react` | [使用指南](./docs/platforms/react.md) |
| 微信小程序 | `@captcha-pro/weixin` | [使用指南](./docs/platforms/miniprogram.md) |
| Taro (React) | `@captcha-pro/taro-react` | [使用指南](./docs/platforms/miniprogram.md) |
| Taro (Vue 3) | `@captcha-pro/taro-vue` | [使用指南](./docs/platforms/miniprogram.md) |
| Taro (Vue 2) | `@captcha-pro/taro-vue2` | [使用指南](./docs/platforms/miniprogram.md) |
| uni-app (Vue 3) | `@captcha-pro/uniapp-vue` | [使用指南](./docs/platforms/miniprogram.md) |
| uni-app (Vue 2) | `@captcha-pro/uniapp-vue2` | [使用指南](./docs/platforms/miniprogram.md) |
| Flutter | `captcha_pro` | [使用指南](./docs/platforms/flutter.md) |
| Android (View) | `captcha-sdk` | [使用指南](./docs/platforms/android.md) |
| Android (Compose) | `captcha-compose` | [使用指南](./docs/platforms/android.md) |
| iOS (UIKit/SwiftUI) | `CaptchaPro` | [使用指南](./docs/platforms/ios.md) |

---

## 🚀 按角色快速开始

### 我是前端开发者

**前端验证模式（无需后端）：**

```javascript
import { SliderCaptcha } from '@captcha-pro/core'

new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'frontend', // 默认值
  onSuccess: () => form.submit()
})
```

**后端验证模式：**

```javascript
new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: '/api/captcha',
    verify: '/api/captcha/verify'
  },
  onSuccess: () => form.submit()
})
```

→ [前端集成完整指南](./docs/guides/frontend-integration.md)

---

### 我是后端开发者

**后端服务示例（Node.js / Java / Go）：**

```bash
# Node.js
cd server/node && pnpm install && pnpm dev

# Java (Spring Boot)
cd server/java && ./gradlew bootRun

# Go (Gin)
cd server/go && go run main.go
```

**API 端点：**

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/captcha` | 生成验证码图片 |
| POST | `/api/captcha/verify` | 验证用户输入 |

→ [后端集成完整指南](./docs/guides/backend-integration.md)

---

### 我是产品/决策者

**为什么选择 captcha-pro？**

| 对比项 | captcha-pro | Google reCAPTCHA | 极验验证码 |
|--------|------------|------------------|-----------|
| 包体积 | **30KB** | ~150KB | ~200KB |
| 多平台支持 | **Web + 小程序 + App** | 仅 Web | Web + App |
| 自定义程度 | **完全可控** | 有限 | 有限 |
| 部署方式 | **自托管** | 云服务 | 云服务 |
| 数据隐私 | **完全自控** | 提交至 Google | 提交至第三方 |
| 成本 | **开源免费** | 免费/付费 | 按量付费 |

→ [技术选型对比详解](./docs/guides/comparison.md)

---

### 我是小程序开发者

**微信小程序：**

```xml
<!-- WXML -->
<captcha-slider bind:success="onSuccess" />
```

```javascript
// JS
import { SliderCaptcha } from '@captcha-pro/weixin'
```

**Taro / uni-app：**

```bash
pnpm add @captcha-pro/taro-react  # Taro (React)
pnpm add @captcha-pro/uniapp-vue  # uni-app (Vue)
```

→ [小程序集成完整指南](./docs/guides/miniprogram-integration.md)

---

## 📚 文档导航

### 快速开始

- [Web 快速开始](./docs/quick-start/web.md)
- [Vue 3 快速开始](./docs/quick-start/vue3.md)
- [React 快速开始](./docs/quick-start/react.md)
- [小程序快速开始](./docs/quick-start/miniprogram.md)

### 深入学习

- [API 参考手册](./docs/api/README.md)
- [配置选项详解](./docs/api/options.md)
- [前端集成指南](./docs/guides/frontend-integration.md)
- [后端集成指南](./docs/guides/backend-integration.md)
- [安全特性详解](./docs/guides/security.md)
- [国际化 (i18n)](./docs/guides/i18n.md)
- [技术对比](./docs/guides/comparison.md)
- [无障碍访问 (a11y)](./docs/accessibility.md)

### 平台专项

- [Web](./docs/platforms/web.md) | [Vue 3](./docs/platforms/vue3.md) | [Vue 2](./docs/platforms/vue.md) | [React](./docs/platforms/react.md)
- [小程序](./docs/platforms/mini-programs.md) | [Android](./docs/platforms/android.md) | [iOS](./docs/platforms/ios.md) | [Flutter](./docs/platforms/flutter.md)
- [各平台集成指南](./docs/platforms/README.md)
- [示例代码仓库](./examples/README.md)

### 后端服务

- [Node.js 后端示例](./server/node/README.md)
- [Java 后端示例](./server/java/README.md)
- [Go 后端示例](./server/go/README.md)

---

## 🛠️ 本地开发

```bash
# 克隆项目
git clone https://github.com/saqqdy/captcha-pro.git
cd captcha-pro

# 安装依赖（首次较慢）
pnpm install

# 运行 Web 示例
pnpm play:vue      # Vue 3 示例
pnpm play:react    # React 示例

# 构建所有包
pnpm build

# 运行测试
pnpm test

# 启动文档站
pnpm docs:dev
```

> ⚠️ 如果 `pnpm install` 报错 `python` / `canvas` 相关错误，这是 `@captcha-pro/core` 编译原生模块所致。**不影响运行 Web 示例，可忽略。** 如需解决：
>
> ```bash
> PYTHON=/usr/local/bin/python3.11 pnpm install
> ```

---

## 🤝 贡献 & 支持

- [贡献指南](./CONTRIBUTING.md)
- [问题反馈](https://github.com/saqqdy/captcha-pro/issues)
- [更新日志](./CHANGELOG.md)

---

## 📄 许可证

[MIT](LICENSE) © [saqqdy](https://github.com/saqqdy)

---

<!-- 徽章链接 -->
[npm-image]: https://img.shields.io/npm/v/@captcha-pro/core.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@captcha-pro/core
[codacy-image]: https://app.codacy.com/project/badge/Grade/f70d4880e4ad4f40aa970eb9ee9d0696
[codacy-url]: https://www.codacy.com/gh/saqqdy/captcha-pro/dashboard?utm_source=github.com&utm_medium=referral&utm_content=saqqdy/captcha-pro&utm_campaign=Badge_Grade
[codecov-image]: https://img.shields.io/codecov/c/github/saqqdy/captcha-pro.svg?style=flat-square
[codecov-url]: https://codecov.io/github/saqqdy/captcha-pro?branch=master
[download-image]: https://img.shields.io/npm/dm/@captcha-pro/core.svg?style=flat-square
[download-url]: https://npmjs.org/package/@captcha-pro/core
[gzip-image]: http://img.badgesize.io/https://unpkg.com/@captcha-pro/core/dist/index.global.min.js?compression=gzip&label=gzip%20size:%20JS
[gzip-url]: http://img.badgesize.io/https://unpkg.com/@captcha-pro/core/dist/index.global.min.js?compression=gzip&label=gzip%20size:%20JS
[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: LICENSE
[sonar-image]: https://sonarcloud.io/api/project_badges/quality_gate?project=saqqdy_captcha-pro
[sonar-url]: https://sonarcloud.io/dashboard?id=saqqdy_captcha-pro