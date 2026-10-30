# 后端集成指南

本指南帮助你在后端项目中集成 captcha-pro 验证服务。

## 📋 目录

- [快速开始](#快速开始)
- [API 端点](#api-端点)
- [请求响应格式](#请求响应格式)
- [安全配置](#安全配置)
- [示例代码](#示例代码)

## 快速开始

captcha-pro 提供了三种后端语言的示例实现：

### Node.js (Express)

```bash
cd server/node
pnpm install
pnpm dev
```

服务运行在 `http://localhost:3001`

### Java (Spring Boot)

```bash
cd server/java
./gradlew bootRun
```

服务运行在 `http://localhost:8080`

### Go (Gin)

```bash
cd server/go
go run main.go
```

服务运行在 `http://localhost:8082`

## API 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/captcha` | 生成验证码图片 |
| POST | `/api/captcha/verify` | 验证用户输入 |
| GET | `/api/health` | 健康检查 |
| GET | `/api/info` | 服务信息 |

## 请求响应格式

### 生成验证码

**请求：**

```
GET /api/captcha?type=slider&width=300&height=170
```

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | string | `slider` | 验证码类型：`slider` 或 `click` |
| `width` | number | `300` | 图片宽度 |
| `height` | number | `170` | 图片高度 |
| `precision` | number | `5` | 验证精度 |
| `clickCount` | number | `3` | 点击次数（click 类型） |

**响应：**

```json
{
  "success": true,
  "data": {
    "captchaId": "uuid-string",
    "type": "slider",
    "bgImage": "data:image/png;base64,...",
    "sliderImage": "data:image/png;base64,...",
    "sliderY": 42,
    "width": 300,
    "height": 170,
    "expiresAt": 1700000000000
  }
}
```

### 验证用户输入

**请求：**

```
POST /api/captcha/verify
Content-Type: application/json

{
  "captchaId": "uuid-string",
  "type": "slider",
  "target": [123]
}
```

**响应：**

```json
{
  "success": true,
  "message": "Verification successful",
  "data": {
    "verifiedAt": 1700000000000
  }
}
```

## 安全配置

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3001` (Node.js) / `8080` (Java) / `8082` (Go) | 服务端口 |
| `HOST` | `localhost` | 服务主机 |
| `SECRET_KEY` | `captcha-pro-secret-key` | AES-GCM 加密密钥 |
| `EXPIRE_TIME` | `60000` | 验证码过期时间（毫秒） |
| `TIMESTAMP_TOLERANCE` | `60000` | 时间戳容差（毫秒） |

### 安全端点

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/security/status/:ip` | 获取 IP 安全状态 |
| GET | `/api/security/blacklist` | 获取黑名单列表 |
| POST | `/api/security/blacklist` | 添加 IP 到黑名单 |
| DELETE | `/api/security/blacklist/:ip` | 从黑名单移除 IP |

## 示例代码

### Node.js 实现

```javascript
import express from 'express'
import { SliderCaptchaBackend } from '@captcha-pro/core'

const app = express()
const captchaBackend = new SliderCaptchaBackend({
  secretKey: process.env.SECRET_KEY,
  expireTime: 60000
})

// 生成验证码
app.get('/api/captcha', async (req, res) => {
  const { type = 'slider', width = 300, height = 170 } = req.query

  const captcha = await captchaBackend.generate({
    type,
    width,
    height
  })

  res.json({
    success: true,
    data: captcha
  })
})

// 验证
app.post('/api/captcha/verify', async (req, res) => {
  const { captchaId, type, target } = req.body

  const result = await captchaBackend.verify({
    captchaId,
    type,
    target
  })

  res.json({
    success: result.valid,
    message: result.message,
    data: result.data
  })
})

app.listen(3001, () => {
  console.log('Server running at http://localhost:3001')
})
```

### 前端配合

```javascript
import { SliderCaptcha } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
    verify: 'http://localhost:3001/api/captcha/verify'
  },
  onSuccess: () => console.log('后端验证通过!')
})
```

## 数据加密

### 后端加密示例（Node.js）

```javascript
import { encrypt, decrypt } from '@captcha-pro/core'

// 加密验证数据
const encryptedData = encrypt({
  target: 123,
  timestamp: Date.now()
}, secretKey)

// 解密并验证
const decrypted = decrypt(encryptedData, secretKey)
console.log('目标位置:', decrypted.target)
```

## 频率限制

默认限制：60 次/分钟

### 自定义限制

```javascript
const captchaBackend = new SliderCaptchaBackend({
  rateLimit: {
    maxRequests: 100,    // 最大请求数
    windowMs: 60000      // 时间窗口（毫秒）
  }
})
```

## IP 黑名单

```javascript
// 添加到黑名单
await captchaBackend.addToBlacklist('192.168.1.100', {
  reason: '暴力破解',
  duration: 3600000 // 1 小时
})

// 从黑名单移除
await captchaBackend.removeFromBlacklist('192.168.1.100')

// 检查状态
const status = await captchaBackend.getIpStatus('192.168.1.100')
console.log('是否在黑名单:', status.blacklisted)
```

## 🔗 相关链接

- [Node.js 后端示例](https://github.com/saqqdy/captcha-pro/blob/master/server/node/README.md)
- [Java 后端示例](https://github.com/saqqdy/captcha-pro/blob/master/server/java/README.md)
- [Go 后端示例](https://github.com/saqqdy/captcha-pro/blob/master/server/go/README.md)
- [前端集成指南](./frontend-integration.md)
- [安全特性详解](./security.md)