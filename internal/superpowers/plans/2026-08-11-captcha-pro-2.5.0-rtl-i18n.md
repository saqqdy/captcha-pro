# captcha-pro 2.5.0 — RTL 支持 + ja/ko 语言补全 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** i18n 从 2.4.0 后的 6 语言扩到 9 语言（+ja-JP/ko-KR/ar-SA），4 处源同步；ar-SA 触发全端 RTL 布局翻转（滑块从右起、箭头翻转、按钮位对调、prompt 右对齐）。`locale` prop/option 仅扩可选值 + 自动判 RTL，无 API 破坏。

**Architecture:** 4 处 i18n 源结构已对齐（2.4.0 确认）。扩展 = 追加 3 语言条目 + 扩 `CaptchaLocale`。RTL = mp-shared 导出 `isRTL(locale)`，4 端各按 locale 设方向（web `dir`/flutter `Directionality`/android `layoutDirection`/ios `semanticContentAttribute`）。无 API 新增。

**Tech Stack:** TypeScript/pnpm/turbo/changesets、Dart/Flutter、Kotlin/Android、Swift/iOS。

**Design spec:** `docs/superpowers/specs/2026-08-11-captcha-pro-2.5.0-rtl-i18n-design.md`（文案表 §4.1.1、RTL 各端方案 §4.2、风险 §6 见此）。

## Global Constraints

- **不改键集**：2.4.0 后键集（14 或 15，Task 1 Step 1 确认）不动，仅扩语言。
- **不改 API**：`locale` prop/option 已存在；方向自动随 locale，无新 prop/field；`getCaptcha`/`verify` 不变；`DEFAULT_LOCALE=zh-CN`。
- **不改后端**：`server/{node,java,go}` 不动；click captcha 字符图仍后端返回（ar 限制见 spec §6）。
- **4 源同步**：mp-shared/flutter/android/ios 必须一致（9 语言 + isRTL 等价逻辑）。
- **文案以 spec §4.1.1 为准**：勿自行改译。
- **node**：JS 构建用 node 18（`fnm use`）。

## 现状审计（已确认，勿重复）

| 源 | 现语言（源码） | 2.4.0 spec 计划 |
|---|---|---|
| mp-shared `i18n.ts` | 2（zh-CN/en-US） | 6 |
| flutter `i18n.dart` | 2 | 6 |
| android `Types.kt` | 2 | 6 |
| ios `Types.swift` | 2 | 6 |

> RTL 全端零处理（grep 确认）。slider 起点 LTR。click 字符后端返回（`core/click.ts:189-195`）。

---

### Task 1: 2.4.0 基线确认 + mp-shared i18n.ts 扩展 + isRTL 导出

**Files:**
- Modify: `packages/mp-shared/src/i18n.ts`
- Modify: `packages/core/test/i18n.test.ts`

**Interfaces:** `CaptchaLocale` 扩 3 literal；`LOCALE_MESSAGES` 追加 3 条；导出 `isRTL`。

- [ ] **Step 1: 确认 2.4.0 落地状态（6 语言基线 + refresh 键）**

Run:
```bash
grep -oE "zh-CN|zh-TW|en-US|fr-FR|de-DE|es-ES" packages/mp-shared/src/i18n.ts | sort -u | wc -l
grep -n "'refresh'\|\"refresh\"" packages/mp-shared/src/i18n.ts || echo "无 refresh 键（14 键）"
```
Expected: 语言数 = 6（2.4.0 已落地）；refresh 有无决定键集 15 或 14。若语言数仍 2 → 2.4.0 未落地，须先做 2.4.0（阻塞，回报）。

- [ ] **Step 2: 扩 `CaptchaLocale` 类型**

`i18n.ts`:
```ts
export type CaptchaLocale = 'zh-CN' | 'zh-TW' | 'en-US' | 'fr-FR' | 'de-DE' | 'es-ES' | 'ja-JP' | 'ko-KR' | 'ar-SA'
```

- [ ] **Step 3: 追加 3 条文案 Record**

