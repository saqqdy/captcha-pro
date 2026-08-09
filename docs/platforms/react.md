# React

`@captcha-pro/react` provides hooks-based components that mirror the core library's options as props.

## Install

```bash
pnpm add @captcha-pro/react
```

## Usage

```tsx
import { SliderCaptcha } from '@captcha-pro/react'

function App() {
  return (
    <SliderCaptcha
      width={300}
      height={170}
      onSuccess={() => console.log('Passed!')}
    />
  )
}
```

## Available Components

All four captcha types are exported: `SliderCaptcha`, `ClickCaptcha`, `PopupCaptcha`, and `InvisibleCaptcha`. Props mirror the [options](/api/options) of the core library.
