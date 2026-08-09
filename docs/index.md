---
layout: home

hero:
  name: captcha-pro
  text: Behavioral Captcha Library
  tagline: Lightweight, framework-agnostic slider & click verification — works on Web, Vue, React, mini-programs, Flutter, Android and iOS
  image:
    src: /logo.svg
    alt: captcha-pro
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/saqqdy/captcha-pro

features:
  - icon: 🧩
    title: Slider Captcha
    details: Puzzle verification with random shapes and decoy holes
  - icon: 🖱️
    title: Click Captcha
    details: Text click verification with 200+ Chinese vocabulary and anti-bot prompts
  - icon: 👻
    title: Invisible Captcha
    details: Risk-based invisible verification with behavior tracking and analysis
  - icon: 📦
    title: Popup Captcha
    details: Modal wrapper for slider and click captcha, trigger by element or programmatically
  - icon: 🔐
    title: Data Encryption
    details: AES-GCM encryption and timestamp validation prevent tampering and replay attacks
  - icon: 🌍
    title: i18n Support
    details: Built-in zh-CN and en-US, auto-detects browser language
  - icon: 🚀
    title: Framework Agnostic
    details: Works with Vue 2/3, React, Angular, vanilla JS, and native platforms
  - icon: 📊
    title: Statistics API
    details: Track success rates, timing, and drag distances out of the box
  - icon: 📦
    title: Lightweight
    details: ~35KB minified, no dependencies, IE11+ support with a Promise polyfill
---

## Quick Start

```bash
# Install
pnpm add captcha-pro

# Use
import { SliderCaptcha } from 'captcha-pro'

new SliderCaptcha({
  el: '#captcha',
  onSuccess: () => console.log('Passed!')
})
```

## Multi-Platform Support

Captcha Pro supports **10+ platforms** with consistent APIs:

| Platform | Package | Description |
|----------|---------|-------------|
| Web (Vanilla JS) | `captcha-pro` | Core package, works everywhere |
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

## Why captcha-pro?

- **Multi-Platform** — One API across 10+ platforms from web to native mobile
- **Zero Configuration** — Sensible defaults, works out of the box
- **Two Verification Modes** — Pure frontend, or server-side with image generation
- **Security First** — AES-GCM encryption, timestamp validation, rate limiting, IP blacklist
- **Lightweight** — ~35KB, no dependencies, IE11+ support
- **Accessible** — ARIA attributes and keyboard navigation
