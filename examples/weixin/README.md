# 微信小程序验证码示例

微信原生小程序验证码示例项目。

## 使用方法

### 1. 安装依赖

```bash
# 在项目根目录安装
pnpm install
```

### 2. 构建 NPM

在微信开发者工具中：
1. 打开 `examples/weixin` 目录
2. 点击 **工具** -> **构建 npm**

### 3. 预览

在微信开发者工具中点击 **预览** 或 **真机调试**。

## 组件使用

### 页面配置 (page.json)

```json
{
  "usingComponents": {
    "slider-captcha": "@captcha/mp/weixin/components/slider-captcha",
    "click-captcha": "@captcha/mp/weixin/components/click-captcha"
  }
}
```

### 模板 (wxml)

```xml
<!-- 滑块验证码 -->
<slider-captcha
  width="{{300}}"
  height="{{170}}"
  precision="{{5}}"
  show-refresh="{{true}}"
  bind:success="onSuccess"
  bind:fail="onFail"
/>

<!-- 点击验证码 -->
<click-captcha
  width="{{300}}"
  height="{{170}}"
  count="{{3}}"
  show-refresh="{{true}}"
  bind:success="onSuccess"
  bind:fail="onFail"
/>
```

### 逻辑 (js)

```javascript
Page({
  onSuccess() {
    wx.showToast({ title: '验证成功', icon: 'success' })
  },

  onFail() {
    wx.showToast({ title: '验证失败', icon: 'error' })
  }
})
```

## Properties

### slider-captcha

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | Number | 300 | 验证码宽度 |
| height | Number | 170 | 验证码高度 |
| precision | Number | 5 | 验证精度 |
| show-refresh | Boolean | true | 显示刷新按钮 |

### click-captcha

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | Number | 300 | 验证码宽度 |
| height | Number | 170 | 验证码高度 |
| count | Number | 3 | 点击次数 |
| show-refresh | Boolean | true | 显示刷新按钮 |

## Events

| 事件 | 说明 |
|------|------|
| bind:success | 验证成功 |
| bind:fail | 验证失败 |
