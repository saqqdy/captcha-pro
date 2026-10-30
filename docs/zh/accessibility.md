# 无障碍

captcha-pro 面向验证码交互流程（获取图片 → 交互（拖拽/点选）→ 校验 → 反馈）达到 **WCAG 2.2 Level AA** 一致性，覆盖所有平台：Web（Vue / Vue 2 / React）、六大小程序端、原生（Flutter / Android / iOS）。

每个可交互元素都暴露了无障碍名称与角色；状态变化（成功/失败）通过实时区域播报；触摸目标满足各平台最小值；Web 端完全可键盘操作。

## 一致性范围

一致性覆盖**验证码交互流程**：

- 获取验证码 → 交互 → 校验 → 反馈。
- 刷新、关闭、滑块拇指、点选标记、状态遮罩。
- 各平台语义：`aria-label` / `role`（Web 与小程序）、`Semantics`（Flutter）、`Modifier.semantics` / `contentDescription`（Android）、`accessibilityLabel` / `accessibilityTraits`（iOS）。

2.2.0 暂不在范围内：高对比/深色主题、弹窗的完整焦点陷阱（弹窗仅用 `role="dialog"` + 初始焦点；完整陷阱留待后续版本）。

## 键盘支持（Web）

Vue、Vue 2、React 封装完全可键盘操作。

| 按键 | 动作 |
| --- | --- |
| `Tab` | 按序聚焦：刷新 → 滑块拇指 / 点选区 → 关闭（弹窗） |
| `Enter` / `Space` | 激活当前控件（刷新、提交、点选中心） |
| `←` / `→` | 调整滑块拇指（Web 滑块） |
| `Enter` | 调整后提交滑块 |

可见聚焦环（`outline: 2px solid #1991fa; outline-offset: 2px`）在 `.refresh-btn`、`.slider-thumb`、`.popup-close`、`.click-marker` 的 `:focus-visible` 上显示。

## 屏幕阅读器支持

| 平台 | 屏幕阅读器 | 语义 |
| --- | --- | --- |
| Web（Vue/Vue2/React） | VoiceOver / NVDA / Narrator | `aria-label`、`role`、`aria-live`、`aria-valuenow/min/max` |
| 小程序 | 平台阅读器（微信/Taro） | `aria-label` / 可访问属性（按支持情况） |
| Flutter | TalkBack / VoiceOver | `Semantics(button/slider:, label:, value:, liveRegion:)` |
| Android | TalkBack | `Modifier.semantics { role, contentDescription, liveRegion }` / `contentDescription` |
| iOS | VoiceOver | `accessibilityLabel`、`accessibilityTraits`、`accessibilityValue`、`UIAccessibility.post(.announcement)` |

状态变化（成功/失败）以礼貌方式播报，不抢占焦点：Web `aria-live="polite"`；Flutter `Semantics(liveRegion: true)`；Android `LiveRegionMode.Polite` / `ViewCompat.announceForAccessibility`；iOS `UIAccessibility.post(notification: .announcement, ...)`。

## 触摸目标

刷新（及其他小）控件保持视觉尺寸不变，仅扩大透明点击区以满足各平台最小值：

| 平台 | 最小值 | 视觉 |
| --- | --- | --- |
| Web | 44 × 44 CSS px | 28 px 图标，44 px 透明 `::before` / padding |
| iOS | 44 × 44 pt | 28 pt 图标，44 pt 透明覆盖 |
| Android | 48 × 48 dp | 28 dp 图标，48 dp `TouchDelegate` / `Modifier.size` |
| Flutter | 44 × 44 pt | 28 px 图标，44 × 44 `SizedBox`（`HitTestBehavior.opaque`） |

视觉尺寸与颜色相较 2.1.0 不变；仅扩大透明点击区。

## 国际化

无障碍标签复用既有 i18n 键（`slider_hint`、`click_prompt`、`popup_close`、`popup_title`、`slider_success`、`slider_fail`、`click_success`、`click_fail`、`loading`）。2.2.0 新增一个键 `refresh`（`刷新` / `Refresh`），让每个图标按钮拥有本地化的无障碍名称。参见[多语言](./guide/i18n.md)。

## 已知偏差

