# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-03-17

🎉 **Initial Release** - Captcha Pro v1.0 is officially released!

### 📦 Frontend Library (captcha-pro)

#### Captcha Types

- 🧩 **Slider Captcha** - Drag the slider to complete the puzzle verification
  - ✨ Random puzzle shapes: square, triangle, trapezoid, pentagon
  - ✨ Decoy holes with random rotation for anti-bot protection
  - ✨ Enhanced gradient backgrounds with decorative patterns
  - ✨ AJ-Captcha style status overlay
  - ✨ Simplified hole/piece styling (1px white border + dark overlay)
  - ✨ Black transparent shadow for slider piece visibility
- 🖱️ **Click Captcha** - Click specified text in sequence
  - ✨ Chinese vocabulary support with 200+ common words/phrases
  - ✨ No duplicate characters per word
  - ✨ AJ-Captcha style status overlay
  - ✨ Enhanced gradient backgrounds with decorative patterns (matching slider)
- 👻 **Invisible Captcha** - Risk-based invisible verification
- 📦 **Popup Captcha** - Modal popup wrapper for captcha
  - ✨ Support slider and click captcha types
  - ✨ Customizable modal (width, title, close button)
  - ✨ Trigger by element click or programmatically
  - ✨ Mask click and ESC key to close
  - ✨ Auto close on success with configurable delay
  - ✨ Smooth enter/exit animations

#### Verification Modes

- 🎯 **Frontend Mode** - Pure frontend verification, no backend required
- 🌐 **Backend Mode** - Server-side verification, higher security
- 🔀 **Flexible Switching** - Configure via `verifyMode`

#### Security Features

- 🔐 **Data Signature** - HMAC-SHA256 signature to prevent data tampering
- ⏱️ **Timestamp Validation** - Prevent replay attacks
- 🔑 **Configurable Secret Key** - Custom `secretKey` for signing

#### Statistics

- 📊 **Verification Statistics** - Track `totalAttempts`, `successCount`, `failCount`, `successRate`
- ⏱️ **Timing Statistics** - Track `avgVerifyTime`, `avgDragTime`
- 📏 **Distance Statistics** - Track `avgDragDistance`, `avgClickCount`

#### Build Outputs

| File | Format | Size | Use Case |
|------|--------|------|----------|
| `index.mjs` | ESM | 35KB | Bundlers (webpack, vite, rollup) |
| `index.cjs` | CommonJS | 36KB | Node.js, legacy bundlers |
| `index.global.js` | IIFE | 57KB | Browser (development) |
| `index.global.min.js` | IIFE | 34KB | Browser (production) |

#### Other Features

- 📦 **Framework Agnostic** - Supports Vue, React, Angular, vanilla JS
- 📱 **Mobile Friendly** - Full touch event support
- 🎨 **Highly Customizable** - Flexible configuration options
- 🖼️ **Custom Images** - Support custom background and slider images
- 🔄 **Auto Refresh** - Built-in refresh button
- 💪 **TypeScript Support** - Full type definitions
- 🌐 **IE11+ Support** - Requires Promise polyfill

---

### 🖥️ Backend Services

Three backend implementations are provided:

#### Node.js (@captcha-pro/server)

- ⚡ **Express 5** - Built on Express 5 framework
- 🖼️ **Server-side Image Generation** - Using canvas
- 💾 **Memory Cache** - Fast in-memory storage
- ⏱️ **Auto Expiration** - Automatic captcha cleanup
- 📡 **RESTful API** - Clean API design
- 🛡️ **Security Features** - Rate limiting, IP blacklist, brute-force protection

#### Java (Spring Boot Starter)

- 🍃 **Spring Boot 3** - Built on Spring Boot 3.2+
- 🖼️ **Server-side Image Generation** - Using Java AWT
- 💾 **Memory Cache** - Concurrent map storage
- 🛡️ **Security Features** - Rate limiting, IP blacklist, brute-force protection
- 📦 **Maven/Gradle** - Easy dependency management

#### Go

- ⚡ **Gin Framework** - High-performance HTTP framework
- 🖼️ **Server-side Image Generation** - Using go-cairo or similar
- 💾 **Memory Cache** - Concurrent map storage
- 🛡️ **Security Features** - Rate limiting, IP blacklist, brute-force protection
- 📦 **Go Modules** - Standard Go dependency management

#### Security Features (All Backends)

- 🚦 **Rate Limiting** - Prevent API abuse
  - Default: 60 requests per minute
  - Block duration: 5 minutes
- 🚫 **IP Blacklist** - Block malicious IPs
  - Manual add/remove via API
  - Support temporary/permanent blocking
- 🛡️ **Brute-Force Protection** - Detect and block brute-force attacks
  - 10 failed attempts in 5 minutes triggers block
  - Block duration: 15 minutes

#### Management APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/security/status/:ip` | Get IP security status |
| GET | `/api/security/blacklist` | Get blacklist entries |
| POST | `/api/security/blacklist` | Add IP to blacklist |
| DELETE | `/api/security/blacklist/:ip` | Remove IP from blacklist |

---

### 📚 Documentation

- 📖 **README** - Complete documentation in English and Chinese
- 📋 **API Reference** - Detailed API documentation
- 🔀 **Comparison** - Comparison with AJ-Captcha and Tencent Captcha
- 🚀 **Upgrade Guide** - Future version upgrade guidance

---

### 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ |
| Firefox | ✅ |
| Safari | ✅ |
| Opera | ✅ |
| Edge | ✅ |
| IE 11 | ✅ (requires Promise polyfill) |

---

### 🔗 Links

- [GitHub Repository](https://github.com/saqqdy/captcha-pro)
- [NPM Package](https://www.npmjs.com/package/captcha-pro)
- [Issue Tracker](https://github.com/saqqdy/captcha-pro/issues)
