# Captcha Pro 服务端示例 (Node.js)

中文 | [English](./README.md)

基于 Express 5 的验证码生成与验证服务示例实现。这是一个参考实现，帮助您将 captcha-pro 集成到自己的后端服务中。

> **注意**：这是一个演示/参考实现，不会作为 npm 包发布。您可以复制并根据需要修改代码来构建自己的后端服务。

## 功能特性

- 🖼️ **服务端图片生成** - 使用 canvas 在后端生成验证码图片
- 🔐 **AES-GCM 数据加密** - 使用 PBKDF2 密钥派生的安全加密传输
- 🛡️ **安全防护** - 请求限流、IP黑名单、防暴力破解
- 📦 **多种验证码类型** - 滑动拼图、点选文字、旋转验证
- ⚡ **内存缓存** - 快速的内存缓存存储
- 🔄 **自动过期** - 验证码自动过期清理

## 快速开始

这是一个演示项目，克隆仓库并在本地运行：

```bash
# 进入服务端目录
cd server/node

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 生产构建
pnpm build
pnpm start
```

## 快速开始

### 开发模式

```bash
pnpm dev
```

服务将在 `http://localhost:3001` 启动。

## API 接口

### 验证码接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/captcha` | 生成验证码 |
| POST | `/api/captcha/verify` | 验证验证码 |
| GET | `/api/health` | 健康检查 |
| GET | `/api/info` | 服务信息 |

### 安全管理接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/security/status/:ip` | 获取 IP 安全状态 |
| GET | `/api/security/blacklist` | 获取黑名单列表 |
| POST | `/api/security/blacklist` | 添加 IP 到黑名单 |
| DELETE | `/api/security/blacklist/:ip` | 移除 IP 黑名单 |

## 生成验证码

**GET** `/api/captcha`

查询参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | slider | 验证码类型: slider, click, rotate |
| width | number | 280 | 图片宽度 |
| height | number | 155 | 图片高度 |
| sliderWidth | number | 50 | 滑块宽度 (仅slider) |
| sliderHeight | number | 50 | 滑块高度 (仅slider) |
| precision | number | 5 | 验证精度 |
| clickCount | number | 3 | 点击数量 (仅click) |
| clickText | string | - | 自定义点击文字 (仅click) |

响应示例：

```json
{
  "success": true,
  "data": {
    "captchaId": "uuid-string",
    "type": "slider",
    "bgImage": "data:image/png;base64,...",
    "sliderImage": "data:image/png;base64,...",
    "width": 280,
    "height": 155,
    "expiresAt": 1700000000000
  }
}
```

## 验证验证码

**POST** `/api/captcha/verify`

### 明文模式

```json
{
  "captchaId": "uuid-string",
  "type": "slider",
  "target": [123]
}
```

- `slider`: target 为 `[x坐标]`
- `click`: target 为 `[{x, y}, {x, y}, ...]`
- `rotate`: target 为 `[角度]`

### 加密模式 (AES-GCM)

当前端启用 `security.enableSign` 时，发送加密数据：

```json
{
  "captchaId": "uuid-string",
  "signature": "base64编码的加密数据"
}
```

签名包含 AES-GCM 加密的 JSON 数据：
- `type`: 验证码类型
- `target`: 验证目标
- `timestamp`: Unix 时间戳 (会验证 `TIMESTAMP_TOLERANCE`)
- `nonce`: 随机字符串，防止重放攻击

响应示例：

```json
{
  "success": true,
  "message": "验证成功",
  "data": {
    "verifiedAt": 1700000000000
  }
}
```

## AES-GCM 加密

### 算法详情

| 参数 | 值 |
|------|-----|
| 加密算法 | AES-256-GCM |
| 密钥派生 | PBKDF2 |
| 哈希算法 | SHA-256 |
| 迭代次数 | 100,000 |
| 盐值长度 | 16 字节 |
| IV 长度 | 12 字节 |
| 认证标签 | 16 字节 (包含在密文中) |

### 数据格式

```
base64(salt[16] + iv[12] + ciphertext + authTag[16])
```

### 使用示例

```typescript
// 前端
import { SliderCaptcha, decryptCaptchaData } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    secretKey: 'your-secret-key',
    enableSign: true
  },
  onSuccess: async () => {
    const signedData = await captcha.getSignedData()
    // 将 signedData.signature 发送到后端
  }
})

// 后端 (Node.js) - 从 server/node/src/crypto.ts 复制
import { decryptCaptchaData, validateTimestamp } from './crypto'

async function verifyCaptcha(encryptedData: string, secretKey: string) {
  const data = await decryptCaptchaData(encryptedData, secretKey)

  if (!validateTimestamp(data.timestamp, 60000)) {
    throw new Error('时间戳已过期')
  }

  return data // { type, target, timestamp, nonce }
}
```

## 安全功能

### 请求限流

- 默认限制：每分钟 60 次请求
- 封锁时长：5 分钟
- 响应头：`X-RateLimit-Remaining`、`Retry-After`

### IP 黑名单

```bash
# 添加 IP 到黑名单
curl -X POST http://localhost:3001/api/security/blacklist \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100", "reason": "可疑活动", "duration": 3600000}'

# 移除 IP 黑名单
curl -X DELETE http://localhost:3001/api/security/blacklist/192.168.1.100

# 获取黑名单列表
curl http://localhost:3001/api/security/blacklist
```

### 防暴力破解

- 最大失败尝试次数：10 次
- 统计窗口：5 分钟
- 封锁时长：15 分钟
- 多次违规自动加入黑名单

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| PORT | 3001 | 服务端口 |
| HOST | localhost | 服务主机 |
| SECRET_KEY | captcha-pro-secret-key | AES-GCM 加密密钥 |
| EXPIRE_TIME | 60000 | 验证码过期时间 (ms) |
| TIMESTAMP_TOLERANCE | 60000 | 时间戳容忍度 (ms) |

## 前端集成示例

```typescript
import { SliderCaptcha } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha-container',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
    verify: 'http://localhost:3001/api/captcha/verify',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  security: {
    secretKey: 'your-secret-key',
    enableSign: true
  },
  onSuccess: () => {
    console.log('验证成功！')
  },
  onFail: () => {
    console.log('验证失败')
  }
})
```

## 项目结构

```
server/node/
├── src/
│   ├── index.ts              # Express 服务入口
│   ├── captcha-generator.ts  # 验证码生成器
│   ├── cache.ts              # 内存缓存
│   ├── crypto.ts             # AES-GCM 加密 (可复制到您的项目)
│   ├── security.ts           # 安全管理器
│   └── types.ts              # 类型定义
├── dist/                     # 编译输出
├── package.json
├── tsconfig.json
├── README.md
└── README_CN.md
```

## 集成指南

将此示例集成到您自己的 Node.js 后端：

1. 将 `src/crypto.ts` 复制到您的项目
2. 使用 `decryptCaptchaData()` 验证前端传来的加密签名
3. 实现您自己的验证码存储（Redis、数据库等）
4. 根据需要自定义安全设置

## 其他后端示例

- **Java (Spring Boot)**: 参见 [server/java](../java/)
- **Go (Gin)**: 参见 [server/go](../go/)

## License

MIT
