# Backend

Reference backend implementations live in the `server/` directory. They are **not published packages** — copy the code you need into your own backend project.

| Directory | Framework | Port | Description |
|-----------|-----------|------|-------------|
| `server/node` | Express 5 | 3001 | Node.js backend demo |
| `server/java` | Spring Boot 3 | 8080 | Java backend demo |
| `server/go` | Gin | 8082 | Go backend demo |

## Quick Start (Node.js Demo)

```bash
cd server/node
pnpm install
pnpm dev
```

Server runs at `http://localhost:3001`. See each server directory's README for details.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/captcha` | Generate captcha image |
| POST | `/api/captcha/verify` | Verify captcha |
| GET | `/api/health` | Health check |
| GET | `/api/info` | Server info |

### Generate Captcha

**GET** `/api/captcha?type=slider&width=300&height=170`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `slider` | Captcha type: `slider` or `click` |
| `width` | number | `300` | Image width |
| `height` | number | `170` | Image height |
| `precision` | number | `5` | Verification precision |
| `clickCount` | number | `3` | Click count (for click type) |

Response (slider):

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

Response (click) includes `clickTexts` and `clickCharImages` instead of `sliderImage`/`sliderY`.

### Verify Captcha

**POST** `/api/captcha/verify`

Request body:

```json
{
  "captchaId": "uuid-string",
  "type": "slider",
  "target": [123]
}
```

Response:

```json
{
  "success": true,
  "message": "Verification successful",
  "data": { "verifiedAt": 1700000000000 }
}
```

## Security Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/security/status/:ip` | Get IP security status |
| GET | `/api/security/blacklist` | Get blacklist entries |
| POST | `/api/security/blacklist` | Add IP to blacklist |
| DELETE | `/api/security/blacklist/:ip` | Remove IP from blacklist |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` (Node) / `8080` (Java) / `8082` (Go) | Server port |
| `HOST` | `localhost` | Server host |
| `SECRET_KEY` | `captcha-pro-secret-key` | AES-GCM encryption key |
| `EXPIRE_TIME` | `60000` | Captcha expire time (ms) |
| `TIMESTAMP_TOLERANCE` | `60000` | Timestamp tolerance (ms) |

## Frontend Integration

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

## Per-Server Guides

- [Node.js](/backend/node) · [Java](/backend/java) · [Go](/backend/go)
