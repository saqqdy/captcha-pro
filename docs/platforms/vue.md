# Vue

captcha-pro provides first-class Vue components for both Vue 3 and Vue 2, exposing the same options as props and the same callbacks as events.

## Vue 3

`@captcha-pro/vue` uses the Composition API and composables.

```bash
pnpm add @captcha-pro/vue
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
import { SliderCaptcha } from '@captcha-pro/vue'

const onSuccess = () => console.log('Passed!')
const onFail = () => console.log('Failed')
</script>
```

## Vue 2

`@captcha-pro/vue2` uses the Options API and mixins.

```bash
pnpm add @captcha-pro/vue2
```

```vue
<template>
  <SliderCaptcha :width="300" :height="170" @success="onSuccess" />
</template>

<script>
import { SliderCaptcha } from '@captcha-pro/vue2'

export default {
  components: { SliderCaptcha },
  methods: {
    onSuccess() { console.log('Passed!') }
  }
}
</script>
```

## Available Components

All four captcha types are exported as components: `SliderCaptcha`, `ClickCaptcha`, `PopupCaptcha`, and `InvisibleCaptcha`. Props mirror the [options](/api/options) of the core library.