文案见 spec §4.1.1（ja-JP/ko-KR/ar-SA 三列，14 或 15 键）。

- [ ] **Step 4: 导出 `isRTL`**

`i18n.ts`:
```ts
export function isRTL(locale: CaptchaLocale | string): boolean {
  return locale === 'ar-SA'
}
```

- [ ] **Step 5: 类型校验 + 单测**

`packages/core/test/i18n.test.ts`：扩 9 语言 × N 键断言；`isRTL('ar-SA')===true`、`isRTL('ja-JP')===false`、`isRTL('en-US')===false`；回退测 `getLocaleMessage('he-IL','loading')` 回退 zh-CN。

Run:
```bash
fnm use 18 && pnpm turbo build --filter=@captcha-pro/mp-shared && pnpm turbo test --filter=@captcha-pro/core
```
Expected: 编译 + 单测全绿。

- [ ] **Step 6: 提交**

```bash
git add packages/mp-shared/src/i18n.ts packages/core/test/i18n.test.ts
git commit -m "feat(mp-shared): add ja-JP/ko-KR/ar-SA locales + isRTL helper"
```

---

### Task 2: web RTL（captcha.scss + wrappers + 6 小程序）

**Files:**
- Modify: `packages/taro-vue/src/styles/captcha.scss`
- Modify: `packages/vue/src/components/{SliderCaptcha,PopupCaptcha}.vue` + vue2 + react 同理
- Modify: 6 小程序样式

**Interfaces:** 容器 `dir` 属性 + CSS `[dir="rtl"]` 覆盖；slider RTL 交互映射。

- [ ] **Step 1: captcha.scss 追加 `[dir="rtl"]` 覆盖块**

```scss
[dir="rtl"] {
  .slider-arrow { transform: scaleX(-1); }
  .refresh-btn { left: auto; right: 16rpx; }
  .popup-close { left: auto; right: 24rpx; }
  .prompt-text { text-align: right; }
  .click-marker { /* 边距方向反转 */ }
}
```

- [ ] **Step 2: 容器 dir 绑定**

`SliderCaptcha.vue`（+ vue2 + react）：根容器加 `:dir="isRTL(locale) ? 'rtl' : 'ltr'"`（或 `dir` attribute）。react 用 `dir={isRTL(locale) ? 'rtl' : 'ltr'}`。`PopupCaptcha.vue` 同理。

- [ ] **Step 3: slider RTL 交互映射**

`useSliderCaptcha.ts`：ar 下
- 起点 `currentX = trackWidth - sliderWidth`（右端）
- 拖拽 `deltaX` 取反（向左 = 增 progress）
- 提交时 `targetX = trackWidth - backendX`（后端缺口 LTR 坐标映射到 RTL）
- 或降级：ar 保持 LTR 交互，仅翻转视觉（spec §6 判断点）。**默认走跟随语言方向方案**。

- [ ] **Step 4: 6 小程序 RTL 同步**

weixin/uniapp-vue/uniapp-vue2/taro-react/taro-vue/taro-vue2：容器 `dir` + 样式 `[dir="rtl"]`。逐端验证基础库支持（不支持回退 LTR + 文档）。

- [ ] **Step 5: web 构建**

Run:
```bash
fnm use 18 && pnpm turbo build
```
Expected: 11 JS 包构建成功。

- [ ] **Step 6: RTL 目视（手动）**

example 切 `ar-SA`：滑块从右起、箭头指左、关闭按钮位、prompt 右对齐。切 `ja-JP`/`ko-KR`：仍 LTR 无破坏。

- [ ] **Step 7: 提交**

```bash
git add packages/taro-vue packages/vue packages/vue2 packages/react packages/weixin packages/uniapp-vue packages/uniapp-vue2 packages/taro-react packages/taro-vue2
git commit -m "feat(web): RTL layout for ar-SA (dir attr + [dir=rtl] overrides + slider RTL mapping)"
```

---

### Task 3: flutter 3 语言 + RTL

