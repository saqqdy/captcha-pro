# 弹窗验证码

滑动或点选验证码的模态包装器。可由元素点击触发，或通过 `show()` / `hide()` 编程式控制。

## 示例

```javascript
import { PopupCaptcha } from '@captcha-pro/core'

const popup = new PopupCaptcha({
  trigger: '#submit-btn',
  type: 'slider', // 'slider' | 'click'
  modal: {
    title: '安全验证',
    maskClosable: true,
    escClosable: true,
    showClose: true
  },
  captchaOptions: { width: 300, height: 170, precision: 5 },
  autoClose: true,
  closeDelay: 500,
  onSuccess: () => console.log('验证通过!'),
  onOpen: () => console.log('弹窗已打开'),
  onClose: () => console.log('弹窗已关闭')
})

popup.show()         // 显示弹窗
popup.hide()         // 隐藏弹窗
popup.isVisible()    // 获取可见状态
popup.getCaptcha()   // 获取内部验证码实例
```

## 选项

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

### PopupModalOptions

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `title` | `string` | - | 弹窗标题 |
| `maskClosable` | `boolean` | `true` | 点击遮罩关闭 |
| `escClosable` | `boolean` | `true` | ESC 键关闭 |
| `showClose` | `boolean` | `true` | 显示关闭按钮 |

## 实例方法

| 方法 | 描述 |
|------|------|
| `show()` | 显示弹窗 |
| `hide()` | 隐藏弹窗 |
| `isVisible()` | 获取可见状态 |
| `getCaptcha()` | 获取内部验证码实例 |
| `destroy()` | 销毁弹窗实例 |
