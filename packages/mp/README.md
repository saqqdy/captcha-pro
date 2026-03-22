# captcha-pro-mp

Mini-program package for Captcha Pro. Supports WeChat Mini-Program, uni-app, and Taro 3.

**[简体中文](./README_CN.md)**

## Installation

```bash
pnpm add captcha-pro-mp
```

## WeChat Mini-Program

### Usage

1. Copy files from `captcha-pro-mp/weixin/components/` to your project's `components/` directory.

2. Register in page JSON:

```json
{
  "usingComponents": {
    "slider-captcha": "/components/slider-captcha/slider-captcha",
    "click-captcha": "/components/click-captcha/click-captcha"
  }
}
```

3. Use in WXML:

```xml
<!-- Slider Captcha -->
<slider-captcha
  width="{{300}}"
  height="{{170}}"
  precision="{{5}}"
  bind:success="onSuccess"
  bind:fail="onFail"
  bind:refresh="onRefresh"
/>

<!-- Click Captcha -->
<click-captcha
  width="{{300}}"
  height="{{170}}"
  count="{{3}}"
  bind:success="onSuccess"
  bind:fail="onFail"
/>
```

### Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| width | Number | 300 | Container width |
| height | Number | 170 | Container height |
| precision | Number | 5 | Verification precision |
| showRefresh | Boolean | true | Show refresh button |

### Events

| Event | Description |
|-------|-------------|
| success | Verification passed |
| fail | Verification failed |
| refresh | Captcha refreshed |

## uni-app

### Usage

```vue
<template>
  <view>
    <!-- Slider Captcha -->
    <slider-captcha
      :width="300"
      :height="170"
      @success="onSuccess"
      @fail="onFail"
    />

    <!-- Click Captcha -->
    <click-captcha
      :width="300"
      :height="170"
      :count="3"
      @success="onSuccess"
    />
  </view>
</template>

<script>
import SliderCaptcha from 'captcha-pro-mp/uniapp/components/slider-captcha.vue'
import ClickCaptcha from 'captcha-pro-mp/uniapp/components/click-captcha.vue'

export default {
  components: { SliderCaptcha, ClickCaptcha },
  methods: {
    onSuccess() {
      uni.showToast({ title: 'Verification passed!' })
    }
  }
}
</script>
```

## Taro 3

### Usage

```tsx
import { View } from '@tarojs/components'
import { SliderCaptcha, ClickCaptcha } from 'captcha-pro-mp/taro'

function Index() {
  const handleSuccess = () => {
    Taro.showToast({ title: 'Verification passed!' })
  }

  return (
    <View>
      <SliderCaptcha
        width={300}
        height={170}
        onSuccess={handleSuccess}
      />
      <ClickCaptcha
        width={300}
        height={170}
        count={3}
        onSuccess={handleSuccess}
      />
    </View>
  )
}
```

### TypeScript Support

```typescript
import type { SliderCaptchaProps, ClickCaptchaProps } from 'captcha-pro-mp/taro'
```

## Props

### SliderCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | number | 300 | Container width |
| height | number | 170 | Container height |
| precision | number | 5 | Verification precision |
| showRefresh | boolean | true | Show refresh button |

### ClickCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | number | 300 | Container width |
| height | number | 170 | Container height |
| count | number | 3 | Click points count |
| precision | number | 20 | Click precision |
| showRefresh | boolean | true | Show refresh button |

## License

MIT
