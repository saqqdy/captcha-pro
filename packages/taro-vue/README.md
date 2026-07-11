# @captcha-pro/taro-vue

Taro + Vue 3 captcha components for Captcha Pro (backend-only mode).

**[简体中文](./README_CN.md)**

## Installation

```bash
pnpm add @captcha-pro/taro-vue
```

## Important: Backend-Only Mode

This package only supports backend verification mode. All captcha images are provided by backend API, `backend` configuration is required.

## Usage

### Global Registration

```typescript
import { createApp } from 'vue'
import CaptchaPro from '@captcha-pro/taro-vue'

const app = createApp(App)
app.use(CaptchaPro)
```

### Component Usage

```vue
<template>
  <!-- Slider Captcha -->
  <SliderCaptcha
    :backend="backendConfig"
    :width="300"
    :height="170"
    @success="onSuccess"
    @fail="onFail"
  />

  <!-- Click Captcha -->
  <ClickCaptcha
    :backend="backendConfig"
    :width="300"
    :height="170"
    @success="onSuccess"
  />

  <!-- Popup Captcha -->
  <PopupCaptcha
    ref="popupRef"
    type="slider"
    :backend="backendConfig"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SliderCaptcha, ClickCaptcha, PopupCaptcha } from '@captcha-pro/taro-vue'

const backendConfig = {
  getCaptcha: 'https://your-api.com/captcha/get',
  verify: 'https://your-api.com/captcha/verify',
  timeout: 10000,
}

const popupRef = ref()
const onSuccess = () => console.log('Verification passed!')

// Show popup
popupRef.value?.show()
</script>
```

### Using Composables

```vue
<template>
  <view ref="containerRef" class="captcha-container" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSliderCaptcha } from '@captcha-pro/taro-vue/composables'

const containerRef = ref()
const backendConfig = {
  getCaptcha: 'https://your-api.com/captcha/get',
  verify: 'https://your-api.com/captcha/verify',
}

const {
  status,
  init,
  refresh,
  destroy
} = useSliderCaptcha({
  backend: backendConfig,
  width: 300,
  height: 170,
  onSuccess: () => console.log('Passed!')
}, containerRef)

onMounted(() => init())
onUnmounted(() => destroy())
</script>
```

## Backend Configuration (Required)

```typescript
interface BackendConfig {
  getCaptcha: string | (params: any) => Promise<any>  // Required
  verify: string | (data: any) => Promise<any>        // Required
  headers?: Record<string, string>                     // Optional
  timeout?: number                                     // Optional, default: 10000
}
```

Example with custom functions:

```typescript
const backendConfig = {
  async getCaptcha(params) {
    return Taro.request({
      url: '/api/captcha/get',
      data: params,
    })
  },
  async verify(data) {
    return Taro.request({
      url: '/api/captcha/verify',
      data,
    })
  },
}
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  BackendConfig,
  SliderCaptchaProps,
  ClickCaptchaProps,
  PopupCaptchaProps,
  SliderCaptchaRef,
  ClickCaptchaRef,
  PopupCaptchaRef,
} from '@captcha-pro/taro-vue'
```

## Components

### SliderCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| backend | BackendConfig | - | **Required**, backend API config |
| width | number | 300 | Container width |
| height | number | 170 | Container height |
| showRefresh | boolean | true | Show refresh button |

### ClickCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| backend | BackendConfig | - | **Required**, backend API config |
| width | number | 300 | Container width |
| height | number | 170 | Container height |
| showRefresh | boolean | true | Show refresh button |

### PopupCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'slider' \| 'click' | 'slider' | Captcha type |
| backend | BackendConfig | - | **Required**, backend API config |
| title | string | '请完成安全验证' | Popup title |
| maskClosable | boolean | true | Close on mask click |
| showClose | boolean | true | Show close button |
| autoClose | boolean | true | Auto close on success |

## Exposed Methods

```vue
<script setup>
const captchaRef = ref()

// SliderCaptcha / ClickCaptcha methods
captchaRef.value?.refresh()

// PopupCaptcha methods
captchaRef.value?.show()
captchaRef.value?.hide()
captchaRef.value?.isVisible()
</script>
```

## Events

| Event | Description | Payload |
|-------|-------------|---------|
| success | Verification passed | `{ verifiedAt }` |
| fail | Verification failed | - |
| refresh | Refresh clicked | - |
| error | Loading error | `Error` |

## License

MIT