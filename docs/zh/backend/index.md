# 后端

`server/` 目录下提供了后端服务的参考实现。这些是**参考实现，不是发布的包** — 请将所需代码复制到自己的后端项目中。

| 目录 | 框架 | 端口 | 描述 |
|------|------|------|------|
| `server/node` | Express 5 | 3001 | Node.js 后端示例 |
| `server/java` | Spring Boot 3 | 8080 | Java 后端示例 |
| `server/go` | Gin | 8082 | Go 后端示例 |

## 快速开始（Node.js 示例）

```bash
cd server/node
pnpm install
pnpm dev
```

服务运行在 `http://localhost:3001`。详见各服务端目录的 README。

## API 接口

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/captcha` | 生成验证码图片 |
| POST | `/api/captcha/verify` | 验证验证码 |
| GET | `/api/health` | 健康检查 |
| GET | `/api/info` | 服务信息 |

### 生成验证码

**GET** `/api/captcha?type=slider&width=300&height=170`

| 参数 | 类型 | 默认值 | 描述 |
|------|------|---------|------|
| `type` | string | `slider` | 验证码类型：`slider` 或 `click` |
| `width` | number | `300` | 图片宽度 |
| `height` | number | `170` | 图片高度 |
| `precision` | number | `5` | 验证精度 |
| `clickCount` | number | `3` | 点击数量（点选类型） |

响应（滑动）：

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

响应（点选）包含 `clickTexts` 与 `clickCharImages`，不含 `sliderImage`/`sliderY`。

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

## 安全管理接口

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/security/status/:ip` | 获取 IP 安全状态 |
| GET | `/api/security/blacklist` | 获取黑名单列表 |
| POST | `/api/security/blacklist` | 添加 IP 到黑名单 |
| DELETE | `/api/security/blacklist/:ip` | 从黑名单移除 IP |

## 环境变量

| 变量 | 默认值 | 描述 |
|------|---------|------|
| `PORT` | `3001`（Node）/ `8080`（Java）/ `8082`（Go） | 服务端口 |
| `HOST` | `localhost` | 服务主机 |
| `SECRET_KEY` | `captcha-pro-secret-key` | AES-GCM 加密密钥 |
| `EXPIRE_TIME` | `60000` | 验证码过期时间（毫秒） |
| `TIMESTAMP_TOLERANCE` | `60000` | 时间戳容差（毫秒） |

## 前端对接后端

```javascript
import { SliderCaptcha } from 'captcha-pro'

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

## 各服务端指南

- [Node.js](/zh/backend/node) · [Java](/zh/backend/java) · [Go](/zh/backend/go)
