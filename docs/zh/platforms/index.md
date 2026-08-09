# 多平台

captcha-pro 支持 **10+ 平台**，API 保持一致。根据你的平台选择对应包：

| 平台 | 包名 | 描述 |
|------|------|------|
| Web（原生 JS） | `captcha-pro` | 核心包，通用支持 |
| Vue 2 | `@captcha-pro/vue2` | Options API + Mixins |
| Vue 3 | `@captcha-pro/vue` | Composition API + Composables |
| React | `@captcha-pro/react` | Hooks 组件 |
| 微信小程序 | `@captcha-pro/weixin` | WXML/WXSS/JS，仅后端模式 |
| uni-app | `@captcha-pro/uniapp-vue` | Vue 跨端，仅后端模式 |
| Taro 3 | `@captcha-pro/taro-react` | React 跨端，仅后端模式 |
| Flutter | `captcha_pro` | Dart Widgets |
| Android | `captcha-sdk` | 原生 Kotlin SDK |
| Android Compose | `captcha-compose` | Jetpack Compose |
| iOS | `CaptchaPro` | Swift SDK（UIKit + SwiftUI） |

## 安装

```bash
# Web
pnpm add captcha-pro

# Vue 2 / Vue 3 / React
pnpm add @captcha-pro/vue2   # 或 @captcha-pro/vue / @captcha-pro/react

# 小程序（微信 / uni-app / Taro）
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

## 验证模式

- **前端模式** 适用于所有平台。
- **仅后端模式** 用于小程序包（`@captcha-pro/weixin`、`@captcha-pro/uniapp-vue`、`@captcha-pro/taro-react`），因为小程序无法在客户端生成验证码图片，需向你的后端请求图片并在服务端验证。

左侧选择平台查看用法示例。
