# Vue 3 平台集成指南

本指南详细说明如何在 Vue 3 项目中使用 captcha-pro。

## 📋 目录

- [安装](#安装)
- [基础使用](#基础使用)
- [组件 Props](#组件-props)
- [事件处理](#事件处理)
- [实例方法](#实例方法)
- [Composition API](#composition-api)

---

## 安装

```bash
pnpm add @captcha-pro/vue
```

---

## 基础使用

### 全局注册（可选）

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import CaptchaPro from '@captcha-pro/vue'

const app = createApp(App)
app.use(CaptchaPro)
app.mount('#app')
```

### 组件导入

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
  console.log('验证通过!')
}
</script>
```

---

## 组件 Props

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
  <button id="submit-btn">提交</button>
  <PopupCaptcha
    trigger="#submit-btn"
    type="slider"
    :modal="{
      title: '安全验证',
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

## 事件处理

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
  console.log('验证通过')
  // 提交表单
}

const handleFail = () => {
  console.log('验证失败')
  // 提示用户重试
}

const handleRefresh = () => {
  console.log('用户点击刷新')
  // 可选：记录用户行为
}
</script>
```

---

## 实例方法

### 通过 ref 调用方法

```vue
<template>
  <div>
    <SliderCaptcha
      ref="captchaRef"
      @success="onSuccess"
    />
    <button @click="resetCaptcha">重置</button>
    <button @click="refreshCaptcha">刷新</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SliderCaptcha } from '@captcha-pro/vue'

const captchaRef = ref()

const onSuccess = () => {
  // 获取验证数据
  const data = captchaRef.value?.getData()
  console.log('目标位置:', data?.target)

  // 获取统计数据
  const stats = captchaRef.value?.getStatistics()
  console.log('成功率:', stats?.successRate)
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

### 自定义 Hook

```vue
<template>
  <div>
    <SliderCaptcha
      ref="captchaRef"
      @success="handleSuccess"
    />
    <div v-if="stats">
      <p>总尝试: {{ stats.totalAttempts }}</p>
      <p>成功率: {{ stats.successRate }}%</p>
      <p>平均时间: {{ stats.avgVerifyTime }}ms</p>
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

// 自动刷新（示例：每 5 分钟）
const refreshInterval = setInterval(() => {
  captchaRef.value?.refresh()
}, 5 * 60 * 1000)

// 清理
onUnmounted(() => {
  clearInterval(refreshInterval)
})
</script>
```

### 后端验证

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
  console.log('后端验证通过!')
}
</script>
```

---

## TypeScript 支持

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

// 类型安全的 ref
const captchaRef = ref<SliderCaptchaRef>()

const width: number = 300
const height: number = 170

const onSuccess = () => {
  // 类型安全的方法调用
  const data = captchaRef.value?.getData()
  const stats = captchaRef.value?.getStatistics()
}
</script>
```

---

## 🔗 相关链接

- [Vue 3 快速开始](../quick-start/vue3.md)
- [前端集成指南](../guides/frontend-integration.md)
- [API 参考手册](../api/)
- [配置选项详解](../api/options.md)
- [Vue 3 示例代码](https://github.com/saqqdy/captcha-pro/blob/master/examples/vue/README.md)