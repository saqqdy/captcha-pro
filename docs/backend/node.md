# Node.js Backend

A reference implementation using **Express 5**, running on port `3001`.

## Quick Start

```bash
cd server/node
pnpm install
pnpm dev
```

Server runs at `http://localhost:3001`.

## Framework

- **Runtime**: Node.js `>=18`
- **Framework**: Express 5
- **Port**: `3001` (override with `PORT`)

## Endpoints

Implements the shared [API endpoints](/backend/#api-endpoints):

- `GET /api/captcha` — generate captcha image
- `POST /api/captcha/verify` — verify captcha
- `GET /api/health` — health check
- `GET /api/info` — server info
- `GET/POST/DELETE /api/security/*` — IP blacklist management

## Environment Variables

See the [shared environment variables](/backend/#environment-variables). Node.js defaults: `PORT=3001`, `HOST=localhost`.

::: tip
This is a reference implementation, not a published package. Copy the code you need into your own Express project.
:::
