# @captcha-pro/uniapp-vue2

Captcha Pro 的 uni-app + Vue 2 验证码组件（仅后端模式）。

## 安装

```bash
pnpm add @captcha-pro/uniapp-vue2
```

## 重要：仅后端模式

本包仅支持后端验证模式。所有验证码图片由后端 API 提供，必须配置 `backend`。

## 使用

### 全局注册

```javascript
import Vue from 'vue'
import CaptchaPro from '@captcha-pro/uniapp-vue2'

Vue.use(CaptchaPro)
```

### 组件用法

```vue
<template>
  <!-- Slider Captcha -->
  <SliderCaptcha
    :backend="backendConfig"
    :width="300"
    :height="170"
    @success="onSuccess"
    @fail="onFail"
  />

  <!-- Click Captcha -->
  <ClickCaptcha
    :backend="backendConfig"
    :width="300"
    :height="170"
    @success="onSuccess"
  />

  <!-- Popup Captcha -->
  <PopupCaptcha
    ref="popupRef"
    type="slider"
    :backend="backendConfig"
    @success="onSuccess"
  />
</template>

<script>
export default {
  data() {
    return {
      backendConfig: {
        getCaptcha: 'https://your-api.com/captcha/get',
        verify: 'https://your-api.com/captcha/verify',
        timeout: 10000,
      },
    }
  },
  methods: {
    onSuccess() {
      console.log('Verification passed!')
    },
    showPopup() {
      this.$refs.popupRef.show()
    },
  },
}
</script>
```

### 使用 Mixins

```vue
<template>
  <view ref="containerRef" class="captcha-container" />
  <view v-if="loading">Loading...</view>
  <view v-if="status === 'success'" class="success">{{ statusText }}</view>
</template>

<script>
import { sliderCaptchaMixin } from '@captcha-pro/uniapp-vue2/mixins'

export default {
  mixins: [sliderCaptchaMixin],
  data() {
    return {
      backendConfig: {
        getCaptcha: '/api/captcha/get',
        verify: '/api/captcha/verify',
      },
    }
  },
  // Mixin provides: status, statusText, loading, error, refresh, etc.
}
</script>
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
backendConfig: {
  async getCaptcha(params) {
    const res = await uni.request({
      url: '/api/captcha/get',
      data: params,
    })
    return res.data
  },
  async verify(data) {
    const res = await uni.request({
      url: '/api/captcha/verify',
      data,
      method: 'POST',
    })
    return res.data
  },
}
```

## 组件

### SliderCaptcha

| Prop | Type | Default | 描述 |
|------|------|---------|-------------|
| backend | Object | - | **必填**，后端 API 配置 |
| width | Number | 300 | 容器宽度 |
| height | Number | 170 | 容器高度 |
| sliderWidth | Number | 42 | 滑块拼图宽度 |
| sliderHeight | Number | 42 | 滑块拼图高度 |
| showRefresh | Boolean | true | 显示刷新按钮 |
| locale | String | 'zh-CN' | 语言 |

### ClickCaptcha

| Prop | Type | Default | 描述 |
|------|------|---------|-------------|
| backend | Object | - | **必填**，后端 API 配置 |
| width | Number | 300 | 容器宽度 |
| height | Number | 170 | 容器高度 |
| showRefresh | Boolean | true | 显示刷新按钮 |

### PopupCaptcha

| Prop | Type | Default | 描述 |
|------|------|---------|-------------|
| type | String | 'slider' | 'slider' 或 'click' |
| backend | Object | - | **必填**，后端 API 配置 |
| title | String | '请完成安全验证' | 弹窗标题 |
| maskClosable | Boolean | true | 点击遮罩层关闭 |
| showClose | Boolean | true | 显示关闭按钮 |
| autoClose | Boolean | true | 验证成功后自动关闭 |
| closeDelay | Number | 500 | 关闭延迟（毫秒） |

## Ref 方法

```javascript
// Access via ref
this.$refs.captcha.refresh()
this.$refs.captcha.getData()

// PopupCaptcha methods
this.$refs.popupRef.show()
this.$refs.popupRef.hide()
this.$refs.popupRef.isVisible()
```

## Events

| Event | 描述 | 参数 |
|-------|-------------|---------|
| success | 验证通过 | `{ verifiedAt }` |
| fail | 验证失败 | - |
| refresh | 点击刷新 | - |
| error | 加载错误 | `Error` |
| open | 弹窗打开 | - |
| close | 弹窗关闭 | - |

## 许可证

MIT
