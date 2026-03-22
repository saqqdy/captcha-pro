# uni-app 小程序验证码示例

基于 uni-app 框架的小程序验证码示例项目。

## 使用方法

### 1. 安装依赖

```bash
# 在项目根目录安装
pnpm install
```

### 2. 构建验证码组件

```bash
# 构建 @captcha/mp 包
pnpm --filter @captcha/mp build
```

### 3. 运行示例

```bash
# 开发模式
pnpm --filter captcha-uniapp-example dev:mp-weixin

# 构建
pnpm --filter captcha-uniapp-example build:mp-weixin
```

### 4. 在微信开发者工具中打开

用微信开发者工具打开 `examples/uniapp/dist/dev/mp-weixin` 目录。

## 组件使用

```vue
<template>
  <slider-captcha
    :width="300"
    :height="170"
    :precision="5"
    :show-refresh="true"
    @success="onSuccess"
    @fail="onFail"
  />
</template>

<script>
import { SliderCaptcha, ClickCaptcha } from '@captcha/mp/uniapp'

export default {
  components: {
    SliderCaptcha,
    ClickCaptcha
  }
}
</script>
```

## Props

### SliderCaptcha

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | Number | 300 | 验证码宽度 |
| height | Number | 170 | 验证码高度 |
| precision | Number | 5 | 验证精度 |
| showRefresh | Boolean | true | 显示刷新按钮 |

### ClickCaptcha

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | Number | 300 | 验证码宽度 |
| height | Number | 170 | 验证码高度 |
| count | Number | 3 | 点击次数 |
| showRefresh | Boolean | true | 显示刷新按钮 |

## Events

| 事件 | 说明 |
|------|------|
| success | 验证成功 |
| fail | 验证失败 |
| refresh | 刷新验证码 |
