# API Reference

captcha-pro exposes four captcha classes, shared option types, and instance methods.

## Classes

| Class | Description |
|-------|-------------|
| `SliderCaptcha` | Puzzle slider verification |
| `ClickCaptcha` | Text click verification |
| `PopupCaptcha` | Modal wrapper around slider or click |
| `InvisibleCaptcha` | Risk-based invisible verification |

## Factory Functions

```javascript
import {
  createSliderCaptcha,
  createClickCaptcha,
  createInvisibleCaptcha,
  createPopupCaptcha
} from '@captcha-pro/core'
```

## Helper Functions

| Function | Description |
|----------|-------------|
| `setLocale(locale)` | Set the global locale (`zh-CN` / `en-US`) |
| `getLocale()` | Get the current locale |
| `t(key)` | Get a translated string |
| `decryptCaptchaData(signature, secretKey)` | Decrypt AES-GCM signed data (backend) |
| `validateTimestamp(timestamp, tolerance)` | Validate a timestamp against a tolerance (backend) |

## Sections

- [Options](/api/options) — All option tables (per type + shared types)
- [Methods](/api/methods) — All instance methods
