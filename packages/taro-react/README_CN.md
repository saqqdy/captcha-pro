# @captcha-pro/taro-react

Captcha Pro 的 Taro + React 验证码组件（仅后端模式）。

## 安装

```bash
pnpm add @captcha-pro/taro-react
```

## 重要：仅后端模式

本包仅支持后端验证模式。所有验证码图片由后端 API 提供，必须配置 `backend`。

## 使用

### 滑动拼图验证码

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

### 点选文字验证码

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

### 弹窗验证码

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

### 使用 Hooks

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

## 后端配置（必填）

```typescript
interface BackendConfig {
  getCaptcha: string | (params: any) => Promise<any>  // Required
  verify: string | (data: any) => Promise<any>        // Required
  headers?: Record<string, string>                     // Optional
  timeout?: number                                     // Optional, default: 10000
}
```

使用自定义函数的示例：

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

## TypeScript 支持

完整的 TypeScript 支持，导出类型定义：

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

## 组件

### SliderCaptcha

| Prop | Type | Default | 描述 |
|------|------|---------|-------------|
| backend | BackendConfig | - | **必填**，后端 API 配置 |
| width | number | 300 | 容器宽度 |
| height | number | 170 | 容器高度 |
| sliderWidth | number | 42 | 滑块拼图宽度 |
| sliderHeight | number | 42 | 滑块拼图高度 |
| showRefresh | boolean | true | 显示刷新按钮 |
| locale | 'zh-CN' \| 'en-US' | 'zh-CN' | 语言 |
| onSuccess | () => void | - | 成功回调 |
| onFail | () => void | - | 失败回调 |
| onRefresh | () => void | - | 刷新回调 |
| onError | (error: Error) => void | - | 错误回调 |

### ClickCaptcha

| Prop | Type | Default | 描述 |
|------|------|---------|-------------|
| backend | BackendConfig | - | **必填**，后端 API 配置 |
| width | number | 300 | 容器宽度 |
| height | number | 170 | 容器高度 |
| showRefresh | boolean | true | 显示刷新按钮 |
| locale | 'zh-CN' \| 'en-US' | 'zh-CN' | 语言 |
| onSuccess | () => void | - | 成功回调 |
| onFail | () => void | - | 失败回调 |
| onError | (error: Error) => void | - | 错误回调 |

### PopupCaptcha

| Prop | Type | Default | 描述 |
|------|------|---------|-------------|
| type | 'slider' \| 'click' | 'slider' | 验证码类型 |
| backend | BackendConfig | - | **必填**，后端 API 配置 |
| title | string | '请完成安全验证' | 弹窗标题 |
| maskClosable | boolean | true | 点击遮罩层关闭 |
| showClose | boolean | true | 显示关闭按钮 |
| autoClose | boolean | true | 验证成功后自动关闭 |
| closeDelay | number | 500 | 关闭延迟（毫秒） |
| onSuccess | () => void | - | 成功回调 |
| onOpen | () => void | - | 打开回调 |
| onClose | () => void | - | 关闭回调 |

## Ref 方法

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

| Event | 描述 | 参数 |
|-------|-------------|---------|
| onSuccess | 验证通过 | `{ verifiedAt }` |
| onFail | 验证失败 | - |
| onRefresh | 点击刷新 | - |
| onError | 加载错误 | `Error` |
| onOpen | 弹窗打开 | - |
| onClose | 弹窗关闭 | - |

## 许可证

MIT
