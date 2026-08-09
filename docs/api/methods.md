# Methods

## Captcha Instance Methods

Shared by `SliderCaptcha` and `ClickCaptcha`:

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

## PopupCaptcha Instance Methods

| Method | Description |
|--------|-------------|
| `show()` | Show popup modal |
| `hide()` | Hide popup modal |
| `isVisible()` | Get visibility state |
| `getCaptcha()` | Get inner captcha instance |
| `destroy()` | Destroy popup instance |

## InvisibleCaptcha Instance Methods

| Method | Description |
|--------|-------------|
| `getRiskScore()` | Get current risk score (0-1) |
| `showChallenge()` | Manually show challenge |
| `destroy()` | Destroy instance |

## Statistics Shape

`getStatistics()` returns:

| Field | Type | Description |
|-------|------|-------------|
| `totalAttempts` | `number` | Total verification attempts |
| `successCount` | `number` | Successful verifications |
| `failCount` | `number` | Failed verifications |
| `successRate` | `number` | Success rate (0-100) |
| `avgVerifyTime` | `number` | Average verify time (ms) |
| `avgDragTime` | `number` | Average drag time (ms) |
| `avgDragDistance` | `number` | Average drag distance (px) |
