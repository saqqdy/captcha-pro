# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2026-08-10

### Native 三端功能契约对齐

- **flutter**: BackendConfig + fetchCaptcha/verifyCaptcha（后端模式，无客户端生成）、14 键 i18n、PopupCaptcha 全 props（autoClose 500ms / 失败刷新 800ms）、onError 回调
- **android**: LocaleMessages 补 loading/slider_hint、移除 precision 死参数、verify 请求体移除 timestamp、timeout 默认 10s、CaptchaDialog title prop
- **ios**: 同 android 对齐（UIKit + SwiftUI 双范式）

### Native 样式复刻（Phase 2）

- 验证码区域：线性渐变 `#667EEA→#764BA2` + 阴影 + 圆角
- 状态反馈：居中遮罩（白@75%）+ 32px 圆图标 + 文本 + 淡入 0.2s（替换底部条）
- loading 态：渐变底 + 白字文案（替换系统 spinner）
- 滑块条/拇指、点击标记、提示条（渐变字符格）、popup 自定义卡片
- 强调蓝统一 `#1991FA`

### 全端版本统一

- root + 11 个 JS 包 + 3 个 native 包（android/ios/flutter）统一 2.1.0

### Documentation

- 移除 native README 中的 AES/encryption 不实声明
- 各可运行项目（examples / android / ios / flutter / server）README 增加面向非开发人员的「起服务 / 构建 / 验证 / 用什么软件 / 怎么打开」指南（EN+CN，含新建 examples/weixin/README_CN.md 与 packages/flutter/README_CN.md）
- VitePress 文档站新增「跑通示例（零基础也能跟着做）」页面（EN + zh）并注册进侧栏；导航版本下拉更新至 v2.1.0

## [2.0.0] - 2026-08-09

🚀 **Multi-Platform Release** - Captcha Pro now supports 14+ platform targets across web, mini-programs, and mobile!

### Breaking Changes

- **Package scope change**: Multi-platform packages are now published under the `@captcha-pro/*` npm scope (was `captcha-pro-*`).
- **Mini-program packages split**: The single `captcha-pro-mp` package is now split into dedicated per-platform packages (`@captcha-pro/weixin`, `@captcha-pro/uniapp-vue`, `@captcha-pro/uniapp-vue2`, `@captcha-pro/taro-react`, `@captcha-pro/taro-vue`, `@captcha-pro/taro-vue2`).
- **Core extraction**: Framework-agnostic logic moved to `@captcha-pro/core`; mini-program shared code to `@captcha-pro/mp-shared`.

### New Packages

#### Core & Shared
- **`@captcha-pro/core`** - Framework-agnostic core logic (captcha generation, verification, types)
- **`@captcha-pro/mp-shared`** - Shared logic for mini-program platforms

#### Web Frameworks
- **`@captcha-pro/vue`** - Vue 3 component library (Composition API): `SliderCaptcha`, `ClickCaptcha`, `PopupCaptcha` + `useSliderCaptcha`, `useClickCaptcha` composables
- **`@captcha-pro/vue2`** - Vue 2 component library (Options API): `SliderCaptcha`, `ClickCaptcha`, `PopupCaptcha` + `sliderCaptchaMixin`, `clickCaptchaMixin` mixins
- **`@captcha-pro/react`** - React component library (Hooks): `SliderCaptcha`, `ClickCaptcha`, `PopupCaptcha` + `useSliderCaptcha`, `useClickCaptcha` hooks

#### Mini-Program Platforms (each a dedicated package)
- **`@captcha-pro/weixin`** - WeChat Mini-Program (WXML/WXSS/JS)
- **`@captcha-pro/uniapp-vue`** - uni-app (Vue 3)
- **`@captcha-pro/uniapp-vue2`** - uni-app (Vue 2)
- **`@captcha-pro/taro-react`** - Taro 3 (React)
- **`@captcha-pro/taro-vue`** - Taro (Vue 3)
- **`@captcha-pro/taro-vue2`** - Taro (Vue 2)

#### Mobile Platforms
- **Flutter** (`captcha_pro`) - Dart widgets: `SliderCaptcha`, `ClickCaptcha`, `PopupCaptcha` + `CaptchaGenerator`, `SliderPainter`, `ClickPainter`
- **Android SDK** (`captcha-sdk`) - Native Kotlin: `SliderCaptchaView`, `ClickCaptchaView`, `CaptchaDialog` + `CaptchaGenerator`, `CanvasRenderer`, `ShapeDrawer`
- **Android Compose** (`captcha-compose`) - Jetpack Compose: `SliderCaptcha`, `ClickCaptcha` composables
- **iOS SDK** (`CaptchaPro`) - Native Swift: UIKit (`SliderCaptchaView`, `ClickCaptchaView`) + SwiftUI (`SliderCaptcha`, `ClickCaptcha`, `PopupCaptcha`) + `CaptchaGenerator`, `CanvasRenderer`; CocoaPods & Swift Package Manager support

### Platform Compatibility Matrix

