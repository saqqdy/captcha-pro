<div style="text-align: center;" align="center">

# captcha-pro

一个轻量级的行为验证码库，支持滑动拼图、点选文字和智能无感验证，框架无关

[![NPM version][npm-image]][npm-url]
[![Codacy Badge][codacy-image]][codacy-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]
[![gzip][gzip-image]][gzip-url]
[![License][license-image]][license-url]

[![Sonar][sonar-image]][sonar-url]

</div>

<div style="text-align: center; margin-bottom: 20px;" align="center">

### **[文档](https://www.saqqdy.com/captcha-pro)** · **[更新日志](./CHANGELOG.md)** · **[English](./README.md)**

</div>

## 特性

### 验证码类型

- 🧩 **滑动拼图验证码** - 支持随机形状（方形/三角形/梯形/五边形），迷惑坑位随机旋转
- 🖱️ **点选文字验证码** - 200+ 中文词汇支持，每个词汇不含重复字，随机迷惑文字防机器人
- 👻 **智能无感验证** - 基于风险评估的隐形验证，行为追踪与分析
- 📦 **弹窗验证码** - 模态弹窗包装器，支持元素点击或编程式触发

### 验证模式

- 🎯 **前端模式** - 纯前端验证，无需后端
- 🌐 **后端模式** - 服务端验证与图片生成

### 安全特性

- 🔐 **数据签名** - HMAC-SHA256 签名防止数据篡改
- ⏱️ **时间戳验证** - 防止重放攻击
- 🚦 **频率限制** - 防止 API 滥用（默认 60 次/分钟）
- 🚫 **IP 黑名单** - 支持临时/永久封禁恶意 IP
- 🛡️ **暴力破解防护** - 检测并封禁暴力破解攻击

### 其他特性

- 📊 **统计 API** - 追踪验证成功率、耗时、距离
- 🚀 **框架无关** - 可用于 Vue、React、Angular 或原生 JS
- 📦 **轻量级** - 约 35KB 压缩后，无额外依赖
- 🖼️ **自定义图片** - 支持自定义背景和滑块图片
- 📱 **移动端友好** - 完整支持触摸事件
- 🌐 **IE11+ 支持** - 需要 Promise polyfill

## 安装

```bash
# 使用 pnpm
$ pnpm install captcha-pro

# 使用 npm
$ npm install captcha-pro --save

# 使用 yarn
$ yarn add captcha-pro
```

## 使用

### 滑动拼图验证码

```html
<div id="slider-captcha"></div>

<script type="module">
  import { SliderCaptcha } from 'captcha-pro'

  const captcha = new SliderCaptcha({
    el: '#slider-captcha',
    width: 300,
    height: 170,
    precision: 5,
    showRefresh: true,
    onSuccess: () => console.log('验证通过！'),
    onFail: () => console.log('验证失败！')
  })

  // 获取验证数据
  const data = captcha.getData()
  console.log('目标位置:', data.target)

  // 获取统计数据
  const stats = captcha.getStatistics()
  console.log('成功率:', stats.successRate + '%')

  // 重置或销毁
  captcha.reset()
  captcha.destroy()
</script>
```

### 点选文字验证码

```html
<div id="click-captcha"></div>

<script type="module">
  import { ClickCaptcha } from 'captcha-pro'

  const captcha = new ClickCaptcha({
    el: '#click-captcha',
    width: 300,
    height: 170,
    count: 3,
    onSuccess: () => console.log('验证通过！')
  })

  // 获取已点击的点位
  const points = captcha.getClickPoints()
</script>
```

### 弹窗验证码

```html
<button id="submit-btn">提交</button>

<script type="module">
  import { PopupCaptcha } from 'captcha-pro'

  const popup = new PopupCaptcha({
    trigger: '#submit-btn',
    type: 'slider', // 'slider' | 'click'
    modal: {
      title: '安全验证',
      maskClosable: true,    // 点击遮罩关闭
      escClosable: true,     // ESC 键关闭
      showClose: true,       // 显示关闭按钮
    },
    captchaOptions: {
      width: 300,
      height: 170,
      precision: 5,
    },
    autoClose: true,
    closeDelay: 500,
    onSuccess: () => console.log('验证通过！'),
    onOpen: () => console.log('弹窗已打开'),
    onClose: () => console.log('弹窗已关闭')
  })

  // 编程式控制
  popup.show()         // 显示弹窗
  popup.hide()         // 隐藏弹窗
  popup.isVisible()    // 获取可见状态
  popup.getCaptcha()   // 获取内部验证码实例
</script>
```

### 智能无感验证

