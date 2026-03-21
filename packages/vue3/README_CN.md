# captcha-pro-vue3

Captcha Pro 的 Vue 3 组件库，支持 Composition API。

## 安装

```bash
pnpm add captcha-pro-vue3
```

## 使用

### 全局注册

```typescript
import { createApp } from 'vue'
import CaptchaPro from 'captcha-pro-vue3'
import 'captcha-pro-vue3/style.css'

const app = createApp(App)
app.use(CaptchaPro)
```

### 组件用法

```vue
<template>
  <!-- 滑动拼图验证码 -->
  <SliderCaptcha
    v-model="sliderData"
    :width="300"
    :height="170"
    @success="onSuccess"
    @fail="onFail"
  />

  <!-- 点选文字验证码 -->
  <ClickCaptcha
    :width="300"
    :height="170"
    :count="3"
    @success="onSuccess"
  />

  <!-- 弹窗验证码 -->
  <PopupCaptcha
    trigger="#submit-btn"
    type="slider"
    @success="onSuccess"
  >
    <button id="submit-btn">提交</button>
  </PopupCaptcha>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SliderCaptcha, ClickCaptcha, PopupCaptcha } from 'captcha-pro-vue3'

const sliderData = ref(null)

const onSuccess = () => {
  console.log('验证通过!')
}
</script>
```

### 使用 Composables

```vue
<template>
  <div ref="containerRef" class="captcha-container" />
  <div v-if="status" class="status" :class="status">{{ statusText }}</div>
</template>

<script setup lang="ts">
import { useSliderCaptcha } from 'captcha-pro-vue3/composables'

const containerRef = ref<HTMLDivElement>()

const {
  status,
  statusText,
  init,
  refresh,
  getData,
  destroy
} = useSliderCaptcha({
  width: 300,
  height: 170,
  onSuccess: () => console.log('验证通过!')
}, containerRef)

onMounted(() => init())
onUnmounted(() => destroy())
</script>
```

## TypeScript 支持

完整的 TypeScript 支持，导出类型定义：

```typescript
import type {
  SliderCaptchaProps,
  ClickCaptchaProps,
  PopupCaptchaProps,
  SliderCaptchaInstance,
  ClickCaptchaInstance
} from 'captcha-pro-vue3'
```

## Props

### SliderCaptcha

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| width | number | 300 | 容器宽度 |
| height | number | 170 | 容器高度 |
| bgImage | string | - | 背景图片 URL |
| sliderImage | string | - | 滑块图片 URL |
| precision | number | 5 | 验证精度（像素） |
| showRefresh | boolean | true | 显示刷新按钮 |
| verifyMode | 'frontend' \| 'backend' | 'frontend' | 验证模式 |
| locale | 'zh-CN' \| 'en-US' | 'zh-CN' | 语言 |

### ClickCaptcha

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| width | number | 300 | 容器宽度 |
| height | number | 170 | 容器高度 |
| count | number | 3 | 点击点数量 |
| showRefresh | boolean | true | 显示刷新按钮 |

## 暴露的方法

```vue
<script setup>
const captchaRef = ref()

// 调用方法
captchaRef.value?.refresh()
captchaRef.value?.getData()
captchaRef.value?.getStatistics()
</script>

<template>
  <SliderCaptcha ref="captchaRef" />
</template>
```

## 许可证

MIT