- **`slider_hint` 对比度**：提示文字原为浅色背景上的 `#999999`（≈ 2.85:1，低于 4.5:1 最低值），现改为 `#666666`（≈ 5.7:1）。
- **iOS 关闭按钮 × 对比度**：弹窗关闭按钮 × 原为白色 header 上的 `#999999`（white 0.6，≈ 2.85:1），现改为 `#666666`（white 0.4，≈ 5.44:1），SwiftUI（`PopupCaptcha`）与 UIKit（`PopupCaptchaView`）两种范式均已应用。
- 以上是 2.1.0 样式令牌表中仅有的显式覆盖，用于对比度合规（WCAG 1.4.3）。
- **弹窗焦点陷阱**：仅实现 `role="dialog" aria-modal="true"` + 初始焦点移动；完整陷阱暂缓。

## 集成方检查清单

- **Web**：对实示例跑 axe-core / Lighthouse a11y 审计（≥ 95，无严重违规）；手测键盘顺序（`Tab`、`Enter`、`←`/`→`）。
- **Flutter**：开启 TalkBack / VoiceOver，确认刷新按钮、滑块、状态按名称播报（非 `⟳ → ✓ ✕` 原始字形）。
- **Android**：开启 TalkBack 验证同样内容；确认 `contentDescription` 存在。
- **iOS**：开启 VoiceOver 或 Xcode Accessibility Inspector，确认标签/特征无告警。
- **契约检查**：各平台无障碍属性计数 > 0 —— grep `aria-label|role=`、`Semantics`、`contentDescription|semantics`、`accessibilityLabel`。

要报告无障碍问题，请提 issue 并注明平台、屏幕阅读器及播报或可操作性有误的元素。

## 深色模式

**2.3.0** 在所有平台引入自动深色模式支持。验证码组件跟随系统配色偏好，无需手动切换 prop。

### 实现

- **Web**：CSS `@media (prefers-color-scheme: dark)` 媒体查询
- **Flutter**：`MediaQuery.platformBrightness` + `CaptchaColorScheme`
- **Android**：`values-night/colors.xml` 资源（View）+ `isSystemInDarkTheme()`（Compose）
- **iOS**：动态 `UIColor` provider + `@Environment(\.colorScheme)`（SwiftUI）

### 颜色令牌

深色模式保留品牌渐变（`#667EEA→#764BA2`）与强调色（`#1991FA`）。适配令牌包括：

| 元素 | 浅色 | 深色 | 对比度（深色） |
| --- | --- | --- | --- |
| 滑块条背景 | `#F7F9FA` | `#1F1F1F` | — |
| 滑块提示文字 | `#666` | `#AAA` | ≥ 4.5:1 |
| 提示条背景 | `#F7F9FA` | `#1F1F1F` | — |
| 提示文字 | `#666` | `#AAA` | ≥ 4.5:1 |
| 刷新按钮背景 | `rgba(255,255,255,0.9)` | `rgba(60,60,60,0.9)` | — |
| 状态遮罩背景 | `rgba(255,255,255,0.75)` | `rgba(0,0,0,0.6)` | — |
| 成功文字 | `#389E0D` | `#5CB85C` | ≥ 4.5:1 |
| 失败文字 | `#CF1322` | `#FF7875` | ≥ 4.5:1 |
| 弹窗卡片 | `#FFF` | `#1F1F1F` | — |
| 弹窗标题 | `#333` | `#EEE` | ≥ 4.5:1 |
| 弹窗关闭 | `#999` | `#AAA` | ≥ 4.5:1 |
| 弹窗遮罩 | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` | — |

所有深色模式文字颜色满足 WCAG 2.2 Level AA 对比度要求（≥ 4.5:1）。

### 小程序兼容性

`@media (prefers-color-scheme: dark)` 要求小程序基础库 **≥ 2.11**。更低版本回退至浅色模式。集成方应在发版说明中注明该最低版本。

### 焦点陷阱（Web 弹窗）

2.3.0 补齐了 2.2.0 暂缓的 Web 弹窗焦点陷阱。弹窗打开时：
- 焦点移至首个可聚焦元素（关闭按钮）
- `Tab` / `Shift+Tab` 在对话框内循环焦点
- 关闭时焦点回到触发元素

这确保键盘用户在弹窗打开时不会误操作背景。

### 手动覆盖

验证码组件**不**暴露 `dark` / `theme` prop。要覆盖系统偏好，集成方需：
- **Web**：在验证码样式之后注入自定义 CSS
- **原生**：用固定配色的主题 provider 包裹验证码
