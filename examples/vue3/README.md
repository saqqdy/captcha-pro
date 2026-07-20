# Vue 3 Captcha Demo

Vue 3 example project demonstrating captcha-pro-vue3 components.

**[简体中文](./README_CN.md)**

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app runs at `http://localhost:5173`

## Features Demonstrated

- **SliderCaptcha** - Drag slider to complete verification
- **ClickCaptcha** - Click characters in order
- **PopupCaptcha** - Modal wrapper for captcha
- **InvisibleCaptcha** - Risk-based invisible verification
- **Backend Verification** - Server-side validation demo
- **Custom Images** - Use your own background/slider images
- **Composables** - useSliderCaptcha, useClickCaptcha hooks

## Project Structure

```
src/
├── App.vue              # Main app
├── main.ts              # Entry point
├── pages/
│   ├── ClickDemo.vue    # Click captcha demo
│   ├── SliderDemo.vue   # Slider captcha demo
│   ├── PopupDemo.vue    # Popup captcha demo
│   ├── InvisibleDemo.vue # Invisible captcha demo
│   ├── BackendDemo.vue  # Backend verification demo
│   └── CustomImageDemo.vue # Custom image demo
└── hooks/
    └── useLocale.ts     # i18n hook
```

## Usage Examples

### Basic Slider Captcha

```vue
<template>
  <SliderCaptcha
    :width="300"
    :height="170"
    @success="onSuccess"
    @fail="onFail"
  />
</template>

<script setup lang="ts">
import { SliderCaptcha } from 'captcha-pro-vue3'

const onSuccess = () => console.log('Passed!')
</script>
```

### Click Captcha

```vue
<template>
  <ClickCaptcha
    :width="300"
    :height="170"
    :count="3"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
import { ClickCaptcha } from 'captcha-pro-vue3'
</script>
```

### Popup Captcha

```vue
<template>
  <PopupCaptcha
    trigger="#submit-btn"
    type="slider"
    @success="onSuccess"
  >
    <button id="submit-btn">Submit</button>
  </PopupCaptcha>
</template>
```

### Backend Verification

```vue
<template>
  <SliderCaptcha
    verify-mode="backend"
    :backend-verify="backendConfig"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
const backendConfig = {
  getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
  verify: 'http://localhost:3001/api/captcha/verify',
}
</script>
```

### Using Composables

```vue
<template>
  <div ref="containerRef" class="captcha-container" />
  <div v-if="status === 'success'">{{ statusText }}</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSliderCaptcha } from 'captcha-pro-vue3/composables'

const containerRef = ref()

const { status, statusText, init, destroy } = useSliderCaptcha({
  width: 300,
  height: 170,
  onSuccess: () => console.log('Passed!'),
}, containerRef)

onMounted(() => init())
onUnmounted(() => destroy())
</script>
```

## Backend Server

To test backend verification, start the demo server:

```bash
# From project root
cd server/node
pnpm install
pnpm dev
```

Server runs at `http://localhost:3001`

## Build

```bash
pnpm build
```

## License

MIT