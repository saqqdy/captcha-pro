---
layout: home

hero:
  name: captcha-pro
  text: 行为验证码库
  tagline: 轻量级、框架无关的滑动与点选验证 — 支持 Web、Vue、React、小程序、Flutter、Android 与 iOS
  image:
    src: /logo.svg
    alt: captcha-pro
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/saqqdy/captcha-pro

features:
  - icon: 🧩
    title: 滑动拼图
    details: 随机形状与迷惑坑位的拼图验证
  - icon: 🖱️
    title: 点选文字
    details: 200+ 中文词汇、防机器识别提示图片的文字点选
  - icon: 👻
    title: 智能无感
    details: 基于风险评估的隐形验证，行为追踪与分析
  - icon: 📦
    title: 弹窗验证码
    details: 滑动 / 点选的模态包装器，元素点击或编程式触发
  - icon: 🔐
    title: 数据加密
    details: AES-GCM 加密与时间戳校验，防止篡改与重放攻击
  - icon: 🌍
    title: 多语言支持
    details: 内置中英文（zh-CN、en-US），自动检测浏览器语言
  - icon: 🚀
    title: 框架无关
    details: 可用于 Vue 2/3、React、Angular、原生 JS 与原生平台
  - icon: 📊
    title: 统计 API
    details: 内置验证成功率、耗时、距离的统计追踪
  - icon: 📦
    title: 轻量级
    details: 约 35KB 压缩后，无额外依赖，IE11+ 需 Promise polyfill
---

## 快速开始

```bash
# 安装
pnpm add captcha-pro

# 使用
import { SliderCaptcha } from 'captcha-pro'

new SliderCaptcha({
  el: '#captcha',
  onSuccess: () => console.log('验证通过!')
})
```

## 多平台支持

Captcha Pro 支持 **10+ 平台**，API 保持一致：

| 平台 | 包名 | 描述 |
|------|------|------|
| Web（原生 JS） | `captcha-pro` | 核心包，通用支持 |
| Vue 2 | `captcha-pro-vue2` | Options API + Mixins |
| Vue 3 | `captcha-pro-vue` | Composition API + Composables |
| React | `captcha-pro-react` | Hooks 组件 |
| 微信小程序 | `captcha-pro-mp` | WXML/WXSS/JS，仅后端模式 |
| uni-app | `captcha-pro-mp` | Vue 跨端，仅后端模式 |
| Taro 3 | `captcha-pro-mp` | React 跨端，仅后端模式 |
| Flutter | `captcha_pro` | Dart Widgets |
| Android | `captcha-sdk` | 原生 Kotlin SDK |
| Android Compose | `captcha-compose` | Jetpack Compose |
| iOS | `CaptchaPro` | Swift SDK（UIKit + SwiftUI） |

## 为什么选择 captcha-pro？

- **多平台** — 一套 API 覆盖 10+ 平台，从 Web 到原生移动端
- **零配置** — 合理默认值，开箱即用
- **双验证模式** — 纯前端验证，或服务端图片生成与校验
- **安全优先** — AES-GCM 加密、时间戳校验、频率限制、IP 黑名单
- **轻量级** — 约 35KB，无依赖，IE11+ 支持
- **无障碍** — ARIA 属性与键盘导航
