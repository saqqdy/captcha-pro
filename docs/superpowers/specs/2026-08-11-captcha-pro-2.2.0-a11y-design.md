# captcha-pro 2.2.0 — 全端无障碍(a11y)合规 设计规格

- **日期**：2026-08-11
- **状态**：已批准，待写实施计划
- **前置**：2.1.0（native 三端功能契约 + 样式复刻）落地后开展。2.2.0 触碰相同包集但不改 API 契约，可并行开发，发版序 2.1.0 先。
- **审计基线**：全端当前 accessibility 标签数 = 0；刷新按钮触摸目标 28px（< 44pt/48dp 不达标）；状态图标用文本符号 `⟳→✓✕` 会被读屏逐字朗读。

## 1. 背景与目标

2.0.0 完成 14+ 平台多端首发；2.1.0 完成 native 三端功能契约 + 样式对齐（审计确认样式已在树中落地）。但**全端无障碍能力为零**：无 accessibility 标签、无 role、无读屏语义、触摸目标过小、web 端无键盘可达。

验证码是**访问门槛**——若读屏用户、键盘用户、运动障碍用户无法操作，即被阻断于受保护的服务之外。2.2.0 在 3.0.0（major breaking：移除客户端生成）之前做质量加固，补齐 a11y。

**目标**：全端（core + 11 JS 包 + 3 native 包）达到 WCAG 2.2 Level AA 的「验证码交互流」合规——取图 → 交互 → 验证 → 反馈全路径可被辅助技术操作与理解。

**非目标**：
- 不改 API 契约（getCaptcha/verify 请求响应不变）
- 不改视觉样式（2.1.0 已对齐 taro-vue，2.2.0 仅扩 hit area、不改视觉尺寸）
- 不引入高对比度主题 / 暗色模式（留后续版本）
- 不为 native 做纯键盘模式（native 用触摸；仅 web 做键盘可达）
- 不改后端（server/{node,java,go} 无 a11y 改动）

## 2. 决策

| 维度 | 决策 |
|---|---|
| 主题 | 全端无障碍合规 |
| 标准 | WCAG 2.2 Level AA（验证码交互流范围） |
| 范围 | core + vue/vue2/react + 6 小程序 + flutter + android(Compose+View) + ios(SwiftUI+UIKit) |
| 触摸目标 | ≥ 44pt（iOS）/ 48dp（Android）/ 44px（web）；视觉尺寸不变，扩大透明 hit area |
| 读屏语义 | 每个可交互元素有 label + role；状态变化走 live region 实时朗读 |
| 键盘（仅 web） | Tab 焦点序 + Enter/Space 操作；滑块支持 ←/→ |
| 版本 | 2.2.0 minor bump 全 14 包 + root（无 API 破坏） |

## 3. 目标契约（WCAG 2.2 Level AA，验证码交互流）

### 3.1 可感知（Perceivable）
- **1.1.1 Non-text Content**：所有图标按钮（刷新、关闭、滑块拇指、点击标记、状态图标）有 `accessibilityLabel`/`aria-label`/`contentDescription`。
- **1.4.3 Contrast (Minimum)**：确认现有配色对比度 ≥ 4.5:1（文本）/ 3:1（大文本/UI）。已知 #999 on #f7f9fa ≈ 2.85:1，不达标 → slider_hint 文本改 #666（≈ 5.7:1）。
- **1.4.11 Non-text Contrast**：UI 组件边框/图标对比度 ≥ 3:1。

### 3.2 可操作（Operable）
- **2.4.3 Focus Order**：web 端 Tab 顺序 = 刷新 → 滑块拇指 / 点击区 → 关闭（popup）。
- **2.4.7 Focus Visible**：web 端焦点元素有可见 focus ring（`:focus-visible` outline）。
- **2.5.5 Target Size (Minimum)**：触摸目标 ≥ 24×24 CSS px（AA Minimum）/ 推荐 44×44。刷新按钮 hit area 扩至 44px。
- **2.1.1 Keyboard**：web 端全功能键盘可达（刷新 Enter、滑块 ←/→ + Enter 提交、点击区 Tab + Enter 落点）。
- **2.1.4 Character Key Shortcuts**：无单字符快捷键（已满足）。

### 3.3 可理解（Understandable）
- **3.3.2 Labels or Instructions**：验证码组件有可访问名（如「滑块验证」/「点击验证」）；提示文案（slider_hint / click_prompt）作为可访问描述。

### 3.4 健壮（Robust）
- **4.1.2 Name, Role, Value**：每个可交互元素暴露 name + role + value（滑块暴露 value=当前位置/进度；点击区暴露已选点数）。
- **4.1.3 Status Messages**：成功/失败走 live region（`aria-live="polite"` / `UIAccessibility.post(.announcement)` / `Modifier.semantics { liveRegion = .polite }`），不抢焦点。

