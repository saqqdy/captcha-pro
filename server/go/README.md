# Captcha Pro Server Demo (Go/Gin)

[中文](./README_CN.md) | English

A Go demo implementation for Captcha Pro backend service using Gin framework. This is a reference implementation to help you integrate captcha-pro with your own backend.

> **Note**: This is a demo/reference implementation. It is NOT published as a Go module. You can copy and adapt this code for your own backend service.

## Features

- 🖼️ **Server-side Image Generation** - Images generated on backend
- 🔐 **AES-GCM Data Encryption** - Secure encrypted data transmission with PBKDF2 key derivation
- 🛡️ **Security Features** - Rate limiting, IP blacklist, brute-force protection
- 📦 **Multiple Captcha Types** - Slider, click, rotate
- ⚡ **Memory Cache** - Fast in-memory captcha storage
- 🔄 **Auto Expiration** - Automatic captcha cleanup
- 🚀 **High Performance** - Go's native concurrency support

## Requirements

- Go 1.21+

## Quick Start

This is a demo project. Clone the repository and run locally:

```bash
# Navigate to server directory
cd server/go

# Install dependencies
go mod tidy

# Run
go run cmd/server/main.go
```

Server starts at `http://localhost:8082`.

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
| type | string | slider | Captcha type: slider, click, rotate |
| width | number | 280 | Image width |
| height | number | 155 | Image height |
| sliderWidth | number | 50 | Slider width (slider only) |
| sliderHeight | number | 50 | Slider height (slider only) |
| precision | number | 5 | Verification precision |
| clickCount | number | 3 | Click count (click only) |

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
// Backend (Go) - Copy internal/crypto/aes.go to your project
import "your-project/internal/crypto"

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

## Project Structure

```
server/go/
├── cmd/
│   └── server/
│       └── main.go           # Application entry point
├── internal/
│   ├── crypto/
│   │   └── aes.go            # AES-GCM encryption (can be copied to your project)
│   ├── handler/
│   │   ├── captcha.go        # Captcha handlers
│   │   └── security.go       # Security handlers
│   ├── model/
│   │   └── types.go          # Type definitions
│   ├── security/
│   │   └── manager.go        # Security manager
│   └── service/
│       ├── cache.go          # Memory cache
│       └── generator.go      # Captcha generator
├── go.mod
├── go.sum
└── README.md
```

## Integration Guide

To integrate with your own Go backend:

1. Copy `internal/crypto/aes.go` to your project
2. Use `crypto.DecryptCaptchaData()` to verify encrypted signatures from frontend
3. Implement your own captcha storage (Redis, database, etc.)
4. Customize security settings as needed

## Other Backend Demos

- **Node.js (Express)**: See [server/node](../node/)
- **Java (Spring Boot)**: See [server/java](../java/)

## License

MIT
