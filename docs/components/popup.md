# Popup Captcha

A modal wrapper around the slider or click captcha. Trigger it by an element click, or programmatically via `show()` / `hide()`.

## Example

```javascript
import { PopupCaptcha } from 'captcha-pro'

const popup = new PopupCaptcha({
  trigger: '#submit-btn',
  type: 'slider', // 'slider' | 'click'
  modal: {
    title: 'Security Verification',
    maskClosable: true,
    escClosable: true,
    showClose: true
  },
  captchaOptions: { width: 300, height: 170, precision: 5 },
  autoClose: true,
  closeDelay: 500,
  onSuccess: () => console.log('Verification passed!'),
  onOpen: () => console.log('Popup opened'),
  onClose: () => console.log('Popup closed')
})

popup.show()         // Show popup
popup.hide()         // Hide popup
popup.isVisible()    // Get visibility state
popup.getCaptcha()   // Get inner captcha instance
```

## Options

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

### PopupModalOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | - | Modal title |
| `maskClosable` | `boolean` | `true` | Click mask to close |
| `escClosable` | `boolean` | `true` | Press ESC to close |
| `showClose` | `boolean` | `true` | Show close button |

## Instance Methods

| Method | Description |
|--------|-------------|
| `show()` | Show popup modal |
| `hide()` | Hide popup modal |
| `isVisible()` | Get visibility state |
| `getCaptcha()` | Get inner captcha instance |
| `destroy()` | Destroy popup instance |
