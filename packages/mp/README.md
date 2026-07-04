# captcha-pro-mp

Mini-program package for Captcha Pro. Supports WeChat Mini-Program, uni-app, and Taro 3.

> ⚠️ **All platforms operate in backend-only mode.** No client-side Canvas rendering — all images come from backend API. Verification is done by backend. `backend` config is **required** for every component.

**[简体中文](./README_CN.md)**

## Installation

```bash
pnpm add captcha-pro-mp
```

## Backend API Contract

All three platforms share the same backend API types. Your server must implement:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/captcha` | GET | Generate captcha (`type=slider|click`, `width`, `height`, etc.) |
| `/api/captcha/verify` | POST | Verify (`{ captchaId, type, target, ... }`) |

See [Backend API docs](../../servers/node/README.md) for full response schema.

---

## WeChat Mini-Program

> ⚠️ 仅支持后端服务模式，`backend` 为必填属性。

### Usage

1. Copy files from `captcha-pro-mp/weixin/components/` to your project's `components/` directory.

2. Register in page JSON:

```json
{
  "usingComponents": {
    "slider-captcha": "/components/slider-captcha/slider-captcha",
    "click-captcha": "/components/click-captcha/click-captcha",
    "popup-captcha": "/components/popup-captcha/popup-captcha"
  }
}
```

3. Use in WXML:

```xml
<!-- Slider Captcha — backend required -->
<slider-captcha
  width="{{300}}"
  height="{{170}}"
  backend="{{backendConfig}}"
  bind:success="onSuccess"
  bind:fail="onFail"
  bind:refresh="onRefresh"
  bind:error="onError"
/>

<!-- Click Captcha — backend required -->
<click-captcha
  width="{{300}}"
  height="{{170}}"
  backend="{{backendConfig}}"
  bind:success="onSuccess"
  bind:fail="onFail"
/>

<!-- Popup Captcha — backend required -->
<popup-captcha
  type="slider"
  title="安全验证"
  backend="{{backendConfig}}"
  bind:success="onSuccess"
  bind:fail="onFail"
  bind:open="onOpen"
  bind:close="onClose"
/>
```

4. Define backend config in page JS:

```javascript
Page({
  data: {
    backendConfig: {
      getCaptcha: 'https://your-server.com/api/captcha',
      verify: 'https://your-server.com/api/captcha/verify',
    }
  },
  onSuccess(e) {
    wx.showToast({ title: 'Verification passed!' })
  },
  onFail() {
    wx.showToast({ title: 'Verification failed', icon: 'none' })
  },
  onRefresh() {
    console.log('Captcha refreshed')
  },
  onError(e) {
    console.error('Request error:', e.detail)
  },
  onOpen() {
    console.log('Popup opened')
  },
  onClose() {
    console.log('Popup closed')
  }
})
```

### Component Properties

#### SliderCaptcha / ClickCaptcha

| Property | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| width | Number | 300 | - | Container width (px) |
| height | Number | 170 | - | Container height (px) |
| backend | Object | - | ✅ | Backend API config |
| showRefresh | Boolean | true | - | Show refresh button |
| sliderWidth | Number | 42 | - | Slider block width (slider only) |
| sliderHeight | Number | 42 | - | Slider block height (slider only) |

#### PopupCaptcha

| Property | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| type | String | 'slider' | - | Captcha type: `slider` or `click` |
| title | String | '请完成安全验证' | - | Popup title |
| backend | Object | - | ✅ | Backend API config |
| maskClosable | Boolean | true | - | Close on mask tap |
| showClose | Boolean | true | - | Show close button |
| autoClose | Boolean | true | - | Auto close on success |
| closeDelay | Number | 500 | - | Auto close delay (ms) |
| sliderOptions | Object | {} | - | Extra SliderCaptcha props |
| clickOptions | Object | {} | - | Extra ClickCaptcha props |

### Events

| Event | Description |
|-------|-------------|
| success | Verification passed (`e.detail = { verifiedAt }`) |
| fail | Verification failed |
| refresh | Captcha refreshed |
| error | Network/request error (`e.detail = Error`) |
| open | Popup opened (popup-captcha only) |
| close | Popup closed (popup-captcha only) |

### Methods (PopupCaptcha)

Access via `this.selectComponent('#popup')`:

| Method | Description |
|--------|-------------|
| show() | Show popup |
| hide() | Hide popup |
| isVisible() | Get visibility state |

### TypeScript

```typescript
import type {
  BackendConfig as WxBackendConfig,
  SliderCaptchaProps as WxSliderCaptchaProps,
  ClickCaptchaProps as WxClickCaptchaProps,
  PopupCaptchaProps as WxPopupCaptchaProps,
  PopupCaptchaRef as WxPopupCaptchaRef,
} from 'captcha-pro-mp/weixin'
```

---

## uni-app

> ⚠️ 仅支持后端服务模式，`backend` 为必填 prop。

### Usage

```vue
<template>
  <view>
    <!-- Slider Captcha -->
    <slider-captcha
      :width="300"
      :height="170"
      :backend="backendConfig"
      @success="onSuccess"
      @fail="onFail"
    />

    <!-- Click Captcha -->
    <click-captcha
      :width="300"
      :height="170"
      :backend="backendConfig"
      @success="onSuccess"
    />

    <!-- Popup Captcha -->
    <popup-captcha
      ref="popup"
      type="slider"
      :backend="backendConfig"
      @success="onSuccess"
      @close="onClose"
    />
  </view>
</template>

<script>
import { SliderCaptcha, ClickCaptcha, PopupCaptcha } from 'captcha-pro-mp/uniapp'

