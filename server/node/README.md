# Captcha Pro Server Demo (Node.js)

[中文](./README_CN.md) | English

A Node.js demo implementation for Captcha Pro backend service using Express 5. This is a reference implementation to help you integrate captcha-pro with your own backend.

> **Note**: This is a demo/reference implementation. It is NOT published as an npm package. You can copy and adapt this code for your own backend service.

## Features

- 🖼️ **Server-side Image Generation** - Images generated on backend using canvas
- 🔐 **AES-GCM Data Encryption** - Secure encrypted data transmission with PBKDF2 key derivation
- 🛡️ **Security Features** - Rate limiting, IP blacklist, brute-force protection
- 📦 **Multiple Captcha Types** - Slider, click
- ⚡ **Memory Cache** - Fast in-memory captcha storage
- 🔄 **Auto Expiration** - Automatic captcha cleanup
- 🌍 **i18n Support** - Built-in internationalization (zh-CN, en-US) via `Accept-Language` header

## Quick Start

This is a demo project. Clone the repository and run locally:

```bash
# Navigate to server directory
cd server/node

# Install dependencies
pnpm install

# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

## Quick Start

### Development

```bash
pnpm dev
```

Server starts at `http://localhost:3001`.

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
| type | string | slider | Captcha type: slider, click |
| width | number | 280 | Image width |
| height | number | 155 | Image height |
| sliderWidth | number | 50 | Slider width (slider only) |
| sliderHeight | number | 50 | Slider height (slider only) |
| precision | number | 5 | Verification precision |
| clickCount | number | 3 | Click count (click only) |
| clickText | string | - | Custom click text (click only) |
| imageQuality | number | 0.5 | JPEG quality for background (0.0-1.0) |

Response:

```json
{
  "success": true,
  "data": {
    "captchaId": "uuid-string",
    "type": "slider",
    "bgImage": "data:image/jpeg;base64,...",
    "sliderImage": "data:image/png;base64,...",
    "sliderY": 42,
    "width": 280,
    "height": 155,
    "expiresAt": 1700000000000
  }
}
```

> **Note**: Background images use JPEG format for smaller file sizes, while slider images use PNG for transparency support.

### Click Captcha Response

```json
{
  "success": true,
  "data": {
    "captchaId": "uuid-string",
    "type": "click",
    "bgImage": "data:image/png;base64,...",
    "clickTexts": ["春", "暖", "花"],
    "clickCharImages": ["data:image/png;base64,...", ...],
    "width": 280,
    "height": 155,
    "expiresAt": 1700000000000
  }
}
```

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

- `slider`: target is `[x-coordinate]`
- `click`: target is `[{x, y}, {x, y}, ...]`

### Encrypted Mode (AES-GCM)

When frontend enables `security.enableSign`, it sends encrypted data:

```json
{
  "captchaId": "uuid-string",
  "signature": "base64-encoded-encrypted-data"
}
```

The signature contains AES-GCM encrypted JSON with:
- `type`: Captcha type
- `target`: Verification target
- `timestamp`: Unix timestamp (validated against `TIMESTAMP_TOLERANCE`)
- `nonce`: Random string for replay prevention

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
| Auth Tag | 16 bytes (included in ciphertext) |

### Data Format

```
base64(salt[16] + iv[12] + ciphertext + authTag[16])
```

### Usage Example

```typescript
// Frontend
import { SliderCaptcha, decryptCaptchaData } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    secretKey: 'your-secret-key',
    enableSign: true
  },
  onSuccess: async () => {
    const signedData = await captcha.getSignedData()
    // Send signedData.signature to backend
  }
})

// Backend (Node.js) - Copy crypto.ts from server/node/src/crypto.ts
import { decryptCaptchaData, validateTimestamp } from './crypto'

async function verifyCaptcha(encryptedData: string, secretKey: string) {
  const data = await decryptCaptchaData(encryptedData, secretKey)

  if (!validateTimestamp(data.timestamp, 60000)) {
    throw new Error('Timestamp expired')
  }

  return data // { type, target, timestamp, nonce }
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
| SECRET_KEY | captcha-pro-secret-key | AES-GCM encryption key |
| EXPIRE_TIME | 60000 | Captcha expire time (ms) |
| TIMESTAMP_TOLERANCE | 60000 | Timestamp tolerance (ms) |

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
curl -H "Accept-Language: zh-CN" http://localhost:3001/api/captcha?type=slider

# English response
curl -H "Accept-Language: en-US" http://localhost:3001/api/captcha?type=slider
```

### Response Example

**Chinese (zh-CN):**
```json
{
  "success": true,
  "message": "操作成功",
  "data": {...}
}
```

**English (en-US):**
```json
{
  "success": true,
  "message": "Success",
  "data": {...}
}
```

