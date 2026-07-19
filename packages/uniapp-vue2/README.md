# @captcha-pro/uniapp-vue2

uni-app + Vue 2 captcha components for Captcha Pro (backend-only mode).

**[简体中文](./README_CN.md)**

## Installation

```bash
pnpm add @captcha-pro/uniapp-vue2
```

## Important: Backend-Only Mode

This package only supports backend verification mode. All captcha images are provided by backend API, `backend` configuration is required.

## Usage

### Global Registration

```javascript
import Vue from 'vue'
import CaptchaPro from '@captcha-pro/uniapp-vue2'

Vue.use(CaptchaPro)
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

<script>
export default {
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
      console.log('Verification passed!')
    },
    showPopup() {
      this.$refs.popupRef.show()
    },
  },
}
</script>
```

### Using Mixins

```vue
<template>
  <view ref="containerRef" class="captcha-container" />
  <view v-if="loading">Loading...</view>
  <view v-if="status === 'success'" class="success">{{ statusText }}</view>
</template>

<script>
import { sliderCaptchaMixin } from '@captcha-pro/uniapp-vue2/mixins'

export default {
  mixins: [sliderCaptchaMixin],
  data() {
    return {
      backendConfig: {
        getCaptcha: '/api/captcha/get',
        verify: '/api/captcha/verify',
      },
    }
  },
  // Mixin provides: status, statusText, loading, error, refresh, etc.
}
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

```javascript
backendConfig: {
  async getCaptcha(params) {
    const res = await uni.request({
      url: '/api/captcha/get',
      data: params,
    })
    return res.data
  },
  async verify(data) {
    const res = await uni.request({
      url: '/api/captcha/verify',
      data,
      method: 'POST',
    })
    return res.data
  },
}
```

## Components

### SliderCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| backend | Object | - | **Required**, backend API config |
| width | Number | 300 | Container width |
| height | Number | 170 | Container height |
| sliderWidth | Number | 42 | Slider piece width |
| sliderHeight | Number | 42 | Slider piece height |
| showRefresh | Boolean | true | Show refresh button |
| locale | String | 'zh-CN' | Language |

### ClickCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| backend | Object | - | **Required**, backend API config |
| width | Number | 300 | Container width |
| height | Number | 170 | Container height |
| showRefresh | Boolean | true | Show refresh button |

### PopupCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | String | 'slider' | 'slider' or 'click' |
| backend | Object | - | **Required**, backend API config |
| title | String | '请完成安全验证' | Popup title |
| maskClosable | Boolean | true | Close on mask click |
| showClose | Boolean | true | Show close button |
| autoClose | Boolean | true | Auto close on success |
| closeDelay | Number | 500 | Close delay (ms) |

## Ref Methods

```javascript
// Access via ref
this.$refs.captcha.refresh()
this.$refs.captcha.getData()

// PopupCaptcha methods
this.$refs.popupRef.show()
this.$refs.popupRef.hide()
this.$refs.popupRef.isVisible()
```

## Events

| Event | Description | Payload |
|-------|-------------|---------|
| success | Verification passed | `{ verifiedAt }` |
| fail | Verification failed | - |
| refresh | Refresh clicked | - |
| error | Loading error | `Error` |
| open | Popup opened | - |
| close | Popup closed | - |

## License

MIT