**Files:**
- Modify: `packages/flutter/lib/src/core/i18n.dart`
- Modify: `packages/flutter/lib/src/widgets/{slider_captcha,click_captcha,popup_captcha}.dart`

**Interfaces:** `localeMessages` 加 3 条；根 `Directionality`；箭头 `Transform.scale`。

- [ ] **Step 1: i18n.dart 追加 3 条文案**

文案见 spec §4.1.1（ja-JP/ko-KR/ar-SA）。

- [ ] **Step 2: Directionality 包根**

3 widget 根包 `Directionality(textDirection: isRTL(locale) ? TextDirection.rtl : TextDirection.ltr, ...)`。`isRTL` 在 flutter 实现：`locale == 'ar-SA'`。

- [ ] **Step 3: 箭头 + 按钮位翻转**

`slider_captcha.dart`：箭头 `Transform.scale(scaleX: isRTL ? -1 : 1)`。`popup_captcha.dart`：关闭按钮用 `Align` + RTL 自动翻转。

- [ ] **Step 4: slider RTL 交互**

ar 下起点右端、拖拽反转、`targetX` 映射（同 web Task 2 Step 3）。

- [ ] **Step 5: flutter 分析 + 构建**

Run:
```bash
cd packages/flutter && flutter analyze && flutter build apk --debug 2>&1 | tail -5
```
Expected: 无 error。

- [ ] **Step 6: 模拟器 RTL 目视（手动）**

切 `ar-SA` 验证。

- [ ] **Step 7: 提交**

```bash
git add packages/flutter/lib/src/core/i18n.dart packages/flutter/lib/src/widgets
git commit -m "feat(flutter): add ja/ko/ar locales + RTL via Directionality"
```

---

### Task 4: android 3 语言 + RTL（Compose + View）

**Files:**
- Modify: `packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt`
- Modify: `packages/android/captcha-compose/.../{SliderCaptcha,ClickCaptcha}.kt`
- Modify: `packages/android/captcha-sdk/.../widget/{SliderCaptchaView,ClickCaptchaView,CaptchaDialog}.kt` + `CanvasRenderer.kt`

**Interfaces:** enum 加 3 case；LocaleMessages 加 3 组；Compose `LocalLayoutDirection`；View `layoutDirection`。

- [ ] **Step 1: Types.kt 扩 enum + LocaleMessages 3 组**

```kotlin
enum class CaptchaLocale(val code: String) {
    ZH_CN("zh-CN"), ZH_TW("zh-TW"), EN_US("en-US"),
    FR_FR("fr-FR"), DE_DE("de-DE"), ES_ES("es-ES"),
    JA_JP("ja-JP"), KO_KR("ko-KR"), AR_SA("ar-SA");
    val isRTL: Boolean get() = this == AR_SA
    // companion object from(code) 不改
}
```
LocaleMessages 加 3 组 `mapOf(...)`（文案 spec §4.1.1）。

- [ ] **Step 2: Compose RTL**

`SliderCaptcha.kt`/`ClickCaptcha.kt`：`CompositionLocalProvider(LocalLayoutDirection provides if (locale.isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr)`；箭头 `Modifier.scale(scaleX = if (locale.isRTL) -1f else 1f)`。

- [ ] **Step 3: View RTL + autoMirrored**

`widget/*.kt`：`view.layoutDirection = if (locale.isRTL) LAYOUT_DIRECTION_RTL else LAYOUT_DIRECTION_LTR`；箭头 drawable 改 `autoMirrored="true"`（vector XML）。

- [ ] **Step 4: slider RTL 交互**

ar 下起点右端、拖拽反转、`targetX` 映射。

- [ ] **Step 5: android 构建**

Run:
```bash
cd packages/android && ./gradlew :captcha-sdk:assembleDebug :captcha-compose:assembleDebug 2>&1 | tail -5
```
Expected: BUILD SUCCESSFUL。

- [ ] **Step 6: 模拟器 RTL 目视（手动）**

- [ ] **Step 7: 提交**

