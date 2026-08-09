# Mini-Programs

`captcha-pro-mp` (the shared `@captcha-pro/mp-shared` package) powers WeChat, uni-app, and Taro. Mini-programs run in **backend-only mode** — they request captcha images from your backend and verify server-side, since client-side image generation is not available.

## Install

```bash
# WeChat / uni-app / Taro
pnpm add captcha-pro-mp
```

## Supported Frameworks

| Framework | Package variant | Notes |
|-----------|-----------------|-------|
| WeChat Mini-Program | `@captcha-pro/weixin` | WXML/WXSS/JS |
| uni-app + Vue 3 | `@captcha-pro/uniapp-vue` | Vue cross-platform |
| uni-app + Vue 2 | `@captcha-pro/uniapp-vue2` | Vue cross-platform |
| Taro + React | `@captcha-pro/taro-react` | React cross-platform |
| Taro + Vue 3 | `@captcha-pro/taro-vue` | Vue cross-platform |
| Taro + Vue 2 | `@captcha-pro/taro-vue2` | Vue cross-platform |

## Usage

Mini-program components always use `verifyMode: 'backend'` and point `backendVerify` at your server:

```javascript
import { SliderCaptcha } from 'captcha-pro-mp'

// configure with backendVerify pointing to your server
```

See the [Backend](/backend/) section for reference server implementations that provide the `/api/captcha` and `/api/captcha/verify` endpoints these components expect.
