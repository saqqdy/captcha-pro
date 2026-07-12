# @captcha-pro/weixin

WeChat mini-program captcha components for Captcha Pro (backend-only mode).

**[简体中文](./README_CN.md)**

## Installation

```bash
pnpm add @captcha-pro/weixin
```

## Important: Backend-Only Mode

This package only supports backend verification mode. All captcha images are provided by backend API, `backend` configuration is required.

## Usage

### 1. Build NPM

In WeChat DevTools:
1. Open your project
2. Click **Tools** → **Build npm**

### 2. Register Components

```json
// page.json
{
  "usingComponents": {
    "slider-captcha": "@captcha-pro/weixin/components/slider-captcha/slider-captcha",
    "click-captcha": "@captcha-pro/weixin/components/click-captcha/click-captcha",
    "popup-captcha": "@captcha-pro/weixin/components/popup-captcha/popup-captcha"
  }
}
```

### 3. Use Components

```xml
<!-- slider-captcha -->
<slider-captcha
  width="{{300}}"
  height="{{170}}"
  backend="{{backend}}"
  bind:success="onSuccess"
  bind:fail="onFail"
/>

<!-- click-captcha -->
<click-captcha
  width="{{300}}"
  height="{{170}}"
  backend="{{backend}}"
  bind:success="onSuccess"
/>

<!-- popup-captcha -->
<popup-captcha
  id="popupCaptcha"
  type="slider"
  backend="{{backend}}"
  bind:success="onSuccess"
/>
```

```javascript
// page.js
Page({
  data: {
    backend: {
      getCaptcha: 'https://your-api.com/captcha/get',
      verify: 'https://your-api.com/captcha/verify',
      timeout: 10000,
    },
  },
  onSuccess(e) {
    console.log('Verification passed!', e.detail)
  },
  showPopup() {
    this.selectComponent('#popupCaptcha').show()
  },
})
```

## Backend Configuration (Required)

```typescript
interface BackendConfig {
  getCaptcha: string | (params: any) => Promise<any>  // Required
  verify: string | (data: any) => Promise<any>        // Required
  headers?: Record<string, string>                     // Optional
  timeout?: number                                     // Optional, default: 10000
}
```

Example with custom functions:

```javascript
Page({
  data: {
    backend: {
      getCaptcha(params) {
        return new Promise((resolve) => {
          wx.request({
            url: '/api/captcha/get',
            data: params,
            success: (res) => resolve(res.data),
          })
        })
      },
      verify(data) {
        return new Promise((resolve) => {
          wx.request({
            url: '/api/captcha/verify',
            data,
            method: 'POST',
            success: (res) => resolve(res.data),
          })
        })
      },
    },
  },
})
```

## Components

### slider-captcha

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| width | Number | 300 | Container width (px) |
| height | Number | 170 | Container height (px) |
| sliderWidth | Number | 42 | Slider piece width (px) |
| sliderHeight | Number | 42 | Slider piece height (px) |
| showRefresh | Boolean | true | Show refresh button |
| locale | String | 'zh-CN' | Language |
| backend | Object | - | **Required**, backend API config |

### click-captcha

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| width | Number | 300 | Container width (px) |
| height | Number | 170 | Container height (px) |
| showRefresh | Boolean | true | Show refresh button |
| locale | String | 'zh-CN' | Language |
| backend | Object | - | **Required**, backend API config |

### popup-captcha

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| type | String | 'slider' | 'slider' or 'click' |
| title | String | '请完成安全验证' | Popup title |
| maskClosable | Boolean | true | Close on mask click |
| showClose | Boolean | true | Show close button |
| autoClose | Boolean | true | Auto close on success |
| closeDelay | Number | 500 | Close delay (ms) |
| backend | Object | - | **Required**, backend API config |

## Component Methods

```javascript
// Get component instance
const slider = this.selectComponent('#sliderCaptcha')
const popup = this.selectComponent('#popupCaptcha')

// slider-captcha / click-captcha methods
slider.refresh()
slider.getData()

// popup-captcha methods
popup.show()
popup.hide()
popup.isVisible()
```

## Events

| Event | Description | Detail |
|-------|-------------|--------|
| bind:success | Verification passed | `{ verifiedAt }` |
| bind:fail | Verification failed | - |
| bind:refresh | Refresh clicked | - |
| bind:error | Loading error | `Error` |
| bind:open | Popup opened | - |
| bind:close | Popup closed | - |

## Utility Functions

```javascript
const { wxFetchCaptcha, wxVerifyCaptcha } = require('@captcha-pro/weixin')

// Fetch captcha
const res = await wxFetchCaptcha(backendConfig, {
  type: 'slider',
  width: 300,
  height: 170,
})

// Verify captcha
const result = await wxVerifyCaptcha(backendConfig, {
  captchaId: 'xxx',
  type: 'slider',
  target: [123],
})
```

## Backend API Reference

### GET /api/captcha/get

Query Parameters:
- `type`: 'slider' | 'click'
- `width`: number
- `height`: number
- `precision`: number (optional, default: 5)
- `clickCount`: number (optional, default: 3)

Response:
```json
{
  "success": true,
  "data": {
    "captchaId": "uuid",
    "type": "slider",
    "bgImage": "data:image/png;base64,...",
    "sliderImage": "data:image/png;base64,...",
    "sliderY": 42,
    "width": 300,
    "height": 170,
    "expiresAt": 1700000000000
  }
}
```

### POST /api/captcha/verify

Request:
```json
{
  "captchaId": "uuid",
  "type": "slider",
  "target": [123]
}
```

Response:
```json
{
  "success": true,
  "message": "Verification successful",
  "data": { "verifiedAt": 1700000000000 }
}
```

## License

MIT