# React Quick Start

This guide helps you integrate captcha-pro into a React project in 5 minutes.

## 📋 Prerequisites

- Node.js 18+
- React 16.8+ (Hooks support)
- Package manager: pnpm / npm / yarn

---

## 🚀 Quick Integration

### 1. Install

```bash
pnpm add @captcha-pro/react
```

### 2. Basic Usage

```tsx
import { SliderCaptcha } from '@captcha-pro/react'

function App() {
  const handleSuccess = () => {
    console.log('Verification passed!')
    // submit the form or continue
  }

  const handleFail = () => {
    console.log('Verification failed!')
  }

  return (
    <SliderCaptcha
      width={300}
      height={170}
      precision={5}
      onSuccess={handleSuccess}
      onFail={handleFail}
    />
  )
}

export default App
```

### 3. Click Captcha

```tsx
import { ClickCaptcha } from '@captcha-pro/react'

function App() {
  return (
    <ClickCaptcha
      count={3}
      onSuccess={() => console.log('Verification passed!')}
    />
  )
}
```

### 4. Popup Captcha

```tsx
import { PopupCaptcha } from '@captcha-pro/react'

function App() {
  return (
    <>
      <button id="submit-btn">Submit</button>
      <PopupCaptcha
        trigger="#submit-btn"
        type="slider"
        modal={{
          title: 'Security Verification',
          maskClosable: true
        }}
        onSuccess={() => console.log('Verification passed!')}
      />
    </>
  )
}
```

---

## 🎨 Custom Configuration

### Custom Images

```tsx
<SliderCaptcha
  bgImage="/path/to/background.jpg"
  sliderImage="/path/to/slider.png"
  width={300}
  height={200}
  onSuccess={handleSuccess}
/>
```

### Custom Precision

```tsx
<SliderCaptcha
  precision={5}
  onSuccess={handleSuccess}
/>
```

### Internationalization

```tsx
import { SliderCaptcha, setLocale } from '@captcha-pro/react'

// global setting
setLocale('en-US')

function App() {
  return (
    <SliderCaptcha
      locale="zh-CN"
      onSuccess={handleSuccess}
    />
  )
}
```

---

## 🔐 Backend Verification

```tsx
import { SliderCaptcha } from '@captcha-pro/react'

function App() {
  return (
    <SliderCaptcha
      verifyMode="backend"
      backendVerify={{
        getCaptcha: '/api/captcha?type=slider',
        verify: '/api/captcha/verify'
      }}
      onSuccess={() => console.log('Backend verification passed!')}
    />
  )
}
```

---

## 📦 Instance Methods

### Get Verification Data

```tsx
import { useRef } from 'react'
import { SliderCaptcha, SliderCaptchaRef } from '@captcha-pro/react'

function App() {
  const captchaRef = useRef<SliderCaptchaRef>(null)

  const handleSuccess = () => {
    // get verification data
    const data = captchaRef.current?.getData()
    console.log('Target position:', data?.target)

    // get statistics
    const stats = captchaRef.current?.getStatistics()
    console.log('Success rate:', stats?.successRate)
  }

  return (
    <SliderCaptcha
      ref={captchaRef}
      onSuccess={handleSuccess}
    />
  )
}
```

### Reset Captcha

```tsx
import { useRef } from 'react'
import { SliderCaptcha, SliderCaptchaRef } from '@captcha-pro/react'

function App() {
  const captchaRef = useRef<SliderCaptchaRef>(null)

  const resetCaptcha = () => {
    captchaRef.current?.reset()
  }

  return (
    <>
      <SliderCaptcha ref={captchaRef} />
      <button onClick={resetCaptcha}>Reset</button>
    </>
  )
}
```

---

## 🔗 Related Links

- [Frontend Integration Guide](../guides/frontend-integration.md)
- [API Reference](../api/README.md)
- [Configuration Options](../api/options.md)
- [React Example Code](https://github.com/saqqdy/captcha-pro/blob/master/examples/react/README.md)
