# Captcha Pro · iOS 示例

iOS 示例 app，演示 `CaptchaPro` 包的滑块 / 点选 / 弹窗三种验证码用法（SwiftUI）。

后端走在线服务（`server/node`），与 Flutter 示例一致。

## 运行

### 1. 启动后端

```bash
cd server/node
pnpm install
pnpm dev   # 监听 http://localhost:3001
```

> 仓库根目录也可 `pnpm dev:server`。`.node-version` 为 18，用 fnm 时先 `fnm use 18`。

### 2. 生成 Xcode 工程（仅改动 `project.yml` 后需要）

```bash
cd examples/ios
xcodegen generate   # 未装：brew install xcodegen
```

### 3. 构建

```bash
xcodebuild -scheme CaptchaProExample \
  -destination 'platform=iOS Simulator,name=iPhone 16e' \
  -derivedDataPath build build
```

产物：`build/Build/Products/Debug-iphonesimulator/CaptchaProExample.app`（`build/` 已被 `.gitignore` 排除）。

### 4. 安装并启动

```bash
xcrun simctl boot "iPhone 16e"   # 模拟器已启动则跳过
open -a Simulator

xcrun simctl install booted build/Build/Products/Debug-iphonesimulator/CaptchaProExample.app
xcrun simctl launch booted com.captchapro.CaptchaProExample
```

### 5. 看日志调试

```bash
# 边启动边打日志（Ctrl-C 退出）
xcrun simctl launch --console-logs booted com.captchapro.CaptchaProExample

# 只过滤 app 自己的输出
xcrun simctl spawn booted log stream --predicate 'process == "CaptchaProExample"'
```

### 6. 直达指定 tab（免手动点击）

```bash
# TAB=slider（默认）| click | popup
# 环境变量通过 SIMCTL_CHILD_ 前缀传递（新版 simctl 已移除 --setenv）
SIMCTL_CHILD_TAB=click xcrun simctl launch booted com.captchapro.CaptchaProExample

# POPUP 让弹窗自动弹出：slider | click
SIMCTL_CHILD_TAB=popup SIMCTL_CHILD_POPUP=slider xcrun simctl launch booted com.captchapro.CaptchaProExample
```

## SDK 单独验证（packages/ios）

```bash
cd packages/ios

# 编译（不跑测试）
xcodebuild -scheme CaptchaPro -destination 'generic/platform=iOS Simulator' build

# 跑单元测试（需指定具体模拟器）
xcodebuild -scheme CaptchaPro -destination 'platform=iOS Simulator,name=iPhone 16e' test
```

> **不要用 `swift build`。** 它默认编 macOS，会报 `no such module 'UIKit'`；iOS SDK 必须用 `xcodebuild` + iOS destination。

## 后端地址

iOS 模拟器共享宿主 loopback，所以代码里直接写 `http://localhost:3001` 即可（见 [Sources/CaptchaProExampleApp.swift](Sources/CaptchaProExampleApp.swift) 的 `backend`）。

| 平台 | 后端地址 |
| --- | --- |
| iOS 模拟器 | `http://localhost:3001` |
| 真机 | `http://<宿主局域网 IP>:3001` |

## 功能

- **Slider** tab — 内嵌 `SliderCaptcha`
- **Click** tab — 内嵌 `ClickCaptcha`
- **Popup** tab — 两个按钮弹出滑块 / 点选验证码

验证结果通过控制台打印反馈（`✅ slider success` / `❌ slider fail` / `⚠️ slider error: ...`）。后端离线生成拼图 / 点选图：拖动滑块到缺口，或按提示顺序点击字符即可通过。
