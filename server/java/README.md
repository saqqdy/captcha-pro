# Captcha Pro Spring Boot Starter

[中文](./README_CN.md) | English

A Spring Boot Starter for Captcha Pro - Backend verification service with image generation.

> **Note**: This is a demo/reference implementation. You can either use it as a local dependency or copy the code to your own project.

## Features

- 🖼️ **Server-side Image Generation** - Images generated on backend using Java AWT
- 🔐 **AES-GCM Data Encryption** - Secure encrypted data transmission with PBKDF2 key derivation
- 🛡️ **Security Features** - Rate limiting, IP blacklist, brute-force protection
- 📦 **Multiple Captcha Types** - Slider, click
- ⚡ **Memory Cache** - Fast in-memory captcha storage
- 🔄 **Auto Expiration** - Automatic captcha cleanup
- 🍃 **Spring Boot 3** - Built for Spring Boot 3.2+
- 🔧 **Auto-Configuration** - Zero-configuration setup

## Requirements

- Java 17+
- Spring Boot 3.2+

## Installation

### Option 1: Local Installation

Clone and install locally:

```bash
# Clone the repository
git clone https://github.com/saqqdy/captcha-pro.git
cd captcha-pro/server/java

# Install to local Maven repository
mvn clean install
```

Then add to your project:

```xml
<dependency>
    <groupId>com.captcha</groupId>
    <artifactId>captcha-pro-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Option 2: Copy Source Files

Copy the following directories to your project:
- `src/main/java/com/captcha/pro/crypto/` - AES-GCM encryption utilities
- `src/main/java/com/captcha/pro/autoconfigure/` - Auto-configuration (optional)

## Quick Start

### 1. Add Dependency

```xml
<dependency>
    <groupId>com.captcha</groupId>
    <artifactId>captcha-pro-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

### 2. Configure (Optional)

```yaml
# application.yml
captcha:
  pro:
    captcha:
      expire-time: 60000           # Captcha expiration (ms)
      timestamp-tolerance: 60000   # Timestamp tolerance (ms)
      secret-key: your-secret-key  # AES-GCM encryption key
    security:
      enable-rate-limit: true
      rate-limit-max: 60
      rate-limit-window: 60000
      rate-limit-block-duration: 300000
      enable-blacklist: true
      blacklist-duration: 0        # 0 = permanent
      enable-brute-force: true
      max-failed-attempts: 10
      failed-attempts-window: 300000
      brute-force-block-duration: 900000
```

### 3. Run Demo Application

```bash
# Navigate to server directory
cd server/java

# Build
mvn clean package

# Run
java -jar target/captcha-pro-spring-boot-starter-1.0.0.jar
```

Server starts at `http://localhost:8080`.

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
  "type": "SLIDER",
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

```java
import com.captcha.pro.crypto.AesCrypto;
import com.captcha.pro.crypto.CaptchaData;
import com.fasterxml.jackson.databind.ObjectMapper;

public CaptchaData verifyEncrypted(String signature, String secretKey) throws Exception {
    String decrypted = AesCrypto.decrypt(signature, secretKey);
    ObjectMapper mapper = new ObjectMapper();
    CaptchaData data = mapper.readValue(decrypted, CaptchaData.class);

    if (!AesCrypto.validateTimestamp(data.getTimestamp(), 60000)) {
        throw new Exception("Timestamp expired");
    }

    return data;
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
  },
  security: {
    secretKey: 'your-secret-key',
    enableSign: true
  }
})
```

## Project Structure

```
server/java/
├── src/main/java/com/captcha/pro/
│   ├── CaptchaProApplication.java       # Demo application
│   ├── autoconfigure/
│   │   └── CaptchaProAutoConfiguration.java  # Auto-configuration
│   ├── config/
│   │   └── CaptchaProProperties.java    # Configuration properties
│   ├── controller/
│   │   ├── CaptchaController.java       # Captcha API
│   │   └── SecurityController.java      # Security API
│   ├── crypto/
│   │   ├── AesCrypto.java               # AES-GCM encryption
│   │   └── CaptchaData.java             # Decrypted data model
│   ├── model/
│   │   ├── CaptchaModels.java           # Captcha models
│   │   └── SecurityModels.java          # Security models
│   ├── security/
│   │   └── SecurityManager.java         # Security manager
│   └── service/
│       ├── CaptchaCache.java            # Cache service
│       └── CaptchaGenerator.java        # Generator service
├── src/main/resources/
│   ├── META-INF/
│   │   ├── additional-spring-configuration-metadata.json
│   │   └── spring/
│   │       └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
│   └── application.yml
├── pom.xml
└── README.md
```

## Customization

### Override Beans

You can override any bean by defining your own:

```java
@Configuration
public class MyCaptchaConfig {

    @Bean
    @Primary
    public CaptchaCache captchaCache() {
        // Use Redis instead of memory cache
        return new RedisCaptchaCache();
    }
}
```

### Disable Auto-Configuration

```java
@SpringBootApplication(exclude = CaptchaProAutoConfiguration.class)
public class MyApplication {
    // ...
}
```

## Other Backend Demos

- **Node.js (Express)**: See [server/node](../node/)
- **Go (Gin)**: See [server/go](../go/)

## License

MIT
