# @captcha-pro/mp-shared

Shared types, logic, constants and utilities for Captcha Pro mini-program packages (backend-only mode).

**[简体中文](./README_CN.md)**

## Overview

This package provides shared infrastructure for all mini-program captcha packages:
- `@captcha-pro/weixin` - WeChat mini-program
- `@captcha-pro/taro-react` - Taro React cross-platform
- `@captcha-pro/taro-vue` - Taro Vue 3 cross-platform
- `@captcha-pro/taro-vue2` - Taro Vue 2 cross-platform
- `@captcha-pro/uniapp-vue` - uni-app Vue 3 cross-platform
- `@captcha-pro/uniapp-vue2` - uni-app Vue 2 cross-platform

## Installation

This package is typically used as a dependency of other packages, not directly installed:

```bash
# Install a specific platform package (mp-shared is included)
pnpm add @captcha-pro/weixin
pnpm add @captcha-pro/taro-vue
pnpm add @captcha-pro/uniapp-vue
```

## Backend-Only Mode

All mini-program packages only support backend verification mode. Captcha images are provided by backend API, `backend` configuration is required.

## Backend Configuration

```typescript
interface BackendConfig {
  getCaptcha: string | (params: CaptchaRequestParams) => Promise<CaptchaResponse>  // Required
  verify: string | (data: VerifyRequest) => Promise<VerifyResponse>                // Required
  headers?: Record<string, string>                                                   // Optional
  timeout?: number                                                                   // Optional, default: 10000
}
```

## Shared Types

```typescript
// Captcha types
type CaptchaType = 'slider' | 'click'

// Captcha request
interface CaptchaRequestParams {
  type: CaptchaType
  width: number
  height: number
  precision?: number
  clickCount?: number
}

// Captcha response
interface SliderCaptchaResponse {
  captchaId: string
  type: 'slider'
  bgImage: string      // Base64 data URL
  sliderImage: string  // Base64 data URL
  sliderY: number
  width: number
  height: number
  expiresAt: number
}

interface ClickCaptchaResponse {
  captchaId: string
  type: 'click'
  bgImage: string
  clickTexts: string[]
  clickCharImages: string[]
  width: number
  height: number
  expiresAt: number
}

// Verify request/response
interface VerifyRequest {
  captchaId: string
  type: CaptchaType
  target: number[] | Point[]  // slider: [sliderX]; click: [{ x, y }, ...]
}

interface VerifyResponse {
  success: boolean
  message: string
  data?: { verifiedAt: number }
}
```

## Shared Constants

```typescript
// Default dimensions
export const DEFAULT_WIDTH = 300
export const DEFAULT_HEIGHT = 170
export const DEFAULT_SLIDER_WIDTH = 42
export const DEFAULT_SLIDER_HEIGHT = 42
export const DEFAULT_PRECISION = 5
export const DEFAULT_CLICK_COUNT = 3
export const DEFAULT_TIMEOUT = 10000

// Status enum
export enum CaptchaStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  VERIFYING = 'verifying',
  SUCCESS = 'success',
  FAIL = 'fail',
  ERROR = 'error',
}

// i18n (keys aligned with Android/iOS LocaleMessages)
export type CaptchaLocale = 'zh-CN' | 'en-US'
export const DEFAULT_LOCALE: CaptchaLocale = 'zh-CN'
export const LOCALE_MESSAGES: Record<CaptchaLocale, Record<string, string>>
// keys: loading, slider_slide, slider_success, slider_fail, slider_hint,
//       click_prompt, click_success, click_fail, popup_title, popup_close,
//       error_network, error_expired, error_invalid, error_not_found
export function getLocaleMessage(locale: CaptchaLocale, key: string): string
```

## Shared Utilities

```typescript
// Request helpers
export function createCaptchaRequest(config: BackendConfig, params: CaptchaRequestParams): Promise<CaptchaResponse>
export function createVerifyRequest(config: BackendConfig, data: VerifyRequest): Promise<VerifyResponse>

// Validation helpers
export function validateSliderTarget(target: number[], precision: number, expectedX: number): boolean
export function validateClickTarget(target: number[], clickTexts: string[]): boolean

// i18n helper (see LOCALE_MESSAGES above)
export function getLocaleMessage(locale: CaptchaLocale, key: string): string

// Image helpers
export function loadImage(src: string): Promise<HTMLImageElement | ImageData>
export function createCanvasContext(width: number, height: number): CanvasContext
```

## Usage in Platform Packages

```typescript
// Example: WeChat mini-program component
import { BackendConfig, CaptchaStatus, createCaptchaRequest, createVerifyRequest } from '@captcha-pro/mp-shared'

Component({
  properties: {
    backend: Object,
    width: { type: Number, value: DEFAULT_WIDTH },
    height: { type: Number, value: DEFAULT_HEIGHT },
  },
  data: {
    status: CaptchaStatus.IDLE,
    bgImage: '',
    sliderImage: '',
  },
  methods: {
    async loadCaptcha() {
      this.setData({ status: CaptchaStatus.LOADING })
      const res = await createCaptchaRequest(this.data.backend, {
        type: 'slider',
        width: this.data.width,
        height: this.data.height,
      })
      this.setData({
        status: CaptchaStatus.READY,
        bgImage: res.bgImage,
        sliderImage: res.sliderImage,
      })
    },
  },
})
```

## License

MIT