export default {
  components: { SliderCaptcha, ClickCaptcha, PopupCaptcha },
  data() {
    return {
      backendConfig: {
        getCaptcha: 'https://your-server.com/api/captcha',
        verify: 'https://your-server.com/api/captcha/verify',
      }
    }
  },
  methods: {
    onSuccess(data) {
      uni.showToast({ title: 'Verification passed!' })
    },
    onFail() {
      uni.showToast({ title: 'Verification failed', icon: 'none' })
    },
    onClose() {
      console.log('Popup closed')
    },
    showPopup() {
      this.$refs.popup.show()
    }
  }
}
</script>
```

### Props

#### SliderCaptcha / ClickCaptcha

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| width | Number | 300 | - | Container width (px) |
| height | Number | 170 | - | Container height (px) |
| backend | Object | - | ✅ | Backend API config |
| showRefresh | Boolean | true | - | Show refresh button |

#### PopupCaptcha

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| type | String | 'slider' | - | `slider` or `click` |
| title | String | '请完成安全验证' | - | Popup title |
| backend | Object | - | ✅ | Backend API config |
| maskClosable | Boolean | true | - | Close on mask tap |
| showClose | Boolean | true | - | Show close button |
| autoClose | Boolean | true | - | Auto close on success |
| closeDelay | Number | 500 | - | Auto close delay (ms) |
| sliderOptions | Object | {} | - | Extra SliderCaptcha props |
| clickOptions | Object | {} | - | Extra ClickCaptcha props |

### TypeScript

```typescript
import type {
  BackendConfig as UniBackendConfig,
  SliderCaptchaProps as UniSliderCaptchaProps,
  ClickCaptchaProps as UniClickCaptchaProps,
  PopupCaptchaProps as UniPopupCaptchaProps,
} from 'captcha-pro-mp/uniapp'
```

---

## Taro 3

> ⚠️ Taro 小程序端**仅支持后端服务模式**，`backend` 为必填 prop，不传则 TypeScript 编译报错。

### Usage

```tsx
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { SliderCaptcha, ClickCaptcha, PopupCaptcha } from 'captcha-pro-mp/taro'
import type { PopupCaptchaRef } from 'captcha-pro-mp/taro'
import { useRef } from 'react'

const BACKEND = {
  getCaptcha: 'https://your-server.com/api/captcha',
  verify: 'https://your-server.com/api/captcha/verify',
}

function Index() {
  const popupRef = useRef<PopupCaptchaRef>(null)
  const handleSuccess = () => {
    Taro.showToast({ title: 'Verification passed!' })
  }

  return (
    <View>
      {/* Slider Captcha */}
      <SliderCaptcha backend={BACKEND} onSuccess={handleSuccess} />

      {/* Click Captcha */}
      <ClickCaptcha backend={BACKEND} onSuccess={handleSuccess} />

      {/* Popup Captcha */}
      <PopupCaptcha
        ref={popupRef}
        type="slider"
        backend={BACKEND}
        onSuccess={handleSuccess}
      />
      <View onClick={() => popupRef.current?.show()}>Show Popup</View>
    </View>
  )
}
```

### TypeScript

```typescript
import type {
  BackendConfig as TaroBackendConfig,
  SliderCaptchaProps as TaroSliderCaptchaProps,
  ClickCaptchaProps as TaroClickCaptchaProps,
  PopupCaptchaProps as TaroPopupCaptchaProps,
  PopupCaptchaRef as TaroPopupCaptchaRef,
} from 'captcha-pro-mp/taro'
```

### Props

#### BackendConfig（Required）

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| getCaptcha | `string \| (params?) => Promise<Response>` | ✅ | Captcha URL or custom function |
| verify | `string \| (data) => Promise<Response>` | ✅ | Verify URL or custom function |
| headers | `Record<string, string>` | - | Request headers |
| timeout | `number` | - | Timeout (ms), default 10000 |

#### SliderCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | number | 650 | Container width (rpx) |
| height | number | 380 | Container height (rpx) |
| sliderWidth | number | 80 | Slider block width (rpx) |
| sliderHeight | number | 80 | Slider block height (rpx) |
| showRefresh | boolean | true | Show refresh button |
| backend | BackendConfig | - | **Required** |
| onSuccess | (data?) => void | - | Success callback |
| onFail | () => void | - | Fail callback |
| onRefresh | () => void | - | Refresh callback |
| onError | (err: Error) => void | - | Error callback |

#### ClickCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | number | 650 | Container width (rpx) |
| height | number | 380 | Container height (rpx) |
| showRefresh | boolean | true | Show refresh button |
| backend | BackendConfig | - | **Required** |
| onSuccess | (data?) => void | - | Success callback |
| onFail | () => void | - | Fail callback |
| onRefresh | () => void | - | Refresh callback |
| onError | (err: Error) => void | - | Error callback |

#### PopupCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'slider' \| 'click' | 'slider' | Captcha type |
| title | string | '安全验证' | Popup title |
| backend | BackendConfig | - | **Required** |
| maskClosable | boolean | true | Close on mask click |
| showClose | boolean | true | Show close button |
| autoClose | boolean | true | Auto close on success |
| closeDelay | number | 500 | Auto close delay (ms) |
| sliderOptions | Omit\<SliderCaptchaProps, 'backend'\> | {} | Extra slider props |
| clickOptions | Omit\<ClickCaptchaProps, 'backend'\> | {} | Extra click props |
| onSuccess | (data?) => void | - | Success callback |
| onFail | () => void | - | Fail callback |
| onOpen | () => void | - | Open callback |
| onClose | () => void | - | Close callback |

---

## License

MIT
