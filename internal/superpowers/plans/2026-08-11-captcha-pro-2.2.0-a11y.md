# captcha-pro 2.2.0 — 全端无障碍(a11y)合规 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全端（core + vue/vue2/react + 6 小程序 + flutter + android + ios）达到 WCAG 2.2 Level AA「验证码交互流」合规——读屏语义、触摸目标、键盘可达、状态 live region 全补齐。

**Architecture:** 源码审计发现全端 accessibility 标签数 = 0、刷新按钮触摸目标 28px（< 44pt/48dp）、状态图标用文本符号被读屏逐字朗读。2.2.0 是「补缺 + 合规」版本，不改 API 契约、不改视觉样式（仅扩 hit area、不改视觉尺寸）。i18n 新增 1 键 `refresh`（14 → 15 键）。各端 a11y API 互不相同但模式一致：每个可交互元素加 label + role，状态变化走 live region。

**Tech Stack:** TypeScript/pnpm/turbo/changesets、Dart/Flutter、Kotlin/Android(Compose+View)、Swift/iOS(SwiftUI+UIKit)。

**Design spec:** `docs/superpowers/specs/2026-08-11-captcha-pro-2.2.0-a11y-design.md`（WCAG 2.2 条款映射、令牌、判断点见此）。

## Global Constraints

