# uni-app Vue 3 Captcha Demo

uni-app + Vue 3 example project demonstrating @captcha-pro/uniapp-vue components (backend-only mode).

**[简体中文](./README_CN.md)**

## Important: Backend-Only Mode

uni-app captcha components only support backend verification. All captcha images are provided by backend API.

## Quick Start

```bash
# Install dependencies
pnpm install

# Development - H5
pnpm dev:h5

# Development - WeChat mini-program
pnpm dev:mp-weixin

# Development - App
pnpm dev:app
```

Open in HBuilderX or browser for preview.

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

<script setup lang="ts">
import { ref } from 'vue'
import { SliderCaptcha } from '@captcha-pro/uniapp-vue'

const backendConfig = ref({
  getCaptcha: 'https://your-api.com/captcha/get',
  verify: 'https://your-api.com/captcha/verify',
  timeout: 10000,
})

const onSuccess = () => console.log('Passed!')
</script>
```

## Project Structure

```
src/
├── App.vue              # App entry
├── main.js              # Main entry
├── manifest.json        # App manifest
├── pages.json           # Pages config
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
<script setup>
import { ref } from 'vue'
import { PopupCaptcha } from '@captcha-pro/uniapp-vue'

const popupRef = ref()
const showPopup = () => popupRef.value?.show()
</script>

<template>
  <button @click="showPopup">Verify</button>
  <PopupCaptcha
    ref="popupRef"
    type="slider"
    :backend="backendConfig"
    @success="handleSuccess"
  />
</template>
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
# Build for H5
pnpm build:h5

# Build for WeChat mini-program
pnpm build:mp-weixin

# Build for App
pnpm build:app
```

## License

MIT