# captcha-pro-vue3

Vue 3 component library for Captcha Pro with Composition API support.

**[简体中文](./README_CN.md)**

## Installation

```bash
pnpm add captcha-pro-vue3
```

## Usage

### Global Registration

```typescript
import { createApp } from 'vue'
import CaptchaPro from 'captcha-pro-vue3'
import 'captcha-pro-vue3/style.css'

const app = createApp(App)
app.use(CaptchaPro)
```

### Component Usage

```vue
<template>
  <!-- Slider Captcha -->
  <SliderCaptcha
    v-model="sliderData"
    :width="300"
    :height="170"
    @success="onSuccess"
    @fail="onFail"
  />

  <!-- Click Captcha -->
  <ClickCaptcha
    :width="300"
    :height="170"
    :count="3"
    @success="onSuccess"
  />

  <!-- Popup Captcha -->
  <PopupCaptcha
    trigger="#submit-btn"
    type="slider"
    @success="onSuccess"
  >
    <button id="submit-btn">Submit</button>
  </PopupCaptcha>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SliderCaptcha, ClickCaptcha, PopupCaptcha } from 'captcha-pro-vue3'

const sliderData = ref(null)

const onSuccess = () => {
  console.log('Verification passed!')
}
</script>
```

### Using Composables

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
  onSuccess: () => console.log('Passed!')
}, containerRef)

onMounted(() => init())
onUnmounted(() => destroy())
</script>
```

## TypeScript Support

Full TypeScript support with exported types:

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | number | 300 | Container width |
| height | number | 170 | Container height |
| bgImage | string | - | Background image URL |
| sliderImage | string | - | Slider image URL |
| precision | number | 5 | Verification precision (px) |
| showRefresh | boolean | true | Show refresh button |
| verifyMode | 'frontend' \| 'backend' | 'frontend' | Verification mode |
| locale | 'zh-CN' \| 'en-US' | 'zh-CN' | Language |

### ClickCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | number | 300 | Container width |
| height | number | 170 | Container height |
| count | number | 3 | Click points count |
| showRefresh | boolean | true | Show refresh button |

## Exposed Methods

```vue
<script setup>
const captchaRef = ref()

// Call methods
captchaRef.value?.refresh()
captchaRef.value?.getData()
captchaRef.value?.getStatistics()
</script>

<template>
  <SliderCaptcha ref="captchaRef" />
</template>
```

## License

MIT