- **不改 API 契约**：getCaptcha/verify 请求响应不变；`BaseCaptchaOptions` 不新增 prop（a11y 用 i18n 键，不增配置）。
- **不改视觉样式**：2.1.0 已对齐 taro-vue 令牌表，2.2.0 仅扩 hit area（透明外包层），视觉尺寸/颜色不动。唯一显式偏差：slider_hint 文本 `#999`→`#666`（对比度合规，spec §6 判断点）。
- **触摸目标**：≥ 44pt（iOS）/ 48dp（Android）/ 44px（web），视觉尺寸不变，扩大透明点击区。
- **native 无单测**：a11y 验证 = build 通过 + TalkBack/VoiceOver 抽测 + grep 标签数 > 0；偏离严格 TDD。web 端用 axe-core 审计。
- **i18n**：14 键 → 15 键（新增 `refresh`），4 处 i18n 源同步。
- **node**：JS 侧构建用 node 18（`.node-version` + `fnm use`），canvas 包需 `PYTHON=/usr/local/bin/python3.11`（仅当装新依赖）。
- **基准**：taro-vue 不改动（契约来源）；examples/* 不涉及（除非跑 a11y 审计需起 server）。

## 现状审计（已确认，勿重复探索）

| 项 | 现状 | 文件:行 |
|---|---|---|
| 全端 accessibility 标签数 | **0**（全空） | grep 全端 0 命中 |
| flutter 刷新按钮尺寸 | 28px（< 44） | `slider_captcha.dart:241` |
| ios 刷新按钮尺寸 | 28px（< 44） | `SliderCaptchaView.swift:136` |
| slider_hint 文本色 | `#999` on `#f7f9fa` ≈ 2.85:1（不达标） | 各端 slider-bar hint |
| i18n 键数 | 14（无 `refresh`） | `mp-shared/src/i18n.ts` + 3 native LocaleMessages |
| 暗色模式 | 0 处适配（不在 2.2.0 范围） | — |

---

### Task 1: i18n 新增 `refresh` 键 + slider_hint 对比度修正

**Files:**
- Modify: `packages/mp-shared/src/i18n.ts`
- Modify: `packages/flutter/lib/src/core/i18n.dart`
- Modify: `packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt`
- Modify: `packages/ios/Sources/Core/Types.swift`

**Interfaces:** 产出 15 键 i18n（zh-CN + en-US），供各端 a11y label 引用 `refresh`。

- [ ] **Step 1: mp-shared 新增 `refresh` 键**

`packages/mp-shared/src/i18n.ts`：在 14 键 map 中加 `refresh`（zh: `'刷新'`，en: `'Refresh'`）。确认 `getLocaleMessage(locale, 'refresh')` 可用。

- [ ] **Step 2: flutter i18n 同步**

`packages/flutter/lib/src/core/i18n.dart`：zh + en map 各加 `refresh` 键。

- [ ] **Step 3: android LocaleMessages 同步**

`packages/android/captcha-sdk/.../core/Types.kt`：`ZH_CN` map（line ~22）与 `EN_US` map（line ~38）各加 `"refresh" to "刷新"` / `"refresh" to "Refresh"`。

- [ ] **Step 4: ios LocaleMessages 同步**

`packages/ios/Sources/Core/Types.swift`：zh + en map 各加 `"refresh": "刷新"` / `"refresh": "Refresh"`。

- [ ] **Step 5: 校验 15 键齐全**

Run:
```bash
for f in packages/mp-shared/src/i18n.ts packages/flutter/lib/src/core/i18n.dart packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt packages/ios/Sources/Core/Types.swift; do echo "== $f =="; grep -c '"refresh"' "$f"; done
```
Expected: mp-shared ≥1；flutter ≥2（zh+en）；android ≥2；ios ≥2。

- [ ] **Step 6: slider_hint 文本对比度修正 #999→#666**

各端 slider-bar hint 文本色 `#999`→`#666`（对比度 2.85:1 → 5.7:1，达 4.5:1）。这是 2.2.0 对样式令牌表的唯一显式偏差（spec §6 判断点）。涉及：
- flutter `slider_captcha.dart:330` `Color(0xFF999999)` → `Color(0xFF666666)`
- android Compose `SliderCaptcha.kt` hint color；android View `SliderCaptchaView.kt` hint color
- ios SwiftUI `SliderCaptcha.swift:122` `Color(white: 0.6)` → `Color(white: 0.4)`（0.4=#666，0.6=#999；翻转）；ios UIKit `SliderCaptchaView.swift:193` `UIColor(white: 0.6, alpha: 1)` → `UIColor(white: 0.4, alpha: 1)`

> 注意：iOS 现用 `white: 0.6`=#999 作 hint，`white: 0.4`=#666 作 refresh icon。修正后 hint 用 0.4、refresh icon 维持 0.4（两者同色 #666，可接受）。

- [ ] **Step 7: 提交**

```bash
git add packages/mp-shared/src/i18n.ts packages/flutter/lib/src/core/i18n.dart packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt packages/ios/Sources/Core/Types.swift
git commit -m "feat(i18n): add 'refresh' key (15th) for a11y labels; fix slider_hint contrast #999→#666"
```

---

### Task 2: web wrappers（vue / vue2 / react）a11y

**Files:**
- Modify: `packages/vue/src/components/{SliderCaptcha,ClickCaptcha,PopupCaptcha}.vue`
- Modify: `packages/vue/src/composables/{useSliderCaptcha,useClickCaptcha}.ts`
- Modify: `packages/vue2/src/components/{SliderCaptcha,ClickCaptcha,PopupCaptcha}.vue`
- Modify: `packages/react/src/components/{SliderCaptcha,ClickCaptcha,PopupCaptcha}.tsx`
- Modify: `packages/react/src/hooks/{useSliderCaptcha,useClickCaptcha}.ts`
- Modify: `packages/taro-vue/src/styles/captcha.scss`（仅 focus-visible + hit area，不改色值）
- Modify: 6 小程序组件（同 taro-vue 模式，aria 在小程序为对应 attribute）

**Interfaces:**
- Consumes: `getLocaleMessage(locale, 'refresh'|'slider_hint'|'click_prompt'|'popup_close'|'popup_title')` from i18n
- Produces: role + aria-label + tabindex + 键盘 handler + aria-live + 44px hit area

- [ ] **Step 1: vue SliderCaptcha a11y**

`packages/vue/src/components/SliderCaptcha.vue`：
- 刷新按钮：`role="button" tabindex="0" :aria-label="t('refresh')" @keydown.enter="refresh"`，外包 44px 透明 hit area（`::before` 或 padding）
- 滑块拇指（MovableView）：`role="slider" tabindex="0" :aria-label="t('slider_hint')" :aria-valuemin="0" :aria-valuemax="widthPx - sliderWidth" :aria-valuenow="sliderX"`，加 `←/→` keydown 调整 + `Enter` 提交
- 状态遮罩 `.status-overlay`：加 `aria-live="polite" aria-atomic="true"`（状态变化自动朗读）
- 验证码区域 `.captcha-area`：加 `role="region" :aria-label="t('slider_hint')"`（可访问名）

- [ ] **Step 2: vue ClickCaptcha a11y**

`packages/vue/src/components/ClickCaptcha.vue`：
- 刷新按钮：同 Step 1
- 点击区 `.captcha-area`：`role="button" tabindex="0" :aria-label="t('click_prompt')" @keydown.enter="handleClickAtCenter"`，加键盘落点（Enter 落在区域中心或上次焦点位）
- 已选点数：`aria-label` 暴露「已选 N/M」（如 `:aria-label="\`已选 ${clickPoints.length}/${maxClicks}\`"`）
- 状态遮罩：`aria-live="polite"`

- [ ] **Step 3: vue PopupCaptcha a11y**

`packages/vue/src/components/PopupCaptcha.vue`：
- dialog 容器 `.popup-captcha`：`role="dialog" aria-modal="true" :aria-label="displayTitle"`
- 关闭按钮 `.popup-close`：`aria-label="t('popup_close')"` + `tabindex="0"`
- 打开时焦点移至关闭按钮（`nextTick` + `focus()`）
- 首版不实现完整 focus trap（spec §6 判断点；仅 `role=dialog` + 初始焦点）

- [ ] **Step 4: vue2 三组件同步 Step 1-3**

`packages/vue2/src/components/{SliderCaptcha,ClickCaptcha,PopupCaptcha}.vue`：同 vue，但用 Options API 语法（`@keydown.native` 等）。

- [ ] **Step 5: react 三组件同步**

`packages/react/src/components/{SliderCaptcha,ClickCaptcha,PopupCaptcha}.tsx`：同 vue，JSX 语法（`role="slider" aria-valuenow={sliderX} onKeyDown={...}`）。

- [ ] **Step 6: focus-visible CSS + hit area**

`packages/taro-vue/src/styles/captcha.scss`（共享样式，vue/vue2/react/小程序均引用）追加：
```scss
.refresh-btn:focus-visible,
.slider-thumb:focus-visible,
.popup-close:focus-visible,
.click-marker:focus-visible {
  outline: 2px solid #1991fa;
  outline-offset: 2px;
}
/* 扩大刷新按钮 hit area 至 44px，视觉 56rpx 不变 */
.refresh-btn::before {
  content: '';
  position: absolute;
  inset: -8rpx; /* 56rpx + 16rpx = 72rpx ≈ 36px... 调整至 ≥ 44px */
}
```
> 判断点：rpx→px 换算确认 hit area ≥ 44px（375 屏）。若 `::before` 在小程序不生效，改用 padding 方案。

- [ ] **Step 7: 6 小程序组件同步 aria**

weixin/uniapp-vue/uniapp-vue2/taro-react/taro-vue/taro-vue2：小程序 `aria-*` 支持 via `aria-label`/`role` attribute（部分小程序转 `accessible-*`）。逐端加同 vue 的 aria + tabindex + hit area。

- [ ] **Step 8: web 构建与 axe 审计**

Run:
```bash
fnm use 18 && pnpm turbo build
```
Expected: 11 JS 包构建成功。

手动/CI 跑 axe-core 扫描 example（需起 `server/node`）：a11y score ≥ 95，无 critical violation。键盘手动测：Tab 序 = 刷新 → 滑块/点击区 → 关闭；Enter 刷新；←/→ 调滑块；Enter 提交。

- [ ] **Step 9: 提交**

```bash
git add packages/vue packages/vue2 packages/react packages/taro-vue packages/weixin packages/uniapp-vue packages/uniapp-vue2 packages/taro-react packages/taro-vue2
git commit -m "feat(web): WCAG 2.2 a11y — aria-labels, role, keyboard, live region, 44px hit area"
```

---

### Task 3: flutter a11y

**Files:**
- Modify: `packages/flutter/lib/src/widgets/slider_captcha.dart`
- Modify: `packages/flutter/lib/src/widgets/click_captcha.dart`
- Modify: `packages/flutter/lib/src/widgets/popup_captcha.dart`

**Interfaces:**
- Consumes: `getLocaleMessage(locale, 'refresh'|'slider_hint'|'click_prompt'|'popup_title')`
- Produces: `Semantics` 包裹（button/slider/container + label + liveRegion）+ 44pt hit area

- [ ] **Step 1: slider_captcha.dart a11y**

`packages/flutter/lib/src/widgets/slider_captcha.dart`：
- 刷新按钮 `_buildRefreshButton()`（line ~237）：外包 `Semantics(button: true, label: t('refresh'), child: ...)`；视觉 28px 不变，外包 `SizedBox(width: 44, height: 44, child: ...)` 透明 hit area（`behavior: HitTestBehavior.opaque`）
- 滑块拇指（line ~333 Positioned Container）：`Semantics(button: true, label: t('slider_hint'), value: '${_sliderX.toInt()}', child: ...)`（flutter `slider` 语义需 onIncrease/onDecrease，可选）
- 状态遮罩 `_buildStatusOverlay()`（line ~261）：`Semantics(liveRegion: true, child: ...)` 朗读 success/fail
- loading 态文本：`Semantics(label: t('loading'), child: ...)`

- [ ] **Step 2: click_captcha.dart a11y**

`packages/flutter/lib/src/widgets/click_captcha.dart`：
- 点击区 GestureDetector（line ~172）：外包 `Semantics(button: true, label: t('click_prompt'), child: ...)` + `onTap` 语义
- 已选点数：`Semantics(value: '${_clickPoints.length}/$_maxClicks', child: ...)`（或合并到点击区 label）
- 刷新按钮（line ~263）、状态遮罩（line ~287）：同 slider

- [ ] **Step 3: popup_captcha.dart a11y**

`packages/flutter/lib/src/widgets/popup_captcha.dart`：
- 卡片 Container（line ~192）：`Semantics(container: true, label: _displayTitle, child: ...)`（dialog 可访问名）
- 关闭按钮（line ~244）：`Semantics(button: true, label: getLocaleMessage(locale, 'popup_close'), child: ...)`
- mask（line ~184）：`Semantics(button: true, label: ..., child: ...)`（若 maskClosable）
- `PopupCaptcha.show` 路由：焦点管理（首次 build 焦点移至卡片）

- [ ] **Step 4: flutter 静态分析**

Run:
```bash
cd packages/flutter && flutter analyze
```
Expected: 无 error（warning 可接受）。

- [ ] **Step 5: TalkBack 抽测（手动）**

在 example app 中开 TalkBack，验证：刷新按钮朗读「刷新」、滑块朗读「向右拖动验证」、状态变化朗读「成功/失败」。无逐字朗读 `⟳→✓✕`。

- [ ] **Step 6: 提交**

```bash
git add packages/flutter/lib/src/widgets/slider_captcha.dart packages/flutter/lib/src/widgets/click_captcha.dart packages/flutter/lib/src/widgets/popup_captcha.dart
git commit -m "feat(flutter): WCAG 2.2 a11y — Semantics labels, liveRegion, 44pt hit area"
```

---

### Task 4: android a11y（Compose + View）

**Files:**
- Modify: `packages/android/captcha-compose/src/main/java/com/captcha/pro/compose/{SliderCaptcha,ClickCaptcha}.kt`
- Modify: `packages/android/captcha-sdk/src/main/java/com/captcha/pro/widget/{SliderCaptchaView,ClickCaptchaView,CaptchaDialog}.kt`

**Interfaces:**
- Consumes: `LocaleMessages.get(locale, "refresh"|"slider_hint"|"click_prompt"|"popup_title")`
- Produces: `Modifier.semantics` / `contentDescription` + 48dp hit area + liveRegion

- [ ] **Step 1: Compose SliderCaptcha a11y**

`packages/android/captcha-compose/.../SliderCaptcha.kt`：
- 刷新 Button（line ~73 区域）：`Modifier.semantics { role = Role.Button; contentDescription = t("refresh") }`，外包 `Modifier.size(44.dp).clickable(...)` hit area
- 滑块拇指（line ~262 区域）：`Modifier.semantics { role = Role.Slider; contentDescription = t("slider_hint"); onIncrease = {...}; onDecrease = {...} }`
- 状态遮罩（line ~205 区域）：`Modifier.semantics { liveRegion = LiveRegionMode.Polite }`

- [ ] **Step 2: Compose ClickCaptcha a11y**

`packages/android/captcha-compose/.../ClickCaptcha.kt`：同 Step 1，点击区 `role = Role.Button; contentDescription = t("click_prompt")`；标记 `contentDescription = "${idx+1}"`。

- [ ] **Step 3: View SliderCaptchaView a11y**

`packages/android/captcha-sdk/.../widget/SliderCaptchaView.kt`：
- `refreshButton.contentDescription = t("refresh")`（setupViews 内）
- `sliderThumbView.contentDescription = t("slider_hint")` + `ViewCompat.setAccessibilityDelegate` 暴露 value
- 状态：`statusView.accessibilityLiveRegion = ViewCompat.ACCESSIBILITY_LIVE_REGION_POLITE`；`showStatus()` 内 `ViewCompat.announceForAccessibility(statusView, message)`
- 触摸目标：`refreshButton` 外包 48dp 透明 TouchDelegate（`post { TouchDelegate(..., 48dp rect) }`），视觉 28dp 居中

- [ ] **Step 4: View ClickCaptchaView a11y**

`packages/android/captcha-sdk/.../widget/ClickCaptchaView.kt`：同 Step 3，点击区 `bgImageView.contentDescription = t("click_prompt")`；标记 `contentDescription = "${index}"`。

- [ ] **Step 5: View CaptchaDialog a11y**

`packages/android/captcha-sdk/.../widget/CaptchaDialog.kt`：dialog `contentDescription` + `setAccessibilityDelegate`；关闭按钮 `contentDescription = t("popup_close")`。

- [ ] **Step 6: android 构建**

Run:
```bash
cd packages/android && ./gradlew :captcha-sdk:assembleDebug :captcha-compose:assembleDebug 2>&1 | tail -5
```
Expected: BUILD SUCCESSFUL.

- [ ] **Step 7: TalkBack 抽测（手动）**

开 TalkBack，验证朗读语义正确、无逐字读 `⟳→✓✕`。

- [ ] **Step 8: 提交**

```bash
git add packages/android/captcha-compose packages/android/captcha-sdk/src/main/java/com/captcha/pro/widget
git commit -m "feat(android): WCAG 2.2 a11y — semantics/contentDescription, liveRegion, 48dp hit area (Compose+View)"
```

---

### Task 5: ios a11y（SwiftUI + UIKit）

**Files:**
- Modify: `packages/ios/Sources/SwiftUI/{SliderCaptcha,ClickCaptcha,PopupCaptcha}.swift`
- Modify: `packages/ios/Sources/Views/{SliderCaptchaView,ClickCaptchaView,CaptchaPopup}.swift`

**Interfaces:**
- Consumes: `LocaleMessages.get(locale, "refresh"|"slider_hint"|"click_prompt"|"popup_title"|"popup_close")`
- Produces: `.accessibilityLabel` / `accessibilityLabel` + 44pt hit area + announcement

- [ ] **Step 1: SwiftUI SliderCaptcha a11y**

`packages/ios/Sources/SwiftUI/SliderCaptcha.swift`：
- 刷新 Button（line ~74）：`.accessibilityLabel(LocaleMessages.get(viewModel.locale, key: "refresh"))` + `.accessibilityAddTraits(.isButton)`；外包 44pt hit area（`.frame(width: 44, height: 44)` + contentShape）
- 滑块拇指（line ~126 RoundedRectangle）：`.accessibilityLabel(...slider_hint)` + `.accessibilityAddTraits(.isSlider)` + `.accessibilityValue("\(viewModel.currentX)")` + `.accessibilityAdjustableAction`
- 状态遮罩（line ~86）：`.accessibilityAddTraits(.updatesFrequently)` 或在 status 变化时 `UIAccessibility.post(notification: .announcement, argument: message)`

- [ ] **Step 2: SwiftUI ClickCaptcha a11y**

`packages/ios/Sources/SwiftUI/ClickCaptcha.swift`：同 Step 1，点击区 `.accessibilityLabel(...click_prompt) + .accessibilityAddTraits(.isButton)`；标记 `.accessibilityLabel("\(index+1)")`。

- [ ] **Step 3: SwiftUI PopupCaptcha a11y**

`packages/ios/Sources/SwiftUI/PopupCaptcha.swift`：
- 卡片 VStack（line ~113）：`.accessibilityElement(children: .contain)` + `.accessibilityLabel(displayTitle)` + `.accessibilityAddTraits(.isModal)`
- 关闭 Button（line ~136）：`.accessibilityLabel(...popup_close)`
- 显示时焦点移至卡片（`UIAccessibility.post(notification: .screenChanged, ...)`）

- [ ] **Step 4: UIKit SliderCaptchaView a11y**

`packages/ios/Sources/Views/SliderCaptchaView.swift`：
- `refreshButton.accessibilityLabel = t("refresh")` + `accessibilityTraits = .button`（setupViews 内，line ~125 区域）
- `sliderThumbView.accessibilityLabel = t("slider_hint")` + `accessibilityTraits = .slider` + `accessibilityValue = "\(currentX)"` + 实现 `accessibilityIncrement/Decrement`
- `statusView.accessibilityTraits = .updatesFrequently`；`showStatus()` 内 `UIAccessibility.post(notification: .announcement, argument: message)`
- 触摸目标：刷新按钮外包 44pt 透明 UIView + `extensionHit`（或扩大 `frame` + 子层视觉 28pt 居中）

- [ ] **Step 5: UIKit ClickCaptchaView a11y**

`packages/ios/Sources/Views/ClickCaptchaView.swift`：同 Step 4，点击区 `bgImageView.accessibilityLabel = t("click_prompt")` + `accessibilityTraits = .button`；标记 `accessibilityLabel = "\(index)"`。

- [ ] **Step 6: UIKit CaptchaPopup a11y**

`packages/ios/Sources/Views/CaptchaPopup.swift`：
- `containerView.accessibilityViewIsModal = true` + `accessibilityLabel = displayTitle`
- 关闭按钮 `accessibilityLabel = t("popup_close")`
- `show()` 内 `UIAccessibility.post(notification: .screenChanged, argument: containerView)` 焦点转移

- [ ] **Step 7: ios 构建**

Run:
```bash
cd packages/ios && swift build 2>&1 | tail -5
```
Expected: 编译成功。

- [ ] **Step 8: VoiceOver 抽测 + Accessibility Inspector（手动）**

开 VoiceOver / Xcode Accessibility Inspector，验证朗读语义、无 warning。

- [ ] **Step 9: 提交**

```bash
git add packages/ios/Sources/SwiftUI packages/ios/Sources/Views
git commit -m "feat(ios): WCAG 2.2 a11y — accessibilityLabel/Hint/Traits, announcement, 44pt hit area (SwiftUI+UIKit)"
```

---

### Task 6: a11y 文档页

**Files:**
- Create: `docs/accessibility.md`

**Interfaces:** 无（纯文档）。

**目标**：向集成方说明验证码无障碍支持、键盘快捷键、读屏行为。

- [ ] **Step 1: 撰写 docs/accessibility.md**

内容大纲：
1. WCAG 2.2 Level AA 符合性声明（验证码交互流范围）
2. 键盘快捷键表（web）：Tab 焦点、Enter 刷新/提交、←/→ 滑块
3. 读屏支持矩阵：VoiceOver / TalkBack / Narrator + 各端语义说明
4. 触摸目标规格（44pt/48dp/44px）
5. 已知偏差：slider_hint #666（对比度修正）；focus trap 首版未实现（仅 role=dialog + 初始焦点）
6. 集成方 checklist：如何验证 a11y、如何报 a11y 问题

- [ ] **Step 2: 提交**

```bash
git add docs/accessibility.md
git commit -m "docs: add accessibility conformance statement + keyboard shortcuts + SR matrix"
```

---

### Task 7: 版本号 + changeset → 2.2.0

**Files:**
- Create: `.changeset/captcha-pro-2.2.0.md`
- Modify: `CHANGELOG.md`
- Modify: 14 包 `package.json` / native 版本源

**Interfaces:** 无。

- [ ] **Step 1: 写 changeset 文件**

创建 `.changeset/captcha-pro-2.2.0.md`：
```markdown
---
"@captcha-pro/core": minor
"@captcha-pro/mp-shared": minor
"@captcha-pro/vue": minor
"@captcha-pro/vue2": minor
"@captcha-pro/react": minor
"@captcha-pro/weixin": minor
"@captcha-pro/uniapp-vue": minor
"@captcha-pro/uniapp-vue2": minor
"@captcha-pro/taro-react": minor
"@captcha-pro/taro-vue": minor
"@captcha-pro/taro-vue2": minor
---

