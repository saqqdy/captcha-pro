# Taro React Captcha Demo

Taro + React example project demonstrating @captcha-pro/taro-react components (backend-only mode).

**[简体中文](./README_CN.md)**

## Important: Backend-Only Mode

Taro captcha components only support backend verification. All captcha images are provided by backend API.

## Quick Start

```bash
# Install dependencies
pnpm install

# Development - WeChat mini-program
pnpm dev:weapp

# Development - H5
pnpm dev:h5

# Development - Alipay mini-program
pnpm dev:alipay
```

Open the `dist/` directory in WeChat DevTools for mini-program preview.

## Backend Configuration

Configure your backend API in the page:

```tsx
import { SliderCaptcha } from '@captcha-pro/taro-react'

function CaptchaPage() {
  const backendConfig = {
    getCaptcha: 'https://your-api.com/captcha/get',
    verify: 'https://your-api.com/captcha/verify',
    timeout: 10000,
  }

  return (
    <SliderCaptcha
      backend={backendConfig}
      width={300}
      height={170}
      onSuccess={() => console.log('Passed!')}
    />
  )
}
```

## Project Structure

```
src/
├── app.config.ts        # App configuration
├── app.tsx              # App entry
├── app.scss             # Global styles
├── pages/
│   ├── index/           # Home page
│   ├── slider/          # Slider captcha demo
│   └── click/           # Click captcha demo
└── components/          # Shared components
```

## Components Demonstrated

### SliderCaptcha

```tsx
<SliderCaptcha
  backend={backendConfig}
  width={300}
  height={170}
  sliderWidth={42}
  sliderHeight={42}
  showRefresh={true}
  onSuccess={handleSuccess}
  onFail={handleFail}
/>
```

### ClickCaptcha

```tsx
<ClickCaptcha
  backend={backendConfig}
  width={300}
  height={170}
  showRefresh={true}
  onSuccess={handleSuccess}
/>
```

### PopupCaptcha

```tsx
import { useRef } from 'react'
import { PopupCaptcha } from '@captcha-pro/taro-react'

function Page() {
  const popupRef = useRef(null)

  return (
    <View>
      <Button onClick={() => popupRef.current?.show()}>Verify</Button>
      <PopupCaptcha
        ref={popupRef}
        type="slider"
        backend={backendConfig}
        onSuccess={handleSuccess}
      />
    </View>
  )
}
```

## Backend Server

Start the demo backend server:

```bash
# From project root
cd server/node
pnpm install
pnpm dev
```

Update `backendConfig` to point to `http://localhost:3001/api/captcha`

## Build

```bash
# Build for WeChat mini-program
pnpm build:weapp

# Build for H5
pnpm build:h5
```

## License

MIT