```bash
git add packages/android/captcha-sdk packages/android/captcha-compose
git commit -m "feat(android): add ja/ko/ar locales + RTL (Compose LocalLayoutDirection + View layoutDirection)"
```

---

### Task 5: ios 3 语言 + RTL（SwiftUI + UIKit）

**Files:**
- Modify: `packages/ios/Sources/Core/Types.swift`
- Modify: `packages/ios/Sources/SwiftUI/{SliderCaptcha,ClickCaptcha,PopupCaptcha}.swift`
- Modify: `packages/ios/Sources/Views/{SliderCaptchaView,ClickCaptchaView,CaptchaPopup}.swift`

**Interfaces:** enum 加 3 case；`isRTL` 计算属性；SwiftUI `@Environment(\.layoutDirection)`；UIKit `semanticContentAttribute`。

- [ ] **Step 1: Types.swift 扩 enum + LocaleMessages 3 条**

```swift
public enum CaptchaLocale: String {
    case zhCN = "zh-CN", zhTW = "zh-TW", enUS = "en-US"
    case frFR = "fr-FR", deDE = "de-DE", esES = "es-ES"
    case jaJP = "ja-JP", koKR = "ko-KR", arSA = "ar-SA"
    public var isRTL: Bool { self == .arSA }
}
```
LocaleMessages.messages 加 3 条（文案 spec §4.1.1）。

- [ ] **Step 2: SwiftUI RTL**

3 SwiftUI 组件：`.environment(\.layoutDirection, locale.isRTL ? .rightToLeft : .leftToRight)`；箭头 `.scaleEffect(x: locale.isRTL ? -1 : 1, y: 1, anchor: .center)`。

- [ ] **Step 3: UIKit RTL**

`Views/*.swift`：`view.semanticContentAttribute = locale.isRTL ? .forceRightToLeft : .forceLeftToRight`；箭头 `imageView.transform = CGAffineTransform(scaleX: locale.isRTL ? -1 : 1, y: 1)`。

- [ ] **Step 4: slider RTL 交互**

ar 下起点右端、拖拽反转、`targetX` 映射。

- [ ] **Step 5: ios 构建**

Run:
```bash
cd packages/ios && swift build 2>&1 | tail -5
```
Expected: 编译成功。

- [ ] **Step 6: 模拟器 RTL + VoiceOver 目视（手动）**

`userInterfaceStyle` + `semanticContentAttribute` 验证。

- [ ] **Step 7: 提交**

```bash
git add packages/ios/Sources/Core/Types.swift packages/ios/Sources/SwiftUI packages/ios/Sources/Views
git commit -m "feat(ios): add ja/ko/ar locales + RTL (SwiftUI layoutDirection + UIKit semanticContentAttribute)"
```

---

### Task 6: docs/i18n.md + README + examples ar 演示

**Files:**
- Modify: `docs/i18n.md`（2.4.0 建）
- Modify: 各 README
- Modify（可选）: `examples/vue/`、`examples/react/` 加 locale 切换含 ar

- [ ] **Step 1: i18n.md 补 3 语言 + RTL 段 + ar 限制**

列 9 语言；RTL 说明（ar-SA 触发、自动判定、无 prop）；ar click captcha 字符限制（推荐 slider）；isRTL 用法。

- [ ] **Step 2: README i18n 段更新**

列 9 语言 + RTL 支持声明。

- [ ] **Step 3: examples ar 演示（可选）**

locale 下拉加 `ar-SA`，目视验证 RTL 布局 + 文案。

- [ ] **Step 4: 提交**

```bash
git add docs/i18n.md README.md packages/*/README*.md examples
git commit -m "docs: i18n + 9 locales + RTL section + ar demo"
```

---

### Task 7: 版本 bump + changeset + CHANGELOG

**Files:**
- Create: `.changeset/captcha-pro-2.5.0.md`
- Modify: 14 包版本源 + root `package.json` + `CHANGELOG.md`

