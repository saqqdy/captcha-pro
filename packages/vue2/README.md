# captcha-pro-vue2

Vue 2 component library for Captcha Pro.

**[简体中文](./README_CN.md)**

## Installation

```bash
pnpm add captcha-pro-vue2
```

## Usage

### Global Registration

```javascript
import Vue from 'vue'
import CaptchaPro from 'captcha-pro-vue2'

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
      @refresh="onRefresh"
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

### Using Mixins

```vue
<template>
  <div>
    <div ref="containerRef" class="captcha-container" />
    <div v-if="status" class="status" :class="status">
      {{ statusText }}
    </div>
  </div>
</template>

<script>
import { sliderCaptchaMixin } from 'captcha-pro-vue2/mixins'

export default {
  mixins: [sliderCaptchaMixin],
  // Mixin provides: data, computed, methods, lifecycle hooks
}
</script>
```

## Props

### SliderCaptcha

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | Number | 300 | Container width |
| height | Number | 170 | Container height |
| bgImage | String | - | Background image URL |
| sliderImage | String | - | Slider image URL |
| precision | Number | 5 | Verification precision (px) |
| showRefresh | Boolean | true | Show refresh button |
| verifyMode | String | 'frontend' | 'frontend' or 'backend' |
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
| closeDelay | Number | 500 | Close delay (ms) |

## Events

| Event | Description |
|-------|-------------|
| success | Verification passed |
| fail | Verification failed |
| refresh | Captcha refreshed |
| ready | Component ready |

## Methods

```javascript
// Access via ref
this.$refs.captcha.refresh()
this.$refs.captcha.getData()
this.$refs.captcha.getStatistics()
this.$refs.captcha.reset()
```

## License

MIT
