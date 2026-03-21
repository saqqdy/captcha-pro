# captcha-pro-react

Captcha Pro 的 React 组件库，支持 Hooks。

## 安装

```bash
pnpm add captcha-pro-react
```

## 使用

### 组件用法

```tsx
import { SliderCaptcha, ClickCaptcha, PopupCaptcha } from 'captcha-pro-react'

function App() {
  const handleSuccess = () => {
    console.log('验证通过!')
  }

  return (
    <div>
      {/* 滑动拼图验证码 */}
      <SliderCaptcha
        width={300}
        height={170}
        precision={5}
        onSuccess={handleSuccess}
        onFail={() => console.log('验证失败')}
      />

      {/* 点选文字验证码 */}
      <ClickCaptcha
        width={300}
        height={170}
        count={3}
        onSuccess={handleSuccess}
      />

      {/* 弹窗验证码 */}
      <PopupCaptcha
        trigger="#submit-btn"
        type="slider"
        onSuccess={handleSuccess}
      >
        <button id="submit-btn">提交</button>
      </PopupCaptcha>
    </div>
  )
}
```

### 使用 Hooks

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
    onSuccess: () => console.log('验证通过!')
  })

  return (
    <div>
      <div ref={containerRef} className="captcha-container" />
      {status && <div className={`status ${status}`}>{statusText}</div>}
      <button onClick={refresh}>刷新</button>
    </div>
  )
}
```

### 使用 Refs

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
      <button onClick={handleClick}>刷新</button>
    </div>
  )
}
```

## TypeScript 支持

完整的 TypeScript 支持，导出类型定义：

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

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| width | number | 300 | 容器宽度 |
| height | number | 170 | 容器高度 |
| bgImage | string | - | 背景图片 URL |
| sliderImage | string | - | 滑块图片 URL |
| precision | number | 5 | 验证精度（像素） |
| showRefresh | boolean | true | 显示刷新按钮 |
| verifyMode | 'frontend' \| 'backend' | 'frontend' | 验证模式 |
| locale | 'zh-CN' \| 'en-US' | 'zh-CN' | 语言 |
| onSuccess | () => void | - | 验证成功回调 |
| onFail | () => void | - | 验证失败回调 |
| onRefresh | () => void | - | 刷新回调 |
| onReady | (instance) => void | - | 就绪回调 |
| className | string | - | 自定义类名 |

### ClickCaptcha

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| width | number | 300 | 容器宽度 |
| height | number | 170 | 容器高度 |
| count | number | 3 | 点击点数量 |
| showRefresh | boolean | true | 显示刷新按钮 |

### PopupCaptcha

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| type | 'slider' \| 'click' | 'slider' | 验证码类型 |
| trigger | string | - | 触发元素选择器 |
| autoClose | boolean | true | 验证成功自动关闭 |
| closeDelay | number | 500 | 关闭延迟（毫秒） |
| captchaOptions | object | - | 内部验证码配置 |

## Ref 方法

| 方法 | 描述 |
|------|------|
| refresh() | 刷新验证码 |
| getData() | 获取验证码数据 |
| getStatistics() | 获取验证统计 |
| getInstance() | 获取核心实例 |

## 许可证

MIT