| Platform | Package | Tech Stack |
|----------|---------|------------|
| Web (Vanilla JS) | `@captcha-pro/core` | TypeScript/Canvas |
| Vue 3 | `@captcha-pro/vue` | Composition API |
| Vue 2 | `@captcha-pro/vue2` | Options API + Mixins |
| React | `@captcha-pro/react` | Hooks |
| WeChat Mini-Program | `@captcha-pro/weixin` | WXML/WXSS/JS |
| uni-app (Vue 3) | `@captcha-pro/uniapp-vue` | Vue |
| uni-app (Vue 2) | `@captcha-pro/uniapp-vue2` | Vue |
| Taro (React) | `@captcha-pro/taro-react` | React |
| Taro (Vue 3) | `@captcha-pro/taro-vue` | Vue |
| Taro (Vue 2) | `@captcha-pro/taro-vue2` | Vue |
| Flutter | `captcha_pro` | Dart/CustomPainter |
| Android | `captcha-sdk` | Kotlin/Canvas |
| Android Compose | `captcha-compose` | Jetpack Compose |
| iOS | `CaptchaPro` | Swift/CoreGraphics |

### Architecture Improvements

- **Abstract Renderer Interface** - Unified rendering API for all platforms
- **Core Logic Separation** - Framework-agnostic `@captcha-pro/core` with platform adapters
- **Composables Refactor** - ClickCaptcha/SliderCaptcha refactored to use composable functions
- **Backend-Only Mode** - Mini-program components (WeChat/uni-app) support backend-only verification
- **Type Definitions** - Full TypeScript support across all packages
- **Monorepo Structure** - pnpm workspaces with 11 JS packages + 3 native SDKs
- **Test Suite** - Vitest unit tests for core package

### Documentation

- **VitePress docs site** (`docs/`) with English + 简体中文 content
  - Guide (getting-started, basic/advanced usage, i18n)
  - API reference (methods, options)
  - Component docs (slider, click, invisible, popup)
  - Platform docs (vue, react, mini-programs, native)
  - Backend docs (node, java, go)
- Updated README with multi-platform installation instructions
- Added code examples for each platform

---

## [1.0.0] - 2026-03-20

🎉 **Initial Release** - Captcha Pro v1.0 is officially released!

### Captcha Types

- 🧩 **Slider Captcha** - Drag the slider to complete the puzzle verification
  - Random puzzle shapes: square, triangle, trapezoid, pentagon
  - Decoy holes with random rotation for anti-bot protection
  - Enhanced gradient backgrounds with decorative patterns
- 🖱️ **Click Captcha** - Click specified text in sequence
  - Chinese vocabulary support with 189 common words/phrases
  - Random decoy characters (1-2 extra) for anti-bot protection
  - Displayed characters drawn with random rotation (anti-OCR)
  - Prompt text displayed as base64 images to prevent machine recognition
- 👻 **Invisible Captcha** - Risk-based invisible verification
- 📦 **Popup Captcha** - Modal popup wrapper for slider/click captcha

### Verification Modes

- 🎯 **Frontend Mode** - Pure frontend verification, no backend required
- 🌐 **Backend Mode** - Server-side verification, higher security

### Security Features

- 🔐 **Data Encryption** - AES-256-GCM encryption with PBKDF2 key derivation (100,000 iterations, SHA-256)
- 🔑 **Nonce Replay Prevention** - Random nonce embedded in the encrypted payload
- ⏱️ **Timestamp Validation** - Prevent replay attacks
- 🚦 **Rate Limiting** - Prevent API abuse (default: 60 requests/min)
- 🚫 **IP Blacklist** - Block malicious IPs (auto-escalated on rate-limit/brute-force threshold)
- 🛡️ **Brute-Force Protection** - Detect and block brute-force attacks

### Other Features

- 📊 **Statistics API** - Track verification success rates, timing, and drag distances
- 🖼️ **Custom Images** - Support custom background and slider images
- 📱 **Mobile Friendly** - Full touch events support
- ♿ **Accessibility** - ARIA attributes and keyboard navigation (arrow keys + Enter)
- 🚀 **Framework Agnostic** - Works with Vue, React, Angular, or vanilla JS
- 📦 **Lightweight** - ~35KB minified
- 🌍 **i18n Support** - Built-in internationalization
  - Supports Chinese (zh-CN) and English (en-US)
  - Auto-detects browser language on initialization
  - `setLocale()`, `getLocale()`, `t()`, `getMessages()` API for global language control
  - Backend i18n modules for Node.js, Java, and Go

### Backend Implementations

| Backend | Framework | Features |
|---------|-----------|----------|
| Node.js | Express 5 | Canvas image generation, memory cache |
| Java | Spring Boot 3 | Java AWT image generation, concurrent map storage |
| Go | Gin | High-performance, concurrent map storage |

### Build Outputs

| File | Format | Size | Use Case |
|------|--------|------|----------|
| `index.mjs` | ESM | 35KB | Bundlers (webpack, vite, rollup) |
| `index.cjs` | CommonJS | 36KB | Node.js, legacy bundlers |
| `index.global.js` | IIFE | 57KB | Browser (development) |
| `index.global.min.js` | IIFE | 34KB | Browser (production) |
| `index.d.ts` | TypeScript | - | Type declarations |

### Browser Support

Chrome, Firefox, Safari, Opera, Edge, IE 11 (with Promise polyfill)

### Links

- [GitHub Repository](https://github.com/saqqdy/captcha-pro)
- [NPM Package](https://www.npmjs.com/package/captcha-pro)
- [Issue Tracker](https://github.com/saqqdy/captcha-pro/issues)
