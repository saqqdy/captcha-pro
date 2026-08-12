# captcha-pro 2.3.0 — 全端暗色模式适配 设计规格

- **日期**：2026-08-11
- **状态**：已批准，待写实施计划
- **前置**：2.2.0（a11y）落地后开展。2.3.0 触碰各端样式层但不改 API 契约，发版序 2.2.0 先。这是 3.0.0（major breaking：移除客户端生成）前最后一个 minor。
- **承接**：2.2.0 spec §1 明确「不引入高对比度主题 / 暗色模式（留后续版本）」、§6 推迟 web popup focus trap 至后续。2.3.0 兑现这两项。

## 1. 背景与目标

2.2.0 完成 a11y 合规（light 模式）。各端颜色当前**硬编码 inline**（flutter `Color(0xFF...)`、android `Color(0xFF...)`/`Color.parseColor`、ios `Color(red:...)`/`UIColor(red:...)`、web `captcha.scss` hex），无暗色变体。系统切暗色时验证码组件仍为 light，与宿主应用视觉冲突。

**目标**：全端跟随系统暗色主题——验证码区域渐变保留（品牌识别），适配滑块条/提示条/popup 外壳/状态遮罩的暗色变体。同时补齐 2.2.0 推迟的 web popup focus trap。

**非目标**：
- 不改 API 契约（getCaptcha/verify 不变；不增 dark mode prop——跟随系统，无手动开关）
- 不改验证码区域渐变 `#667eea→#764ba2`（品牌识别，light/dark 通用）
- 不改点击标记 `#1991fa` / 滑块箭头 `#1991fa` / 字符格渐变（强调色通用）
- 不引入手动主题切换 API（跟随系统 `prefers-color-scheme` / `userInterfaceStyle`；手动开关留后续）
- 不改后端
- 不做高对比度主题（HC mode 留后续）

## 2. 决策

| 维度 | 决策 |
|---|---|
| 主题 | 全端暗色模式适配（跟随系统，无手动开关） |
| 范围 | core（无）+ vue/vue2/react + 6 小程序 + flutter + android(Compose+View) + ios(SwiftUI+UIKit) |
| 验证码区域渐变 | 保留 `#667eea→#764ba2`（light/dark 通用） |
| 强调色 | `#1991fa` 保留（通用） |
| 暗色实现 | 各端原生机制：web CSS `@media`、flutter `MediaQuery`、android 资源限定/`isSystemInDarkTheme`、ios Color Asset/`colorScheme` |
| focus trap | 兑现 2.2.0 推迟：web popup 完整焦点陷阱 |
| 版本 | 2.3.0 minor bump 全 14 包 + root（无 API 破坏） |

## 3. 暗色令牌表

### 3.1 保留（light/dark 通用，不改）

| 元素 | 值 | 理由 |
|---|---|---|
| 验证码区域渐变 | `#667eea→#764ba2` | 品牌识别 |
| 字符格渐变 | `#667eea→#764ba2` | 同上 |
| 点击标记 | `#1991fa` + 白边 | 强调色通用 |
| 滑块箭头 | `#1991fa` | 强调色 |
| loading 渐变 | `#667eea→#764ba2` | 品牌识别 |
| 状态图标符号 | `✓`/`✕` | 不变 |

### 3.2 light → dark 映射

