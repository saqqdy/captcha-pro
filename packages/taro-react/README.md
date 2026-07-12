# @captcha-pro/taro-react

Taro + React captcha components for Captcha Pro (backend-only mode).

**[简体中文](./README_CN.md)**

## Installation

```bash
pnpm add @captcha-pro/taro-react
```

## Important: Backend-Only Mode

This package only supports backend verification mode. All captcha images are provided by backend API, `backend` configuration is required.

## Usage

### Slider Captcha

```tsx
import { SliderCaptcha } from '@captcha-pro/taro-react'

function CaptchaPage() {
  const backendConfig = {
    getCaptcha: 'https://your-api.com/captcha/get',
    verify: 'https://your-api.com/captcha/verify',
    timeout: 10000,
  }

  const handleSuccess = () => {
    console.log('Verification passed!')
  }

  return (
    <SliderCaptcha
      backend={backendConfig}
      width={300}
      height={170}
      onSuccess={handleSuccess}
      onFail={() => console.log('Failed')}
    />
  )
}
```

### Click Captcha

```tsx
import { ClickCaptcha } from '@captcha-pro/taro-react'

function CaptchaPage() {
  return (
    <ClickCaptcha
      backend={backendConfig}
      width={300}
      height={170}
      onSuccess={() => console.log('Passed!')}
    />
  )
}
```

### Popup Captcha

```tsx
import { useRef } from 'react'
import { PopupCaptcha, type PopupCaptchaRef } from '@captcha-pro/taro-react'

function CaptchaPage() {
  const popupRef = useRef<PopupCaptchaRef>(null)

  const showPopup = () => {
    popupRef.current?.show()
  }

  return (
    <View>
      <Button onClick={showPopup}>Verify</Button>
      <PopupCaptcha
        ref={popupRef}
        type="slider"
        backend={backendConfig}
        title="请完成安全验证"
        onSuccess={() => console.log('Passed!')}
      />
    </View>
  )
}
```

### Using Hooks

```tsx
import { useSliderCaptcha } from '@captcha-pro/taro-react/hooks'

function CustomCaptcha() {
  const backendConfig = {
    getCaptcha: 'https://your-api.com/captcha/get',
    verify: 'https://your-api.com/captcha/verify',
  }

  const {
    containerRef,
    status,
    statusText,
    refresh,
    loading,
    error,
  } = useSliderCaptcha({
    backend: backendConfig,
    width: 300,
    height: 170,
    onSuccess: () => console.log('Passed!'),
  })

  return (
    <View>
      <View ref={containerRef} className="captcha-container" />
      {loading && <Text>Loading...</Text>}
      {error && <Text className="error">{error.message}</Text>}
      {status === 'success' && <Text className="success">{statusText}</Text>}
      <Button onClick={refresh}>Refresh</Button>
    </View>
  )
}
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
import Taro from '@tarojs/taro'

const backendConfig = {
  async getCaptcha(params) {
    const res = await Taro.request({
      url: '/api/captcha/get',
      data: params,
      method: 'GET',
    })
    return res.data
  },
  async verify(data) {
    const res = await Taro.request({
      url: '/api/captcha/verify',
      data,
      method: 'POST',
    })
    return res.data
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
  UseSliderCaptchaOptions,
  UseClickCaptchaOptions,
  UseSliderCaptchaReturn,
  UseClickCaptchaReturn,
} from '@captcha-pro/taro-react'
```

## Components

### SliderCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| backend | BackendConfig | - | **Required**, backend API config |
| width | number | 300 | Container width |
| height | number | 170 | Container height |
| sliderWidth | number | 42 | Slider piece width |
| sliderHeight | number | 42 | Slider piece height |
| showRefresh | boolean | true | Show refresh button |
| locale | 'zh-CN' \| 'en-US' | 'zh-CN' | Language |
| onSuccess | () => void | - | Success callback |
| onFail | () => void | - | Fail callback |
| onRefresh | () => void | - | Refresh callback |
| onError | (error: Error) => void | - | Error callback |

### ClickCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| backend | BackendConfig | - | **Required**, backend API config |
| width | number | 300 | Container width |
| height | number | 170 | Container height |
| showRefresh | boolean | true | Show refresh button |
| locale | 'zh-CN' \| 'en-US' | 'zh-CN' | Language |
| onSuccess | () => void | - | Success callback |
| onFail | () => void | - | Fail callback |
| onError | (error: Error) => void | - | Error callback |

### PopupCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'slider' \| 'click' | 'slider' | Captcha type |
| backend | BackendConfig | - | **Required**, backend API config |
| title | string | '请完成安全验证' | Popup title |
| maskClosable | boolean | true | Close on mask click |
| showClose | boolean | true | Show close button |
| autoClose | boolean | true | Auto close on success |
| closeDelay | number | 500 | Close delay (ms) |
| onSuccess | () => void | - | Success callback |
| onOpen | () => void | - | Open callback |
| onClose | () => void | - | Close callback |

## Ref Methods

```tsx
const captchaRef = useRef<SliderCaptchaRef>(null)
const popupRef = useRef<PopupCaptchaRef>(null)

// SliderCaptcha / ClickCaptcha methods
captchaRef.current?.refresh()
captchaRef.current?.getData()

// PopupCaptcha methods
popupRef.current?.show()
popupRef.current?.hide()
popupRef.current?.isVisible()
```

## Events

| Event | Description | Payload |
|-------|-------------|---------|
| onSuccess | Verification passed | `{ verifiedAt }` |
| onFail | Verification failed | - |
| onRefresh | Refresh clicked | - |
| onError | Loading error | `Error` |
| onOpen | Popup opened | - |
| onClose | Popup closed | - |

## License

MIT