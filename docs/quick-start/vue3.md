# Vue 3 Quick Start

This guide helps you integrate captcha-pro into a Vue 3 project in 5 minutes.

## 📋 Prerequisites

- Node.js 18+
- Vue 3+
- Package manager: pnpm / npm / yarn

---

## 🚀 Quick Integration

### 1. Install

```bash
pnpm add @captcha-pro/vue
```

### 2. Basic Usage

```vue
<template>
  <div>
    <SliderCaptcha
      :width="300"
      :height="170"
      :precision="5"
      @success="onSuccess"
      @fail="onFail"
    />
  </div>
</template>

<script setup lang="ts">
import { SliderCaptcha } from '@captcha-pro/vue'

const onSuccess = () => {
  console.log('Verification passed!')
  // submit the form or continue
}

const onFail = () => {
  console.log('Verification failed!')
}
</script>
```

### 3. Click Captcha

```vue
<template>
  <ClickCaptcha
    :count="3"
    @success="onSuccess"
  />
</template>

<script setup>
import { ClickCaptcha } from '@captcha-pro/vue'

const onSuccess = () => {
  console.log('Verification passed!')
}
</script>
```

### 4. Popup Captcha

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
    @success="onSuccess"
  />
</template>

<script setup>
import { PopupCaptcha } from '@captcha-pro/vue'

const onSuccess = () => {
  console.log('Verification passed!')
}
</script>
```

---

## 🎨 Custom Configuration

### Custom Images

```vue
<template>
  <SliderCaptcha
    bg-image="/path/to/background.jpg"
    slider-image="/path/to/slider.png"
    :width="300"
    :height="200"
    @success="onSuccess"
  />
</template>
```

### Custom Precision

```vue
<template>
  <SliderCaptcha
    :precision="5"
    @success="onSuccess"
  />
</template>
```

### Internationalization

```vue
<template>
  <SliderCaptcha
    locale="zh-CN"
    @success="onSuccess"
  />
</template>

<script setup>
import { SliderCaptcha, setLocale } from '@captcha-pro/vue'

// global setting
setLocale('en-US')
</script>
```

---

## 🔐 Backend Verification

```vue
<template>
  <SliderCaptcha
    verify-mode="backend"
    :backend-verify="{
      getCaptcha: '/api/captcha?type=slider',
      verify: '/api/captcha/verify'
    }"
    @success="onSuccess"
  />
</template>

<script setup>
import { SliderCaptcha } from '@captcha-pro/vue'

const onSuccess = () => {
  console.log('Backend verification passed!')
}
</script>
```

---

## 📦 Instance Methods

### Get Verification Data

```vue
<template>
  <SliderCaptcha
    ref="captchaRef"
    @success="onSuccess"
  />
</template>

<script setup>
import { ref } from 'vue'
import { SliderCaptcha } from '@captcha-pro/vue'

const captchaRef = ref()

const onSuccess = () => {
  // get verification data
  const data = captchaRef.value.getData()
  console.log('Target position:', data.target)

  // get statistics
  const stats = captchaRef.value.getStatistics()
  console.log('Success rate:', stats.successRate)
}
</script>
```

### Reset Captcha

```vue
<template>
  <SliderCaptcha ref="captchaRef" />
  <button @click="resetCaptcha">Reset</button>
</template>

<script setup>
import { ref } from 'vue'
import { SliderCaptcha } from '@captcha-pro/vue'

const captchaRef = ref()

const resetCaptcha = () => {
  captchaRef.value.reset()
}
</script>
```

---

## 🔗 Related Links

- [Frontend Integration Guide](../guides/frontend-integration.md)
- [API Reference](../api/README.md)
- [Configuration Options](../api/options.md)
- [Vue 3 Example Code](https://github.com/saqqdy/captcha-pro/blob/master/examples/vue/README.md)
