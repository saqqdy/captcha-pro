# Captcha Pro Spring Boot Starter

[中文](./README_CN.md) | English

A Spring Boot Starter for Captcha Pro - Backend verification service with image generation.

## Features

- 🖼️ **Server-side Image Generation** - Images generated on backend using Java AWT
- 🔐 **Server-side Verification** - Prevent frontend bypass
- 🛡️ **Security Features** - Rate limiting, IP blacklist, brute-force protection
- 📦 **Multiple Captcha Types** - Slider, click, rotate
- ⚡ **Memory Cache** - Fast in-memory captcha storage
- 🔄 **Auto Expiration** - Automatic captcha cleanup
- 🍃 **Spring Boot 3** - Built for Spring Boot 3.2+

## Requirements

- Java 17+
- Spring Boot 3.2+

## Installation

### Maven

```xml
<dependency>
    <groupId>com.captcha</groupId>
    <artifactId>captcha-pro-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'com.captcha:captcha-pro-spring-boot-starter:1.0.0'
```

## Quick Start

```bash
# Build
mvn clean package

# Run
java -jar target/captcha-pro-spring-boot-starter-1.0.0.jar
```

Server starts at `http://localhost:8080`.

## Configuration

```yaml
# application.yml
captcha:
  pro:
    security:
      enable-rate-limit: true
      rate-limit-max: 60
      rate-limit-window: 60000
      rate-limit-block-duration: 300000
      enable-blacklist: true
      blacklist-duration: 0
      enable-brute-force: true
      max-failed-attempts: 10
      failed-attempts-window: 300000
      brute-force-block-duration: 900000
    captcha:
      expire-time: 60000
      secret-key: captcha-pro-secret-key
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
| GET | `/api/security/status/{ip}` | Get IP security status |
| GET | `/api/security/blacklist` | Get blacklist entries |
| POST | `/api/security/blacklist` | Add IP to blacklist |
| DELETE | `/api/security/blacklist/{ip}` | Remove IP from blacklist |

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
| clickText | string | - | Custom click text (click only) |

## Verify Captcha

**POST** `/api/captcha/verify`

```json
{
  "captchaId": "uuid-string",
  "type": "SLIDER",
  "target": [123]
}
```

## Security Features

### Rate Limiting
- Default: 60 requests per minute
- Block duration: 5 minutes

### IP Blacklist
```bash
# Add IP to blacklist
curl -X POST http://localhost:8080/api/security/blacklist \
  -H "Content-Type: application/json" \
  -d '{"ip": "192.168.1.100", "reason": "Suspicious activity", "duration": 3600000}'
```

### Brute-Force Protection
- Max failed attempts: 10
- Window: 5 minutes
- Block duration: 15 minutes

## Frontend Integration

```javascript
import { SliderCaptcha } from 'captcha-pro'

const captcha = new SliderCaptcha({
  el: '#captcha-container',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: 'http://localhost:8080/api/captcha?type=slider',
    verify: 'http://localhost:8080/api/captcha/verify'
  }
})
```

## Project Structure

```
server/java/
├── src/main/java/com/captcha/pro/
│   ├── CaptchaProApplication.java    # Main application
│   ├── config/
│   │   └── CaptchaProProperties.java # Configuration
│   ├── controller/
│   │   ├── CaptchaController.java    # Captcha API
│   │   └── SecurityController.java   # Security API
│   ├── model/
│   │   ├── CaptchaModels.java        # Captcha models
│   │   └── SecurityModels.java       # Security models
│   ├── security/
│   │   └── SecurityManager.java      # Security manager
│   └── service/
│       ├── CaptchaCache.java         # Cache service
│       └── CaptchaGenerator.java     # Generator service
├── src/main/resources/
│   └── application.yml               # Configuration
├── pom.xml
└── README.md
```

## License

MIT
