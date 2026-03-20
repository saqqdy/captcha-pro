# Captcha Pro Go Server

中文 | [English](./README.md)

基于 Gin 框架的 Go 验证码验证服务，支持服务端图片生成。

## 功能特性

- 🖼️ **服务端图片生成** - 使用 gg 库在后端生成验证码图片
- 🔐 **AES-GCM 数据加密** - 使用 PBKDF2 密钥派生的安全加密传输
- 🛡️ **安全防护** - 请求限流、IP黑名单、防暴力破解
- 📦 **多种验证码类型** - 滑动拼图、点选文字、旋转验证
- ⚡ **内存缓存** - 快速的内存缓存存储
- 🔄 **自动过期** - 验证码自动过期清理
- 🚀 **高性能** - Go 原生并发支持
- 🌍 **多语言支持** - 通过 `Accept-Language` 请求头支持中英文国际化

## 安装

### 作为库使用

```bash
go get github.com/saqqdy/captcha-pro/server/go
```

### 独立服务器

```bash
cd server/go
go mod tidy
go run cmd/server/main.go
```

## 使用方式

### 库集成模式

```go
package main

import (
    "github.com/gin-gonic/gin"
    "github.com/saqqdy/captcha-pro/server/go/pkg/captcha"
)

func main() {
    r := gin.Default()

    // 创建验证码服务器
    server := captcha.New(captcha.Config{
        SecretKey:  "your-secret-key",
        ExpireTime: 60000,
        TimestampTolerance: 60000,
        Security: captcha.SecurityConfig{
            EnableRateLimit: true,
            RateLimitMax:    60,
        },
    })

    // 应用安全中间件（可选）
    r.Use(server.Middleware())

    // 注册路由
    server.RegisterRoutes(r)

    r.Run(":8080")
}
```

### 独立服务器模式

```bash
# 设置环境变量（可选）
export SECRET_KEY=your-secret-key
export PORT=8082

# 运行服务器
go run cmd/server/main.go
```

服务将在 `http://localhost:8082` 启动。

## 配置

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `8082` | 服务端口 |
| `HOST` | `localhost` | 服务主机 |
| `SECRET_KEY` | `captcha-pro-secret-key` | AES-GCM 加密密钥 |
| `EXPIRE_TIME` | `60000` | 验证码过期时间 (ms) |
| `TIMESTAMP_TOLERANCE` | `60000` | 时间戳容忍度 (ms) |
| `ENABLE_RATE_LIMIT` | `true` | 启用请求限流 |
| `RATE_LIMIT_MAX` | `60` | 窗口内最大请求数 |
| `RATE_LIMIT_WINDOW` | `60000` | 限流窗口 (ms) |
| `ENABLE_BLACKLIST` | `true` | 启用 IP 黑名单 |
| `ENABLE_BRUTE_FORCE` | `true` | 启用防暴力破解 |
| `MAX_FAILED_ATTEMPTS` | `10` | 最大失败尝试次数 |

### Config 结构体

```go
type Config struct {
    SecretKey          string
    ExpireTime         int64
    TimestampTolerance int64
    Security           SecurityConfig
}

type SecurityConfig struct {
    EnableRateLimit          bool
    RateLimitMax             int
    RateLimitWindow          int64
    RateLimitBlockDuration   int64
    EnableBlacklist          bool
    BlacklistDuration        int64
    EnableBruteForce         bool
    MaxFailedAttempts        int
    FailedAttemptsWindow     int64
    BruteForceBlockDuration  int64
}
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

**GET** `/api/captcha?type=slider&width=280&height=155`

查询参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | slider | 验证码类型: slider, click |
| width | number | 280 | 图片宽度 |
| height | number | 155 | 图片高度 |
| sliderWidth | number | 50 | 滑块宽度 (仅slider) |
| sliderHeight | number | 50 | 滑块高度 (仅slider) |
| precision | number | 5 | 验证精度 |
| clickCount | number | 3 | 点击数量 (仅click) |
| clickText | string | - | 自定义点击文字 (仅click) |

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

### 加密模式 (AES-GCM)

当前端启用 `security.enableSign` 时，发送加密数据：

```json
{
  "captchaId": "uuid-string",
  "signature": "base64编码的加密数据"
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
| GCM 标签长度 | 128 位 |

### 数据格式

```
base64(salt[16] + iv[12] + ciphertext + authTag[16])
```

### 使用示例

```go
import "github.com/saqqdy/captcha-pro/server/go/internal/crypto"

func verifyCaptcha(encryptedData, secretKey string) (*crypto.CaptchaData, error) {
    data, err := crypto.DecryptCaptchaData(encryptedData, secretKey)
    if err != nil {
        return nil, err
    }

    if !crypto.ValidateTimestamp(data.Timestamp, 60000) {
        return nil, errors.New("时间戳已过期")
    }

    return data, nil // { Type, Target, Timestamp, Nonce }
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
curl -X POST http://localhost:8082/api/security/blacklist \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100", "reason": "可疑活动", "duration": 3600000}'

# 移除 IP 黑名单
curl -X DELETE http://localhost:8082/api/security/blacklist/192.168.1.100
```

### 防暴力破解
- 最大失败尝试次数：10 次
- 统计窗口：5 分钟
- 封锁时长：15 分钟

## 前端集成示例

```javascript
import { SliderCaptcha } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha-container',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: 'http://localhost:8082/api/captcha?type=slider',
    verify: 'http://localhost:8082/api/captcha/verify'
  },
  security: {
    secretKey: 'your-secret-key',
    enableSign: true
  }
})
```

## 项目结构

```
server/go/
├── cmd/
│   └── server/
│       └── main.go           # 独立服务入口
├── pkg/
│   └── captcha/
│       ├── config.go         # 配置类型
│       ├── server.go         # 服务器和路由
│       ├── generator.go      # 验证码生成器
│       ├── cache.go          # 内存缓存
│       └── security.go       # 安全管理器
├── internal/
│   ├── crypto/
│   │   └── aes.go            # AES-GCM 加密
│   ├── types/
│   │   └── captcha.go        # 类型定义
│   └── i18n/
│       ├── i18n.go           # i18n 核心模块
│       ├── zh-CN.go          # 中文语言包
│       └── en-US.go          # 英文语言包
├── middleware/
│   └── i18n.go               # i18n 中间件
├── go.mod
├── go.sum
├── README.md
└── README_CN.md
```

## 多语言支持 (i18n)

服务端通过 `Accept-Language` HTTP 请求头支持国际化。

### 支持的语言

| 语言 | 代码 |
|------|------|
| 简体中文 | `zh-CN` |
| English | `en-US` |

### 使用方式

```bash
# 中文响应
curl -H "Accept-Language: zh-CN" http://localhost:8082/api/captcha?type=slider

# 英文响应
curl -H "Accept-Language: en-US" http://localhost:8082/api/captcha?type=slider
```

## 自定义

### 自定义缓存实现

```go
// 实现自己的缓存（如 Redis）
type RedisCache struct {
    client *redis.Client
}

func (c *RedisCache) Get(id string) *types.CaptchaCache {
    // ...
}

func (c *RedisCache) Set(id string, data *types.CaptchaCache, ttl int64) {
    // ...
}
```

### 仅使用中间件

```go
// 仅使用安全中间件
r.Use(server.Middleware())
```

## 其他后端示例

- **Node.js (Express)**: 参见 [server/node](../node/)
- **Java (Spring Boot)**: 参见 [server/java](../java/)

## License

MIT