## Frontend Integration

```typescript
import { SliderCaptcha } from '@captcha-pro/core'

const captcha = new SliderCaptcha({
  el: '#captcha-container',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
    verify: 'http://localhost:3001/api/captcha/verify',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': navigator.language || 'zh-CN'  // Auto-detect language
    }
  },
  security: {
    secretKey: 'your-secret-key',
    enableSign: true
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
│   ├── captcha-generator.ts  # Captcha generator
│   ├── cache.ts              # Memory cache
│   ├── crypto.ts             # AES-GCM encryption (can be copied to your project)
│   ├── security.ts           # Security manager
│   ├── types.ts              # Type definitions
│   ├── locales/              # i18n language files
│   │   ├── index.ts          # i18n core module
│   │   ├── zh-CN.ts          # Chinese messages
│   │   └── en-US.ts          # English messages
│   └── middleware/
│       └── i18n.ts           # i18n middleware
├── dist/                     # Build output
├── package.json
├── tsconfig.json
├── README.md
└── README_CN.md
```

## Integration Guide

To integrate with your own Node.js backend:

1. Copy `src/crypto.ts` to your project
2. Use `decryptCaptchaData()` to verify encrypted signatures from frontend
3. Implement your own captcha storage (Redis, database, etc.)
4. Customize security settings as needed

## Other Backend Demos

- **Java (Spring Boot)**: See [server/java](../java/)
- **Go (Gin)**: See [server/go](../go/)

## License

MIT

## Start Server & Verify Guide (No Coding Experience Needed)

This section is for people who have never run a backend service before. Follow it step by step and you will have the captcha service running in your browser.

### 1. What software to install

1. **Node.js 18 LTS** — Go to https://nodejs.org, download the version marked "LTS" (Long Term Support), and double-click the installer. On Windows it is an `.msi`, on macOS a `.pkg`. Finish the installer with all default options.
2. **pnpm** (a package manager) — After Node.js is installed, open a terminal (macOS: the "Terminal" app; Windows: "PowerShell" or "Command Prompt") and run:
   ```bash
   npm install -g pnpm
   ```
   Wait until it finishes. You only do this once.

How to check it worked: in the terminal run `node -v` (should print `v18...` or higher) and `pnpm -v` (should print a version number).

> **About the `canvas` module**: This project uses a native image library called `canvas`. Under Node.js 18 it usually installs without problems. If `pnpm install` later fails with a python/canvas-related error message, install Python 3.11 and retry with `PYTHON=/usr/local/bin/python3.11 pnpm install` (macOS/Linux). On Windows, install Python from https://www.python.org and retry `pnpm install`; that usually fixes it. Most people on Node 18 will not hit this.

### 2. Start the service

In the terminal:

```bash
# Go into the server directory (replace the path with your own)
cd /your/path/to/captcha-pro/server/node

# Install dependencies (first time only, can take a few minutes)
pnpm install

# Start the dev server
pnpm dev
```

When you see a line in the terminal like `Captcha Pro Server running at http://localhost:3001` (the address is `http://localhost:3001` by default), the service has started. Keep this terminal window open — closing it stops the service.

### 3. Verify it works

Open your web browser (Chrome, Safari, Edge, any one). In the address bar, paste this and press Enter:

```
http://localhost:3001/api/captcha?type=slider
```

If you see a page full of text starting with something like `{"success":true,"data":{"captchaId":...,"bgImage":"data:image/jpeg;base64,...}}`, then it works — that JSON text is the captcha data your service just generated.

You can also try the health check: open `http://localhost:3001/api/health`.

### 4. Build (optional)

If you only want to run the service locally, you do not need to build — `pnpm dev` is enough. If you do want a production build:

```bash
pnpm build
```

The output goes into the `dist/` folder. Run the built version with `pnpm start` (which runs `node dist/cli.js`).

### 5. Common errors and fixes

- **`EADDRINUSE` or "port 3001 already in use"** — Another program is using port 3001. Either close that program, or start the service on a different port: on macOS/Linux run `PORT=3002 pnpm dev`; on Windows PowerShell run `$env:PORT=3002; pnpm dev`.
- **`pnpm install` fails on `canvas`** — See the note in step 1 about installing Python 3.11 and retrying with `PYTHON=/usr/local/bin/python3.11 pnpm install`.
- **`pnpm: command not found`** — pnpm did not install. Re-run `npm install -g pnpm`.

### 6. Connect it to a frontend example

The frontend demos in this repo (for example `examples/vue`) can talk to this service. In the frontend demo, set the backend address to `http://localhost:3001`, so that the captcha fetch URL is `http://localhost:3001/api/captcha?type=slider` and the verify URL is `http://localhost:3001/api/captcha/verify`. See each frontend example's own README for the exact config field name.