WCAG 2.2 Level AA accessibility compliance across all platforms (aria labels, role, keyboard, live region, 44px/44pt/48dp touch targets).
```

- [ ] **Step 2: 应用 changeset**

Run:
```bash
pnpm changeset version
```
Expected: 11 个 JS 包 `version` → `2.2.0`。

- [ ] **Step 3: native 版本 → 2.2.0**

- flutter：`packages/flutter/pubspec.yaml` `version: 2.2.0`
- android：`captcha-sdk` + `captcha-compose` 的 versionName/VERSION_NAME → `2.2.0`
- ios：`packages/ios/Package.swift` `version: "2.2.0"` + podspec `s.version = '2.2.0'`

- [ ] **Step 4: root package.json 升 2.2.0**

`package.json`：`"version": "2.2.0"`

- [ ] **Step 5: CHANGELOG 追加 2.2.0 条目**

在 `CHANGELOG.md` 顶部（`## [2.1.0]` 之前）插入：
```markdown
## [2.2.0] - 2026-08-11

### 全端无障碍(a11y)合规 — WCAG 2.2 Level AA

- **读屏语义**：全端图标按钮（刷新、关闭、滑块拇指、点击标记）补 accessibility 标签 + role，停止逐字朗读 `⟳→✓✕`
- **触摸目标**：刷新按钮 hit area 扩至 44px/44pt/48dp（视觉尺寸不变）
- **键盘可达（web）**：Tab 焦点序、Enter 刷新/提交、←/→ 滑块调整
- **状态 live region**：成功/失败实时朗读（aria-live / announceForAccessibility / UIAccessibility.post）
- **i18n**：新增 `refresh` 键（14 → 15）
- **对比度修正**：slider_hint 文本 `#999`→`#666`（达 4.5:1）
- **文档**：新增 `docs/accessibility.md` 符合性声明 + 键盘快捷键 + 读屏矩阵

