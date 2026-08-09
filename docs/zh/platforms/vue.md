# Vue

captcha-pro 为 Vue 3 与 Vue 2 提供一等公民的组件支持，将相同的选项作为 props、相同的回调作为事件暴露。

## Vue 3

`captcha-pro-vue` 使用 Composition API 与 composables。

```bash
pnpm add captcha-pro-vue
```

```vue
<template>
  <SliderCaptcha
    :width="300"
    :height="170"
    @success="onSuccess"
    @fail="onFail"
  />
</template>

<script setup lang="ts">
import { SliderCaptcha } from 'captcha-pro-vue'

const onSuccess = () => console.log('验证通过!')
const onFail = () => console.log('验证失败')
</script>
```

## Vue 2

`captcha-pro-vue2` 使用 Options API 与 mixins。

```bash
pnpm add captcha-pro-vue2
```

```vue
<template>
  <SliderCaptcha :width="300" :height="170" @success="onSuccess" />
</template>

<script>
import { SliderCaptcha } from 'captcha-pro-vue2'

export default {
  components: { SliderCaptcha },
  methods: {
    onSuccess() { console.log('验证通过!') }
  }
}
</script>
```

## 可用组件

四种验证码类型均作为组件导出：`SliderCaptcha`、`ClickCaptcha`、`PopupCaptcha`、`InvisibleCaptcha`。props 与核心库的[选项](/zh/api/options)一一对应。
