# Changelog

All notable changes to this project will be documented in this file.

## [2.2.0] - 2026-08-16

### Full-Platform Accessibility (a11y) Compliance — WCAG 2.2 Level AA

- **Screen reader semantics**: added accessibility labels + roles to all icon buttons (refresh, close, slider thumb, click markers) across all platforms, stopping verbatim reading of `⟳ → ✓ ✕` glyphs
- **Touch targets**: refresh button hit area enlarged to 44px / 44pt / 48dp (visual size unchanged, transparent overlay only)
- **Keyboard operability (web)**: Tab focus order, Enter to refresh/submit, `←`/`→` to adjust the slider
- **Status live region**: success/failure announced in real time (`aria-live` / `announceForAccessibility` / `UIAccessibility.post`)
- **i18n**: added `refresh` key (14 → 15 keys)
- **Contrast fix**: slider_hint text and iOS close-button × `#999`→`#666` (now meet 4.5:1)
- **Docs**: added `docs/accessibility.md` conformance statement + keyboard shortcuts + screen reader matrix
- **iOS package**: declared iOS-only (removed the unsupported `.macOS` platform from `Package.swift`; build with `xcodebuild -destination 'platform=iOS Simulator'`)

### Documentation

- `docs/accessibility.md`: WCAG 2.2 conformance, keyboard table, screen reader support

## [2.1.0] - 2026-08-10

### Native Three-Platform Feature Contract Alignment

- **flutter**: BackendConfig + fetchCaptcha/verifyCaptcha (backend mode, no client-side generation), 14-key i18n, PopupCaptcha full props (autoClose 500ms / refresh on failure 800ms), onError callback
- **android**: Added loading/slider_hint to LocaleMessages, removed dead precision parameter, removed timestamp from verify request body, timeout default 10s, CaptchaDialog title prop
- **ios**: Aligned with android (UIKit + SwiftUI dual paradigms)

### Native Style Replication (Phase 2)

- Captcha area: linear gradient `#667EEA→#764BA2` + shadow + rounded corners
- Status feedback: centered overlay (white@75%) + 32px circular icon + text + fade-in 0.2s (replaces bottom bar)
- Loading state: gradient background + white text label (replaces system spinner)
- Slider bar/thumb, click markers, hint bar (gradient character cells), popup custom card
- Unified accent blue `#1991FA`

### Unified Version Across All Platforms

- root + 11 JS packages + 3 native packages (android/ios/flutter) unified to 2.1.0

### Documentation

- Removed inaccurate AES/encryption claims from native READMEs
- Added non-developer-facing guides ("start service / build / verify / what software to use / how to open") to READMEs of all runnable projects (examples / android / ios / flutter / server) (EN+CN, including new examples/weixin/README_CN.md and packages/flutter/README_CN.md)
- Added a "Run the Examples (beginner-friendly walkthrough)" page to the VitePress docs site (EN + zh) and registered it in the sidebar; updated the navigation version dropdown to v2.1.0

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

- **VitePress docs site** (`docs/`) with English + Simplified Chinese content
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
