# @captcha-pro/taro-vue2

Taro + Vue 2 captcha components for captcha-pro (backend-only mode).

**[简体中文](./README_CN.md)**

## Installation

```bash
pnpm add @captcha-pro/taro-vue2
```

## Usage

### Global Registration

```javascript
import Vue from 'vue'
import CaptchaPro from '@captcha-pro/taro-vue2'
import '@captcha-pro/taro-vue2/dist/style.css'

Vue.use(CaptchaPro)
```

### Component Usage

```vue
<template>
  <div>
    <!-- Slider Captcha -->
    <SliderCaptcha
      :width="300"
      :height="170"
      :precision="5"
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
  </div>
</template>

<script>
export default {
  methods: {
    onSuccess() {
      console.log('Verification passed!')
    },
    onFail() {
      console.log('Verification failed!')
    }
  }
}
</script>
```

## Props

### SliderCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | Number | 300 | Container width |
| height | Number | 170 | Container height |
| precision | Number | 5 | Verification precision (px) |
| showRefresh | Boolean | true | Show refresh button |
| locale | String | 'zh-CN' | Language |

### ClickCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | Number | 300 | Container width |
| height | Number | 170 | Container height |
| count | Number | 3 | Click points count |
| showRefresh | Boolean | true | Show refresh button |

### PopupCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | String | 'slider' | 'slider' or 'click' |
| trigger | String | - | Trigger element selector |
| autoClose | Boolean | true | Auto close on success |

## Events

| Event | Description |
|-------|-------------|
| success | Verification passed |
| fail | Verification failed |
| refresh | Captcha refreshed |
| ready | Component ready |

## License

MIT