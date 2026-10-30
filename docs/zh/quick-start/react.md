# React 快速开始

本指南帮助你在 5 分钟内在 React 项目中集成 captcha-pro。

## 📋 前置要求

- Node.js 18+
- React 16.8+ (支持 Hooks)
- 包管理器：pnpm / npm / yarn

---

## 🚀 快速集成

### 1. 安装

```bash
pnpm add @captcha-pro/react
```

### 2. 基础使用

```tsx
import { SliderCaptcha } from '@captcha-pro/react'

function App() {
  const handleSuccess = () => {
    console.log('验证通过!')
    // 提交表单或继续操作
  }

  const handleFail = () => {
    console.log('验证失败!')
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

### 3. 点选验证码

```tsx
import { ClickCaptcha } from '@captcha-pro/react'

function App() {
  return (
    <ClickCaptcha
      count={3}
      onSuccess={() => console.log('验证通过!')}
    />
  )
}
```

### 4. 弹窗验证码

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
          maskClosable: true
        }}
        onSuccess={() => console.log('验证通过!')}
      />
    </>
  )
}
```

---

## 🎨 自定义配置

### 自定义图片

```tsx
<SliderCaptcha
  bgImage="/path/to/background.jpg"
  sliderImage="/path/to/slider.png"
  width={300}
  height={200}
  onSuccess={handleSuccess}
/>
```

### 自定义精度

```tsx
<SliderCaptcha
  precision={5}
  onSuccess={handleSuccess}
/>
```

### 国际化

```tsx
import { SliderCaptcha, setLocale } from '@captcha-pro/react'

// 全局设置
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

## 🔐 后端验证

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
      onSuccess={() => console.log('后端验证通过!')}
    />
  )
}
```

---

## 📦 实例方法

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

  return (
    <SliderCaptcha
      ref={captchaRef}
      onSuccess={handleSuccess}
    />
  )
}
```

### 重置验证码

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
      <button onClick={resetCaptcha}>重置</button>
    </>
  )
}
```

---

## 🔗 相关链接

- [前端集成完整指南](../guides/frontend-integration.md)
- [API 参考手册](../api/)
- [配置选项详解](../api/options.md)
- [React 示例代码](https://github.com/saqqdy/captcha-pro/blob/master/examples/react/README.md)