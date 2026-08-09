# 小程序

`captcha-pro-mp`（共享的 `@captcha-pro/mp-shared` 包）支持微信、uni-app 与 Taro。小程序运行于**仅后端模式** — 向你的后端请求验证码图片并在服务端校验，因为客户端无法生成图片。

## 安装

```bash
# 微信 / uni-app / Taro
pnpm add captcha-pro-mp
```

## 支持的框架

| 框架 | 包变体 | 说明 |
|------|--------|------|
| 微信小程序 | `@captcha-pro/weixin` | WXML/WXSS/JS |
| uni-app + Vue 3 | `@captcha-pro/uniapp-vue` | Vue 跨端 |
| uni-app + Vue 2 | `@captcha-pro/uniapp-vue2` | Vue 跨端 |
| Taro + React | `@captcha-pro/taro-react` | React 跨端 |
| Taro + Vue 3 | `@captcha-pro/taro-vue` | Vue 跨端 |
| Taro + Vue 2 | `@captcha-pro/taro-vue2` | Vue 跨端 |

## 用法

小程序组件始终使用 `verifyMode: 'backend'`，并将 `backendVerify` 指向你的服务端：

```javascript
import { SliderCaptcha } from 'captcha-pro-mp'

// 配置 backendVerify 指向你的服务端
```

[后端](/zh/backend/)章节提供了这些组件所需 `/api/captcha` 与 `/api/captcha/verify` 端点的参考实现。
