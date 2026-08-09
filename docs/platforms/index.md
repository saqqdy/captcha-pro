# Platforms

captcha-pro supports **10+ platforms** with a consistent API. Pick the package that matches your platform:

| Platform | Package | Description |
|----------|---------|-------------|
| Web (Vanilla JS) | `@captcha-pro/core` | Core package, works everywhere |
| Vue 2 | `@captcha-pro/vue2` | Options API + Mixins |
| Vue 3 | `@captcha-pro/vue` | Composition API + Composables |
| React | `@captcha-pro/react` | Hooks-based components |
| WeChat Mini-Program | `@captcha-pro/weixin` | WXML/WXSS/JS, backend-only |
| uni-app | `@captcha-pro/uniapp-vue` | Vue cross-platform, backend-only |
| Taro 3 | `@captcha-pro/taro-react` | React cross-platform, backend-only |
| Flutter | `captcha_pro` | Dart widgets |
| Android | `captcha-sdk` | Native Kotlin SDK |
| Android Compose | `captcha-compose` | Jetpack Compose |
| iOS | `CaptchaPro` | Swift SDK (UIKit + SwiftUI) |

## Install

```bash
# Web
pnpm add @captcha-pro/core

# Vue 2 / Vue 3 / React
pnpm add @captcha-pro/vue2   # or @captcha-pro/vue / @captcha-pro/react

# Mini-programs (WeChat / uni-app / Taro)
pnpm add @captcha-pro/weixin
```

```bash
# Flutter — pubspec.yaml
captcha_pro: ^2.0.0

# Android — build.gradle
implementation 'com.captcha.pro:captcha-sdk:2.0.0'

# iOS — CocoaPods
pod 'CaptchaPro', '~> 2.0.0'
```

## Verification Modes

- **Frontend mode** works on all platforms.
- **Backend-only mode** is used by mini-program packages (`@captcha-pro/weixin`, `@captcha-pro/uniapp-vue`, `@captcha-pro/taro-react`) since mini-programs cannot generate captcha images client-side. They request images from your backend and verify server-side.

Choose a platform on the left for usage examples.
