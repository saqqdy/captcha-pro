# captcha-pro-react

React component library for Captcha Pro with Hooks support.

**[简体中文](./README_CN.md)**

## Installation

```bash
pnpm add captcha-pro-react
```

## Usage

### Component Usage

```tsx
import { SliderCaptcha, ClickCaptcha, PopupCaptcha } from 'captcha-pro-react'

function App() {
  const handleSuccess = () => {
    console.log('Verification passed!')
  }

  return (
    <div>
      {/* Slider Captcha */}
      <SliderCaptcha
        width={300}
        height={170}
        precision={5}
        onSuccess={handleSuccess}
        onFail={() => console.log('Failed')}
      />

      {/* Click Captcha */}
      <ClickCaptcha
        width={300}
        height={170}
        count={3}
        onSuccess={handleSuccess}
      />

      {/* Popup Captcha */}
      <PopupCaptcha
        trigger="#submit-btn"
        type="slider"
        onSuccess={handleSuccess}
      >
        <button id="submit-btn">Submit</button>
      </PopupCaptcha>
    </div>
  )
}
```

### Using Hooks

```tsx
import { useSliderCaptcha, useClickCaptcha } from 'captcha-pro-react/hooks'

function CustomCaptcha() {
  const {
    containerRef,
    status,
    statusText,
    refresh,
    getData,
    getStatistics
  } = useSliderCaptcha({
    width: 300,
    height: 170,
    onSuccess: () => console.log('Passed!')
  })

  return (
    <div>
      <div ref={containerRef} className="captcha-container" />
      {status && <div className={`status ${status}`}>{statusText}</div>}
      <button onClick={refresh}>Refresh</button>
    </div>
  )
}
```

### Using Refs

```tsx
import { useRef } from 'react'
import { SliderCaptcha, type SliderCaptchaRef } from 'captcha-pro-react'

function App() {
  const captchaRef = useRef<SliderCaptchaRef>(null)

  const handleClick = () => {
    captchaRef.current?.refresh()
    const data = captchaRef.current?.getData()
    const stats = captchaRef.current?.getStatistics()
  }

  return (
    <div>
      <SliderCaptcha ref={captchaRef} />
      <button onClick={handleClick}>Refresh</button>
    </div>
  )
}
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type {
  SliderCaptchaProps,
  ClickCaptchaProps,
  PopupCaptchaProps,
  SliderCaptchaRef,
  ClickCaptchaRef,
  PopupCaptchaRef,
  UseSliderCaptchaOptions,
  UseClickCaptchaOptions,
  UseSliderCaptchaReturn,
  UseClickCaptchaReturn
} from 'captcha-pro-react'
```

## Props

### SliderCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | number | 300 | Container width |
| height | number | 170 | Container height |
| bgImage | string | - | Background image URL |
| sliderImage | string | - | Slider image URL |
| precision | number | 5 | Verification precision (px) |
| showRefresh | boolean | true | Show refresh button |
| verifyMode | 'frontend' \| 'backend' | 'frontend' | Verification mode |
| locale | 'zh-CN' \| 'en-US' | 'zh-CN' | Language |
| onSuccess | () => void | - | Success callback |
| onFail | () => void | - | Fail callback |
| onRefresh | () => void | - | Refresh callback |
| onReady | (instance) => void | - | Ready callback |
| className | string | - | Custom class name |

### ClickCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | number | 300 | Container width |
| height | number | 170 | Container height |
| count | number | 3 | Click points count |
| showRefresh | boolean | true | Show refresh button |

### PopupCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'slider' \| 'click' | 'slider' | Captcha type |
| trigger | string | - | Trigger element selector |
| autoClose | boolean | true | Auto close on success |
| closeDelay | number | 500 | Close delay (ms) |
| captchaOptions | object | - | Inner captcha options |

## Ref Methods

| Method | Description |
|--------|-------------|
| refresh() | Refresh captcha |
| getData() | Get captcha data |
| getStatistics() | Get verification statistics |
| getInstance() | Get core instance |

## License

MIT