### Documentation

- `docs/accessibility.md`：WCAG 2.2 符合性、键盘表、读屏支持
```

- [ ] **Step 6: 校验版本号**

Run:
```bash
grep -rn "2.2.0" package.json packages/flutter/pubspec.yaml packages/ios/Package.swift packages/android/captcha-sdk/build.gradle packages/android/captcha-compose/build.gradle
```
Expected: 各文件出现 `2.2.0`。

- [ ] **Step 7: 提交**

```bash
git add .changeset CHANGELOG.md package.json packages/*/package.json packages/flutter/pubspec.yaml packages/android packages/ios
git commit -m "chore: bump all packages to 2.2.0 + changelog"
```

---

### Task 8: 全端构建与回归验证

**Files:** 无修改。

**Interfaces:** 产出构建 + a11y 合规结论。

- [ ] **Step 1: JS 侧构建**

Run:
```bash
fnm use 18 && pnpm turbo build
```
Expected: 全部 11 个 JS 包构建成功。

- [ ] **Step 2: core 单测**

Run:
```bash
fnm use 18 && pnpm turbo test
```
Expected: vitest 全绿（i18n `refresh` 键测试若新增需通过）。

- [ ] **Step 3: flutter 构建**

Run:
```bash
cd packages/flutter && flutter analyze && flutter build apk --debug 2>&1 | tail -5
```
Expected: analyze 无 error；build 成功。

- [ ] **Step 4: android 构建**

Run:
```bash
cd packages/android && ./gradlew :captcha-sdk:assembleDebug :captcha-compose:assembleDebug 2>&1 | tail -5
```
Expected: BUILD SUCCESSFUL.

- [ ] **Step 5: ios 构建**

Run:
```bash
cd packages/ios && swift build 2>&1 | tail -5
```
Expected: 编译成功。

- [ ] **Step 6: a11y grep 契约终检**

Run:
```bash
echo "== web aria ==" && grep -rniE "aria-label|role=" packages/vue/src packages/vue2/src packages/react/src packages/taro-vue/src | wc -l
echo "== flutter Semantics ==" && grep -rniE "Semantics" packages/flutter/lib/src/widgets | wc -l
echo "== android ==" && grep -rniE "contentDescription|semantics|accessibility" packages/android --include="*.kt" | grep -v "/build/" | wc -l
echo "== ios ==" && grep -rniE "accessibilityLabel|accessibilityTraits|accessibilityValue" packages/ios/Sources --include="*.swift" | wc -l
echo "== refresh key ==" && grep -rn '"refresh"' packages/mp-shared/src/i18n.ts packages/flutter/lib/src/core/i18n.dart packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt packages/ios/Sources/Core/Types.swift | wc -l
```
Expected: 每端命中数 > 0；`refresh` 键 ≥ 4 处。

- [ ] **Step 7: 提交构建验证记录（若有修复）**

```bash
git add -A
git commit -m "chore: verify 2.2.0 builds green + a11y compliance across all platforms"
```
（无改动则跳过；若构建失败则回到对应 Task 修复。）

---

## 发版

Task 1-8 均完成、全端构建绿、a11y grep 终检通过后：
- `git tag v2.2.0`
- `pnpm pub`（JS 包，`--no-git-checks`）
- native 按各平台渠道发布（Maven Central / CocoaPods+SPM / pub.dev）

## 风险

- **native a11y 无自动化测试**：依赖 TalkBack/VoiceOver 手动抽测，回归无单测兜底。建议每端完成即抽测。
- **focus trap 首版缺位**：web popup 仅 `role=dialog` + 初始焦点，不实现完整焦点陷阱（spec §6 判断点），后续版本补。
- **slider_hint 色值偏差**：`#999`→`#666` 是对 2.1.0 样式令牌表的唯一显式覆盖（a11y 合规优先），需在 CHANGELOG 与 accessibility.md 记录。
- **rpx→native hit area 换算**：刷新按钮视觉 56rpx≈28px，hit area 需 ≥ 44px，用透明外包层扩大，视觉不动。
- **小程序 aria 兼容**：各小程序对 `aria-*` 支持不一（部分转 `accessible-*`），需逐端验证 attribute 是否生效。
- **i18n 键扩展链路**：新增 `refresh` 需 4 处同步，漏一处则该端 a11y label 回退到键名（不致命，但需 grep 兜底）。
- **2.1.0 依赖**：2.2.0 发版序在 2.1.0 后；触碰包集相同，但 2.1.0 不改 a11y、2.2.0 不改契约，可并行开发。
