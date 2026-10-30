# Vue 3 Platform Integration Guide

This guide details how to use captcha-pro in Vue 3 projects.

## 📋 Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Component Props](#component-props)
- [Event Handling](#event-handling)
- [Instance Methods](#instance-methods)
- [Composition API](#composition-api)

---

## Installation

```bash
pnpm add @captcha-pro/vue
```

---

## Basic Usage

### Global Registration (Optional)

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import CaptchaPro from '@captcha-pro/vue'

const app = createApp(App)
app.use(CaptchaPro)
app.mount('#app')
```

### Component Import

```vue
<template>
  <SliderCaptcha
    :width="300"
    :height="170"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
import { SliderCaptcha } from '@captcha-pro/vue'

const onSuccess = () => {
  console.log('Passed!')
}
</script>
```

---

## Component Props

### SliderCaptcha

```vue
<template>
  <SliderCaptcha
    :width="300"
    :height="170"
    :precision="5"
    :show-refresh="true"
    bg-image="/path/to/background.jpg"
    slider-image="/path/to/slider.png"
    verify-mode="frontend"
    locale="zh-CN"
    @success="onSuccess"
    @fail="onFail"
    @refresh="onRefresh"
  />
</template>
```

### ClickCaptcha

```vue
<template>
  <ClickCaptcha
    :width="300"
    :height="170"
    :count="3"
    @success="onSuccess"
  />
</template>
```

### PopupCaptcha

```vue
<template>
  <button id="submit-btn">Submit</button>
  <PopupCaptcha
    trigger="#submit-btn"
    type="slider"
    :modal="{
      title: 'Security Verification',
      maskClosable: true
    }"
    :captcha-options="{
      width: 300,
      height: 170
    }"
    :auto-close="true"
    :close-delay="500"
    @success="onSuccess"
  />
</template>
```

---

## Event Handling

```vue
<template>
  <SliderCaptcha
    @success="handleSuccess"
    @fail="handleFail"
    @refresh="handleRefresh"
  />
</template>

<script setup lang="ts">
const handleSuccess = () => {
  console.log('Passed')
  // submit the form
}

const handleFail = () => {
  console.log('Failed')
  // prompt the user to retry
}

const handleRefresh = () => {
  console.log('User clicked refresh')
  // optional: record user behavior
}
</script>
```

---

## Instance Methods

### Calling Methods via ref

```vue
<template>
  <div>
    <SliderCaptcha
      ref="captchaRef"
      @success="onSuccess"
    />
    <button @click="resetCaptcha">Reset</button>
    <button @click="refreshCaptcha">Refresh</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SliderCaptcha } from '@captcha-pro/vue'

const captchaRef = ref()

const onSuccess = () => {
  // Get verification data
  const data = captchaRef.value?.getData()
  console.log('Target position:', data?.target)

  // Get statistics
  const stats = captchaRef.value?.getStatistics()
  console.log('Success rate:', stats?.successRate)
}

const resetCaptcha = () => {
  captchaRef.value?.reset()
}

const refreshCaptcha = () => {
  captchaRef.value?.refresh()
}
</script>
```

---

## Composition API

### Custom Hook

```vue
<template>
  <div>
    <SliderCaptcha
      ref="captchaRef"
      @success="handleSuccess"
    />
    <div v-if="stats">
      <p>Total attempts: {{ stats.totalAttempts }}</p>
      <p>Success rate: {{ stats.successRate }}%</p>
      <p>Average time: {{ stats.avgVerifyTime }}ms</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { SliderCaptcha } from '@captcha-pro/vue'

const captchaRef = ref()
const stats = ref(null)

const handleSuccess = () => {
  stats.value = captchaRef.value?.getStatistics()
}

// Auto-refresh (example: every 5 minutes)
const refreshInterval = setInterval(() => {
  captchaRef.value?.refresh()
}, 5 * 60 * 1000)

// Cleanup
onUnmounted(() => {
  clearInterval(refreshInterval)
})
</script>
```

### Backend Verification

```vue
<template>
  <SliderCaptcha
    verify-mode="backend"
    :backend-verify="backendConfig"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const backendConfig = reactive({
  getCaptcha: '/api/captcha?type=slider',
  verify: '/api/captcha/verify',
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 10000
})

const onSuccess = () => {
  console.log('Backend verification passed!')
}
</script>
```

---

## TypeScript Support

```vue
<template>
  <SliderCaptcha
    ref="captchaRef"
    :width="width"
    :height="height"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SliderCaptcha, SliderCaptchaRef } from '@captcha-pro/vue'

// Type-safe ref
const captchaRef = ref<SliderCaptchaRef>()

const width: number = 300
const height: number = 170

const onSuccess = () => {
  // Type-safe method calls
  const data = captchaRef.value?.getData()
  const stats = captchaRef.value?.getStatistics()
}
</script>
```

---

## 🔗 Related Links

- [Vue 3 Quick Start](../quick-start/vue3.md)
- [Frontend Integration Guide](../guides/frontend-integration.md)
- [API Reference](../api/README.md)
- [Options](../api/options.md)
- [Vue 3 Examples](https://github.com/saqqdy/captcha-pro/blob/master/examples/vue/README.md)
