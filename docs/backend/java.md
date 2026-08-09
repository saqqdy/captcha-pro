# Java Backend

A reference implementation using **Spring Boot 3**, running on port `8080`.

## Quick Start

```bash
cd server/java
./mvnw spring-boot:run
```

Server runs at `http://localhost:8080`.

## Framework

- **Runtime**: Java 17+
- **Framework**: Spring Boot 3
- **Port**: `8080` (override with `PORT`)

## Endpoints

Implements the shared [API endpoints](/backend/#api-endpoints):

- `GET /api/captcha` — generate captcha image
- `POST /api/captcha/verify` — verify captcha
- `GET /api/health` — health check
- `GET /api/info` — server info
- `GET/POST/DELETE /api/security/*` — IP blacklist management

## Environment Variables

See the [shared environment variables](/backend/#environment-variables). Java defaults: `PORT=8080`, `HOST=localhost`.

::: tip
This is a reference implementation, not a published package. Copy the code you need into your own Spring Boot project.
:::
