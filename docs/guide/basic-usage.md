# Basic Usage

captcha-pro ships four captcha types: **Slider**, **Click**, **Popup**, and **Invisible**. All are framework-agnostic and share a consistent options shape.

## Slider Captcha

```html
<div id="slider-captcha"></div>

<script type="module">
  import { SliderCaptcha } from 'captcha-pro'

  const captcha = new SliderCaptcha({
    el: '#slider-captcha',
    width: 300,
    height: 170,
    precision: 5,
    showRefresh: true,
    onSuccess: () => console.log('Verification passed!'),
    onFail: () => console.log('Verification failed!')
  })

  // Get captcha data
  const data = captcha.getData()
  console.log('Target position:', data.target)

  // Reset or destroy
  captcha.reset()
  captcha.destroy()
</script>
```

## Click Captcha

```html
<div id="click-captcha"></div>

<script type="module">
  import { ClickCaptcha } from 'captcha-pro'

  const captcha = new ClickCaptcha({
    el: '#click-captcha',
    width: 300,
    height: 170,
    count: 3,
    onSuccess: () => console.log('Verification passed!')
  })

  // Get clicked points
  const points = captcha.getClickPoints()
</script>
```

## Popup Captcha

```html
<button id="submit-btn">Submit</button>

<script type="module">
  import { PopupCaptcha } from 'captcha-pro'

  const popup = new PopupCaptcha({
    trigger: '#submit-btn',
    type: 'slider', // 'slider' | 'click'
    modal: {
      title: 'Security Verification',
      maskClosable: true,    // Click mask to close
      escClosable: true,     // Press ESC to close
      showClose: true        // Show close button
    },
    captchaOptions: {
      width: 300,
      height: 170,
      precision: 5
    },
    autoClose: true,
    closeDelay: 500,
    onSuccess: () => console.log('Verification passed!'),
    onOpen: () => console.log('Popup opened'),
    onClose: () => console.log('Popup closed')
  })

  // Programmatic control
  popup.show()         // Show popup
  popup.hide()         // Hide popup
  popup.isVisible()    // Get visibility state
  popup.getCaptcha()   // Get inner captcha instance
</script>
```

## Invisible Captcha

```html
<button id="submit-btn">Submit</button>

<script type="module">
  import { InvisibleCaptcha } from 'captcha-pro'

  const captcha = new InvisibleCaptcha({
    el: '#submit-btn',
    trigger: 'click',
    riskAssessment: {
      threshold: 0.7, // Show challenge if risk score > 0.7
      behaviorCheck: {
        minInteractionTime: 500,
        trackAnalysis: true
      }
    },
    challengeType: 'slider', // 'slider' | 'click'
    onChallenge: () => console.log('Showing captcha challenge...'),
    onSuccess: () => form.submit(),
    onFail: () => console.log('Verification failed')
  })

  // Get risk score
  const score = captcha.getRiskScore()
</script>
```

## Framework Components

For Vue 3, React, and Flutter, the same options are exposed as component props:

```vue
<template>
  <SliderCaptcha :width="300" :height="170" @success="onSuccess" />
</template>

<script setup lang="ts">
import { SliderCaptcha } from 'captcha-pro-vue'
const onSuccess = () => console.log('Passed!')
</script>
```

See [Platforms](/platforms/) for framework-specific usage.

## Next Steps

- [Advanced Usage](/guide/advanced-usage) — Security, backend mode, statistics, custom images
- [Components](/components/) — Full options and instance methods per type
