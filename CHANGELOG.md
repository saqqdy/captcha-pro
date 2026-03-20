# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-03-20

### New Features

- 🌍 **i18n Support** - Built-in internationalization support
  - Supports Chinese (zh-CN) and English (en-US)
  - Auto-detects browser language on initialization
  - `setLocale()`, `getLocale()`, `t()` API for global language control
  - Component-level `locale` option for per-instance language setting
  - Frontend i18n module (`src/locales/`)
  - Backend i18n modules for Node.js, Java (Spring Boot), and Go (Gin)
  - `Accept-Language` header support for backend APIs
  - Comprehensive i18n documentation (`docs/I18N_SUPPORT.md`)

### Bug Fixes

- Fixed click captcha allowing more clicks than required text count
- Fixed click captcha verification in backend mode

## [1.0.0] - 2025-03-17

🎉 **Initial Release** - Captcha Pro v1.0 is officially released!

### Captcha Types

- 🧩 **Slider Captcha** - Drag the slider to complete the puzzle verification
  - Random puzzle shapes: square, triangle, trapezoid, pentagon
  - Decoy holes with random rotation for anti-bot protection
  - Enhanced gradient backgrounds with decorative patterns
- 🖱️ **Click Captcha** - Click specified text in sequence
  - Chinese vocabulary support with 200+ common words/phrases
  - No duplicate characters per word
  - Random decoy characters (1-2 extra) for anti-bot protection
  - Prompt text displayed as base64 images to prevent machine recognition
- 👻 **Invisible Captcha** - Risk-based invisible verification
- 📦 **Popup Captcha** - Modal popup wrapper for slider/click captcha

### Verification Modes

- 🎯 **Frontend Mode** - Pure frontend verification, no backend required
- 🌐 **Backend Mode** - Server-side verification, higher security

### Security Features

- 🔐 **Data Encryption** - AES-GCM encryption with PBKDF2 key derivation
- ⏱️ **Timestamp Validation** - Prevent replay attacks
- 🚦 **Rate Limiting** - Prevent API abuse (default: 60 requests/min)
- 🚫 **IP Blacklist** - Block malicious IPs
- 🛡️ **Brute-Force Protection** - Detect and block brute-force attacks

### Backend Implementations

| Backend | Framework | Features |
|---------|-----------|----------|
| Node.js | Express 5 | Canvas image generation, memory cache |
| Java | Spring Boot 3 | Java AWT image generation, concurrent map storage |
| Go | Gin | High-performance, concurrent map storage |

### Build Outputs

| File | Format | Size | Use Case |
|------|--------|------|----------|
| `index.mjs` | ESM | 35KB | Bundlers (webpack, vite, rollup) |
| `index.cjs` | CommonJS | 36KB | Node.js, legacy bundlers |
| `index.global.js` | IIFE | 57KB | Browser (development) |
| `index.global.min.js` | IIFE | 34KB | Browser (production) |

### Browser Support

Chrome, Firefox, Safari, Opera, Edge, IE 11 (with Promise polyfill)

### Links

- [GitHub Repository](https://github.com/saqqdy/captcha-pro)
- [NPM Package](https://www.npmjs.com/package/captcha-pro)
- [Issue Tracker](https://github.com/saqqdy/captcha-pro/issues)
