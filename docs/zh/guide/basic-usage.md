# 基础用法

captcha-pro 提供四种验证码类型：**滑动拼图**、**点选文字**、**弹窗验证码**、**智能无感**。它们均框架无关，并共享一致的选项结构。

## 滑动拼图验证码

```html
<div id="slider-captcha"></div>

<script type="module">
  import { SliderCaptcha } from '@captcha-pro/core'

  const captcha = new SliderCaptcha({
    el: '#slider-captcha',
    width: 300,
    height: 170,
    precision: 5,
    showRefresh: true,
    onSuccess: () => console.log('验证通过!'),
    onFail: () => console.log('验证失败!')
  })

  // 获取验证数据
  const data = captcha.getData()
  console.log('目标位置:', data.target)

  // 重置或销毁
  captcha.reset()
  captcha.destroy()
</script>
```

## 点选文字验证码

```html
<div id="click-captcha"></div>

<script type="module">
  import { ClickCaptcha } from '@captcha-pro/core'

  const captcha = new ClickCaptcha({
    el: '#click-captcha',
    width: 300,
    height: 170,
    count: 3,
    onSuccess: () => console.log('验证通过!')
  })

  // 获取已点击的点位
  const points = captcha.getClickPoints()
</script>
```

## 弹窗验证码

```html
<button id="submit-btn">提交</button>

<script type="module">
  import { PopupCaptcha } from '@captcha-pro/core'

  const popup = new PopupCaptcha({
    trigger: '#submit-btn',
    type: 'slider', // 'slider' | 'click'
    modal: {
      title: '安全验证',
      maskClosable: true,    // 点击遮罩关闭
      escClosable: true,     // ESC 键关闭
      showClose: true        // 显示关闭按钮
    },
    captchaOptions: {
      width: 300,
      height: 170,
      precision: 5
    },
    autoClose: true,
    closeDelay: 500,
    onSuccess: () => console.log('验证通过!'),
    onOpen: () => console.log('弹窗已打开'),
    onClose: () => console.log('弹窗已关闭')
  })

  // 编程式控制
  popup.show()         // 显示弹窗
  popup.hide()         // 隐藏弹窗
  popup.isVisible()    // 获取可见状态
  popup.getCaptcha()   // 获取内部验证码实例
</script>
```

## 智能无感验证

```html
<button id="submit-btn">提交</button>

<script type="module">
  import { InvisibleCaptcha } from '@captcha-pro/core'

  const captcha = new InvisibleCaptcha({
    el: '#submit-btn',
    trigger: 'click',
    riskAssessment: {
      threshold: 0.7, // 风险分数 > 0.7 时显示验证码
      behaviorCheck: {
        minInteractionTime: 500,
        trackAnalysis: true
      }
    },
    challengeType: 'slider', // 'slider' | 'click'
    onChallenge: () => console.log('显示验证码挑战...'),
    onSuccess: () => form.submit(),
    onFail: () => console.log('验证失败')
  })

  // 获取风险分数
  const score = captcha.getRiskScore()
</script>
```

## 框架组件

Vue 3、React、Flutter 以组件 props 的形式暴露相同的选项：

```vue
<template>
  <SliderCaptcha :width="300" :height="170" @success="onSuccess" />
</template>

<script setup lang="ts">
import { SliderCaptcha } from '@captcha-pro/vue'
const onSuccess = () => console.log('验证通过!')
</script>
```

框架特定用法见[多平台](/zh/platforms/)。

## 下一步

- [进阶用法](/zh/guide/advanced-usage) — 安全、后端模式、统计、自定义图片
- [验证码类型](/zh/components/) — 各类型的完整选项与实例方法
