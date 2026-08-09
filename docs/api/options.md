# Options

## SliderCaptcha Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `el` | `string \| HTMLElement` | - | Container element or selector |
| `bgImage` | `string` | - | Background image URL |
| `sliderImage` | `string` | - | Slider image URL |
| `width` | `number` | `300` | Container width |
| `height` | `number` | `170` | Container height |
| `sliderWidth` | `number` | `42` | Slider piece width |
| `sliderHeight` | `number` | `42` | Slider piece height |
| `precision` | `number` | `5` | Verification precision (px) |
| `showRefresh` | `boolean` | `true` | Show refresh button |
| `className` | `string` | `'captcha-slider'` | Custom class name |
| `verifyMode` | `'frontend' \| 'backend'` | `'frontend'` | Verification mode |
| `backendVerify` | `BackendVerifyOptions` | - | Backend verification config |
| `security` | `SecurityOptions` | - | Security options |
| `onSuccess` | `() => void` | - | Success callback |
| `onFail` | `() => void` | - | Fail callback |
| `onRefresh` | `() => void` | - | Refresh callback |

## ClickCaptcha Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `el` | `string \| HTMLElement` | - | Container element or selector |
| `width` | `number` | `300` | Container width |
| `height` | `number` | `170` | Container height |
| `count` | `number` | `3` | Number of click points |
| `showRefresh` | `boolean` | `true` | Show refresh button |
| `className` | `string` | `'captcha-click'` | Custom class name |
| `verifyMode` | `'frontend' \| 'backend'` | `'frontend'` | Verification mode |
| `backendVerify` | `BackendVerifyOptions` | - | Backend verification config |
| `security` | `SecurityOptions` | - | Security options |
| `onSuccess` | `() => void` | - | Success callback |
| `onFail` | `() => void` | - | Fail callback |
| `onRefresh` | `() => void` | - | Refresh callback |

## InvisibleCaptcha Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `el` | `string \| HTMLElement` | - | Trigger element or selector |
| `trigger` | `'click' \| 'submit' \| 'focus'` | `'click'` | Trigger event |
| `riskAssessment` | `RiskAssessmentOptions` | - | Risk assessment config |
| `challengeType` | `'slider' \| 'click'` | `'slider'` | Challenge captcha type |
| `challengeOptions` | `object` | - | Options for challenge captcha |
| `onChallenge` | `() => void` | - | Called when challenge is shown |
| `onSuccess` | `() => void` | - | Success callback |
| `onFail` | `() => void` | - | Fail callback |

## PopupCaptcha Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `trigger` | `string \| HTMLElement` | - | Trigger element or selector |
| `type` | `'slider' \| 'click'` | `'slider'` | Captcha type |
| `captchaOptions` | `object` | - | Options for inner captcha |
| `modal` | `PopupModalOptions` | - | Modal options |
| `autoClose` | `boolean` | `true` | Auto close on success |
| `closeDelay` | `number` | `500` | Delay before close (ms) |
| `onOpen` | `() => void` | - | Called when popup opens |
| `onClose` | `() => void` | - | Called when popup closes |
| `onSuccess` | `() => void` | - | Success callback |
| `onFail` | `() => void` | - | Fail callback |

## PopupModalOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | - | Modal title |
| `maskClosable` | `boolean` | `true` | Click mask to close |
| `escClosable` | `boolean` | `true` | Press ESC to close |
| `showClose` | `boolean` | `true` | Show close button |

## SecurityOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `secretKey` | `string` | - | Secret key for AES-GCM encryption |
| `enableSign` | `boolean` | `false` | Enable data signing |
| `timestampTolerance` | `number` | `60000` | Timestamp tolerance (ms) |

## BackendVerifyOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `getCaptcha` | `string \| Function` | - | URL or function to get captcha |
| `verify` | `string \| Function` | - | URL or function to verify captcha |
| `headers` | `object` | - | Request headers |
| `timeout` | `number` | `10000` | Request timeout (ms) |
