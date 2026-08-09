# 选项

## SliderCaptcha 选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `el` | `string \| HTMLElement` | - | 容器元素或选择器 |
| `bgImage` | `string` | - | 背景图片 URL |
| `sliderImage` | `string` | - | 滑块图片 URL |
| `width` | `number` | `300` | 容器宽度 |
| `height` | `number` | `170` | 容器高度 |
| `sliderWidth` | `number` | `42` | 滑块宽度 |
| `sliderHeight` | `number` | `42` | 滑块高度 |
| `precision` | `number` | `5` | 验证精度（像素） |
| `showRefresh` | `boolean` | `true` | 显示刷新按钮 |
| `className` | `string` | `'captcha-slider'` | 自定义类名 |
| `verifyMode` | `'frontend' \| 'backend'` | `'frontend'` | 验证模式 |
| `backendVerify` | `BackendVerifyOptions` | - | 后端验证配置 |
| `security` | `SecurityOptions` | - | 安全选项 |
| `onSuccess` | `() => void` | - | 验证成功回调 |
| `onFail` | `() => void` | - | 验证失败回调 |
| `onRefresh` | `() => void` | - | 刷新回调 |

## ClickCaptcha 选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `el` | `string \| HTMLElement` | - | 容器元素或选择器 |
| `width` | `number` | `300` | 容器宽度 |
| `height` | `number` | `170` | 容器高度 |
| `count` | `number` | `3` | 点击点数量 |
| `showRefresh` | `boolean` | `true` | 显示刷新按钮 |
| `className` | `string` | `'captcha-click'` | 自定义类名 |
| `verifyMode` | `'frontend' \| 'backend'` | `'frontend'` | 验证模式 |
| `backendVerify` | `BackendVerifyOptions` | - | 后端验证配置 |
| `security` | `SecurityOptions` | - | 安全选项 |
| `onSuccess` | `() => void` | - | 验证成功回调 |
| `onFail` | `() => void` | - | 验证失败回调 |
| `onRefresh` | `() => void` | - | 刷新回调 |

## InvisibleCaptcha 选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `el` | `string \| HTMLElement` | - | 触发元素或选择器 |
| `trigger` | `'click' \| 'submit' \| 'focus'` | `'click'` | 触发事件 |
| `riskAssessment` | `RiskAssessmentOptions` | - | 风险评估配置 |
| `challengeType` | `'slider' \| 'click'` | `'slider'` | 挑战验证码类型 |
| `challengeOptions` | `object` | - | 挑战验证码配置 |
| `onChallenge` | `() => void` | - | 显示挑战时回调 |
| `onSuccess` | `() => void` | - | 验证成功回调 |
| `onFail` | `() => void` | - | 验证失败回调 |

## PopupCaptcha 选项

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `trigger` | `string \| HTMLElement` | - | 触发元素或选择器 |
| `type` | `'slider' \| 'click'` | `'slider'` | 验证码类型 |
| `captchaOptions` | `object` | - | 内部验证码配置 |
| `modal` | `PopupModalOptions` | - | 弹窗配置 |
| `autoClose` | `boolean` | `true` | 验证成功自动关闭 |
| `closeDelay` | `number` | `500` | 关闭延迟（毫秒） |
| `onOpen` | `() => void` | - | 弹窗打开时回调 |
| `onClose` | `() => void` | - | 弹窗关闭时回调 |
| `onSuccess` | `() => void` | - | 验证成功回调 |
| `onFail` | `() => void` | - | 验证失败回调 |

## PopupModalOptions

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `title` | `string` | - | 弹窗标题 |
| `maskClosable` | `boolean` | `true` | 点击遮罩关闭 |
| `escClosable` | `boolean` | `true` | ESC 键关闭 |
| `showClose` | `boolean` | `true` | 显示关闭按钮 |

## SecurityOptions

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `secretKey` | `string` | - | AES-GCM 加密密钥 |
| `enableSign` | `boolean` | `false` | 启用数据签名 |
| `timestampTolerance` | `number` | `60000` | 时间戳容差（毫秒） |

## BackendVerifyOptions

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `getCaptcha` | `string \| Function` | - | 获取验证码的 URL 或函数 |
| `verify` | `string \| Function` | - | 验证验证码的 URL 或函数 |
| `headers` | `object` | - | 请求头 |
| `timeout` | `number` | `10000` | 请求超时（毫秒） |
