# Taro + Vue 3 Captcha Example

Taro + Vue 3 captcha example project using `@captcha-pro/taro-vue` components.

> **Important:** This example only supports backend verification mode. All captcha images are provided by backend API, `backend` configuration is required.

## Quick Start

### 1. Install Dependencies

```bash
# Install in project root
pnpm install
```

### 2. Build Package

```bash
# Build @captcha-pro/taro-vue package first
pnpm build:taro-vue
```

### 3. Run Development

```bash
# WeChat Mini-Program
pnpm dev:weapp

# H5
pnpm dev:h5

# Alipay Mini-Program
pnpm dev:alipay

# Other platforms: swan, tt, qq, jd
```

### 4. Preview

- **WeChat Mini-Program**: Open project in WeChat Developer Tools
- **H5**: Open browser at `http://localhost:10086`
- **Other platforms**: Follow platform-specific instructions

## Backend Configuration (Required)

All components require `backend` configuration:

```vue
<script setup>
const backendConfig = {
  getCaptcha: 'https://your-api.com/captcha/get',
  verify: 'https://your-api.com/captcha/verify',
  timeout: 10000,
}
</script>

<template>
  <SliderCaptcha
    :backend="backendConfig"
    @success="onSuccess"
  />
</template>
```

### Backend Config Options

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| getCaptcha | `string \| function` | Yes | URL or custom function to get captcha |
| verify | `string \| function` | Yes | URL or custom function to verify captcha |
| headers | `Record<string, string>` | No | Request headers |
| timeout | `number` | No | Timeout (ms), default: 10000 |

## Example Pages

This example includes multiple pages demonstrating different captcha types:

### ClickCaptcha Demo (`/pages/click`)

Click verification captcha example.

### SliderCaptcha Demo (`/pages/slider`)

Slider puzzle captcha example.

### PopupCaptcha Demo (`/pages/popup`)

Popup captcha example with both slider and click modes.

## Directory Structure

```
examples/taro-vue/
├── src/
│   ├── app.config.ts    # App configuration
│   ├── app.scss         # Global styles
│   ├── app.ts           # App entry
│   └── pages/
│       ├── click/       # ClickCaptcha demo
│       ├── slider/      # SliderCaptcha demo
│       └── popup/       # PopupCaptcha demo
├── config/              # Taro build config
├── package.json
└── project.config.json  # WeChat Mini-Program config
```

## Platform Support

| Platform | Command | Notes |
|----------|---------|-------|
| WeChat | `pnpm dev:weapp` | Recommended |
| H5 | `pnpm dev:h5` | Browser |
| Alipay | `pnpm dev:alipay` | Alipay Mini-Program |
| ByteDance | `pnpm dev:tt` | Douyin/Toutiao |
| Baidu | `pnpm dev:swan` | Baidu Mini-Program |
| QQ | `pnpm dev:qq` | QQ Mini-Program |
| JD | `pnpm dev:jd` | JD Mini-Program |

## Reference

- [Taro Documentation](https://taro-docs.jd.com/)
- [@captcha-pro/taro-vue Package](../../packages/taro-vue/README.md)
- [Backend API Documentation](../../server/node/README.md)

## License

MIT