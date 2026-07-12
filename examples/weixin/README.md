# 微信小程序验证码示例

微信原生小程序验证码示例项目，使用 `@captcha-pro/mp/weixin` 组件。

> **重要：** 微信小程序端仅支持后端服务模式（Backend-only），所有验证码图片均由后端 API 提供，`backend` 为必填配置。

## 使用方法

### 1. 安装依赖

```bash
# 在项目根目录安装
pnpm install
```

### 2. 构建 NPM

在微信开发者工具中：
1. 打开 `examples/weixin` 目录
2. 点击 **工具** → **构建 npm**

### 3. 预览

在微信开发者工具中点击 **预览** 或 **真机调试**。

## 后端配置（必填）

所有组件都需要通过 `backend` 属性配置后端 API 地址：

```xml
<slider-captcha
  backend="{{backend}}"
  bind:success="onSuccess"
  bind:fail="onFail"
/>
```

```javascript
Page({
  data: {
    backend: {
      getCaptcha: 'https://your-api.com/captcha/get',
      verify: 'https://your-api.com/captcha/verify',
      timeout: 10000,
    },
  },
})
```

### Backend 配置项

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| getCaptcha | `string \| function` | 是 | 获取验证码的 URL 或自定义函数 |
| verify | `string \| function` | 是 | 验证验证码的 URL 或自定义函数 |
| headers | `Record<string, string>` | 否 | 请求头 |
| timeout | `number` | 否 | 超时时间（ms），默认 10000 |

也可以使用自定义函数实现更灵活的请求逻辑：

```javascript
backend: {
  getCaptcha(params) {
    return myRequest('/api/captcha/get', params)
  },
  verify(data) {
    return myRequest('/api/captcha/verify', data)
  },
}
```

## 组件使用

### slider-captcha 滑块验证码

#### 页面配置 (page.json)

```json
{
  "usingComponents": {
    "slider-captcha": "@captcha-pro/mp/weixin/components/slider-captcha"
  }
}
```

#### 模板 (wxml)

```xml
<slider-captcha
  width="{{300}}"
  height="{{170}}"
  slider-width="{{42}}"
  slider-height="{{42}}"
  show-refresh="{{true}}"
  backend="{{backend}}"
  bind:success="onSuccess"
  bind:fail="onFail"
  bind:refresh="onRefresh"
  bind:error="onError"
/>
```

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | Number | 300 | 验证码宽度（px） |
| height | Number | 170 | 验证码高度（px） |
| sliderWidth | Number | 42 | 滑块宽度（px） |
| sliderHeight | Number | 42 | 滑块高度（px） |
| showRefresh | Boolean | true | 显示刷新按钮 |
| backend | Object | - | **必填**，后端 API 配置 |

### click-captcha 点击验证码

#### 页面配置 (page.json)

```json
{
  "usingComponents": {
    "click-captcha": "@captcha-pro/mp/weixin/components/click-captcha"
  }
}
```

#### 模板 (wxml)

```xml
<click-captcha
  width="{{300}}"
  height="{{170}}"
  show-refresh="{{true}}"
  backend="{{backend}}"
  bind:success="onSuccess"
  bind:fail="onFail"
  bind:refresh="onRefresh"
  bind:error="onError"
/>
```

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | Number | 300 | 验证码宽度（px） |
| height | Number | 170 | 验证码高度（px） |
| showRefresh | Boolean | true | 显示刷新按钮 |
| backend | Object | - | **必填**，后端 API 配置 |

### popup-captcha 弹出验证码

#### 页面配置 (page.json)

```json
{
  "usingComponents": {
    "popup-captcha": "@captcha-pro/mp/weixin/components/popup-captcha"
  }
}
```

#### 模板 (wxml)

```xml
<popup-captcha
  id="popupCaptcha"
  type="slider"
  title="请完成安全验证"
  mask-closable="{{true}}"
  show-close="{{true}}"
  auto-close="{{true}}"
  close-delay="{{500}}"
  backend="{{backend}}"
  bind:success="onSuccess"
  bind:fail="onFail"
  bind:open="onOpen"
  bind:close="onClose"
/>
```

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | String | 'slider' | 验证码类型（slider / click） |
| title | String | '请完成安全验证' | 弹窗标题 |
| maskClosable | Boolean | true | 点击遮罩关闭 |
| showClose | Boolean | true | 显示关闭按钮 |
| autoClose | Boolean | true | 验证成功自动关闭 |
| closeDelay | Number | 500 | 自动关闭延迟（ms） |
| sliderOptions | Object | {} | 滑块验证码额外配置 |
| clickOptions | Object | {} | 点击验证码额外配置 |
| backend | Object | - | **必填**，后端 API 配置 |

#### 方法（通过 selectComponent 调用）

```javascript
// 显示弹窗
this.selectComponent('#popupCaptcha').show()

// 隐藏弹窗
this.selectComponent('#popupCaptcha').hide()

// 获取可见状态
this.selectComponent('#popupCaptcha').isVisible()
```

## 事件

| 事件 | 说明 | 回调参数 |
|------|------|----------|
| bind:success | 验证成功 | `e.detail = { verifiedAt }` |
| bind:fail | 验证失败 | - |
| bind:refresh | 点击刷新 | - |
| bind:error | 加载错误 | `e.detail = Error` |
| bind:open | 弹窗打开（popup-captcha） | - |
| bind:close | 弹窗关闭（popup-captcha） | - |

## 工具函数

`@captcha-pro/mp/weixin` 还导出了请求工具函数，可在自定义逻辑中使用：

```javascript
const { wxFetchCaptcha, wxVerifyCaptcha } = require('@captcha-pro/mp/weixin')

// 获取验证码
const res = await wxFetchCaptcha(backendConfig, {
  type: 'slider',
  width: 300,
  height: 170,
})

// 验证
const result = await wxVerifyCaptcha(backendConfig, {
  captchaId: 'xxx',
  type: 'slider',
  target: [123],
})
```
