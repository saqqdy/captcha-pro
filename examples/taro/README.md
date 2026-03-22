# Taro 小程序验证码示例

基于 Taro 框架的小程序验证码示例项目。

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
pnpm --filter captcha-taro-example dev:weapp

# 构建
pnpm --filter captcha-taro-example build:weapp
```

### 4. 在微信开发者工具中打开

用微信开发者工具打开 `examples/taro` 目录。

## 组件使用

```tsx
import { SliderCaptcha, ClickCaptcha } from '@captcha/mp/taro'

// 滑块验证码
<SliderCaptcha
  width={300}
  height={170}
  precision={5}
  showRefresh
  onSuccess={() => {}}
  onFail={() => {}}
/>

// 点击验证码
<ClickCaptcha
  width={300}
  height={170}
  count={3}
  showRefresh
  onSuccess={() => {}}
  onFail={() => {}}
/>
```

## Props

### SliderCaptcha

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | number | 300 | 验证码宽度 |
| height | number | 170 | 验证码高度 |
| precision | number | 5 | 验证精度 |
| showRefresh | boolean | true | 显示刷新按钮 |
| onSuccess | () => void | - | 验证成功回调 |
| onFail | () => void | - | 验证失败回调 |

### ClickCaptcha

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | number | 300 | 验证码宽度 |
| height | number | 170 | 验证码高度 |
| count | number | 3 | 点击次数 |
| showRefresh | boolean | true | 显示刷新按钮 |
| onSuccess | () => void | - | 验证成功回调 |
| onFail | () => void | - | 验证失败回调 |