- [ ] **Step 1: changeset + 应用** — `.changeset/captcha-pro-2.5.0.md`：11 JS 包 `minor`。`pnpm changeset version`。
- [ ] **Step 2: native 版本 → 2.5.0** — flutter pubspec / android versionName / ios Package.swift + podspec。
- [ ] **Step 3: root package.json + CHANGELOG** — `"version": "2.5.0"`；CHANGELOG 顶部 `[2.5.0]` 条目（新增 ja/ko/ar + RTL 布局）。
- [ ] **Step 4: 校验 + 提交**

```bash
grep -rn "2.5.0" package.json packages/flutter/pubspec.yaml packages/ios/Package.swift packages/android/captcha-sdk/build.gradle packages/android/captcha-compose/build.gradle
git add -A && git commit -m "chore: bump all packages to 2.5.0 + changelog"
```

---

### Task 8: 全端构建与回归验证

- [ ] **Step 1: JS 构建 + 单测** — `fnm use 18 && pnpm turbo build && pnpm turbo test`，全绿。
- [ ] **Step 2: flutter** — `cd packages/flutter && flutter analyze && flutter build apk --debug 2>&1 | tail -5`。
- [ ] **Step 3: android** — `./gradlew :captcha-sdk:assembleDebug :captcha-compose:assembleDebug`。
- [ ] **Step 4: ios** — `swift build`。
- [ ] **Step 5: 4 源语言数 grep 终检（应 9）**:
```bash
for f in packages/mp-shared/src/i18n.ts packages/flutter/lib/src/core/i18n.dart packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt packages/ios/Sources/Core/Types.swift; do printf "%s: " "$f"; grep -oE "zh-CN|zh-TW|en-US|fr-FR|de-DE|es-ES|ja-JP|ko-KR|ar-SA" "$f" | sort -u | wc -l; done
```
Expected: 每源 9。
- [ ] **Step 6: isRTL grep 终检** — 4 源/4 端均有 isRTL 等价逻辑（mp-shared `isRTL`、flutter inline、android `isRTL` 属性、ios `isRTL` 计算属性）。
- [ ] **Step 7: RTL 目视（手动）** — example 切 `ar-SA`，验证全端滑块从右起、箭头指左、关闭按钮位、prompt 右对齐。
- [ ] **Step 8: LTR 回归（手动）** — 切 `ja-JP`/`ko-KR` 仍 LTR，无视觉破坏。
- [ ] **Step 9: 提交（若有修复）**

```bash
git add -A && git commit -m "chore: verify 2.5.0 builds green + 9 locales + RTL across all platforms"
```

---

## 发版

Task 1-8 完成、全端构建绿、grep + RTL 目视终检通过后：
- `git tag v2.5.0`
- `pnpm pub`（JS 包，`--no-git-checks`）
- native 按各平台渠道发布

## 风险

- **slider RTL 交互**：ar 下从右起 + `targetX` 映射（`trackWidth - backendX`）易出错。Task 2/3/4/5 Step 3/4 各端统一实现；单测覆盖映射。降级方案（仅翻转视觉、交互保持 LTR）作 fallback。
- **click captcha ar 字符**：后端返回中文字符，ar 用户不可读。2.5.0 不改后端，文档声明 ar 推荐 slider，click 字符待后端 i18n 后续。
- **翻译准确性**：ja/ko/ar AI 翻译初稿。文档声明 community translation + 欢迎 PR。ar 母语审校尤重要（连字/语法）。
- **RTL 视觉对称遗漏**：grep 兜底难，依赖目视。Task 8 Step 7 逐端切 ar 抽测。
- **小程序 RTL 兼容**：6 小程序基础库对 `dir="rtl"` 支持度不一。不支持回退 LTR + 文档声明最低版本。
- **4 端 isRTL 不一致**：mp-shared 导出 `isRTL`，但 flutter/android/ios 各自实现等价逻辑须同步。Task 8 Step 6 grep 校验。
- **2.4.0 依赖**：Task 1 Step 1 确认 2.4.0 已落地（6 语言基线）；未落地则阻塞，须先做 2.4.0。
