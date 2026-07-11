# @captcha-pro/taro-vue

Taro + Vue 3 验证码组件库，用于 Captcha Pro（后端验证模式）。

**[English](./README.md)**

## 安装

```bash
pnpm add @captcha-pro/taro-vue
```

## 重要说明：后端验证模式

本组件包仅支持后端验证模式。所有验证码图片均由后端 API 提供，`backend` 配置为必填项。

## 使用方法

### 全局注册

```typescript
import { createApp } from 'vue'
import CaptchaPro from '@captcha-pro/taro-vue'

const app = createApp(App)
app.use(CaptchaPro)
```

### 组件使用

```vue
<template>
  <!-- 滑块验证码 -->
  <SliderCaptcha
    :backend="backendConfig"
    :width="300"
    :height="170"
    @success="onSuccess"
    @fail="onFail"
  />

  <!-- 点击验证码 -->
  <ClickCaptcha
    :backend="backendConfig"
    :width="300"
    :height="170"
    @success="onSuccess"
  />

  <!-- 弹出验证码 -->
  <PopupCaptcha
    ref="popupRef"
    type="slider"
    :backend="backendConfig"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SliderCaptcha, ClickCaptcha, PopupCaptcha } from '@captcha-pro/taro-vue'

const backendConfig = {
  getCaptcha: 'https://your-api.com/captcha/get',
  verify: 'https://your-api.com/captcha/verify',
  timeout: 10000,
}

const popupRef = ref()
const onSuccess = () => console.log('验证通过！')

// 显示弹窗
popupRef.value?.show()
</script>
```

### 使用组合式函数

```vue
<template>
  <view ref="containerRef" class="captcha-container" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSliderCaptcha } from '@captcha-pro/taro-vue/composables'

const containerRef = ref()
const backendConfig = {
  getCaptcha: 'https://your-api.com/captcha/get',
  verify: 'https://your-api.com/captcha/verify',
}

const {
  status,
  init,
  refresh,
  destroy
} = useSliderCaptcha({
  backend: backendConfig,
  width: 300,
  height: 170,
  onSuccess: () => console.log('验证通过！')
}, containerRef)

onMounted(() => init())
onUnmounted(() => destroy())
</script>
```

## 后端配置（必填）

```typescript
interface BackendConfig {
  getCaptcha: string | (params: any) => Promise<any>  // 必填
  verify: string | (data: any) => Promise<any>        // 必填
  headers?: Record<string, string>                     // 可选
  timeout?: number                                     // 可选，默认: 10000
}
```

使用自定义函数示例：

```typescript
const backendConfig = {
  async getCaptcha(params) {
    return Taro.request({
      url: '/api/captcha/get',
      data: params,
    })
  },
  async verify(data) {
    return Taro.request({
      url: '/api/captcha/verify',
      data,
    })
  },
}
```

## TypeScript 支持

完整的 TypeScript 类型支持：

```typescript
import type {
  BackendConfig,
  SliderCaptchaProps,
  ClickCaptchaProps,
  PopupCaptchaProps,
  SliderCaptchaRef,
  ClickCaptchaRef,
  PopupCaptchaRef,
} from '@captcha-pro/taro-vue'
```

## 组件

### SliderCaptcha（滑块验证码）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| backend | BackendConfig | - | **必填**，后端 API 配置 |
| width | number | 300 | 容器宽度 |
| height | number | 170 | 容器高度 |
| showRefresh | boolean | true | 显示刷新按钮 |

### ClickCaptcha（点击验证码）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| backend | BackendConfig | - | **必填**，后端 API 配置 |
| width | number | 300 | 容器宽度 |
| height | number | 170 | 容器高度 |
| showRefresh | boolean | true | 显示刷新按钮 |

### PopupCaptcha（弹出验证码）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | 'slider' \| 'click' | 'slider' | 验证码类型 |
| backend | BackendConfig | - | **必填**，后端 API 配置 |
| title | string | '请完成安全验证' | 弹窗标题 |
| maskClosable | boolean | true | 点击遮罩关闭 |
| showClose | boolean | true | 显示关闭按钮 |
| autoClose | boolean | true | 验证成功自动关闭 |

## 组件方法

```vue
<script setup>
const captchaRef = ref()

// SliderCaptcha / ClickCaptcha 方法
captchaRef.value?.refresh()

// PopupCaptcha 方法
captchaRef.value?.show()
captchaRef.value?.hide()
captchaRef.value?.isVisible()
</script>
```

## 事件

| 事件 | 说明 | 参数 |
|------|------|------|
| success | 验证成功 | `{ verifiedAt }` |
| fail | 验证失败 | - |
| refresh | 点击刷新 | - |
| error | 加载错误 | `Error` |

## 许可证

MIT