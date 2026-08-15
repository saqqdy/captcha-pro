# 跑通示例（零基础也能跟着做）

本项目为每个支持的平台都附带了可运行的示例。这一页是个快速入口——挑一个平台，装一两个软件，你就能在屏幕上看到一个活的验证码。

每一节都链到对应示例的 README，里面有完整的分步说明（下载链接、安装步骤、要点哪个、常见报错怎么处理）。

## 准备工作（所有平台通用）

- **Node.js 18 LTS** — 从 <https://nodejs.org> 下载（Windows 选 `.msi`、macOS 选 `.pkg`，双击一路下一步安装）。
- **pnpm** — 装完 Node 后，打开终端输入 `npm install -g pnpm`。
- 终端在哪打开：**Windows** 在开始菜单搜"PowerShell"；**macOS** 在启动台 → 其他 → 终端。

克隆或下载本仓库后，在项目根目录打开终端，运行：

```bash
pnpm install   # 首次会跑几分钟，等它 Done
```

> 如果 `pnpm install` 报 Python/canvas 相关错误（只有 `core` 包可能），不影响你跑示例——忽略即可。必须构建 core 的话，装 Python 3.11 后用 `PYTHON=/usr/local/bin/python3.11 pnpm install`。

## 网页端（最快看到效果）

在项目根目录：

```bash
pnpm play:vue   # 或：pnpm play:react  |  pnpm play:vue2
```

把终端打印的 `http://localhost:5173` 复制到浏览器，验证码就出来了。

- [examples/vue/README.md](https://github.com/saqqdy/captcha-pro/blob/master/examples/vue/README.md)
- [examples/react/README.md](https://github.com/saqqdy/captcha-pro/blob/master/examples/react/README.md)
- [examples/vue2/README.md](https://github.com/saqqdy/captcha-pro/blob/master/examples/vue2/README.md)
- [examples/html/README.md](https://github.com/saqqdy/captcha-pro/blob/master/examples/html/README.md) —— 纯 HTML+CDN，不用装任何东西，直接双击 `index.html` 即可

## 微信小程序

1. 装**微信开发者工具**：<https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html>
2. Taro / uni-app 示例要先编译（产物在 `dist/`）：

   ```bash
   cd examples/taro-vue      # 或 taro-vue2 / taro-react
   pnpm install
   pnpm dev:weapp           # uni-app 用：pnpm dev:mp-weixin
   ```

   `weixin` 示例是原生小程序，不需要编译。
3. 打开微信开发者工具 → **导入项目** → 选示例目录（Taro/uni-app 选它的 `dist/`）→ AppID 选**测试号** → 模拟器里出现验证码。

- [examples/weixin](https://github.com/saqqdy/captcha-pro/blob/master/examples/weixin/README.md) · [taro-vue](https://github.com/saqqdy/captcha-pro/blob/master/examples/taro-vue/README.md) · [taro-vue2](https://github.com/saqqdy/captcha-pro/blob/master/examples/taro-vue2/README.md) · [taro-react](https://github.com/saqqdy/captcha-pro/blob/master/examples/taro-react/README.md) · [uniapp-vue](https://github.com/saqqdy/captcha-pro/blob/master/examples/uniapp-vue/README.md)

## 原生端（Android / iOS / Flutter）

这三个是 **SDK 库**，不是独立 App——可以**构建**，但没有可直接查看的界面。想看验证码长什么样，用上面的**网页端**。

- **Android** —— 装 [Android Studio](https://developer.android.com/studio)（自带 JDK）→ 打开 `packages/android` → 等 Gradle sync → **Build → Make Project**。命令行：`./gradlew :captcha-sdk:assembleDebug :captcha-compose:assembleDebug`。（[README](https://github.com/saqqdy/captcha-pro/blob/master/packages/android/README.md)）
- **iOS**（仅 macOS）—— 装 Xcode → 打开 `packages/ios/Package.swift` → ⌘B。命令行：`xcodebuild -scheme CaptchaPro -destination 'generic/platform=iOS' -derivedDataPath .build build`。**不要用 `swift build`**（它默认编 macOS，会报 `no such module 'UIKit'`）。（[README](https://github.com/saqqdy/captcha-pro/blob/master/packages/ios/README.md)）
- **Flutter** —— 装 [Flutter SDK](https://docs.flutter.dev/get-started/install) → `cd packages/flutter && flutter analyze` → 看到 `No issues found!`。这是插件包，`flutter build apk` 必然报 "Target file lib/main.dart not found"——这是正常的，`flutter analyze` 才是正确的验证方式。（[README](https://github.com/saqqdy/captcha-pro/blob/master/packages/flutter/README.md)）

## 后端示例

三个后端各在不同端口提供验证码 API。浏览器打开 `http://localhost:<端口>/api/captcha?type=slider`，能返回一段 JSON 就说明跑起来了。

| 后端 | 端口 | 启动命令 |
|---|---|---|
| Node.js | 3001 | `cd server/node && pnpm install && pnpm dev` |
| Go | 8082 | `cd server/go && go run cmd/server/main.go` |
| Java | 8080 | `cd server/java && mvn spring-boot:run`（需先装 [Maven](https://maven.apache.org/)，项目无 wrapper） |

- [server/node](https://github.com/saqqdy/captcha-pro/blob/master/server/node/README.md) · [server/go](https://github.com/saqqdy/captcha-pro/blob/master/server/go/README.md) · [server/java](https://github.com/saqqdy/captcha-pro/blob/master/server/java/README.md)

## 怎么算成功

- **网页端** —— 浏览器在 `localhost:5173` 显示出验证码。
- **小程序** —— 微信开发者工具模拟器里显示验证码。
- **原生端** —— 构建输出 `BUILD SUCCESSFUL` / `BUILD SUCCEEDED` / `No issues found!`。
- **后端** —— `http://localhost:<端口>/api/captcha?type=slider` 返回 JSON。

如果某步失败了，去看对应 README 的"常见报错"小节。
