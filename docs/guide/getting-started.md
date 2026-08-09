# Getting Started

## Install

Install the package that matches your platform:

```bash
# Core package (Web / Vanilla JS)
pnpm add captcha-pro

# Vue 2
pnpm add @captcha-pro/vue2

# Vue 3
pnpm add @captcha-pro/vue

# React
pnpm add @captcha-pro/react

# Mini-program (WeChat / uni-app / Taro)
pnpm add @captcha-pro/weixin
```

For native platforms, see [Platforms](/platforms/).

```bash
# Flutter — add to pubspec.yaml
captcha_pro: ^2.0.0

# Android — add to build.gradle
implementation 'com.captcha.pro:captcha-sdk:2.0.0'

# iOS — CocoaPods
pod 'CaptchaPro', '~> 2.0.0'
```

## Your First Captcha

```html
<div id="captcha"></div>

<script type="module">
  import { SliderCaptcha } from 'captcha-pro'

  const captcha = new SliderCaptcha({
    el: '#captcha',
    width: 300,
    height: 170,
    onSuccess: () => console.log('Verification passed!'),
    onFail: () => console.log('Verification failed!')
  })
</script>
```

## Requirements

- **Node.js**: `>=18`
- **Browser**: Chrome, Firefox, Safari, Opera, IE 11+ (IE11 needs a Promise polyfill)
- **Bundle size**: ~35KB minified, no runtime dependencies

## Build Outputs

| File | Format | Size | Use Case |
|------|--------|------|----------|
| `index.mjs` | ESM | 35KB | Bundlers (webpack, vite, rollup) |
| `index.cjs` | CommonJS | 36KB | Node.js, older bundlers |
| `index.global.js` | IIFE | 57KB | Browser (development) |
| `index.global.min.js` | IIFE | 34KB | Browser (production) |

## Next Steps

- [Basic Usage](/guide/basic-usage) — Slider, click, popup and invisible examples
- [Advanced Usage](/guide/advanced-usage) — Security, backend mode, statistics, i18n
- [Components](/components/) — Per-captcha-type options and methods
