<div align="center">

# captcha-pro

**Cross-Platform Behavioral Captcha · 30KB Ultra Lightweight**

Slider Puzzle · Click Verification · Invisible Captcha · Popup Mode

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![gzip][gzip-image]][gzip-url]
[![License][license-image]][license-url]

[![Codacy Badge][codacy-image]][codacy-url]
[![Test coverage][codecov-image]][codecov-url]
[![Sonar][sonar-image]][sonar-url]

**[Live Demo](https://stackblitz.com/github/saqqdy/captcha-pro?file=examples/html/index.html)** ·
**[Full Documentation](#-documentation)** ·
**[Changelog](./CHANGELOG.md)** ·
**[简体中文](./README_CN.md)**

</div>

---

## ✨ Core Features

| Verification Type | Description | Use Cases |
|------------------|-------------|-----------|
| 🧩 **Slider Captcha** | Puzzle verification with multiple shapes (square/triangle/trapezoid/pentagon) | General scenarios |
| 🖱️ **Click Captcha** | Text click verification, 200+ Chinese vocabulary, random decoy characters | Anti-bot |
| 👻 **Invisible Captcha** | Risk-based verification triggered, behavior tracking analysis | Low-risk users |
| 📦 **Popup Captcha** | Popup wrapper for slider/click captcha, multiple trigger methods | Button trigger |

**Technical Highlights:**

- 🚀 **Ultra Lightweight** - 30KB minified, zero dependencies
- 🌍 **Multi-Platform Support** - Web / Vue / React / Mini-Program / Flutter / Android / iOS
- 🔐 **Security Hardened** - AES-GCM encryption, timestamp validation, rate limiting, IP blacklist
- ♿ **Accessibility** - WCAG 2.2 AA level, full keyboard operation support
- 🌐 **Internationalization** - Chinese/English bilingual, auto-detect browser language
- 🎨 **Highly Customizable** - Custom images, themes, text
- 🌓 **Dark Mode** - Automatic system theme detection, no manual toggle needed

---

## 📦 Quick Start

### Installation

```bash
# Web (Vanilla JS)
pnpm add @captcha-pro/core

# Vue 3
pnpm add @captcha-pro/vue

# React
pnpm add @captcha-pro/react

# WeChat Mini-Program
pnpm add @captcha-pro/weixin

# Taro (React)
pnpm add @captcha-pro/taro-react

# Flutter
# pubspec.yaml: captcha_pro: ^2.3.0

# Android
# implementation 'com.captcha.pro:captcha-sdk:2.3.0'

# iOS
# pod 'CaptchaPro', '~> 2.3.0'
```

### Minimal Example

```html
<!-- Web -->
<div id="captcha"></div>
<script type="module">
  import { SliderCaptcha } from '@captcha-pro/core'
  new SliderCaptcha({ el: '#captcha', onSuccess: () => console.log('Passed!') })
</script>
```

```vue
<!-- Vue 3 -->
<template>
  <SliderCaptcha @success="onSuccess" />
</template>
<script setup>
import { SliderCaptcha } from '@captcha-pro/vue'
const onSuccess = () => console.log('Passed!')
</script>
```

```tsx
// React
import { SliderCaptcha } from '@captcha-pro/react'
export default () => <SliderCaptcha onSuccess={() => console.log('Passed!')} />
```

---

## 🌍 Multi-Platform Support

captcha-pro supports **14+ platforms** with consistent API:

| Platform | Package Name | Documentation |
|----------|--------------|---------------|
| Web (Vanilla JS) | `@captcha-pro/core` | [Guide](./docs/platforms/web.md) |
| Vue 3 | `@captcha-pro/vue` | [Guide](./docs/platforms/vue3.md) |
| Vue 2 | `@captcha-pro/vue2` | [Guide](./docs/platforms/vue.md) |
| React | `@captcha-pro/react` | [Guide](./docs/platforms/react.md) |
| WeChat Mini-Program | `@captcha-pro/weixin` | [Guide](./docs/platforms/miniprogram.md) |
| Taro (React) | `@captcha-pro/taro-react` | [Guide](./docs/platforms/miniprogram.md) |
| Taro (Vue 3) | `@captcha-pro/taro-vue` | [Guide](./docs/platforms/miniprogram.md) |
| Taro (Vue 2) | `@captcha-pro/taro-vue2` | [Guide](./docs/platforms/miniprogram.md) |
| uni-app (Vue 3) | `@captcha-pro/uniapp-vue` | [Guide](./docs/platforms/miniprogram.md) |
| uni-app (Vue 2) | `@captcha-pro/uniapp-vue2` | [Guide](./docs/platforms/miniprogram.md) |
| Flutter | `captcha_pro` | [Guide](./docs/platforms/flutter.md) |
| Android (View) | `captcha-sdk` | [Guide](./docs/platforms/android.md) |
| Android (Compose) | `captcha-compose` | [Guide](./docs/platforms/android.md) |
| iOS (UIKit/SwiftUI) | `CaptchaPro` | [Guide](./docs/platforms/ios.md) |

---

## 🚀 Quick Start by Role

### I'm a Frontend Developer

**Frontend Verification Mode (No Backend Required):**

```javascript
import { SliderCaptcha } from '@captcha-pro/core'

new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'frontend', // default
  onSuccess: () => form.submit()
})
```

**Backend Verification Mode:**

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

→ [Frontend Integration Guide](./docs/guides/frontend-integration.md)

---

### I'm a Backend Developer

**Backend Server Examples (Node.js / Java / Go):**

```bash
# Node.js
cd server/node && pnpm install && pnpm dev

# Java (Spring Boot)
cd server/java && ./gradlew bootRun

# Go (Gin)
cd server/go && go run main.go
```

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/captcha` | Generate captcha image |
| POST | `/api/captcha/verify` | Verify user input |

→ [Backend Integration Guide](./docs/guides/backend-integration.md)

---

### I'm a Product Manager / Decision Maker

**Why choose captcha-pro?**

| Comparison | captcha-pro | Google reCAPTCHA | GeeTest |
|------------|------------|------------------|---------|
| Package Size | **30KB** | ~150KB | ~200KB |
| Multi-Platform | **Web + Mini-Program + App** | Web only | Web + App |
| Customization | **Fully Controllable** | Limited | Limited |
| Deployment | **Self-Hosted** | Cloud Service | Cloud Service |
| Data Privacy | **Fully Self-Controlled** | Submitted to Google | Submitted to Third-Party |
| Cost | **Open Source Free** | Free/Paid | Pay-per-use |

→ [Technology Comparison Details](./docs/guides/comparison.md)

---

### I'm a Mini-Program Developer

**WeChat Mini-Program:**

```xml
<!-- WXML -->
<captcha-slider bind:success="onSuccess" />
```

```javascript
// JS
import { SliderCaptcha } from '@captcha-pro/weixin'
```

**Taro / uni-app:**

```bash
pnpm add @captcha-pro/taro-react  # Taro (React)
pnpm add @captcha-pro/uniapp-vue  # uni-app (Vue)
```

→ [Mini-Program Integration Guide](./docs/guides/miniprogram-integration.md)

---

## 📚 Documentation

### Quick Start

- [Web Quick Start](./docs/quick-start/web.md)
- [Vue 3 Quick Start](./docs/quick-start/vue3.md)
- [React Quick Start](./docs/quick-start/react.md)
- [Mini-Program Quick Start](./docs/quick-start/miniprogram.md)

### Deep Dive

- [API Reference](./docs/api/README.md)
- [Configuration Options](./docs/api/options.md)
- [Frontend Integration Guide](./docs/guides/frontend-integration.md)
- [Backend Integration Guide](./docs/guides/backend-integration.md)
- [Security Features](./docs/guides/security.md)
- [Internationalization (i18n)](./docs/guides/i18n.md)
- [Technology Comparison](./docs/guides/comparison.md)
- [Accessibility (a11y)](./docs/accessibility.md)

### Platform-Specific

- [Web](./docs/platforms/web.md) | [Vue 3](./docs/platforms/vue3.md) | [Vue 2](./docs/platforms/vue.md) | [React](./docs/platforms/react.md)
- [Mini-Programs](./docs/platforms/mini-programs.md) | [Android](./docs/platforms/android.md) | [iOS](./docs/platforms/ios.md) | [Flutter](./docs/platforms/flutter.md)
- [Platform Integration Overview](./docs/platforms/README.md)
- [Example Code Repository](./examples/README.md)

### Backend Services

- [Node.js Backend Example](./server/node/README.md)
- [Java Backend Example](./server/java/README.md)
- [Go Backend Example](./server/go/README.md)

---

## 🛠️ Local Development

```bash
# Clone the project
git clone https://github.com/saqqdy/captcha-pro.git
cd captcha-pro

# Install dependencies (first time is slow)
pnpm install

# Run Web examples
pnpm play:vue      # Vue 3 example
pnpm play:react    # React example

# Build all packages
pnpm build

# Run tests
pnpm test

# Start documentation site
pnpm docs:dev
```

> ⚠️ If `pnpm install` reports `python` / `canvas` related errors, this is caused by `@captcha-pro/core` compiling native modules. **It doesn't affect running Web examples, can be ignored.** To resolve:
>
> ```bash
> PYTHON=/usr/local/bin/python3.11 pnpm install
> ```

---

## 🤝 Contributing & Support

- [Contributing Guide](./CONTRIBUTING.md)
- [Issue Tracker](https://github.com/saqqdy/captcha-pro/issues)
- [Changelog](./CHANGELOG.md)

---

## 📄 License

[MIT](LICENSE) © [saqqdy](https://github.com/saqqdy)

---

<!-- Badge Links -->
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