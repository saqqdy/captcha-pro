# @captcha-pro/weixin

Captcha Pro 的微信小程序验证码组件（仅后端模式）。

## 安装

```bash
pnpm add @captcha-pro/weixin
```

## 重要：仅后端模式

本包仅支持后端验证模式。所有验证码图片由后端 API 提供，必须配置 `backend`。

## 使用

### 1. 构建 NPM

在微信开发者工具中：
1. 打开项目
2. 点击 **工具** → **构建 npm**

### 2. 注册组件

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

### 3. 使用组件

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

## 后端配置（必填）

```typescript
interface BackendConfig {
  getCaptcha: string | (params: any) => Promise<any>  // Required
  verify: string | (data: any) => Promise<any>        // Required
  headers?: Record<string, string>                     // Optional
  timeout?: number                                     // Optional, default: 10000
}
```

使用自定义函数的示例：

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

## 组件

### slider-captcha

| Property | Type | Default | 描述 |
|----------|------|---------|-------------|
| width | Number | 300 | 容器宽度（px） |
| height | Number | 170 | 容器高度（px） |
| sliderWidth | Number | 42 | 滑块拼图宽度（px） |
| sliderHeight | Number | 42 | 滑块拼图高度（px） |
| showRefresh | Boolean | true | 显示刷新按钮 |
| locale | String | 'zh-CN' | 语言 |
| backend | Object | - | **必填**，后端 API 配置 |

### click-captcha

| Property | Type | Default | 描述 |
|----------|------|---------|-------------|
| width | Number | 300 | 容器宽度（px） |
| height | Number | 170 | 容器高度（px） |
| showRefresh | Boolean | true | 显示刷新按钮 |
| locale | String | 'zh-CN' | 语言 |
| backend | Object | - | **必填**，后端 API 配置 |

### popup-captcha

| Property | Type | Default | 描述 |
|----------|------|---------|-------------|
| type | String | 'slider' | 'slider' 或 'click' |
| title | String | '请完成安全验证' | 弹窗标题 |
| maskClosable | Boolean | true | 点击遮罩层关闭 |
| showClose | Boolean | true | 显示关闭按钮 |
| autoClose | Boolean | true | 验证成功后自动关闭 |
| closeDelay | Number | 500 | 关闭延迟（毫秒） |
| backend | Object | - | **必填**，后端 API 配置 |

## 组件方法

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

| Event | 描述 | 详情 |
|-------|-------------|--------|
| bind:success | 验证通过 | `{ verifiedAt }` |
| bind:fail | 验证失败 | - |
| bind:refresh | 点击刷新 | - |
| bind:error | 加载错误 | `Error` |
| bind:open | 弹窗打开 | - |
| bind:close | 弹窗关闭 | - |

## 工具函数

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

## 后端 API 参考

### GET /api/captcha/get

查询参数：
- `type`: 'slider' | 'click'
- `width`: number
- `height`: number
- `precision`: number（可选，默认：5）
- `clickCount`: number（可选，默认：3）

响应：
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

请求：
```json
{
  "captchaId": "uuid",
  "type": "slider",
  "target": [123]
}
```

响应：
```json
{
  "success": true,
  "message": "Verification successful",
  "data": { "verifiedAt": 1700000000000 }
}
```

## 许可证

MIT
