# React 平台集成指南

本指南详细说明如何在 React 项目中使用 captcha-pro。

## 📋 目录

- [安装](#安装)
- [基础使用](#基础使用)
- [组件 Props](#组件-props)
- [事件处理](#事件处理)
- [Hooks](#hooks)
- [TypeScript 支持](#typescript-支持)

---

## 安装

```bash
pnpm add @captcha-pro/react
```

---

## 基础使用

### 滑块验证码

```tsx
import { SliderCaptcha } from '@captcha-pro/react'

function App() {
  const handleSuccess = () => {
    console.log('验证通过!')
    // 提交表单或其他操作
  }

  const handleFail = () => {
    console.log('验证失败!')
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

### 点选验证码

```tsx
import { ClickCaptcha } from '@captcha-pro/react'

function App() {
  return (
    <ClickCaptcha
      width={300}
      height={170}
      count={3}
      onSuccess={() => console.log('验证通过!')}
    />
  )
}
```

### 弹窗验证码

```tsx
import { PopupCaptcha } from '@captcha-pro/react'

function App() {
  return (
    <>
      <button id="submit-btn">提交</button>
      <PopupCaptcha
        trigger="#submit-btn"
        type="slider"
        modal={{
          title: '安全验证',
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
        onSuccess={() => console.log('验证通过!')}
      />
    </>
  )
}
```

---

## 组件 Props

### SliderCaptcha Props

```tsx
interface SliderCaptchaProps {
  // 容器
  el?: string | HTMLElement

  // 尺寸
  width?: number
  height?: number
  sliderWidth?: number
  sliderHeight?: number

  // 图片
  bgImage?: string
  sliderImage?: string

  // 验证
  precision?: number
  verifyMode?: 'frontend' | 'backend'
  backendVerify?: BackendVerifyOptions

  // 安全
  security?: SecurityOptions

  // 样式
  showRefresh?: boolean
  className?: string

  // 国际化
  locale?: 'zh-CN' | 'en-US'

  // 回调
  onSuccess?: () => void
  onFail?: () => void
  onRefresh?: () => void
}
```

---

## 事件处理

```tsx
import { SliderCaptcha } from '@captcha-pro/react'

function App() {
  const handleSuccess = () => {
    console.log('验证通过')
    // 提交表单
  }

  const handleFail = () => {
    console.log('验证失败')
    // 提示用户重试
  }

  const handleRefresh = () => {
    console.log('用户点击刷新')
    // 可选：记录用户行为
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

### 获取验证数据

```tsx
import { useRef } from 'react'
import { SliderCaptcha, SliderCaptchaRef } from '@captcha-pro/react'

function App() {
  const captchaRef = useRef<SliderCaptchaRef>(null)

  const handleSuccess = () => {
    // 获取验证数据
    const data = captchaRef.current?.getData()
    console.log('目标位置:', data?.target)

    // 获取统计数据
    const stats = captchaRef.current?.getStatistics()
    console.log('成功率:', stats?.successRate)
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
      <button onClick={resetCaptcha}>重置</button>
      <button onClick={refreshCaptcha}>刷新</button>
    </>
  )
}
```

---

## TypeScript 支持

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

## 🔗 相关链接

- [React 快速开始](../quick-start/react)
- [前端集成指南](../guides/frontend-integration)
- [API 参考手册](../api/)
- [配置选项详解](../api/options)
- [React 示例代码](https://github.com/saqqdy/captcha-pro/blob/master/examples/react/README.md)
