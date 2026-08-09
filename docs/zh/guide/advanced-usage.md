# 进阶用法

## 安全特性

captcha-pro 提供 AES-GCM 加密、时间戳校验与签名，防止数据篡改与重放攻击。

```javascript
import { SliderCaptcha, decryptCaptchaData } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    secretKey: 'your-secret-key',  // 与后端共享
    enableSign: true,
    timestampTolerance: 60000      // 60秒
  },
  onSuccess: async () => {
    // 获取加密数据用于后端验证
    const encryptedData = await captcha.getSignedData()
    // encryptedData 包含: type, target, timestamp, nonce, 加密数据

    await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify(encryptedData)
    })
  }
})
```

### 后端验证示例（Node.js）

```javascript
import { decryptCaptchaData, validateTimestamp } from '@captcha-pro/core'

async function verifyCaptcha(encryptedData, secretKey) {
  try {
    // 解密数据
    const data = await decryptCaptchaData(encryptedData.signature, secretKey)

    // 检查时间戳
    if (!validateTimestamp(data.timestamp, 60000)) {
      return { valid: false, error: '时间戳已过期' }
    }

    return { valid: true, data }
  } catch (error) {
    return { valid: false, error: '加密数据无效' }
  }
}
```

## 后端验证模式

除纯前端验证外，可由后端生成与校验验证码图片。

```javascript
import { SliderCaptcha } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend', // 'frontend'（默认）或 'backend'
  backendVerify: {
    getCaptcha: '/api/captcha/get',
    verify: '/api/captcha/verify',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 10000
  },
  onSuccess: () => console.log('后端验证通过!'),
  onFail: () => console.log('验证失败')
})
```

参考后端实现见[后端](/zh/backend/)章节，提供 Node.js、Java、Go 三种实现。

## 统计 API

追踪验证成功率、耗时与拖动距离。

```javascript
const captcha = new SliderCaptcha({ el: '#captcha' })

// 进行一些验证后...
const stats = captcha.getStatistics()
console.log({
  totalAttempts: stats.totalAttempts,
  successCount: stats.successCount,
  failCount: stats.failCount,
  successRate: stats.successRate + '%',
  avgVerifyTime: stats.avgVerifyTime + 'ms',
  avgDragTime: stats.avgDragTime + 'ms',
  avgDragDistance: stats.avgDragDistance + 'px'
})

// 重置统计
captcha.resetStatistics()
```

## 自定义图片

提供自定义背景与滑块图片，替代自动生成的图片。

```javascript
import { SliderCaptcha } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  bgImage: '/path/to/background.jpg',
  sliderImage: '/path/to/slider.png', // 可选，不提供则自动生成
  width: 300,
  height: 200,
  sliderWidth: 60,
  sliderHeight: 60,
  onSuccess: () => console.log('验证通过!')
})
```

## 工厂函数

使用工厂函数代替 `new`，更简洁：

```javascript
import {
  createSliderCaptcha,
  createClickCaptcha,
  createInvisibleCaptcha,
  createPopupCaptcha
} from '@captcha-pro/core'

const slider = createSliderCaptcha({ el: '#slider' })
const click = createClickCaptcha({ el: '#click' })
const invisible = createInvisibleCaptcha({ el: '#btn' })
const popup = createPopupCaptcha({ type: 'slider' })
```

## 浏览器直接引入（IIFE）

没有打包工具的项目可使用全局 IIFE 产物：

```html
<head>
  <!-- IE11 需先引入 Promise polyfill -->
  <!--[if IE]>
  <script src="https://cdn.jsdelivr.net/npm/core-js-bundle/minified.js"></script>
  <![endif]-->
  <script src="https://unpkg.com/@captcha-pro/core/dist/index.global.min.js"></script>
</head>
<body>
  <div id="captcha"></div>
  <script>
    const captcha = new CaptchaPro.SliderCaptcha({
      el: '#captcha',
      onSuccess: () => alert('验证成功!')
    })
  </script>
</body>
```