```html
<button id="submit-btn">提交</button>

<script type="module">
  import { InvisibleCaptcha } from 'captcha-pro'

  const captcha = new InvisibleCaptcha({
    el: '#submit-btn',
    trigger: 'click',
    riskAssessment: {
      threshold: 0.7, // 风险分数 > 0.7 时显示验证码
      behaviorCheck: {
        minInteractionTime: 500,
        trackAnalysis: true
      }
    },
    challengeType: 'slider', // 'slider' | 'click'
    onChallenge: () => console.log('显示验证码挑战...'),
    onSuccess: () => form.submit(),
    onFail: () => console.log('验证失败')
  })

  // 获取风险分数
  const score = captcha.getRiskScore()
</script>
```

### 安全特性

```javascript
import { SliderCaptcha } from 'captcha-pro'

// 带 HMAC-SHA256 签名用于后端验证
const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    secretKey: 'your-secret-key',  // 与后端共享
    enableSign: true,
    timestampTolerance: 60000      // 60秒
  },
  onSuccess: async () => {
    // 获取带签名的数据用于后端验证
    const signedData = await captcha.getSignedData()
    // signedData 包含: type, target, timestamp, nonce, signature

    // 发送到后端
    await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify(signedData)
    })
  }
})

// 后端验证示例（Node.js）
import { createHmac } from 'crypto'

function verifyCaptcha(data, secretKey) {
  // 检查时间戳
  if (Math.abs(Date.now() - data.timestamp) > 60000) {
    return { valid: false, error: '时间戳已过期' }
  }

  // 验证签名
  const message = `${data.type}|${JSON.stringify(data.target)}|${data.timestamp}|${data.nonce}`
  const expectedSign = createHmac('sha256', secretKey)
    .update(message)
    .digest('hex')

  return expectedSign === data.signature
    ? { valid: true }
    : { valid: false, error: '签名无效' }
}
```

### 后端验证模式

```javascript
import { SliderCaptcha } from 'captcha-pro'

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
  onSuccess: () => console.log('后端验证通过！'),
  onFail: () => console.log('验证失败')
})
```

### 统计 API

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

### 自定义图片

```javascript
import { SliderCaptcha } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha',
  bgImage: '/path/to/background.jpg',
  sliderImage: '/path/to/slider.png', // 可选，不提供则自动生成
  width: 300,
  height: 200,
  sliderWidth: 60,
  sliderHeight: 60,
  onSuccess: () => console.log('验证通过！')
})
```

### 工厂函数

```javascript
import {
  createSliderCaptcha,
  createClickCaptcha,
  createInvisibleCaptcha,
  createPopupCaptcha
} from 'captcha-pro'

const slider = createSliderCaptcha({ el: '#slider' })
const click = createClickCaptcha({ el: '#click' })
const invisible = createInvisibleCaptcha({ el: '#btn' })
const popup = createPopupCaptcha({ type: 'slider' })
```

### 浏览器直接引入（IIFE）

```html
<head>
  <!-- IE11 需要先引入 Promise polyfill -->
  <!--[if IE]>
  <script src="https://cdn.jsdelivr.net/npm/core-js-bundle/minified.js"></script>
  <![endif]-->
  <script src="https://unpkg.com/captcha-pro/dist/index.global.min.js"></script>
</head>
<body>
  <div id="captcha"></div>
  <script>
    const captcha = new CaptchaPro.SliderCaptcha({
      el: '#captcha',
      onSuccess: () => alert('验证成功！')
    })
  </script>
</body>
```

## 后端服务

在 `server/node` 目录下提供了完整的后端服务，用于服务端图片生成和验证。

### 快速开始

```bash
cd server/node
pnpm install
pnpm dev
```

服务运行在 `http://localhost:3001`

### API 接口

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/captcha` | 生成验证码图片 |
| POST | `/api/captcha/verify` | 验证验证码 |
| GET | `/api/health` | 健康检查 |
| GET | `/api/info` | 服务信息 |

### 生成验证码

**GET** `/api/captcha?type=slider&width=300&height=170`

查询参数：

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `type` | string | `slider` | 验证码类型：`slider` 或 `click` |
| `width` | number | `300` | 图片宽度 |
| `height` | number | `170` | 图片高度 |
| `precision` | number | `5` | 验证精度 |
| `clickCount` | number | `3` | 点击数量（点选类型） |

响应：

```json
{
  "success": true,
  "data": {
    "captchaId": "uuid-string",
    "type": "slider",
    "bgImage": "data:image/png;base64,...",
    "sliderImage": "data:image/png;base64,...",
    "width": 300,
    "height": 170,
    "expiresAt": 1700000000000
  }
}
```

### 验证验证码

**POST** `/api/captcha/verify`

请求体：

```json
{
  "captchaId": "uuid-string",
  "type": "slider",
  "target": [123]
}
```

响应：

```json
{
  "success": true,
  "message": "验证成功",
  "data": { "verifiedAt": 1700000000000 }
}
```

### 安全管理接口

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/security/status/:ip` | 获取 IP 安全状态 |
| GET | `/api/security/blacklist` | 获取黑名单列表 |
| POST | `/api/security/blacklist` | 添加 IP 到黑名单 |
| DELETE | `/api/security/blacklist/:ip` | 从黑名单移除 IP |

