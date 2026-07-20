# React Captcha Demo

React example project demonstrating captcha-pro-react components.

**[简体中文](./README_CN.md)**

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app runs at `http://localhost:5173`

## Features Demonstrated

- **SliderCaptcha** - Drag slider to complete verification
- **ClickCaptcha** - Click characters in order
- **PopupCaptcha** - Modal wrapper for captcha
- **InvisibleCaptcha** - Risk-based invisible verification
- **Backend Verification** - Server-side validation demo
- **Custom Images** - Use your own background/slider images

## Project Structure

```
src/
├── App.tsx              # Main app with tab navigation
├── main.tsx             # Entry point
├── pages/
│   ├── ClickDemo.tsx    # Click captcha demo
│   ├── SliderDemo.tsx   # Slider captcha demo
│   ├── PopupDemo.tsx    # Popup captcha demo
│   ├── InvisibleDemo.tsx # Invisible captcha demo
│   ├── BackendDemo.tsx  # Backend verification demo
│   └── CustomImageDemo.tsx # Custom image demo
├── components/
│   ├── Header.tsx       # App header
│   ├── Footer.tsx       # App footer
│   ├── Features.tsx     # Feature list
│   └── TabNav.tsx       # Tab navigation
└── hooks/
    └── useLocale.tsx    # i18n hook
```

## Usage Examples

### Basic Slider Captcha

```tsx
import { SliderCaptcha } from 'captcha-pro-react'

function Demo() {
  return (
    <SliderCaptcha
      width={300}
      height={170}
      onSuccess={() => console.log('Passed!')}
      onFail={() => console.log('Failed')}
    />
  )
}
```

### Click Captcha

```tsx
import { ClickCaptcha } from 'captcha-pro-react'

function Demo() {
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
import { PopupCaptcha } from 'captcha-pro-react'

function Demo() {
  return (
    <PopupCaptcha
      trigger="#submit-btn"
      type="slider"
      onSuccess={() => console.log('Passed!')}
    >
      <button id="submit-btn">Submit</button>
    </PopupCaptcha>
  )
}
```

### Backend Verification

```tsx
import { SliderCaptcha } from 'captcha-pro-react'

function Demo() {
  return (
    <SliderCaptcha
      verifyMode="backend"
      backendVerify={{
        getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
        verify: 'http://localhost:3001/api/captcha/verify',
      }}
      onSuccess={() => console.log('Backend verified!')}
    />
  )
}
```

## Backend Server

To test backend verification, start the demo server:

```bash
# From project root
cd server/node
pnpm install
pnpm dev
```

Server runs at `http://localhost:3001`

## Build

```bash
pnpm build
```

## License

MIT