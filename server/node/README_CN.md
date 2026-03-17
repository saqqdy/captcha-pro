# @captcha-pro/server

中文 | [English](./README.md)

Captcha Pro 服务端 - 基于 Express 5 的验证码生成与验证服务。

## 功能特性

- 🖼️ **服务端图片生成** - 使用 canvas 在后端生成验证码图片
- 🔐 **服务端验证** - 防止前端绕过验证
- 🛡️ **安全防护** - 请求限流、IP黑名单、防暴力破解
- 📦 **多种验证码类型** - 滑动拼图、点选文字、旋转验证
- ⚡ **内存缓存** - 快速的内存缓存存储
- 🔄 **自动过期** - 验证码自动过期清理

## 安装

```bash
# 使用 pnpm
pnpm install

# 使用 npm
npm install

# 使用 yarn
yarn install
```

## 快速开始

### 开发模式

```bash
pnpm dev
```

服务将在 `http://localhost:3001` 启动。

### 生产模式

```bash
pnpm build
pnpm start
```

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

请求体：

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

响应示例：

```json
{
  "success": true,
  "message": "Verification successful",
  "data": {
    "verifiedAt": 1700000000000
  }
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

### 安全配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `rateLimitMax` | 60 | 每分钟最大请求数 |
| `rateLimitWindow` | 60000 | 限流窗口 (ms) |
| `rateLimitBlockDuration` | 300000 | 限流封锁时长 (ms) |
| `maxFailedAttempts` | 10 | 最大失败尝试次数 |
| `failedAttemptsWindow` | 300000 | 失败尝试窗口 (ms) |
| `bruteForceBlockDuration` | 900000 | 暴力破解封锁时长 (ms) |

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| PORT | 3001 | 服务端口 |
| HOST | localhost | 服务主机 |
| SECRET_KEY | captcha-pro-secret-key | 密钥 |
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
│   ├── cli.ts                # 命令行入口
│   ├── captcha-generator.ts  # 验证码生成器
│   ├── cache.ts              # 内存缓存
│   ├── security.ts           # 安全管理器
│   └── types.ts              # 类型定义
├── dist/                     # 编译输出
├── package.json
├── tsconfig.json
├── README.md
└── README_CN.md
```

## License

MIT
