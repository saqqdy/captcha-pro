# Vue 3 快速开始

本指南帮助你在 5 分钟内在 Vue 3 项目中集成 captcha-pro。

## 📋 前置要求

- Node.js 18+
- Vue 3+
- 包管理器：pnpm / npm / yarn

---

## 🚀 快速集成

### 1. 安装

```bash
pnpm add @captcha-pro/vue
```

### 2. 基础使用

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
  console.log('验证通过!')
  // 提交表单或继续操作
}

const onFail = () => {
  console.log('验证失败!')
}
</script>
```

### 3. 点选验证码

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
  console.log('验证通过!')
}
</script>
```

### 4. 弹窗验证码

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
    @success="onSuccess"
  />
</template>

<script setup>
import { PopupCaptcha } from '@captcha-pro/vue'

const onSuccess = () => {
  console.log('验证通过!')
}
</script>
```

---

## 🎨 自定义配置

### 自定义图片

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

### 自定义精度

```vue
<template>
  <SliderCaptcha
    :precision="5"
    @success="onSuccess"
  />
</template>
```

### 国际化

```vue
<template>
  <SliderCaptcha
    locale="zh-CN"
    @success="onSuccess"
  />
</template>

<script setup>
import { SliderCaptcha, setLocale } from '@captcha-pro/vue'

// 全局设置
setLocale('en-US')
</script>
```

---

## 🔐 后端验证

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
  console.log('后端验证通过!')
}
</script>
```

---

## 📦 实例方法

### 获取验证数据

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
  // 获取验证数据
  const data = captchaRef.value.getData()
  console.log('目标位置:', data.target)

  // 获取统计数据
  const stats = captchaRef.value.getStatistics()
  console.log('成功率:', stats.successRate)
}
</script>
```

### 重置验证码

```vue
<template>
  <SliderCaptcha ref="captchaRef" />
  <button @click="resetCaptcha">重置</button>
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

## 🔗 相关链接

- [前端集成完整指南](../guides/frontend-integration.md)
- [API 参考手册](../api/)
- [配置选项详解](../api/options.md)
- [Vue 3 示例代码](https://github.com/saqqdy/captcha-pro/blob/master/examples/vue/README.md)