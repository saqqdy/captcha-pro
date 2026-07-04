# captcha-pro-mp

Captcha Pro 小程序包。支持微信小程序、uni-app 和 Taro 3。

> ⚠️ **所有平台均为 backend-only 模式**：无客户端 Canvas 渲染，所有图片来自后端 API；验证由后端完成；`backend` 配置为**必填**。

**[English](./README.md)**

## 安装

```bash
pnpm add captcha-pro-mp
```

## 后端 API 契约

三平台共享同一套后端 API 类型定义，你的服务端需实现：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/captcha` | GET | 生成验证码（`type=slider|click`，`width`，`height` 等） |
| `/api/captcha/verify` | POST | 验证（`{ captchaId, type, target, ... }`） |

完整响应格式见 [后端 API 文档](../../servers/node/README.md)。

---

## 微信小程序

> ⚠️ 仅支持后端服务模式，`backend` 为必填属性。

### 使用方法

1. 将 `captcha-pro-mp/weixin/components/` 目录下的文件复制到项目的 `components/` 目录。

2. 在页面 JSON 中注册：

```json
{
  "usingComponents": {
    "slider-captcha": "/components/slider-captcha/slider-captcha",
    "click-captcha": "/components/click-captcha/click-captcha",
    "popup-captcha": "/components/popup-captcha/popup-captcha"
  }
}
```

3. 在 WXML 中使用：

```xml
<!-- 滑动拼图验证码 — 必须配置后端 -->
<slider-captcha
  width="{{300}}"
  height="{{170}}"
  backend="{{backendConfig}}"
  bind:success="onSuccess"
  bind:fail="onFail"
  bind:refresh="onRefresh"
  bind:error="onError"
/>

<!-- 点选文字验证码 — 必须配置后端 -->
<click-captcha
  width="{{300}}"
  height="{{170}}"
  backend="{{backendConfig}}"
  bind:success="onSuccess"
  bind:fail="onFail"
/>

<!-- 弹窗验证码 — 必须配置后端 -->
<popup-captcha
  type="slider"
  title="安全验证"
  backend="{{backendConfig}}"
  bind:success="onSuccess"
  bind:fail="onFail"
  bind:open="onOpen"
  bind:close="onClose"
/>
```

4. 在页面 JS 中定义 backend 配置：

```javascript
Page({
  data: {
    backendConfig: {
      getCaptcha: 'https://your-server.com/api/captcha',
      verify: 'https://your-server.com/api/captcha/verify',
    }
  },
  onSuccess(e) {
    wx.showToast({ title: '验证通过！' })
  },
  onFail() {
    wx.showToast({ title: '验证失败', icon: 'none' })
  },
  onRefresh() {
    console.log('验证码已刷新')
  },
  onError(e) {
    console.error('请求错误：', e.detail)
  },
  onOpen() {
    console.log('弹窗已打开')
  },
  onClose() {
    console.log('弹窗已关闭')
  }
})
```

### 组件属性

#### SliderCaptcha / ClickCaptcha

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| width | Number | 300 | - | 容器宽度（px） |
| height | Number | 170 | - | 容器高度（px） |
| backend | Object | - | ✅ | 后端 API 配置 |
| showRefresh | Boolean | true | - | 显示刷新按钮 |
| sliderWidth | Number | 42 | - | 滑块宽度（仅滑动验证码） |
| sliderHeight | Number | 42 | - | 滑块高度（仅滑动验证码） |

#### PopupCaptcha

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| type | String | 'slider' | - | 验证码类型：`slider` 或 `click` |
| title | String | '请完成安全验证' | - | 弹窗标题 |
| backend | Object | - | ✅ | 后端 API 配置 |
| maskClosable | Boolean | true | - | 点击遮罩关闭 |
| showClose | Boolean | true | - | 显示关闭按钮 |
| autoClose | Boolean | true | - | 验证成功自动关闭 |
| closeDelay | Number | 500 | - | 自动关闭延迟（ms） |
| sliderOptions | Object | {} | - | 额外 SliderCaptcha 属性 |
| clickOptions | Object | {} | - | 额外 ClickCaptcha 属性 |

### 事件

| 事件 | 说明 |
|------|------|
| success | 验证通过（`e.detail = { verifiedAt }`） |
| fail | 验证失败 |
| refresh | 验证码刷新 |
| error | 网络/请求错误（`e.detail = Error`） |
| open | 弹窗打开（popup-captcha） |
| close | 弹窗关闭（popup-captcha） |

### 方法（PopupCaptcha）

通过 `this.selectComponent('#popup')` 访问：

| 方法 | 说明 |
|------|------|
| show() | 显示弹窗 |
| hide() | 隐藏弹窗 |
| isVisible() | 获取显示状态 |

### TypeScript

```typescript
import type {
  BackendConfig as WxBackendConfig,
  SliderCaptchaProps as WxSliderCaptchaProps,
  ClickCaptchaProps as WxClickCaptchaProps,
  PopupCaptchaProps as WxPopupCaptchaProps,
  PopupCaptchaRef as WxPopupCaptchaRef,
} from 'captcha-pro-mp/weixin'
```

---

## uni-app

> ⚠️ 仅支持后端服务模式，`backend` 为必填 prop。

### 使用方法

```vue
<template>
  <view>
    <!-- 滑动拼图验证码 -->
    <slider-captcha
      :width="300"
      :height="170"
      :backend="backendConfig"
      @success="onSuccess"
      @fail="onFail"
    />

    <!-- 点选文字验证码 -->
    <click-captcha
      :width="300"
      :height="170"
      :backend="backendConfig"
      @success="onSuccess"
    />

    <!-- 弹窗验证码 -->
    <popup-captcha
      ref="popup"
      type="slider"
      :backend="backendConfig"
      @success="onSuccess"
      @close="onClose"
    />
  </view>
