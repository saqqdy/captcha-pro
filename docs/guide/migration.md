# Migration from v1 to v2

v2.0.0 is a **multi-platform release**. The public component API (props, events, methods) for the web frameworks is unchanged — v2 is primarily a **packaging reorganization**: all packages moved to the `@captcha-pro/*` npm scope, the single mini-program package was split into dedicated per-platform packages, and framework-agnostic logic was extracted into `@captcha-pro/core`. Native SDKs (Android / iOS / Flutter) were aligned to a unified backend contract.

This guide walks through upgrading from v1.x to v2.0.0.

## Summary of breaking changes

| Area | v1 | v2 |
| --- | --- | --- |
| npm scope | `captcha-pro-*` (unscoped) | `@captcha-pro/*` (scoped) |
| Vanilla web | `captcha-pro` | `@captcha-pro/core` |
| Mini-programs | single `captcha-pro-mp` | 6 dedicated packages (see table below) |
| Core logic | bundled per package | extracted to `@captcha-pro/core` |
| CDN | `unpkg.com/captcha-pro/dist/...` | `unpkg.com/@captcha-pro/core/dist/...` |
| Native verify request | included `timestamp` | `timestamp` removed |
| Native `precision` option | present | removed (dead parameter) |
| Native timeout default | 30000 ms | 10000 ms |
| Flutter | client-side generate + verify | backend-only mode |

## Step 1 — Rename your package

Replace the v1 package name with its v2 equivalent and bump to `^2.0.0`.

| Platform | v1 package | v2 package |
| --- | --- | --- |
| Web (Vanilla JS) | `captcha-pro` | `@captcha-pro/core` |
| Vue 3 | `captcha-pro-vue` | `@captcha-pro/vue` |
| Vue 2 | `captcha-pro-vue2` | `@captcha-pro/vue2` |
| React | `captcha-pro-react` | `@captcha-pro/react` |

```bash
# Example: Vue 3
pnpm remove captcha-pro-vue
pnpm add @captcha-pro/vue@^2.0.0
```

## Step 2 — Update imports

Update every `import` / `require` path to the new scoped name. The named exports are unchanged.

```diff
- import { SliderCaptcha, ClickCaptcha } from 'captcha-pro'
+ import { SliderCaptcha, ClickCaptcha } from '@captcha-pro/core'
- import 'captcha-pro/dist/style.css'
+ import '@captcha-pro/core/dist/style.css'
```

```diff
- import { SliderCaptcha } from 'captcha-pro-vue'
+ import { SliderCaptcha } from '@captcha-pro/vue'
```

Vue 2 mixins move with the package:

```diff
- import sliderCaptchaMixin from 'captcha-pro-vue2/mixins/sliderCaptcha'
+ import sliderCaptchaMixin from '@captcha-pro/vue2/mixins/sliderCaptcha'
```

## Step 3 — Mini-programs: pick a dedicated package

The single `captcha-pro-mp` package is gone. Install the package for **your** target platform instead:

| Platform | v2 package |
| --- | --- |
| WeChat Mini-Program | `@captcha-pro/weixin` |
| uni-app (Vue 3) | `@captcha-pro/uniapp-vue` |
| uni-app (Vue 2) | `@captcha-pro/uniapp-vue2` |
| Taro (React) | `@captcha-pro/taro-react` |
| Taro (Vue 3) | `@captcha-pro/taro-vue` |
| Taro (Vue 2) | `@captcha-pro/taro-vue2` |

```bash
# Example: WeChat Mini-Program
pnpm remove captcha-pro-mp
pnpm add @captcha-pro/weixin@^2.0.0
```

Mini-program components now support **backend-only verification** — see the [Mini-Programs platform guide](/platforms/mini-programs) for the `backend` config contract.

## Step 4 — Update CDN URLs (vanilla JS)

If you load captcha-pro from a CDN, update the host path:

```diff
- <script src="https://unpkg.com/captcha-pro/dist/index.umd.js"></script>
+ <script src="https://unpkg.com/@captcha-pro/core/dist/index.umd.js"></script>
```

npm badge / package page URLs move to `@captcha-pro/core` as well.

> For production, add `integrity="sha384-..."` and `crossorigin="anonymous"` to the `<script>` tag (Subresource Integrity) so a compromised CDN cannot serve tampered code.

## Step 5 — Native SDKs (Android / iOS / Flutter)

The native SDKs were aligned to a unified backend contract. If you embed a native SDK, review the changes that touch your integration:

- **All three platforms**
  - The `verify` request body **no longer sends `timestamp`** — remove any reliance on it server-side.
  - The `precision` option is **removed** (it was a dead parameter) — drop it from your config.
  - Timeout default lowered from `30000 ms` → `10000 ms`. Override `backendVerify.timeout` if you need the old value.
  - Two new i18n keys added: `loading` and `slider_hint`. The loading state now shows the `loading` text on the gradient background; the slider bar shows the `slider_hint` text.
- **Flutter** — switched from client-side generation/verification to **backend-only mode**. `CaptchaGenerator` and `lib/src/renderers/*` were removed. Add a `BackendConfig { getCaptcha, verify, headers?, timeout? }`; the widget fetches and verifies through your backend. Popup now auto-closes on success (500 ms) and auto-refreshes on failure (800 ms); an `onError` callback was added.
- **Android** — `CaptchaDialog` gained a `title` prop (custom popup title; falls back to the `popup_title` locale key when empty).
- **iOS** — no additional API changes beyond the three-platform items above.

Native package names are unchanged (Flutter `captcha_pro`, Android `captcha-sdk` / `captcha-compose`, iOS `CaptchaPro`) — only the version bumps to `2.0.0`. See the [Native platform guide](/platforms/native).

## What did NOT change

- **Component props, events, and methods** for `SliderCaptcha`, `ClickCaptcha`, `PopupCaptcha`, and `InvisibleCaptcha` on the web frameworks — the public surface is compatible with v1.
- **Verification modes** — frontend and backend modes behave as before.
- **Security model** — AES-256-GCM encryption, nonce replay prevention, timestamp validation, rate limiting, IP blacklist, and brute-force protection are unchanged.

## Quick checklist

- [ ] Renamed package in `package.json` (and `pnpm` / `npm` / `yarn` install)
- [ ] Updated all `import` / `require` paths to `@captcha-pro/*`
- [ ] Mini-program: replaced `captcha-pro-mp` with the per-platform package
- [ ] Updated CDN `<script src>` and badge URLs
- [ ] Native: removed `timestamp` / `precision` usage; reviewed timeout; Flutter moved to backend mode
- [ ] Build passes, tests pass

Run into trouble? Open an issue on [GitHub](https://github.com/saqqdy/captcha-pro/issues).
