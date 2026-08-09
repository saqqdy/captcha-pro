# @captcha-pro/uniapp-vue

Captcha Pro 的 uni-app + Vue 3 验证码组件（仅后端模式）。

## 安装

```bash
pnpm add @captcha-pro/uniapp-vue
```

## 重要：仅后端模式

本包仅支持后端验证模式。所有验证码图片由后端 API 提供，必须配置 `backend`。

## 使用

### 全局注册

```typescript
import { createSSRApp } from 'vue'
import CaptchaPro from '@captcha-pro/uniapp-vue'

const app = createSSRApp(App)
app.use(CaptchaPro)
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

<script setup lang="ts">
import { ref } from 'vue'
import { SliderCaptcha, ClickCaptcha, PopupCaptcha } from '@captcha-pro/uniapp-vue'

const backendConfig = {
  getCaptcha: 'https://your-api.com/captcha/get',
  verify: 'https://your-api.com/captcha/verify',
  timeout: 10000,
}

const popupRef = ref()
const onSuccess = () => console.log('Verification passed!')

// Show popup
popupRef.value?.show()
</script>
```

### 使用 Composables

```vue
<template>
  <view ref="containerRef" class="captcha-container" />
  <view v-if="loading">Loading...</view>
  <view v-if="status === 'success'" class="success">{{ statusText }}</view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSliderCaptcha } from '@captcha-pro/uniapp-vue/composables'

const containerRef = ref()
const backendConfig = {
  getCaptcha: 'https://your-api.com/captcha/get',
  verify: 'https://your-api.com/captcha/verify',
}

const {
  status,
  statusText,
  loading,
  error,
  init,
  refresh,
  destroy
} = useSliderCaptcha({
  backend: backendConfig,
  width: 300,
  height: 170,
  onSuccess: () => console.log('Passed!')
}, containerRef)

onMounted(() => init())
onUnmounted(() => destroy())
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

```typescript
const backendConfig = {
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

## TypeScript 支持

完整的 TypeScript 支持，导出类型定义：

```typescript
import type {
  BackendConfig,
  SliderCaptchaProps,
  ClickCaptchaProps,
  PopupCaptchaProps,
  SliderCaptchaRef,
  ClickCaptchaRef,
  PopupCaptchaRef,
} from '@captcha-pro/uniapp-vue'
```

## 组件

### SliderCaptcha

| Prop | Type | Default | 描述 |
|------|------|---------|-------------|
| backend | BackendConfig | - | **必填**，后端 API 配置 |
| width | number | 300 | 容器宽度 |
| height | number | 170 | 容器高度 |
| sliderWidth | number | 42 | 滑块拼图宽度 |
| sliderHeight | number | 42 | 滑块拼图高度 |
| showRefresh | boolean | true | 显示刷新按钮 |
| locale | 'zh-CN' \| 'en-US' | 'zh-CN' | 语言 |

### ClickCaptcha

| Prop | Type | Default | 描述 |
|------|------|---------|-------------|
| backend | BackendConfig | - | **必填**，后端 API 配置 |
| width | number | 300 | 容器宽度 |
| height | number | 170 | 容器高度 |
| showRefresh | boolean | true | 显示刷新按钮 |

### PopupCaptcha

| Prop | Type | Default | 描述 |
|------|------|---------|-------------|
| type | 'slider' \| 'click' | 'slider' | 验证码类型 |
| backend | BackendConfig | - | **必填**，后端 API 配置 |
| title | string | '请完成安全验证' | 弹窗标题 |
| maskClosable | boolean | true | 点击遮罩层关闭 |
| showClose | boolean | true | 显示关闭按钮 |
| autoClose | boolean | true | 验证成功后自动关闭 |
| closeDelay | number | 500 | 关闭延迟（毫秒） |

## 暴露的方法

```vue
<script setup>
const captchaRef = ref()
const popupRef = ref()

// SliderCaptcha / ClickCaptcha methods
captchaRef.value?.refresh()
captchaRef.value?.getData()

// PopupCaptcha methods
popupRef.value?.show()
popupRef.value?.hide()
popupRef.value?.isVisible()
</script>
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
