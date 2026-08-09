# Slider Captcha

Puzzle verification with random shapes (square / triangle / trapezoid / pentagon) and decoy holes with random rotation.

## Example

```javascript
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

const data = captcha.getData()
console.log('Target position:', data.target)
```

## Options

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

See [API Options](/api/options) for `BackendVerifyOptions` and `SecurityOptions`.

## Instance Methods

| Method | Description |
|--------|-------------|
| `verify(data)` | Manually verify captcha |
| `reset()` | Reset captcha state |
| `refresh()` | Generate new captcha |
| `destroy()` | Destroy captcha instance |
| `getData()` | Get captcha data |
| `getSignedData()` | Get signed data for backend verification |
| `getStatistics()` | Get verification statistics |
| `resetStatistics()` | Reset statistics |
