# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-03-20

🚀 **Multi-Platform Release** - Captcha Pro now supports 10+ platforms!

### New Packages

#### Web Frameworks
- **`captcha-pro-vue2`** - Vue 2 component library with Options API + Mixins
  - `SliderCaptcha`, `ClickCaptcha`, `PopupCaptcha` components
  - `sliderCaptchaMixin`, `clickCaptchaMixin` mixins
- **`captcha-pro-vue3`** - Vue 3 component library with Composition API
  - `SliderCaptcha`, `ClickCaptcha`, `PopupCaptcha` components
  - `useSliderCaptcha`, `useClickCaptcha` composables
- **`captcha-pro-react`** - React component library with Hooks
  - `SliderCaptcha`, `ClickCaptcha`, `PopupCaptcha` components
  - `useSliderCaptcha`, `useClickCaptcha` hooks

#### Mini-Program Platforms
- **`captcha-pro-mp`** - Mini-program package supporting:
  - **WeChat Mini-Program** - WXML/WXSS/JS components
  - **uni-app** - Vue-based cross-platform components
  - **Taro 3** - React-based cross-platform components

#### Mobile Platforms
- **Flutter** (`captcha_pro`) - Dart package with widgets
  - `SliderCaptcha`, `ClickCaptcha`, `PopupCaptcha` widgets
  - `CaptchaGenerator` for image generation
  - `SliderPainter`, `ClickPainter` custom painters
- **Android SDK** (`captcha-sdk`) - Native Kotlin SDK
  - `SliderCaptchaView`, `ClickCaptchaView`, `CaptchaDialog` views
  - `CaptchaGenerator` for bitmap generation
  - `CanvasRenderer`, `ShapeDrawer` for custom rendering
- **Android Compose** (`captcha-compose`) - Jetpack Compose components
  - `SliderCaptcha`, `ClickCaptcha` composables
- **iOS SDK** (`CaptchaPro`) - Native Swift SDK
  - UIKit: `SliderCaptchaView`, `ClickCaptchaView`
  - SwiftUI: `SliderCaptcha`, `ClickCaptcha` views
  - `CaptchaGenerator`, `CanvasRenderer` for image generation
  - CocoaPods and Swift Package Manager support

### Platform Compatibility Matrix

| Platform | Package | Tech Stack | Status |
|----------|---------|------------|--------|
| Web (Vanilla JS) | `captcha-pro` | TypeScript/Canvas | ✅ Stable |
| Vue 2 | `captcha-pro-vue2` | Options API + Mixins | ✅ Stable |
| Vue 3 | `captcha-pro-vue3` | Composition API | ✅ Stable |
| React 17/18 | `captcha-pro-react` | Hooks | ✅ Stable |
| WeChat Mini-Program | `captcha-pro-mp/weixin` | WXML/WXSS/JS | ✅ Stable |
| uni-app | `captcha-pro-mp/uniapp` | Vue | ✅ Stable |
| Taro 3 | `captcha-pro-mp/taro` | React | ✅ Stable |
| Flutter | `captcha_pro` | Dart/CustomPainter | ✅ Stable |
| Android | `captcha-sdk` | Kotlin/Canvas | ✅ Stable |
| Android Compose | `captcha-compose` | Jetpack Compose | ✅ Stable |
| iOS | `CaptchaPro` | Swift/CoreGraphics | ✅ Stable |

### Architecture Improvements

- **Abstract Renderer Interface** - Unified rendering API for all platforms
- **Core Logic Separation** - Framework-agnostic core with platform adapters
- **Type Definitions** - Full TypeScript support across all packages
- **Monorepo Structure** - Organized with pnpm workspaces

### Documentation

- Added `PLATFORM_ROADMAP.md` - Detailed multi-platform implementation guide
- Updated README with multi-platform installation instructions
- Added code examples for each platform

---

## [1.0.0] - 2025-03-17

🎉 **Initial Release** - Captcha Pro v1.0 is officially released!

### Captcha Types

- 🧩 **Slider Captcha** - Drag the slider to complete the puzzle verification
  - Random puzzle shapes: square, triangle, trapezoid, pentagon
  - Decoy holes with random rotation for anti-bot protection
  - Enhanced gradient backgrounds with decorative patterns
- 🖱️ **Click Captcha** - Click specified text in sequence
  - Chinese vocabulary support with 200+ common words/phrases
  - No duplicate characters per word
  - Random decoy characters (1-2 extra) for anti-bot protection
  - Prompt text displayed as base64 images to prevent machine recognition
- 👻 **Invisible Captcha** - Risk-based invisible verification
- 📦 **Popup Captcha** - Modal popup wrapper for slider/click captcha

### Verification Modes

- 🎯 **Frontend Mode** - Pure frontend verification, no backend required
- 🌐 **Backend Mode** - Server-side verification, higher security

### Security Features

- 🔐 **Data Encryption** - AES-GCM encryption with PBKDF2 key derivation
- ⏱️ **Timestamp Validation** - Prevent replay attacks
- 🚦 **Rate Limiting** - Prevent API abuse (default: 60 requests/min)
- 🚫 **IP Blacklist** - Block malicious IPs
- 🛡️ **Brute-Force Protection** - Detect and block brute-force attacks

### Other Features

- 🌍 **i18n Support** - Built-in internationalization
  - Supports Chinese (zh-CN) and English (en-US)
  - Auto-detects browser language on initialization
  - `setLocale()`, `getLocale()`, `t()` API for global language control
  - Component-level `locale` option for per-instance language setting
  - Backend i18n modules for Node.js, Java, and Go
  - `Accept-Language` header support for backend APIs

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

### Browser Support

Chrome, Firefox, Safari, Opera, Edge, IE 11 (with Promise polyfill)

### Links

- [GitHub Repository](https://github.com/saqqdy/captcha-pro)
- [NPM Package](https://www.npmjs.com/package/captcha-pro)
- [Issue Tracker](https://github.com/saqqdy/captcha-pro/issues)
