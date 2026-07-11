# @captcha-pro/taro-vue2

captcha-pro 的 Taro + Vue 2 验证码组件（后端模式）。

## 安装

```bash
pnpm add @captcha-pro/taro-vue2
```

## 使用

### 全局注册

```javascript
import Vue from 'vue'
import CaptchaPro from '@captcha-pro/taro-vue2'
import '@captcha-pro/taro-vue2/dist/style.css'

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

## Props

### SliderCaptcha

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| width | Number | 300 | 容器宽度 |
| height | Number | 170 | 容器高度 |
| precision | Number | 5 | 验证精度（像素） |
| showRefresh | Boolean | true | 显示刷新按钮 |
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

## Events

| 事件 | 描述 |
|------|------|
| success | 验证通过 |
| fail | 验证失败 |
| refresh | 验证码刷新 |
| ready | 组件就绪 |

## 许可证

MIT