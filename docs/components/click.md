# Click Captcha

Text click verification with 200+ Chinese vocabulary support. Each word has no duplicate characters, random decoy characters are inserted, and prompt images prevent machine recognition.

## Example

```javascript
import { ClickCaptcha } from 'captcha-pro'

const captcha = new ClickCaptcha({
  el: '#click-captcha',
  width: 300,
  height: 170,
  count: 3,
  onSuccess: () => console.log('Verification passed!')
})

const points = captcha.getClickPoints()
```

## Options

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

See [API Options](/api/options) for `BackendVerifyOptions` and `SecurityOptions`.

## Instance Methods

| Method | Description |
|--------|-------------|
| `verify(data)` | Manually verify captcha |
| `reset()` | Reset captcha state |
| `refresh()` | Generate new captcha |
| `destroy()` | Destroy captcha instance |
| `getClickPoints()` | Get clicked points |
| `getSignedData()` | Get signed data for backend verification |
| `getStatistics()` | Get verification statistics |
| `resetStatistics()` | Reset statistics |
