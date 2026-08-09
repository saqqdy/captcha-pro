# Go Backend

A reference implementation using **Gin**, running on port `8082`.

## Quick Start

```bash
cd server/go
go run .
```

Server runs at `http://localhost:8082`.

## Framework

- **Runtime**: Go 1.21+
- **Framework**: Gin
- **Port**: `8082` (override with `PORT`)

## Endpoints

Implements the shared [API endpoints](/backend/#api-endpoints):

- `GET /api/captcha` — generate captcha image
- `POST /api/captcha/verify` — verify captcha
- `GET /api/health` — health check
- `GET /api/info` — server info
- `GET/POST/DELETE /api/security/*` — IP blacklist management

## Environment Variables

See the [shared environment variables](/backend/#environment-variables). Go defaults: `PORT=8082`, `HOST=localhost`.

::: tip
This is a reference implementation, not a published package. Copy the code you need into your own Go project.
:::
