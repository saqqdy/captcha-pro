# captcha-pro-mp

Captcha Pro 小程序包。支持微信小程序、uni-app 和 Taro 3。

## 安装

```bash
pnpm add captcha-pro-mp
```

## 微信小程序

### 使用方法

1. 将 `captcha-pro-mp/weixin/components/` 目录下的文件复制到项目的 `components/` 目录。

2. 在页面 JSON 中注册：

```json
{
  "usingComponents": {
    "slider-captcha": "/components/slider-captcha/slider-captcha",
    "click-captcha": "/components/click-captcha/click-captcha"
  }
}
```

3. 在 WXML 中使用：

```xml
<!-- 滑动拼图验证码 -->
<slider-captcha
  width="{{300}}"
  height="{{170}}"
  precision="{{5}}"
  bind:success="onSuccess"
  bind:fail="onFail"
  bind:refresh="onRefresh"
/>

<!-- 点选文字验证码 -->
<click-captcha
  width="{{300}}"
  height="{{170}}"
  count="{{3}}"
  bind:success="onSuccess"
  bind:fail="onFail"
/>
```

### 组件属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| width | Number | 300 | 容器宽度 |
| height | Number | 170 | 容器高度 |
| precision | Number | 5 | 验证精度 |
| showRefresh | Boolean | true | 显示刷新按钮 |

### Events

| 事件 | 描述 |
|------|------|
| success | 验证通过 |
| fail | 验证失败 |
| refresh | 验证码刷新 |

## uni-app

### 使用方法

```vue
<template>
  <view>
    <!-- 滑动拼图验证码 -->
    <slider-captcha
      :width="300"
      :height="170"
      @success="onSuccess"
      @fail="onFail"
    />

    <!-- 点选文字验证码 -->
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
      uni.showToast({ title: '验证通过!' })
    }
  }
}
</script>
```

## Taro 3

### 使用方法

```tsx
import { View } from '@tarojs/components'
import { SliderCaptcha, ClickCaptcha } from 'captcha-pro-mp/taro'

function Index() {
  const handleSuccess = () => {
    Taro.showToast({ title: '验证通过!' })
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

### TypeScript 支持

```typescript
import type { SliderCaptchaProps, ClickCaptchaProps } from 'captcha-pro-mp/taro'
```

## Props

### SliderCaptcha

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| width | number | 300 | 容器宽度 |
| height | number | 170 | 容器高度 |
| precision | number | 5 | 验证精度 |
| showRefresh | boolean | true | 显示刷新按钮 |

### ClickCaptcha

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| width | number | 300 | 容器宽度 |
| height | number | 170 | 容器高度 |
| count | number | 3 | 点击点数量 |
| precision | number | 20 | 点击精度 |
| showRefresh | boolean | true | 显示刷新按钮 |

## 许可证

MIT