### 环境变量

| 变量 | 默认值 | 描述 |
|------|---------|------|
| `PORT` | `3001` | 服务端口 |
| `HOST` | `localhost` | 服务主机 |
| `SECRET_KEY` | `captcha-pro-secret-key` | 签名密钥 |
| `EXPIRE_TIME` | `60000` | 验证码过期时间（毫秒） |
| `TIMESTAMP_TOLERANCE` | `60000` | 时间戳容差（毫秒） |

### 前端对接后端

```javascript
import { SliderCaptcha } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
    verify: 'http://localhost:3001/api/captcha/verify'
  },
  onSuccess: () => console.log('后端验证通过！')
})
```

## API 参考

### SliderCaptcha 选项

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

### ClickCaptcha 选项

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

### InvisibleCaptcha 选项

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

### PopupCaptcha 选项

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

### SecurityOptions

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `secretKey` | `string` | - | HMAC-SHA256 签名密钥 |
| `enableSign` | `boolean` | `false` | 启用数据签名 |
| `timestampTolerance` | `number` | `60000` | 时间戳容差（毫秒） |

### BackendVerifyOptions

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `getCaptcha` | `string \| Function` | - | 获取验证码的 URL 或函数 |
| `verify` | `string \| Function` | - | 验证验证码的 URL 或函数 |
| `headers` | `object` | - | 请求头 |
| `timeout` | `number` | `10000` | 请求超时（毫秒） |

### 实例方法

| 方法 | 描述 |
|------|------|
| `verify(data)` | 手动验证 |
| `reset()` | 重置验证码状态 |
| `refresh()` | 生成新的验证码 |
| `destroy()` | 销毁验证码实例 |
| `getData()` | 获取验证码数据 |
| `getSignedData()` | 获取带签名的数据用于后端验证 |
| `getStatistics()` | 获取验证统计 |
| `resetStatistics()` | 重置统计数据 |

### PopupCaptcha 实例方法

| 方法 | 描述 |
|------|------|
| `show()` | 显示弹窗 |
| `hide()` | 隐藏弹窗 |
| `isVisible()` | 获取可见状态 |
| `getCaptcha()` | 获取内部验证码实例 |
| `destroy()` | 销毁弹窗实例 |

### InvisibleCaptcha 实例方法

| 方法 | 描述 |
|------|------|
| `getRiskScore()` | 获取当前风险分数（0-1） |
| `showChallenge()` | 手动显示挑战 |
| `destroy()` | 销毁实例 |

## 构建输出

| 文件 | 格式 | 大小 | 用途 |
|------|------|------|------|
| `index.mjs` | ESM | 35KB | 打包工具（webpack、vite、rollup） |
| `index.cjs` | CommonJS | 36KB | Node.js、旧版打包工具 |
| `index.global.js` | IIFE | 57KB | 浏览器（开发版） |
| `index.global.min.js` | IIFE | 34KB | 浏览器（生产版） |

## 浏览器支持

| ![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) |
| --- | --- | --- | --- | --- |
| Chrome ✓ | Firefox ✓ | Safari ✓ | Opera ✓ | IE 11+ ✓ |

> **IE11 说明**：需要 Promise polyfill。

## 本地开发

```bash
# 克隆并安装
git clone https://github.com/saqqdy/captcha-pro.git
cd captcha-pro
pnpm install

# 构建、测试、lint
pnpm build
pnpm test
pnpm lint

# 运行后端服务
cd server/node && pnpm dev
```

## 许可证

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/captcha-pro.svg?style=flat-square
[npm-url]: https://npmjs.org/package/captcha-pro
[codacy-image]: https://app.codacy.com/project/badge/Grade/f70d4880e4ad4f40aa970eb9ee9d0696
[codacy-url]: https://www.codacy.com/gh/saqqdy/captcha-pro/dashboard?utm_source=github.com&utm_medium=referral&utm_content=saqqdy/captcha-pro&utm_campaign=Badge_Grade
[codecov-image]: https://img.shields.io/codecov/c/github/saqqdy/captcha-pro.svg?style=flat-square
[codecov-url]: https://codecov.io/github/saqqdy/captcha-pro?branch=master
[download-image]: https://img.shields.io/npm/dm/captcha-pro.svg?style=flat-square
[download-url]: https://npmjs.org/package/captcha-pro
[gzip-image]: http://img.badgesize.io/https://unpkg.com/captcha-pro/dist/index.global.min.js?compression=gzip&label=gzip%20size:%20JS
[gzip-url]: http://img.badgesize.io/https://unpkg.com/captcha-pro/dist/index.global.min.js?compression=gzip&label=gzip%20size:%20JS
[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: LICENSE
[sonar-image]: https://sonarcloud.io/api/project_badges/quality_gate?project=saqqdy_captcha-pro
[sonar-url]: https://sonarcloud.io/dashboard?id=saqqdy_captcha-pro
