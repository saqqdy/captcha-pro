# Taro Vue 2 Captcha Demo

Taro + Vue 2 example project demonstrating @captcha-pro/taro-vue2 components (backend-only mode).

**[简体中文](./README_CN.md)**

## Important: Backend-Only Mode

Taro captcha components only support backend verification. All captcha images are provided by backend API.

## Quick Start

```bash
# Install dependencies
pnpm install

# Development - WeChat mini-program
pnpm dev:weapp

# Development - H5
pnpm dev:h5

# Development - Alipay mini-program
pnpm dev:alipay
```

Open the `dist/` directory in WeChat DevTools for mini-program preview.

## Backend Configuration

Configure your backend API in the page:

```vue
<template>
  <SliderCaptcha
    :backend="backendConfig"
    :width="300"
    :height="170"
    @success="onSuccess"
  />
</template>

<script>
import { SliderCaptcha } from '@captcha-pro/taro-vue2'

export default {
  components: { SliderCaptcha },
  data() {
    return {
      backendConfig: {
        getCaptcha: 'https://your-api.com/captcha/get',
        verify: 'https://your-api.com/captcha/verify',
        timeout: 10000,
      },
    }
  },
  methods: {
    onSuccess() {
      console.log('Passed!')
    },
  },
}
</script>
```

## Project Structure

```
src/
├── app.config.ts        # App configuration
├── app.vue              # App entry
├── app.scss             # Global styles
├── pages/
│   ├── index/           # Home page
│   ├── slider/          # Slider captcha demo
│   └── click/           # Click captcha demo
└── components/          # Shared components
```

## Components Demonstrated

### SliderCaptcha

```vue
<SliderCaptcha
  :backend="backendConfig"
  :width="300"
  :height="170"
  :slider-width="42"
  :slider-height="42"
  :show-refresh="true"
  @success="handleSuccess"
  @fail="handleFail"
/>
```

### ClickCaptcha

```vue
<ClickCaptcha
  :backend="backendConfig"
  :width="300"
  :height="170"
  :show-refresh="true"
  @success="handleSuccess"
/>
```

### PopupCaptcha

```vue
<template>
  <view>
    <button @click="showPopup">Verify</button>
    <PopupCaptcha
      ref="popupRef"
      type="slider"
      :backend="backendConfig"
      @success="handleSuccess"
    />
  </view>
</template>

<script>
export default {
  methods: {
    showPopup() {
      this.$refs.popupRef.show()
    },
  },
}
</script>
```

## Backend Server

Start the demo backend server:

```bash
# From project root
cd server/node
pnpm install
pnpm dev
```

Update `backendConfig` to point to `http://localhost:3001/api/captcha`

## Build

```bash
# Build for WeChat mini-program
pnpm build:weapp

# Build for H5
pnpm build:h5
```

## License

MIT