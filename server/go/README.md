# Captcha Pro Go Server

[中文](./README_CN.md) | English

A Go captcha verification service for Gin framework with server-side image generation.

## Features

- 🖼️ **Server-side Image Generation** - Images generated on backend using gg library
- 🔐 **AES-GCM Data Encryption** - Secure encrypted data transmission with PBKDF2 key derivation
- 🛡️ **Security Features** - Rate limiting, IP blacklist, brute-force protection
- 📦 **Multiple Captcha Types** - Slider, click
- ⚡ **Memory Cache** - Fast in-memory captcha storage
- 🔄 **Auto Expiration** - Automatic captcha cleanup
- 🚀 **High Performance** - Go's native concurrency
- 🌍 **i18n Support** - Built-in internationalization (zh-CN, en-US) via `Accept-Language` header

## Installation

### As a Library

```bash
go get github.com/saqqdy/captcha-pro/server/go
```

### Standalone Server

```bash
cd server/go
go mod tidy
go run cmd/server/main.go
```

## Usage

### Library Integration

```go
package main

import (
    "github.com/gin-gonic/gin"
    "github.com/saqqdy/captcha-pro/server/go/pkg/captcha"
)

func main() {
    r := gin.Default()

    // Create captcha server with configuration
    server := captcha.New(captcha.Config{
        SecretKey:  "your-secret-key",
        ExpireTime: 60000,
        TimestampTolerance: 60000,
        Security: captcha.SecurityConfig{
            EnableRateLimit: true,
            RateLimitMax:    60,
        },
    })

    // Apply security middleware (optional)
    r.Use(server.Middleware())

    // Register routes
    server.RegisterRoutes(r)

    r.Run(":8080")
}
```

### Standalone Server

```bash
# Set environment variables (optional)
export SECRET_KEY=your-secret-key
export PORT=8082

# Run server
go run cmd/server/main.go
```

Server starts at `http://localhost:8082`.

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8082` | Server port |
| `HOST` | `localhost` | Server host |
| `SECRET_KEY` | `captcha-pro-secret-key` | AES-GCM encryption key |
| `EXPIRE_TIME` | `60000` | Captcha expire time (ms) |
| `TIMESTAMP_TOLERANCE` | `60000` | Timestamp tolerance (ms) |
| `ENABLE_RATE_LIMIT` | `true` | Enable rate limiting |
| `RATE_LIMIT_MAX` | `60` | Max requests per window |
| `RATE_LIMIT_WINDOW` | `60000` | Rate limit window (ms) |
| `ENABLE_BLACKLIST` | `true` | Enable IP blacklist |
| `ENABLE_BRUTE_FORCE` | `true` | Enable brute-force protection |
| `MAX_FAILED_ATTEMPTS` | `10` | Max failed attempts |

### Config Struct

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

## API Endpoints

### Captcha APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/captcha` | Generate captcha |
| POST | `/api/captcha/verify` | Verify captcha |
| GET | `/api/health` | Health check |
| GET | `/api/info` | Server info |

### Security APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/security/status/:ip` | Get IP security status |
| GET | `/api/security/blacklist` | Get blacklist entries |
| POST | `/api/security/blacklist` | Add IP to blacklist |
| DELETE | `/api/security/blacklist/:ip` | Remove IP from blacklist |

## Generate Captcha

**GET** `/api/captcha?type=slider&width=280&height=155`

Query Parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| type | string | slider | Captcha type: slider, click |
| width | number | 280 | Image width |
| height | number | 155 | Image height |
| sliderWidth | number | 50 | Slider width (slider only) |
| sliderHeight | number | 50 | Slider height (slider only) |
| precision | number | 5 | Verification precision |
| clickCount | number | 3 | Click count (click only) |
| clickText | string | - | Custom click text (click only) |

## Verify Captcha

**POST** `/api/captcha/verify`

### Plain Mode

```json
{
  "captchaId": "uuid-string",
  "type": "slider",
  "target": [123]
}
```

### Encrypted Mode (AES-GCM)

When frontend enables `security.enableSign`, it sends encrypted data:

```json
{
  "captchaId": "uuid-string",
  "signature": "base64-encoded-encrypted-data"
}
```

## AES-GCM Encryption

### Algorithm Details

| Parameter | Value |
|-----------|-------|
| Algorithm | AES-256-GCM |
| Key Derivation | PBKDF2 |
| Hash | SHA-256 |
| Iterations | 100,000 |
| Salt Length | 16 bytes |
| IV Length | 12 bytes |
| GCM Tag Length | 128 bits |

### Data Format

```
base64(salt[16] + iv[12] + ciphertext + authTag[16])
```

### Usage Example

```go
import "github.com/saqqdy/captcha-pro/server/go/internal/crypto"

func verifyCaptcha(encryptedData, secretKey string) (*crypto.CaptchaData, error) {
    data, err := crypto.DecryptCaptchaData(encryptedData, secretKey)
    if err != nil {
        return nil, err
    }

    if !crypto.ValidateTimestamp(data.Timestamp, 60000) {
        return nil, errors.New("timestamp expired")
    }

    return data, nil // { Type, Target, Timestamp, Nonce }
}
```

## Security Features

