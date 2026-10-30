# Backend Integration Guide

This guide helps you integrate captcha-pro verification services into your backend project.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Request/Response Format](#request-response-format)
- [Security Configuration](#security-configuration)
- [Example Code](#example-code)

## Quick Start

captcha-pro provides example implementations in three backend languages:

### Node.js (Express)

```bash
cd server/node
pnpm install
pnpm dev
```

The service runs at `http://localhost:3001`

### Java (Spring Boot)

```bash
cd server/java
./gradlew bootRun
```

The service runs at `http://localhost:8080`

### Go (Gin)

```bash
cd server/go
go run main.go
```

The service runs at `http://localhost:8082`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/captcha` | Generate captcha image |
| POST | `/api/captcha/verify` | Verify user input |
| GET | `/api/health` | Health check |
| GET | `/api/info` | Service information |

## Request/Response Format

### Generate Captcha

**Request:**

```
GET /api/captcha?type=slider&width=300&height=170
```

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `slider` | Captcha type: `slider` or `click` |
| `width` | number | `300` | Image width |
| `height` | number | `170` | Image height |
| `precision` | number | `5` | Verification precision |
| `clickCount` | number | `3` | Click count (click type) |

**Response:**

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

### Verify User Input

**Request:**

```
POST /api/captcha/verify
Content-Type: application/json

{
  "captchaId": "uuid-string",
  "type": "slider",
  "target": [123]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Verification successful",
  "data": {
    "verifiedAt": 1700000000000
  }
}
```

## Security Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` (Node.js) / `8080` (Java) / `8082` (Go) | Service port |
| `HOST` | `localhost` | Service host |
| `SECRET_KEY` | `captcha-pro-secret-key` | AES-GCM encryption key |
| `EXPIRE_TIME` | `60000` | Captcha expiration time (ms) |
| `TIMESTAMP_TOLERANCE` | `60000` | Timestamp tolerance (ms) |

### Security Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/security/status/:ip` | Get IP security status |
| GET | `/api/security/blacklist` | Get blacklist |
| POST | `/api/security/blacklist` | Add IP to blacklist |
| DELETE | `/api/security/blacklist/:ip` | Remove IP from blacklist |

## Example Code

### Node.js Implementation

```javascript
import express from 'express'
import { SliderCaptchaBackend } from '@captcha-pro/core'

const app = express()
const captchaBackend = new SliderCaptchaBackend({
  secretKey: process.env.SECRET_KEY,
  expireTime: 60000
})

// Generate captcha
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

// Verify
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

### Frontend Integration

```javascript
import { SliderCaptcha } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
    verify: 'http://localhost:3001/api/captcha/verify'
  },
  onSuccess: () => console.log('Backend verification passed!')
})
```

## Data Encryption

### Backend Encryption Example (Node.js)

```javascript
import { encrypt, decrypt } from '@captcha-pro/core'

// Encrypt verification data
const encryptedData = encrypt({
  target: 123,
  timestamp: Date.now()
}, secretKey)

// Decrypt and verify
const decrypted = decrypt(encryptedData, secretKey)
console.log('Target position:', decrypted.target)
```

## Rate Limiting

Default limit: 60 requests/minute

### Custom Limits

```javascript
const captchaBackend = new SliderCaptchaBackend({
  rateLimit: {
    maxRequests: 100,    // maximum number of requests
    windowMs: 60000      // time window (ms)
  }
})
```

## IP Blacklist

```javascript
// Add to blacklist
await captchaBackend.addToBlacklist('192.168.1.100', {
  reason: 'Brute force',
  duration: 3600000 // 1 hour
})

// Remove from blacklist
await captchaBackend.removeFromBlacklist('192.168.1.100')

// Check status
const status = await captchaBackend.getIpStatus('192.168.1.100')
console.log('Blacklisted:', status.blacklisted)
```

## 🔗 Related Links

- [Node.js Backend Example](https://github.com/saqqdy/captcha-pro/blob/master/server/node/README.md)
- [Java Backend Example](https://github.com/saqqdy/captcha-pro/blob/master/server/java/README.md)
- [Go Backend Example](https://github.com/saqqdy/captcha-pro/blob/master/server/go/README.md)
- [Frontend Integration Guide](./frontend-integration.md)
- [Security Features](./security.md)
