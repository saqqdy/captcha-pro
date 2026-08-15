# Run the Examples (No Coding Experience Needed)

This project ships with runnable examples for every supported platform. This page is a quick hub — pick a platform, install one or two pieces of software, and you'll have a live captcha on screen.

Each section links to that example's README for the full step-by-step (download links, install steps, what to click, common errors).

## Prerequisites (all platforms)

- **Node.js 18 LTS** — download from <https://nodejs.org> (pick the LTS `.msi` on Windows / `.pkg` on macOS, double-click to install).
- **pnpm** — after Node is installed, open a terminal and run `npm install -g pnpm`.
- A terminal: **Windows** → search "PowerShell" in the Start menu; **macOS** → "Terminal" (Launchpad → Other).

Clone or download this repo, open a terminal in the project root, and run:

```bash
pnpm install   # first run takes a few minutes; wait for Done
```

> If `pnpm install` reports a Python/canvas error (only the `core` package), it won't stop you running the examples — ignore it. If you must build core, install Python 3.11 and run `PYTHON=/usr/local/bin/python3.11 pnpm install`.

## Web (fastest way to see it)

From the project root:

```bash
pnpm play:vue   # or: pnpm play:react  |  pnpm play:vue2
```

Copy the printed `http://localhost:5173` into your browser — the captcha appears.

- [examples/vue/README.md](https://github.com/saqqdy/captcha-pro/blob/master/examples/vue/README.md)
- [examples/react/README.md](https://github.com/saqqdy/captcha-pro/blob/master/examples/react/README.md)
- [examples/vue2/README.md](https://github.com/saqqdy/captcha-pro/blob/master/examples/vue2/README.md)
- [examples/html/README.md](https://github.com/saqqdy/captcha-pro/blob/master/examples/html/README.md) — pure HTML+CDN, no install needed, just open `index.html`

## WeChat Mini-Program

1. Install **WeChat DevTools**: <https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html>
2. For Taro / uni-app examples, build first (output goes to `dist/`):

   ```bash
   cd examples/taro-vue      # or taro-vue2 / taro-react
   pnpm install
   pnpm dev:weapp           # uni-app uses: pnpm dev:mp-weixin
   ```

   The `weixin` example is native — no build step.
3. Open WeChat DevTools → **Import project** → select the example dir (or its `dist/` for Taro/uni-app) → use a **Test AppID** → the simulator shows the captcha.

- [examples/weixin](https://github.com/saqqdy/captcha-pro/blob/master/examples/weixin/README.md) · [taro-vue](https://github.com/saqqdy/captcha-pro/blob/master/examples/taro-vue/README.md) · [taro-vue2](https://github.com/saqqdy/captcha-pro/blob/master/examples/taro-vue2/README.md) · [taro-react](https://github.com/saqqdy/captcha-pro/blob/master/examples/taro-react/README.md) · [uniapp-vue](https://github.com/saqqdy/captcha-pro/blob/master/examples/uniapp-vue/README.md)

## Native (Android / iOS / Flutter)

These are **SDK libraries**, not standalone apps — you can *build* them, but there's no UI to view directly. To see the captcha visually, use the **Web** example above.

- **Android** — install [Android Studio](https://developer.android.com/studio) (it bundles the JDK) → open `packages/android` → wait for Gradle sync → **Build → Make Project**. Command line: `./gradlew :captcha-sdk:assembleDebug :captcha-compose:assembleDebug`. ([README](https://github.com/saqqdy/captcha-pro/blob/master/packages/android/README.md))
- **iOS** (macOS only) — install Xcode → open `packages/ios/Package.swift` → ⌘B. Command line: `xcodebuild -scheme CaptchaPro -destination 'generic/platform=iOS' -derivedDataPath .build build`. **Do not use `swift build`** (it targets macOS and fails with `no such module 'UIKit'`). ([README](https://github.com/saqqdy/captcha-pro/blob/master/packages/ios/README.md))
- **Flutter** — install the [Flutter SDK](https://docs.flutter.dev/get-started/install) → `cd packages/flutter && flutter analyze` → `No issues found!`. It's a plugin package, so `flutter build apk` is *expected* to fail with "Target file lib/main.dart not found" — `flutter analyze` is the correct check. ([README](https://github.com/saqqdy/captcha-pro/blob/master/packages/flutter/README.md))

## Backend demos

Each backend serves the captcha API on a different port. Open `http://localhost:<port>/api/captcha?type=slider` in a browser — you should get JSON back.

| Backend | Port | Run |
|---|---|---|
| Node.js | 3001 | `cd server/node && pnpm install && pnpm dev` |
| Go | 8082 | `cd server/go && go run cmd/server/main.go` |
| Java | 8080 | `cd server/java && mvn spring-boot:run` (install [Maven](https://maven.apache.org/) first — the project has no wrapper) |

- [server/node](https://github.com/saqqdy/captcha-pro/blob/master/server/node/README.md) · [server/go](https://github.com/saqqdy/captcha-pro/blob/master/server/go/README.md) · [server/java](https://github.com/saqqdy/captcha-pro/blob/master/server/java/README.md)

## Verify it works

- **Web** — the browser shows the captcha at `localhost:5173`.
- **Mini-program** — the WeChat DevTools simulator shows the captcha.
- **Native** — the build prints `BUILD SUCCESSFUL` / `BUILD SUCCEEDED` / `No issues found!`.
- **Backend** — `http://localhost:<port>/api/captcha?type=slider` returns JSON.

If something fails, see the matching README's "Common errors" section.