### Rate Limiting
- Default: 60 requests per minute
- Block duration: 5 minutes
- Headers: `X-RateLimit-Remaining`, `Retry-After`

### IP Blacklist
```bash
# Add IP to blacklist
curl -X POST http://localhost:8082/api/security/blacklist \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100", "reason": "Suspicious activity", "duration": 3600000}'

# Remove IP from blacklist
curl -X DELETE http://localhost:8082/api/security/blacklist/192.168.1.100
```

### Brute-Force Protection
- Max failed attempts: 10
- Window: 5 minutes
- Block duration: 15 minutes

## Frontend Integration

```javascript
import { SliderCaptcha } from '@captcha-pro/core'

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

## Project Structure

```
server/go/
├── cmd/
│   └── server/
│       └── main.go           # Standalone server entry point
├── pkg/
│   └── captcha/
│       ├── config.go         # Configuration types
│       ├── server.go         # Main server and routes
│       ├── generator.go      # Captcha image generator
│       ├── cache.go          # Memory cache
│       └── security.go       # Security manager
├── internal/
│   ├── crypto/
│   │   └── aes.go            # AES-GCM encryption
│   ├── types/
│   │   └── captcha.go        # Type definitions
│   └── i18n/
│       ├── i18n.go           # i18n core module
│       ├── zh-CN.go          # Chinese messages
│       └── en-US.go          # English messages
├── middleware/
│   └── i18n.go               # i18n middleware
├── go.mod
├── go.sum
├── README.md
└── README_CN.md
```

## i18n Support

The server supports internationalization via the `Accept-Language` HTTP header.

### Supported Languages

| Language | Code |
|----------|------|
| Chinese (Simplified) | `zh-CN` |
| English | `en-US` |

### Usage

```bash
# Chinese response
curl -H "Accept-Language: zh-CN" http://localhost:8082/api/captcha?type=slider

# English response
curl -H "Accept-Language: en-US" http://localhost:8082/api/captcha?type=slider
```

## Customization

### Custom Cache Implementation

```go
// Implement your own cache (e.g., Redis)
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

### Middleware Only

```go
// Use only the security middleware
r.Use(server.Middleware())
```

## Other Backend Demos

- **Node.js (Express)**: See [server/node](../node/)
- **Java (Spring Boot)**: See [server/java](../java/)

## License

MIT

## Start Server & Verify Guide (No Coding Experience Needed)

This section is for people who have never run a backend service before. Follow it step by step and you will have the captcha service running in your browser.

### 1. What software to install

**Go 1.21 or newer** — Go to https://go.dev/dl/, download the installer for your system (macOS: `.pkg`; Windows: `.msi`), and double-click to install. Use all default options.

How to check it worked: open a terminal (macOS: the "Terminal" app; Windows: PowerShell) and run `go version`. You should see something like `go1.21.x`.

### 2. Start the service

In the terminal:

```bash
# Go into the server directory (replace the path with your own)
cd /your/path/to/captcha-pro/server/go

# (Optional, first time) download and tidy dependencies
go mod tidy

# Start the server
go run cmd/server/main.go
```

The first time you run this, Go downloads dependencies, which can take a few minutes and may look stuck — wait for it. When you see a line like `Captcha Pro Server running at http://localhost:8082`, the service has started. Keep this terminal window open — closing it stops the service.

> The entry file is `cmd/server/main.go` (not `main.go` at the root).

### 3. Verify it works

Open your web browser (Chrome, Safari, Edge, any one). In the address bar, paste this and press Enter:

```
http://localhost:8082/api/captcha?type=slider
```

If you see a page full of text starting with something like `{"success":true,"data":{"captchaId":...,"bgImage":...}}`, then it works — that JSON is the captcha data your service just generated.

You can also try the health check: open `http://localhost:8082/api/health`.

### 4. Build (optional)

If you only want to run the service locally, `go run cmd/server/main.go` is enough — no build needed. If you want a single runnable file:

```bash
go build -o captcha-server ./cmd/server
```

This produces an executable file:
- macOS/Linux: `captcha-server` — run it with `./captcha-server`
- Windows: `captcha-server.exe` — double-click it or run `captcha-server.exe` in PowerShell

### 5. Common errors and fixes

- **Dependency download times out / is very slow** — This is a network issue. Configure a Go module proxy mirror and retry:
  ```bash
  go env -w GOPROXY=https://goproxy.cn,direct
  ```
  Then run `go mod tidy` and `go run cmd/server/main.go` again.
- **`listen tcp :8082: bind: address already in use` (port in use)** — Another program is using port 8082. Either close it, or start on a different port: `PORT=8083 go run cmd/server/main.go` (macOS/Linux), or in PowerShell `$env:PORT=8083; go run cmd/server/main.go`.
- **`go: command not found`** — Go did not install or is not in your PATH. Reopen the terminal, or reinstall Go.

### 6. Connect it to a frontend example

The frontend demos in this repo (for example `examples/vue`) can talk to this service. In the frontend demo, set the backend address to `http://localhost:8082`, so the captcha fetch URL is `http://localhost:8082/api/captcha?type=slider` and the verify URL is `http://localhost:8082/api/captcha/verify`. See each frontend example's own README for the exact config field name.
