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
- 🌍 **i18n Support** - Built-in internationalization (zh-CN, en-US) via `Accept-Language` header

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
    <version>2.0.0</version>
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
    <version>2.0.0</version>
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
java -jar target/captcha-pro-spring-boot-starter-2.0.0.jar
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
import { SliderCaptcha } from '@captcha-pro/core'

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
│   ├── i18n/
│   │   ├── I18nMessages.java            # i18n utility class
│   │   └── CaptchaLocaleResolver.java   # Locale resolver
│   ├── model/
│   │   ├── CaptchaModels.java           # Captcha models
│   │   └── SecurityModels.java          # Security models
│   ├── security/
│   │   └── SecurityManager.java         # Security manager
│   └── service/
│       ├── CaptchaCache.java            # Cache service
│       └── CaptchaGenerator.java        # Generator service
├── src/main/resources/
│   ├── i18n/
│   │   ├── messages_zh_CN.properties    # Chinese messages
│   │   └── messages_en_US.properties    # English messages
│   ├── META-INF/
│   │   ├── additional-spring-configuration-metadata.json
│   │   └── spring/
│   │       └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
│   └── application.yml
├── pom.xml
└── README.md
```

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
curl -H "Accept-Language: zh-CN" http://localhost:8080/api/captcha?type=slider

# English response
curl -H "Accept-Language: en-US" http://localhost:8080/api/captcha?type=slider
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

## Start Server & Verify Guide (No Coding Experience Needed)

This section is for people who have never run a backend service before. Follow it step by step and you will have the captcha service running in your browser.

### 1. What software to install

1. **JDK 17** — Go to https://adoptium.net and download **Temurin 17 LTS** for your system (macOS: `.pkg`; Windows: `.msi`). Double-click to install with default options. This project requires Java 17 specifically.
2. **Maven** — This project does not include the `mvnw` wrapper, so you need Maven installed separately.
   - macOS (with Homebrew): `brew install maven`
   - Windows: download from https://maven.apache.org/download.cgi, unzip, and add its `bin` folder to your PATH (the download page has instructions).
   - If you use IntelliJ IDEA or VS Code with Java extensions, Maven is usually bundled — no separate install needed.

How to check it worked: in a terminal (macOS: the "Terminal" app; Windows: PowerShell) run `java -version` (should mention version `17`) and `mvn -v` (should print a Maven version number).

### 2. Start the service

In the terminal:

```bash
# Go into the server directory (replace the path with your own)
cd /your/path/to/captcha-pro/server/java

# Start the Spring Boot service directly (downloads dependencies on first run, can take several minutes)
mvn spring-boot:run
```

When you see Spring Boot's banner and a line like `Tomcat started on port 8080` (the address is `http://localhost:8080`), the service has started. Keep this terminal window open — closing it stops the service.

> The port is set in `src/main/resources/application.yml` (`server.port: 8080`).

### 3. Verify it works

Open your web browser (Chrome, Safari, Edge, any one). In the address bar, paste this and press Enter:

```
http://localhost:8080/api/captcha?type=slider
```

If you see a page full of text starting with something like `{"success":true,"data":{"captchaId":...,"bgImage":...}}`, then it works — that JSON is the captcha data your service just generated.

You can also try the health check: open `http://localhost:8080/api/health`.

### 4. Build (optional)

If you only want to run the service locally, `mvn spring-boot:run` is enough — no build needed. If you want a standalone runnable jar:

```bash
# Build
mvn clean package

# Run the built jar
java -jar target/captcha-pro-spring-boot-starter-2.0.0.jar
```

The jar file is in the `target/` folder.

### 5. Common errors and fixes

- **`java: command not found` or wrong Java version** — JDK 17 is not installed or not active. Reinstall Temurin 17 from https://adoptium.net and reopen the terminal.
- **`mvn: command not found`** — Maven is not installed or not in your PATH. See step 1 for how to install Maven.
- **`Web server failed to start. Port 8080 was already in use.`** — Another program is using port 8080. Either close it, or start on a different port: `mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081`.
- **First run is slow** — Maven is downloading dependencies. This is normal the first time and can take several minutes.

### 6. Connect it to a frontend example

The frontend demos in this repo (for example `examples/vue`) can talk to this service. In the frontend demo, set the backend address to `http://localhost:8080`, so the captcha fetch URL is `http://localhost:8080/api/captcha?type=slider` and the verify URL is `http://localhost:8080/api/captcha/verify`. See each frontend example's own README for the exact config field name.
