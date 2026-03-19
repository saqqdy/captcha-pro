# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-03-17

### Bug Fixes (2025-03-20)

- **Fixed duplicate decoy holes in slider captcha** - Resolved issue where `generateSliderPiece()` was called twice, causing multiple decoy holes to appear
- **Fixed frontend regeneration in backend mode** - Frontend no longer regenerates shapes when using backend-generated images
- **Fixed click captcha regeneration in backend mode** - Frontend no longer redraws characters on backend-generated background images

### Improvements (2025-03-20)

- **Added `sliderY` field to backend response** - Server now returns the Y position of the slider piece for correct positioning
- **Added `clickCharImages` field to backend response** - Server now returns base64 images for click captcha prompt display
- **Added Chinese vocabulary library to server** - Server now uses the same CHINESE_WORDS array as frontend for consistent text generation
- **Added decoy characters to server click captcha** - Server now generates 1-2 random decoy characters matching frontend behavior

### API Changes (2025-03-20)

#### Backend Response (Slider)
```json
{
  "captchaId": "uuid",
  "type": "slider",
  "bgImage": "data:image/png;base64,...",
  "sliderImage": "data:image/png;base64,...",
  "sliderY": 42,
  "width": 300,
  "height": 170,
  "expiresAt": 1700000000000
}
```

#### Backend Response (Click)
```json
{
  "captchaId": "uuid",
  "type": "click",
  "bgImage": "data:image/png;base64,...",
  "clickTexts": ["春", "暖", "花"],
  "clickCharImages": ["data:image/png;base64,...", ...],
  "width": 300,
  "height": 170,
  "expiresAt": 1700000000000
}
```

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
  - Enhanced gradient backgrounds (matching slider style)
- 👻 **Invisible Captcha** - Risk-based invisible verification
- 📦 **Popup Captcha** - Modal popup wrapper for slider/click captcha
  - Customizable modal (title, close button)
  - Trigger by element click or programmatically
  - Mask click and ESC key to close
  - Auto close on success with configurable delay

### Verification Modes

- 🎯 **Frontend Mode** - Pure frontend verification, no backend required
- 🌐 **Backend Mode** - Server-side verification, higher security

### Security Features

- 🔐 **Data Encryption** - AES-GCM encryption with PBKDF2 key derivation (replacing HMAC-SHA256)
- ⏱️ **Timestamp Validation** - Prevent replay attacks
- 🚦 **Rate Limiting** - Prevent API abuse (default: 60 requests/min)
- 🚫 **IP Blacklist** - Block malicious IPs
- 🛡️ **Brute-Force Protection** - Detect and block brute-force attacks

### Statistics API

- Track `totalAttempts`, `successCount`, `failCount`, `successRate`
- Track `avgVerifyTime`, `avgDragTime`, `avgDragDistance`, `avgClickCount`

### Backend Demo Implementations

Reference implementations are provided for quick integration:

| Backend | Framework | Features |
|---------|-----------|----------|
| Node.js | Express 5 | Canvas image generation, memory cache |
| Java | Spring Boot 3 | Java AWT image generation, concurrent map storage |
| Go | Gin | High-performance, concurrent map storage |

> **Note**: These are demo implementations, not published packages. Copy the crypto code to your own backend project.

### Build Outputs

| File | Format | Size | Use Case |
|------|--------|------|----------|
| `index.mjs` | ESM | 35KB | Bundlers (webpack, vite, rollup) |
| `index.cjs` | CommonJS | 36KB | Node.js, legacy bundlers |
| `index.global.js` | IIFE | 57KB | Browser (development) |
| `index.global.min.js` | IIFE | 34KB | Browser (production) |

### Other Features

- 📦 Framework agnostic (Vue, React, Angular, vanilla JS)
- 📱 Mobile friendly with full touch event support
- ♿ Accessibility support (ARIA attributes, keyboard navigation)
- 🎨 Highly customizable configuration options
- 🖼️ Custom background and slider images support
- 💪 Full TypeScript support
- 🌐 IE11+ support (requires Promise polyfill)

### Browser Support

Chrome, Firefox, Safari, Opera, Edge, IE 11 (with Promise polyfill)

### Links

- [GitHub Repository](https://github.com/saqqdy/captcha-pro)
- [NPM Package](https://www.npmjs.com/package/captcha-pro)
- [Issue Tracker](https://github.com/saqqdy/captcha-pro/issues)
