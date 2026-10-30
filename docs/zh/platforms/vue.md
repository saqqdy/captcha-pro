# Vue 平台集成指南

本指南详细说明如何在 Vue 2 和 Vue 3 项目中使用 captcha-pro。

## 📋 目录

- [Vue 3](#vue-3)
- [Vue 2](#vue-2)
- [组件 Props](#组件-props)
- [事件处理](#事件处理)
- [实例方法](#实例方法)
- [TypeScript 支持](#typescript-支持)

---

## Vue 3

`@captcha-pro/vue` 使用 Composition API 和 composables。

### 安装

```bash
pnpm add @captcha-pro/vue
```

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

### 基础使用

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

### 组件 Props

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

### 弹窗验证码

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

### 事件处理

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

### 通过 ref 调用实例方法

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

## Vue 2

`@captcha-pro/vue2` 使用 Options API 和 mixins。

### 安装

```bash
pnpm add @captcha-pro/vue2
```

### 基础使用

```vue
<template>
  <SliderCaptcha
    :width="300"
    :height="170"
    @success="onSuccess"
  />
</template>

<script>
import { SliderCaptcha } from '@captcha-pro/vue2'

export default {
  components: { SliderCaptcha },
  methods: {
    onSuccess() {
      console.log('验证通过!')
    }
  }
}
</script>
```

### 可用组件

四种验证码类型均作为组件导出：`SliderCaptcha`、`ClickCaptcha`、`PopupCaptcha`、`InvisibleCaptcha`。Props 与核心库的[选项](../api/options)一一对应。

```vue
<template>
  <div>
    <!-- 滑块 -->
    <SliderCaptcha
      :width="300"
      :height="170"
      @success="onSuccess"
    />

    <!-- 点选 -->
    <ClickCaptcha
      :width="300"
      :height="170"
      :count="3"
      @success="onSuccess"
    />

    <!-- 弹窗 -->
    <PopupCaptcha
      trigger="#submit-btn"
      type="slider"
      @success="onSuccess"
    />
  </div>
</template>

<script>
import {
  SliderCaptcha,
  ClickCaptcha,
  PopupCaptcha
} from '@captcha-pro/vue2'

export default {
  components: {
    SliderCaptcha,
    ClickCaptcha,
    PopupCaptcha
  },
  methods: {
    onSuccess() {
      console.log('验证通过!')
    }
  }
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

- [Vue 3 快速开始](../quick-start/vue3)
- [前端集成指南](../guides/frontend-integration)
- [API 参考手册](../api/)
- [配置选项详解](../api/options)
- [Vue 示例代码](https://github.com/saqqdy/captcha-pro/blob/master/examples/vue/README.md)