</template>

<script>
import { SliderCaptcha, ClickCaptcha, PopupCaptcha } from 'captcha-pro-mp/uniapp'

export default {
  components: { SliderCaptcha, ClickCaptcha, PopupCaptcha },
  data() {
    return {
      backendConfig: {
        getCaptcha: 'https://your-server.com/api/captcha',
        verify: 'https://your-server.com/api/captcha/verify',
      }
    }
  },
  methods: {
    onSuccess(data) {
      uni.showToast({ title: '验证通过！' })
    },
    onFail() {
      uni.showToast({ title: '验证失败', icon: 'none' })
    },
    onClose() {
      console.log('弹窗已关闭')
    },
    showPopup() {
      this.$refs.popup.show()
    }
  }
}
</script>
```

### Props

#### SliderCaptcha / ClickCaptcha

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| width | Number | 300 | - | 容器宽度（px） |
| height | Number | 170 | - | 容器高度（px） |
| backend | Object | - | ✅ | 后端 API 配置 |
| showRefresh | Boolean | true | - | 显示刷新按钮 |

#### PopupCaptcha

| Prop | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| type | String | 'slider' | - | `slider` 或 `click` |
| title | String | '请完成安全验证' | - | 弹窗标题 |
| backend | Object | - | ✅ | 后端 API 配置 |
| maskClosable | Boolean | true | - | 点击遮罩关闭 |
| showClose | Boolean | true | - | 显示关闭按钮 |
| autoClose | Boolean | true | - | 验证成功自动关闭 |
| closeDelay | Number | 500 | - | 自动关闭延迟（ms） |
| sliderOptions | Object | {} | - | 额外 SliderCaptcha 属性 |
| clickOptions | Object | {} | - | 额外 ClickCaptcha 属性 |

### TypeScript

```typescript
import type {
  BackendConfig as UniBackendConfig,
  SliderCaptchaProps as UniSliderCaptchaProps,
  ClickCaptchaProps as UniClickCaptchaProps,
  PopupCaptchaProps as UniPopupCaptchaProps,
} from 'captcha-pro-mp/uniapp'
```

---

## Taro 3

> ⚠️ Taro 小程序端**仅支持后端服务模式**，`backend` 为必填 prop，不传则 TypeScript 编译报错。

### 使用方法

```tsx
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { SliderCaptcha, ClickCaptcha, PopupCaptcha } from 'captcha-pro-mp/taro'
import type { PopupCaptchaRef } from 'captcha-pro-mp/taro'
import { useRef } from 'react'