## 4. 详细设计

### 4.1 core（共享逻辑层）
- `utils.ts`：新增 `a11y` 导出（无运行时逻辑，仅类型/常量，供 wrapper 引用 i18n 键 → a11y label 映射）。
- `types.ts`：`BaseCaptchaOptions` 无新增字段（a11y 用 i18n 现有键，不增 prop，保 API 稳定）。
- 单测：core 无 UI，a11y 测试在 wrapper 层。

### 4.2 web wrappers（vue / vue2 / react）
每端 SliderCaptcha + ClickCaptcha + PopupCaptcha：
- **role + aria-label**：刷新按钮 `role="button" aria-label=t('refresh')`；滑块拇指 `role="slider" aria-label=t('slider_hint') aria-valuemin=0 aria-valuemax=maxX aria-valuenow=currentX`；点击区 `role="button" aria-label=t('click_prompt')`；状态遮罩 `aria-live="polite"`。
- **键盘**：刷新按钮 `tabindex=0` + `@keydown.enter`；滑块拇指 `tabindex=0` + `←/→` 调整 + `Enter` 提交；点击区 `tabindex=0` + `Enter` 落点（落在焦点位或中心）。
- **focus visible**：`:focus-visible { outline: 2px solid #1991fa; outline-offset: 2px }`（CSS / 内联 style）。
- **触摸目标**：刷新按钮视觉 28px 不变，外包一层 44px 透明 hit area（`padding` 或 `::before`）。
- **状态 live region**：状态遮罩容器 `aria-live="polite" aria-atomic="true"`，状态变化时读屏朗读 success/fail 文案。
- **popup**：关闭按钮 `aria-label=t('popup_close')`；dialog 容器 `role="dialog" aria-modal="true" aria-label=displayTitle`；打开时焦点陷阱（focus trap）+ 焦点移至标题/关闭。

涉及文件：
- vue：`SliderCaptcha.vue`、`ClickCaptcha.vue`、`PopupCaptcha.vue` + `composables/useSliderCaptcha.ts`、`useClickCaptcha.ts`
- vue2：`SliderCaptcha.vue`、`ClickCaptcha.vue`、`PopupCaptcha.vue`
- react：`SliderCaptcha.tsx`、`ClickCaptcha.tsx`、`PopupCaptcha.tsx` + `hooks/useSliderCaptcha.ts`、`useClickCaptcha.ts`

### 4.3 flutter
- `Semantics` widget 包裹：刷新按钮 `button: true, label: t('refresh')`；滑块拇指 `slider: true, label: t('slider_hint'), value: '$currentX', onIncrease`/`onDecrease`；点击区 `button: true, label: t('click_prompt')`。
- 状态遮罩：`liveRegion: true`（Semantics flag）朗读 success/fail。
- popup：`Semantics(container: true, label: displayTitle)`；路由 barrier dismissable 时附语义。
- 触摸目标：刷新按钮外包 `SizedBox(44,44)` 透明 hit area（`behavior: HitTestBehavior.opaque`）。

涉及文件：`packages/flutter/lib/src/widgets/{slider_captcha,click_captcha,popup_captcha}.dart`

### 4.4 android — Compose
- `Modifier.semantics { ... }`：刷新 `role = Role.Button; contentDescription = t("refresh")`；滑块拇指 `role = Role.Slider; contentDescription; onIncrease/onDecrease`；点击区 `role = Role.Button; contentDescription = t("click_prompt")`。
- 状态遮罩：`Modifier.semantics { liveRegion = LiveRegionMode.Polite }`。
- 触摸目标：刷新按钮外包 `Modifier.size(44.dp).clickable(...)`，内部图标 28dp 居中。
- popup（若 Compose 有）：`Modifier.semantics { dialog = true }`。

涉及文件：`packages/android/captcha-compose/.../{SliderCaptcha,ClickCaptcha}.kt`

### 4.5 android — View
- `contentDescription`：刷新按钮 `refreshButton.contentDescription = t("refresh")`；点击区 `bgImageView.contentDescription = t("click_prompt")`；滑块拇指 `sliderThumbView.contentDescription = t("slider_hint")` + `accessibilityValue`。
- 状态：`ViewCompat.announceForAccessibility(statusView, message)` 或 `accessibilityLiveRegion = ViewCompat.ACCESSIBILITY_LIVE_REGION_POLITE`。
- 触摸目标：`refreshButton` 外包 48dp 透明 TouchDelegate，视觉 28dp 居中。
- popup：`containerView.contentDescription` + `setAccessibilityDelegate`。

