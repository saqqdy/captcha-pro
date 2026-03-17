# Captcha Pro 服务端示例 (Go/Gin)

中文 | [English](./README.md)

基于 Gin 框架的验证码生成与验证服务示例实现。这是一个参考实现，帮助您将 captcha-pro 集成到自己的后端服务中。

> **注意**：这是一个演示/参考实现，不会作为 Go 模块发布。您可以复制并根据需要修改代码来构建自己的后端服务。

## 功能特性

- 🖼️ **服务端图片生成** - 在后端生成验证码图片
- 🔐 **AES-GCM 数据加密** - 使用 PBKDF2 密钥派生的安全加密传输
- 🛡️ **安全防护** - 请求限流、IP黑名单、防暴力破解
- 📦 **多种验证码类型** - 滑动拼图、点选文字、旋转验证
- ⚡ **内存缓存** - 快速的内存缓存存储
- 🔄 **自动过期** - 验证码自动过期清理
- 🚀 **高性能** - Go 原生并发支持

## 环境要求

- Go 1.21+

## 快速开始

这是一个演示项目，克隆仓库并在本地运行：

```bash
# 进入服务端目录
cd server/go

# 安装依赖
go mod tidy

# 运行
go run cmd/server/main.go
```

服务将在 `http://localhost:8082` 启动。

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
| type | string | slider | 验证码类型: slider, click, rotate |
| width | number | 280 | 图片宽度 |
| height | number | 155 | 图片高度 |
| sliderWidth | number | 50 | 滑块宽度 (仅slider) |
| sliderHeight | number | 50 | 滑块高度 (仅slider) |
| precision | number | 5 | 验证精度 |
| clickCount | number | 3 | 点击数量 (仅click) |

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
// 后端 (Go) - 从 internal/crypto/aes.go 复制到您的项目
import "your-project/internal/crypto"

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

## 项目结构

```
server/go/
├── cmd/
│   └── server/
│       └── main.go           # 应用入口
├── internal/
│   ├── crypto/
│   │   └── aes.go            # AES-GCM 加密 (可复制到您的项目)
│   ├── handler/
│   │   ├── captcha.go        # 验证码处理器
│   │   └── security.go       # 安全处理器
│   ├── model/
│   │   └── types.go          # 类型定义
│   ├── security/
│   │   └── manager.go        # 安全管理器
│   └── service/
│       ├── cache.go          # 内存缓存
│       └── generator.go      # 验证码生成器
├── go.mod
├── go.sum
└── README.md
```

## 集成指南

将此示例集成到您自己的 Go 后端：

1. 将 `internal/crypto/aes.go` 复制到您的项目
2. 使用 `crypto.DecryptCaptchaData()` 验证前端传来的加密签名
3. 实现您自己的验证码存储（Redis、数据库等）
4. 根据需要自定义安全设置

## 其他后端示例

- **Node.js (Express)**: 参见 [server/node](../node/)
- **Java (Spring Boot)**: 参见 [server/java](../java/)

## License

MIT