const BACKEND = {
  getCaptcha: 'https://your-server.com/api/captcha',
  verify: 'https://your-server.com/api/captcha/verify',
}

function Index() {
  const popupRef = useRef<PopupCaptchaRef>(null)
  const handleSuccess = () => {
    Taro.showToast({ title: '验证通过！' })
  }

  return (
    <View>
      {/* 滑块验证码 */}
      <SliderCaptcha backend={BACKEND} onSuccess={handleSuccess} />

      {/* 点选验证码 */}
      <ClickCaptcha backend={BACKEND} onSuccess={handleSuccess} />

      {/* 弹窗验证码 */}
      <PopupCaptcha
        ref={popupRef}
        type="slider"
        backend={BACKEND}
        onSuccess={handleSuccess}
      />
      <View onClick={() => popupRef.current?.show()}>显示弹窗</View>
    </View>
  )
}
```

### TypeScript

```typescript
import type {
  BackendConfig as TaroBackendConfig,
  SliderCaptchaProps as TaroSliderCaptchaProps,
  ClickCaptchaProps as TaroClickCaptchaProps,
  PopupCaptchaProps as TaroPopupCaptchaProps,
  PopupCaptchaRef as TaroPopupCaptchaRef,
} from 'captcha-pro-mp/taro'
```

### Props

#### BackendConfig（必填）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| getCaptcha | `string \| (params?) => Promise<Response>` | ✅ | 获取验证码 URL 或自定义函数 |
| verify | `string \| (data) => Promise<Response>` | ✅ | 验证 URL 或自定义函数 |
| headers | `Record<string, string>` | - | 请求头 |
| timeout | `number` | - | 超时（ms），默认 10000 |

#### SliderCaptcha

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | number | 650 | 容器宽度（rpx） |
| height | number | 380 | 容器高度（rpx） |
| sliderWidth | number | 80 | 滑块宽度（rpx） |
| sliderHeight | number | 80 | 滑块高度（rpx） |
| showRefresh | boolean | true | 显示刷新按钮 |
| backend | BackendConfig | - | **必填** |
| onSuccess | (data?) => void | - | 验证成功回调 |
| onFail | () => void | - | 验证失败回调 |
| onRefresh | () => void | - | 刷新回调 |
| onError | (err: Error) => void | - | 请求错误回调 |

#### ClickCaptcha

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | number | 650 | 容器宽度（rpx） |
| height | number | 380 | 容器高度（rpx） |
| showRefresh | boolean | true | 显示刷新按钮 |
| backend | BackendConfig | - | **必填** |
| onSuccess | (data?) => void | - | 验证成功回调 |
| onFail | () => void | - | 验证失败回调 |
| onRefresh | () => void | - | 刷新回调 |
| onError | (err: Error) => void | - | 请求错误回调 |

#### PopupCaptcha

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | 'slider' \| 'click' | 'slider' | 验证码类型 |
| title | string | '安全验证' | 弹窗标题 |
| backend | BackendConfig | - | **必填** |
| maskClosable | boolean | true | 点击遮罩关闭 |
| showClose | boolean | true | 显示关闭按钮 |
| autoClose | boolean | true | 验证成功自动关闭 |
| closeDelay | number | 500 | 自动关闭延迟（ms） |
| sliderOptions | Omit\<SliderCaptchaProps, 'backend'\> | {} | 额外滑块验证码属性 |
| clickOptions | Omit\<ClickCaptchaProps, 'backend'\> | {} | 额外点选验证码属性 |
| onSuccess | (data?) => void | - | 验证成功回调 |
| onFail | () => void | - | 验证失败回调 |
| onOpen | () => void | - | 弹窗打开回调 |
| onClose | () => void | - | 弹窗关闭回调 |

---

## 许可证

MIT