| 元素 | light | dark | 说明 |
|---|---|---|---|
| slider-bar 底 | `#f7f9fa` | `#1f1f1f` | 表层 |
| slider hint 文本 | `#666` | `#aaaaaa` | 2.2.0 已 #999→#666；dark 用 #aaa |
| slider-thumb 底 | `#fff` | `#2a2a2a` | 次表层 |
| slider-thumb 边框 | `#e1e4e8` | `#3a3a3a` | 边框 |
| prompt-bar 底 | `#f7f9fa` | `#1f1f1f` | 表层 |
| prompt-bar 边框 | `#e8e8e8` | `#3a3a3a` | 边框 |
| prompt-text | `#666` | `#aaaaaa` | 次文本 |
| refresh-btn 底 | `rgba(255,255,255,0.9)` | `rgba(60,60,60,0.9)` | 按钮底 |
| refresh-icon | `#666` | `#aaaaaa` | 图标 |
| status-overlay 底 | `rgba(255,255,255,0.75)` | `rgba(0,0,0,0.6)` | 遮罩 |
| 成功文本 | `#389e0d` | `#5cb85c` | dark 提亮 |
| 失败文本 | `#cf1322` | `#ff7875` | dark 提亮 |
| 成功图标底 | `rgba(82,196,26,0.85)` | `rgba(82,196,26,0.9)` | 微提透明度 |
| 失败图标底 | `rgba(255,77,79,0.85)` | `rgba(255,77,79,0.9)` | 微提透明度 |
| popup 卡片底 | `#fff` | `#1f1f1f` | 表层 |
| popup 标题 | `#333` | `#eeeeee` | 主文本 |
| popup 关闭 | `#999` | `#aaaaaa` | 次文本 |
| popup 分隔线 | `#eee` | `#3a3a3a` | 边框 |
| popup mask | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` | dark 加深 |

## 4. 详细设计

### 4.1 web（vue/vue2/react + 6 小程序 + taro-vue）
- `packages/taro-vue/src/styles/captcha.scss`：在现有 light 规则后追加 `@media (prefers-color-scheme: dark) { ... }` 覆盖块，逐元素覆写 §3.2 dark 值。CSS 媒体查询自动跟随系统，无 JS。
- 小程序：`@media (prefers-color-scheme: dark)` 在 weixin/uniapp/taro 均支持（基础库 ≥ 2.11）。验证各端兼容。
- focus trap（兑现 2.2.0 推迟）：`PopupCaptcha.vue/.tsx` 实现 Tab/Shift+Tab 焦点陷阱——打开时焦点入 dialog，关闭时焦点返触发元素；`role="dialog"` 已有（2.2.0 加），补 `keydown.tab` handler + 焦点元素缓存。

### 4.2 flutter
- 新增 `packages/flutter/lib/src/core/theme.dart`：`CaptchaColors` 类，`CaptchaColors.of(context)` 按 `MediaQuery.platformBrightness` 返回 light/dark `CaptchaColorScheme`（含 §3.2 所有字段）。
- 3 个 widget（slider/click/popup）将硬编码 `Color(0xFF...)` 替换为 `CaptchaColors.of(context).xxx`。
- 保留项（渐变/强调色）仍硬编码或常量。

### 4.3 android — Compose
- `isSystemInDarkTheme()` + 新增 `CaptchaColorScheme` data class（light/dark factory）。
- `SliderCaptcha.kt`/`ClickCaptcha.kt` 硬编码 `Color(0xFF...)` → `colorScheme.xxx`。

### 4.4 android — View
- **资源限定方案**（推荐，无代码分支）：新建 `packages/android/captcha-sdk/src/main/res/values/colors.xml` + `values-night/colors.xml`，颜色移入资源；`CanvasRenderer.kt`/widget Views 的 `Color.parseColor("#...")` → `ContextCompat.getColor(context, R.color.captcha_xxx)`。
- 现状颜色散在 CanvasRenderer.kt + widget/*.kt，需先 grep 定位全部硬编码色，迁入资源。

### 4.5 ios — SwiftUI
- **Color Asset 方案**（推荐）：`Assets.xcassets` 新增 dark 可适配 Color Set（每个颜色 light + dark variant）；`Color("CaptchaSliderBar")` 自动跟随 `traitCollection`。
- 或 `@Environment(\.colorScheme)` 条件分支（简单但散）。
- `SliderCaptcha.swift`/`ClickCaptcha.swift`/`PopupCaptcha.swift` 硬编码 `Color(red:...)` → `Color("CaptchaXxx")`。

### 4.6 ios — UIKit
- **UIColor dynamic provider 方案**（推荐）：`UIColor { traitCollection in traitCollection.userInterfaceStyle == .dark ? darkColor : lightColor }`，自动跟随。
- 或 Color Asset + `UIColor(named:)`。
- `SliderCaptchaView.swift`/`ClickCaptchaView.swift`/`CaptchaPopup.swift` 硬编码 `UIColor(red:...)` → 动态 UIColor。

## 5. 验证与发版

### 验证
- **web**：`turbo build` 全绿；浏览器切暗色目视比对；`prefers-color-scheme` 媒体查询生效。
- **flutter**：`flutter analyze` 无 error；`flutter build apk --debug`；模拟器切暗色目视比对。
- **android**：`./gradlew assembleDebug`；模拟器 dark theme 目视比对；`values-night` 资源生效。
- **ios**：`swift build`；模拟器 `userInterfaceStyle = dark` 目视比对；Xcode preview light/dark。
- **grep 校验**：各端无遗漏硬编码 light 色（应全部走 dark 可适配路径）。
- **focus trap**：键盘测——Tab/Shift+Tab 不出 dialog；关闭后焦点返触发元素。

### 发版
- changeset：14 包 + root 一律 2.2.0 → 2.3.0（minor）。
- CHANGELOG.md 顶部追加 `[2.3.0]` 条目。
- 文档：`docs/accessibility.md` 补暗色模式说明；README 截图 light/dark 双版本。

## 6. 风险与判断点

- **颜色散落 inline**：各端颜色硬编码在多处，dark 适配需逐处替换。**判断点**：是否引入颜色集中层（flutter `CaptchaColors`/android 资源/ios Asset）？推荐引入，降低后续维护成本；但增加 2.3.0 改动面。可接受。
- **小程序 `prefers-color-scheme` 兼容**：旧版基础库不支持。判断点：设最低基础库版本，或回退 light。建议设最低版本并在文档声明。
- **native 暗色 a11y 对比度**：2.2.0 a11y 在 light 下验证；dark 下对比度需重验（§3.2 已提亮状态文本保证 dark 对比度 ≥ 4.5:1）。
- **focus trap 复杂度**：完整焦点陷阱需 JS 管理「上一次焦点 + Tab 拦截」，增加 web 包体积。判断点：可用极简实现（`addEventListener('keydown', ...)` + 焦点元素缓存），不引第三方库。
- **手动开关缺位**：仅跟随系统，不提供 `dark` prop。依赖手动切换的宿主需自行覆盖 CSS。判断点：可后续版本加 `theme` prop，2.3.0 不加（保 API 稳定）。
- **2.2.0 依赖**：2.3.0 发版序在 2.2.0 后；focus trap 兑现 2.2.0 推迟项，需 2.2.0 的 `role="dialog"` 已落地。