涉及文件：`packages/android/captcha-sdk/.../widget/{SliderCaptchaView,ClickCaptchaView,CaptchaDialog}.kt`

### 4.6 ios — SwiftUI
- `.accessibilityLabel(...)` / `.accessibilityHint(...)` / `.accessibilityAddTraits(.isButton|.isSlider)`：刷新、滑块拇指、点击区。
- 滑块拇指 `.accessibilityValue("\(currentX)")` + `.accessibilityAdjustableAction`。
- 状态：`.accessibilityAddTraits(.updatesFrequently)` 或 `UIAccessibility.post(.announcement, ...)`。
- popup：`.accessibilityAddTraits(.isModal)` + 焦点管理。

涉及文件：`packages/ios/Sources/SwiftUI/{SliderCaptcha,ClickCaptcha,PopupCaptcha}.swift`

### 4.7 ios — UIKit
- `accessibilityLabel` / `accessibilityHint` / `accessibilityTraits = .button / .slider`：刷新、滑块拇指、点击区。
- 滑块拇指 `accessibilityValue = "\(currentX)"` + `accessibilityIncrement/Decrement`。
- 状态：`UIAccessibility.post(notification: .announcement, argument: message)`。
- 触摸目标：刷新按钮外包 44pt 透明 UIView + `extensionHit`（或 `frame` 扩大 + 子层视觉 28pt 居中）。
- popup：`accessibilityViewIsModal = true` + 焦点管理。

涉及文件：`packages/ios/Sources/Views/{SliderCaptchaView,ClickCaptchaView,CaptchaPopup}.swift`

### 4.8 i18n 键扩展
现有 14 键无「刷新」专用 a11y 文案。**决策：新增 1 键 `refresh`**（zh: 刷新 / en: Refresh），14 → 15 键。其余 a11y label 复用现有键：`slider_hint`（滑块）、`click_prompt`（点击）、`popup_close`（关闭）、`popup_title`（dialog 名）、`slider_success`/`slider_fail`/`click_success`/`click_fail`（状态朗读，已存在）。
- 涉及：`packages/mp-shared/src/i18n.ts` + 3 native `LocaleMessages`（`Types.kt` / `Types.swift` / flutter `i18n.dart`）同步加 `refresh` 键。

## 5. 验证与发版

### 验证
- **web**：axe-core / lighthouse a11y 审计 ≥ 95；键盘手动测（Tab 序、Enter、←/→）；`turbo build && turbo test` 全绿。
- **flutter**：`flutter analyze` 无 error；`flutter test` 若有 a11y 测试基建则跑；手动 TalkBack 抽测。
- **android**：`./gradlew assembleDebug` 通过；TalkBack 抽测；`ui-automator` a11y 检查（若 CI 有）。
- **ios**：`swift build` 通过；VoiceOver 抽测；Xcode Accessibility Inspector 扫描无 warning。
- **grep 契约校验**：每端 accessibility 标签数 > 0（`accessibilityLabel|contentDescription|semantics|aria-label`）；`refresh` 键在 4 处 i18n 源均存在。

### 发版
- changeset：14 包 + root 一律 2.1.0 → 2.2.0（minor）。
- CHANGELOG.md 顶部追加 `[2.2.0]` 条目。
- a11y 文档：`docs/accessibility.md`（验证码无障碍使用说明 + 键盘快捷键表 + 读屏支持列表）。

## 6. 风险与判断点

- **触摸目标 vs 视觉**：扩大 hit area 不得改变视觉尺寸（否则破坏 2.1.0 样式对齐）。用透明外包层 / TouchDelegate / `::before`，视觉层不动。
- **slider_hint 对比度**：#999 on #f7f9fa ≈ 2.85:1 不达 4.5:1。改 #666 会破坏样式令牌表。**判断点**：可覆盖 spec 令牌表（§3.1 1.4.3），因 a11y 合规优先级高于样式 1:1 复刻；记录为 2.2.0 显式偏差。
- **native 无单测基建**：a11y 验证依赖 build + 辅助技术抽测，无自动化兜底。建议每端完成即 TalkBack/VoiceOver 抽测。
- **focus trap（web popup）**：实现焦点陷阱需额外 JS，增加复杂度。判断点：可首版仅做 `role=dialog` + 初始焦点，不实现完整 trap（留后续）。
- **i18n 键扩展**：新增 `refresh` 键需同步 4 处 i18n 源 + changeset 记录。若判断「不新增、用图标 `aria-label` 直接硬编码」则避免 i18n 改动，但牺牲 zh/en 之外将来的本地化。推荐新增键。
- **2.1.0 依赖**：2.2.0 发版序在 2.1.0 后；触碰包集相同（native + core + wrapper），但 2.1.0 未改 a11y，2.2.0 不改契约，可并行开发。
