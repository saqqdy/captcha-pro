# captcha-pro 2.1.0 Phase 2 — Native 样式复刻实施计划

> **For agentic workers:** 用 superpowers:subagent-driven-development 执行。5 个代码库互相独立，可并行。

**Goal:** 把 taro-vue 视觉样式复刻到 native 三端五套 UI（android Compose/View、ios UIKit/SwiftUI、flutter），使 2.1.0 达到发版门槛。

**基准（不改动，只读参考）：** `packages/taro-vue/src/styles/captcha.scss` + `packages/taro-vue/src/components/{slider,click,popup}-captcha.vue`。

**Global Constraints**
- 只改样式（颜色/渐变/阴影/圆角/遮罩反馈/loading 态/刷新按钮/滑块条/拇指/点击标记/提示条/popup 卡片）。**不改** API 契约、props、时序、尺寸（native 维持 300×170、滑块 42px）。
- 强调蓝统一 `#1991FA`（android 现有 `#1890FA` 全部改为 `#1991FA`）。
- 成功：图标底 `rgba(82,196,26,.85)` + 文本 `#389E0D`；失败：图标底 `rgba(255,77,79,.85)` + 文本 `#CF1322`。
- 状态反馈用「居中遮罩 + 圆图标 + 文本 + 淡入」**替换**底部条式反馈（若现有是底部条）。
- loading 态用「渐变底 + 白字 loading 文案」**替换**系统 spinner（若现有是系统 spinner）。
- 不动 invisible、统计、facade、设备指纹。

## 样式令牌表（源自 captcha.scss，native 用 px）

| 元素 | 规格 | hex/值 |
|---|---|---|
| 验证码区域底 | 线性渐变 135° + 阴影 + 圆角 | 渐变 `#667EEA→#764BA2`；阴影 `0 4 16 rgba(0,0,0,.15)`；圆角 8~16 |
| 状态遮罩 | 居中、白@75%、淡入 0.2s、scale 0.9→1 | bg `rgba(255,255,255,.75)` |
| 状态图标 | 32px 圆、白字 | success bg `rgba(82,196,26,.85)`；fail bg `rgba(255,77,79,.85)` |
| 状态文本 | success `#389E0D`；fail `#CF1322`；base `#333` | |
| loading 态 | 渐变底 + 白字 | 渐变 `#667EEA→#764BA2`；color `#FFF` |
| 刷新按钮 | 28px 白@90% 方圆角8 + `⟳` `#666` | bg `rgba(255,255,255,.9)` |
| 滑块条 | `#F7F9FA` 圆角8 + slider_hint 居中 `#999` | |
| 滑块拇指 | 白 + `#E1E4E8` 边框 圆角8 + `→` `#1991FA` | |
| 点击标记 | 24px 圆 `#1991FA` 白边3 | border `#FFF` 3 |
| 提示条 | `#F7F9FA` 圆角16 + 边框`#E8E8E8` + 字符格 28px 渐变紫蓝 + 阴影 | char 格渐变 `#667EEA→#764BA2`；阴影 `0 1 4 rgba(102,126,234,.3)` |
| popup 卡片 | 自定义卡片（非系统 Dialog）圆角24 + 阴影 + `×` 文本关闭 + 标题 | 圆角 24 |

## Task 分派（5 代码库，独立并行）

### Task A: flutter
- 文件：`packages/flutter/lib/src/widgets/{slider_captcha,click_captcha,popup_captcha}.dart`
- 参考：taro-vue `captcha.scss` + 三 `.vue` 组件
- 验证：`cd packages/flutter && flutter analyze` 无 error

### Task B: android Compose
- 文件：`packages/android/captcha-compose/src/main/java/com/captcha/pro/compose/{SliderCaptcha,ClickCaptcha}.kt`
- 若 Compose 无 popup 组件，跳过 popup（View 端 CaptchaDialog 覆盖）
- 验证：`cd packages/android && ./gradlew :captcha-compose:assembleDebug` → BUILD SUCCESSFUL

### Task C: android View
- 文件：`packages/android/captcha-sdk/src/main/java/com/captcha/pro/widget/{SliderCaptchaView,ClickCaptchaView,CaptchaDialog}.kt`
- `#1890FA` → `#1991FA` 全替换
- 验证：`cd packages/android && ./gradlew :captcha-sdk:assembleDebug` → BUILD SUCCESSFUL

### Task D: ios UIKit
- 文件：`packages/ios/Sources/Views/{SliderCaptchaView,ClickCaptchaView,CaptchaPopup}.swift`
- 验证：`cd packages/ios && xcodebuild -scheme CaptchaPro -destination 'generic/platform=iOS' -derivedDataPath .build build` → BUILD SUCCEEDED

### Task E: ios SwiftUI
- 文件：`packages/ios/Sources/SwiftUI/{SliderCaptcha,ClickCaptcha,PopupCaptcha}.swift`
- 验证：同 Task D（同一 package 一次构建覆盖两端）

## 收尾
- 全端重新构建验证（flutter analyze + gradle sdk&compose + xcodebuild）
- 契约终检（grep timestamp/precision/i18n/timeout 复跑 Phase 1 Task 1，确保样式改动未碰契约）
- 提交：`feat(native): replicate taro-vue visual style across native UIs`
- tag v2.1.0
