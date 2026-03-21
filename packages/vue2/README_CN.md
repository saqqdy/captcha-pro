# captcha-pro-vue2

Captcha Pro 的 Vue 2 组件库。

## 安装

```bash
pnpm add captcha-pro-vue2
```

## 使用

### 全局注册

```javascript
import Vue from 'vue'
import CaptchaPro from 'captcha-pro-vue2'

Vue.use(CaptchaPro)
```

### 组件用法

```vue
<template>
  <div>
    <!-- 滑动拼图验证码 -->
    <SliderCaptcha
      :width="300"
      :height="170"
      :precision="5"
      @success="onSuccess"
      @fail="onFail"
      @refresh="onRefresh"
    />

    <!-- 点选文字验证码 -->
    <ClickCaptcha
      :width="300"
      :height="170"
      :count="3"
      @success="onSuccess"
    />

    <!-- 弹窗验证码 -->
    <PopupCaptcha
      trigger="#submit-btn"
      type="slider"
      @success="onSuccess"
    >
      <button id="submit-btn">提交</button>
    </PopupCaptcha>
  </div>
</template>

<script>
export default {
  methods: {
    onSuccess() {
      console.log('验证通过!')
    },
    onFail() {
      console.log('验证失败!')
    }
  }
}
</script>
```

### 使用 Mixins

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
  // Mixin 提供: data, computed, methods, 生命周期钩子
}
</script>
```

## Props

### SliderCaptcha

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| width | Number | 300 | 容器宽度 |
| height | Number | 170 | 容器高度 |
| bgImage | String | - | 背景图片 URL |
| sliderImage | String | - | 滑块图片 URL |
| precision | Number | 5 | 验证精度（像素） |
| showRefresh | Boolean | true | 显示刷新按钮 |
| verifyMode | String | 'frontend' | 'frontend' 或 'backend' |
| locale | String | 'zh-CN' | 语言 |

### ClickCaptcha

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| width | Number | 300 | 容器宽度 |
| height | Number | 170 | 容器高度 |
| count | Number | 3 | 点击点数量 |
| showRefresh | Boolean | true | 显示刷新按钮 |

### PopupCaptcha

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| type | String | 'slider' | 'slider' 或 'click' |
| trigger | String | - | 触发元素选择器 |
| autoClose | Boolean | true | 验证成功自动关闭 |
| closeDelay | Number | 500 | 关闭延迟（毫秒） |

## Events

| 事件 | 描述 |
|------|------|
| success | 验证通过 |
| fail | 验证失败 |
| refresh | 验证码刷新 |
| ready | 组件就绪 |

## Methods

```javascript
// 通过 ref 访问
this.$refs.captcha.refresh()
this.$refs.captcha.getData()
this.$refs.captcha.getStatistics()
this.$refs.captcha.reset()
```

## 许可证

MIT
