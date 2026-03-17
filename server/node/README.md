# @captcha-pro/server

[中文](./README_CN.md) | English

Captcha Pro Server - Express 5 based backend service for captcha generation and verification.

## Features

- 🖼️ **Server-side Image Generation** - Images generated on backend using canvas
- 🔐 **Server-side Verification** - Prevent frontend bypass
- 🛡️ **Security Features** - Rate limiting, IP blacklist, brute-force protection
- 📦 **Multiple Captcha Types** - Slider, click, rotate
- ⚡ **Memory Cache** - Fast in-memory captcha storage
- 🔄 **Auto Expiration** - Automatic captcha cleanup

## Installation

```bash
# pnpm
pnpm install

# npm
npm install

# yarn
yarn install
```

## Quick Start

### Development

```bash
pnpm dev
```

Server starts at `http://localhost:3001`.

### Production

```bash
pnpm build
pnpm start
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

**GET** `/api/captcha`

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
| clickText | string | - | Custom click text (click only) |

Response:

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

## Verify Captcha

**POST** `/api/captcha/verify`

Request Body:

```json
{
  "captchaId": "uuid-string",
  "type": "slider",
  "target": [123]
}
```

- `slider`: target is `[x-coordinate]`
- `click`: target is `[{x, y}, {x, y}, ...]`
- `rotate`: target is `[angle]`

Response:

```json
{
  "success": true,
  "message": "Verification successful",
  "data": {
    "verifiedAt": 1700000000000
  }
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
curl -X POST http://localhost:3001/api/security/blacklist \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100", "reason": "Suspicious activity", "duration": 3600000}'

# Remove IP from blacklist
curl -X DELETE http://localhost:3001/api/security/blacklist/192.168.1.100

# Get blacklist
curl http://localhost:3001/api/security/blacklist
```

### Brute-Force Protection

- Max failed attempts: 10
- Window: 5 minutes
- Block duration: 15 minutes
- Auto-add to blacklist on repeated violations

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| HOST | localhost | Server host |
| SECRET_KEY | captcha-pro-secret-key | Secret key |
| EXPIRE_TIME | 60000 | Captcha expire time (ms) |
| TIMESTAMP_TOLERANCE | 60000 | Timestamp tolerance (ms) |

## Frontend Integration

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
    console.log('Verification successful!')
  },
  onFail: () => {
    console.log('Verification failed')
  }
})
```

## Project Structure

```
server/node/
├── src/
│   ├── index.ts              # Express server entry
│   ├── cli.ts                # CLI entry
│   ├── captcha-generator.ts  # Captcha generator
│   ├── cache.ts              # Memory cache
│   ├── security.ts           # Security manager
│   └── types.ts              # Type definitions
├── dist/                     # Build output
├── package.json
├── tsconfig.json
├── README.md
└── README_CN.md
```

## License

MIT
