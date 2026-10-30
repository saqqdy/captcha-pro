# 平台集成指南

本目录包含各平台的详细集成指南。

## 📋 支持平台列表

| 平台 | 包名 | 快速开始 | 完整文档 |
|------|------|---------|---------|
| Web (Vanilla JS) | `@captcha-pro/core` | [快速开始](../quick-start/web.md) | [详细指南](./web.md) |
| Vue 3 | `@captcha-pro/vue` | [快速开始](../quick-start/vue3.md) | [详细指南](./vue3.md) |
| Vue 2 | `@captcha-pro/vue2` | - | [详细指南](./vue.md) |
| React | `@captcha-pro/react` | [快速开始](../quick-start/react.md) | [详细指南](./react.md) |
| 微信小程序 | `@captcha-pro/weixin` | - | [详细指南](./mini-programs.md) |
| Taro (React) | `@captcha-pro/taro-react` | - | [详细指南](./mini-programs.md) |
| Taro (Vue) | `@captcha-pro/taro-vue` | - | [详细指南](./mini-programs.md) |
| uni-app (Vue) | `@captcha-pro/uniapp-vue` | - | [详细指南](./mini-programs.md) |
| Flutter | `captcha_pro` | - | [详细指南](./flutter.md) |
| Android | `captcha-sdk` | - | [详细指南](./android.md) |
| iOS | `CaptchaPro` | - | [详细指南](./ios.md) |

## 🚀 安装方式

### NPM 包（Web / Vue / React / 小程序）

```bash
# Web
pnpm add @captcha-pro/core

# Vue 3
pnpm add @captcha-pro/vue

# React
pnpm add @captcha-pro/react

# 微信小程序
pnpm add @captcha-pro/weixin

# Taro (React)
pnpm add @captcha-pro/taro-react

# uni-app (Vue)
pnpm add @captcha-pro/uniapp-vue
```

### Flutter

在 `pubspec.yaml` 中添加：

```yaml
dependencies:
  captcha_pro: ^2.2.0
```

### Android

在 `build.gradle` 中添加：

```gradle
dependencies {
  implementation 'com.captcha.pro:captcha-sdk:2.2.0'
}
```

### iOS

在 `Podfile` 中添加：

```ruby
pod 'CaptchaPro', '~> 2.2.0'
```

## 📖 各平台特性对比

| 平台 | 滑块验证 | 点选验证 | 无感验证 | 弹窗验证 | 后端验证 |
|------|---------|---------|---------|---------|---------|
| Web | ✅ | ✅ | ✅ | ✅ | ✅ |
| Vue 3 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Vue 2 | ✅ | ✅ | ✅ | ✅ | ✅ |
| React | ✅ | ✅ | ✅ | ✅ | ✅ |
| 微信小程序 | ✅ | ✅ | - | - | ✅ |
| Taro | ✅ | ✅ | - | - | ✅ |
| uni-app | ✅ | ✅ | - | - | ✅ |
| Flutter | ✅ | ✅ | ✅ | ✅ | ✅ |
| Android | ✅ | ✅ | ✅ | ✅ | ✅ |
| iOS | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🔗 相关链接

- [API 参考手册](../api/README.md)
- [前端集成指南](../guides/frontend-integration.md)
- [后端集成指南](../guides/backend-integration.md)
- [示例代码](https://github.com/saqqdy/captcha-pro/blob/master/examples/README.md)