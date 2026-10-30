# React Platform Integration Guide

This guide details how to use captcha-pro in a React project.

## 📋 Table of Contents

- [Install](#install)
- [Basic Usage](#basic-usage)
- [Component Props](#component-props)
- [Event Handling](#event-handling)
- [Hooks](#hooks)
- [TypeScript Support](#typescript-support)

---

## Install

```bash
pnpm add @captcha-pro/react
```

---

## Basic Usage

### Slider Captcha

```tsx
import { SliderCaptcha } from '@captcha-pro/react'

function App() {
  const handleSuccess = () => {
    console.log('Passed!')
    // submit the form or other actions
  }

  const handleFail = () => {
    console.log('Failed!')
  }

  return (
    <SliderCaptcha
      width={300}
      height={170}
      precision={5}
      showRefresh={true}
      onSuccess={handleSuccess}
      onFail={handleFail}
    />
  )
}

export default App
```

### Click Captcha

```tsx
import { ClickCaptcha } from '@captcha-pro/react'

function App() {
  return (
    <ClickCaptcha
      width={300}
      height={170}
      count={3}
      onSuccess={() => console.log('Passed!')}
    />
  )
}
```

### Popup Captcha

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
          maskClosable: true,
          escClosable: true,
          showClose: true
        }}
        captchaOptions={{
          width: 300,
          height: 170
        }}
        autoClose={true}
        closeDelay={500}
        onSuccess={() => console.log('Passed!')}
      />
    </>
  )
}
```

---

## Component Props

### SliderCaptcha Props

```tsx
interface SliderCaptchaProps {
  // Container
  el?: string | HTMLElement

  // Dimensions
  width?: number
  height?: number
  sliderWidth?: number
  sliderHeight?: number

  // Images
  bgImage?: string
  sliderImage?: string

  // Verification
  precision?: number
  verifyMode?: 'frontend' | 'backend'
  backendVerify?: BackendVerifyOptions

  // Security
  security?: SecurityOptions

  // Styling
  showRefresh?: boolean
  className?: string

  // Internationalization
  locale?: 'zh-CN' | 'en-US'

  // Callbacks
  onSuccess?: () => void
  onFail?: () => void
  onRefresh?: () => void
}
```

---

## Event Handling

```tsx
import { SliderCaptcha } from '@captcha-pro/react'

function App() {
  const handleSuccess = () => {
    console.log('Passed')
    // submit the form
  }

  const handleFail = () => {
    console.log('Failed')
    // prompt the user to retry
  }

  const handleRefresh = () => {
    console.log('User clicked refresh')
    // optional: record user behavior
  }

  return (
    <SliderCaptcha
      onSuccess={handleSuccess}
      onFail={handleFail}
      onRefresh={handleRefresh}
    />
  )
}
```

---

## Hooks

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

  const resetCaptcha = () => {
    captchaRef.current?.reset()
  }

  const refreshCaptcha = () => {
    captchaRef.current?.refresh()
  }

  return (
    <>
      <SliderCaptcha
        ref={captchaRef}
        onSuccess={handleSuccess}
      />
      <button onClick={resetCaptcha}>Reset</button>
      <button onClick={refreshCaptcha}>Refresh</button>
    </>
  )
}
```

---

## TypeScript Support

```tsx
import {
  SliderCaptcha,
  SliderCaptchaRef,
  StatisticsData,
  BackendVerifyOptions,
  SecurityOptions
} from '@captcha-pro/react'

function CaptchaComponent() {
  const captchaRef = useRef<SliderCaptchaRef>(null)

  const handleSuccess = () => {
    const data = captchaRef.current?.getData()
    const stats: StatisticsData | undefined = captchaRef.current?.getStatistics()
  }

  return (
    <SliderCaptcha
      ref={captchaRef}
      width={300}
      height={170}
      onSuccess={handleSuccess}
    />
  )
}
```

---

## 🔗 Related Links

- [React Quick Start](../quick-start/react)
- [Frontend Integration](../guides/frontend-integration)
- [API Reference](../api/)
- [Options](../api/options)
- [React Examples](https://github.com/saqqdy/captcha-pro/blob/master/examples/react/README.md)
