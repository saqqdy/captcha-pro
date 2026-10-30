# 配置选项详解

本文档详细说明 captcha-pro 各组件的配置选项。

## 📋 目录

- [SliderCaptcha 选项](#slidercaptcha-选项)
- [ClickCaptcha 选项](#clickcaptcha-选项)
- [PopupCaptcha 选项](#popupcaptcha-选项)
- [InvisibleCaptcha 选项](#invisiblecaptcha-选项)
- [通用选项](#通用选项)

---

## SliderCaptcha 选项

滑块验证码的完整配置选项：

```typescript
interface SliderCaptchaOptions {
  // 容器（必填）
  el: string | HTMLElement

  // 图片
  bgImage?: string       // 背景图片 URL
  sliderImage?: string   // 滑块图片 URL（可选，默认自动生成）

  // 尺寸
  width?: number         // 容器宽度，默认 300
  height?: number        // 容器高度，默认 170
  sliderWidth?: number   // 滑块宽度，默认 42
  sliderHeight?: number  // 滑块高度，默认 42

  // 验证
  precision?: number     // 验证精度（像素），默认 5
  verifyMode?: 'frontend' | 'backend'  // 验证模式，默认 'frontend'

  // 样式
  showRefresh?: boolean  // 显示刷新按钮，默认 true
  className?: string     // 自定义类名，默认 'captcha-slider'

  // 后端验证
  backendVerify?: BackendVerifyOptions

  // 安全
  security?: SecurityOptions

  // 国际化
  locale?: 'zh-CN' | 'en-US'

  // 回调
  onSuccess?: () => void
  onFail?: () => void
  onRefresh?: () => void
}
```

### 使用示例

```javascript
new SliderCaptcha({
  el: '#captcha',
  width: 300,
  height: 170,
  precision: 5,
  showRefresh: true,
  onSuccess: () => console.log('通过!')
})
```

---

## ClickCaptcha 选项

点选验证码的完整配置选项：

```typescript
interface ClickCaptchaOptions {
  // 容器（必填）
  el: string | HTMLElement

  // 尺寸
  width?: number     // 容器宽度，默认 300
  height?: number    // 容器高度，默认 170

  // 点选
  count?: number     // 点击次数，默认 3

  // 验证
  verifyMode?: 'frontend' | 'backend'  // 验证模式，默认 'frontend'

  // 样式
  showRefresh?: boolean  // 显示刷新按钮，默认 true
  className?: string     // 自定义类名，默认 'captcha-click'

  // 后端验证
  backendVerify?: BackendVerifyOptions

  // 安全
  security?: SecurityOptions

  // 国际化
  locale?: 'zh-CN' | 'en-US'

  // 回调
  onSuccess?: () => void
  onFail?: () => void
  onRefresh?: () => void
}
```

### 使用示例

```javascript
new ClickCaptcha({
  el: '#captcha',
  width: 300,
  height: 170,
  count: 3,
  onSuccess: () => console.log('通过!')
})
```

---

## PopupCaptcha 选项

弹窗验证码的完整配置选项：

```typescript
interface PopupCaptchaOptions {
  // 触发（必填）
  trigger: string | HTMLElement  // 触发元素或选择器

  // 验证码类型
  type: 'slider' | 'click'  // 默认 'slider'

  // 验证码选项
  captchaOptions?: SliderCaptchaOptions | ClickCaptchaOptions

  // 弹窗
  modal?: PopupModalOptions

  // 行为
  autoClose?: boolean   // 成功后自动关闭，默认 true
  closeDelay?: number   // 关闭延迟（毫秒），默认 500

  // 回调
  onOpen?: () => void
  onClose?: () => void
  onSuccess?: () => void
  onFail?: () => void
}
```

### PopupModalOptions

```typescript
interface PopupModalOptions {
  title?: string          // 弹窗标题
  maskClosable?: boolean  // 点击遮罩关闭，默认 true
  escClosable?: boolean   // 按 ESC 关闭，默认 true
  showClose?: boolean     // 显示关闭按钮，默认 true
}
```

### 使用示例

```javascript
new PopupCaptcha({
  trigger: '#submit-btn',
  type: 'slider',
  modal: {
    title: '安全验证',
    maskClosable: true
  },
  captchaOptions: {
    width: 300,
    height: 170
  },
  onSuccess: () => console.log('通过!')
})
```

---

## InvisibleCaptcha 选项

无感验证码的完整配置选项：

```typescript
interface InvisibleCaptchaOptions {
  // 触发（必填）
  el: string | HTMLElement  // 触发元素或选择器

  // 触发事件
  trigger?: 'click' | 'submit' | 'focus'  // 默认 'click'

  // 风险评估
  riskAssessment?: RiskAssessmentOptions

  // 挑战类型
  challengeType?: 'slider' | 'click'  // 默认 'slider'
  challengeOptions?: object  // 挑战验证码的选项

  // 回调
  onChallenge?: () => void  // 显示挑战时触发
  onSuccess?: () => void
  onFail?: () => void
}
```

### RiskAssessmentOptions

```typescript
interface RiskAssessmentOptions {
  threshold?: number  // 风险阈值（0-1），默认 0.7
  behaviorCheck?: {
    minInteractionTime?: number  // 最小交互时间（毫秒）
    trackAnalysis?: boolean      // 轨迹分析
  }
}
```

### 使用示例

```javascript
new InvisibleCaptcha({
  el: '#submit-btn',
  trigger: 'click',
  riskAssessment: {
    threshold: 0.7,
    behaviorCheck: {
      minInteractionTime: 500,
      trackAnalysis: true
    }
  },
  challengeType: 'slider',
  onChallenge: () => console.log('显示挑战...'),
  onSuccess: () => form.submit()
})
```

---

## 通用选项

以下选项适用于所有验证码类型：

### BackendVerifyOptions

```typescript
interface BackendVerifyOptions {
  getCaptcha: string | Function  // 获取验证码的 URL 或函数
  verify: string | Function      // 验证的 URL 或函数
  headers?: object               // 请求头
  timeout?: number               // 超时时间（毫秒），默认 10000
}
```

**示例：**

```javascript
backendVerify: {
  getCaptcha: '/api/captcha?type=slider',
  verify: '/api/captcha/verify',
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 10000
}
```

### SecurityOptions

```typescript
interface SecurityOptions {
  secretKey?: string         // AES-GCM 加密密钥
  enableSign?: boolean       // 启用签名，默认 false
  timestampTolerance?: number // 时间戳容差（毫秒），默认 60000
}
```

**示例：**

```javascript
security: {
  secretKey: 'your-secret-key',
  enableSign: true,
  timestampTolerance: 60000
}
```

---

## 📊 默认值速查表

| 选项 | SliderCaptcha | ClickCaptcha | PopupCaptcha | InvisibleCaptcha |
|------|---------------|--------------|--------------|------------------|
| `width` | 300 | 300 | - | - |
| `height` | 170 | 170 | - | - |
| `precision` | 5 | - | - | - |
| `count` | - | 3 | - | - |
| `showRefresh` | true | true | - | - |
| `verifyMode` | 'frontend' | 'frontend' | - | - |
| `type` | - | - | 'slider' | - |
| `trigger` | - | - | - | 'click' |
| `challengeType` | - | - | - | 'slider' |
| `autoClose` | - | - | true | - |
| `closeDelay` | - | - | 500 | - |

---

## 🔗 相关链接

- [API 参考手册](../api/)
- [前端集成指南](../guides/frontend-integration)
- [后端集成指南](../guides/backend-integration)
