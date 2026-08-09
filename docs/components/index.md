# Captcha Types

captcha-pro provides four captcha types, all framework-agnostic and sharing a consistent options shape.

## Verification Modes

Both modes are supported across all captcha types:

- 🎯 **Frontend Mode** — Pure frontend verification, no backend required (default)
- 🌐 **Backend Mode** — Server-side verification with image generation

## Slider Captcha

Puzzle verification with random shapes (square / triangle / trapezoid / pentagon) and decoy holes with random rotation. The user drags a slider piece into the missing slot.

→ [Slider options & methods](/components/slider)

## Click Captcha

Text click verification with 200+ Chinese vocabulary support, no duplicate characters per word, random decoy characters, and prompt images for anti-bot detection.

→ [Click options & methods](/components/click)

## Popup Captcha

A modal wrapper around the slider or click captcha, triggered by an element click or programmatically.

→ [Popup options & methods](/components/popup)

## Invisible Captcha

Risk-based invisible verification with behavior tracking and analysis. Shows a challenge only when the risk score exceeds a threshold.

→ [Invisible options & methods](/components/invisible)

## Security

All types support the shared `security` option (AES-GCM encryption + timestamp validation) and the `backendVerify` option for server-side verification. See [Advanced Usage](/guide/advanced-usage).
