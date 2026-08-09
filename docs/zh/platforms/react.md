# React

`@captcha-pro/react` 提供基于 hooks 的组件，props 与核心库的选项一一对应。

## 安装

```bash
pnpm add @captcha-pro/react
```

## 用法

```tsx
import { SliderCaptcha } from '@captcha-pro/react'

function App() {
  return (
    <SliderCaptcha
      width={300}
      height={170}
      onSuccess={() => console.log('验证通过!')}
    />
  )
}
```

## 可用组件

四种验证码类型均作为组件导出：`SliderCaptcha`、`ClickCaptcha`、`PopupCaptcha`、`InvisibleCaptcha`。props 与核心库的[选项](/zh/api/options)一一对应。
