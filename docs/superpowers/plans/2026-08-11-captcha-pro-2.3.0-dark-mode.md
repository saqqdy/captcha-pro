# captcha-pro 2.3.0 — 全端暗色模式适配 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全端跟随系统暗色主题——验证码区域渐变保留，适配滑块条/提示条/popup/状态遮罩暗色变体；兑现 2.2.0 推迟的 web popup focus trap。

**Architecture:** 各端颜色当前硬编码 inline。2.3.0 引入颜色集中层（flutter `CaptchaColors`/android 资源/ios Color Asset 与 dynamic UIColor），light/dark 双值自动跟随系统。web 用 CSS `@media (prefers-color-scheme: dark)`。无 API 破坏、无手动开关 prop。

**Tech Stack:** TypeScript/pnpm/turbo/changesets、Dart/Flutter、Kotlin/Android(Compose+View)、Swift/iOS(SwiftUI+UIKit)。

**Design spec:** `docs/superpowers/specs/2026-08-11-captcha-pro-2.3.0-dark-mode-design.md`（暗色令牌表 §3、各端方案 §4、判断点 §6 见此）。

## Global Constraints

- **不改 API 契约**：不增 `dark`/`theme` prop；跟随系统 `prefers-color-scheme`/`userInterfaceStyle`。
- **不改保留项**：验证码区域渐变 `#667eea→#764ba2`、点击标记 `#1991fa`、滑块箭头 `#1991fa`、字符格渐变、loading 渐变——light/dark 通用。
- **dark 对比度**：§3.2 dark 文本色（#aaa/#5cb85c/#ff7875）须达 4.5:1（2.2.0 a11y 在 dark 下重验）。
- **native 无单测**：验证 = build 通过 + 模拟器切暗色目视比对 + grep 无遗漏 light 硬编码。
- **node**：JS 构建用 node 18（`fnm use`）。
- **基准**：taro-vue `captcha.scss` 不删 light 规则，追加 `@media` 覆盖。

## 现状审计（2.2.0 探索已确认，勿重复）

| 端 | 颜色定义方式 | 文件 |
|---|---|---|
| web/taro-vue | `captcha.scss` hex 硬编码 | `packages/taro-vue/src/styles/captcha.scss` |
| flutter | `Color(0xFF...)` inline in build() | `widgets/{slider,click,popup}_captcha.dart` |
| android Compose | `Color(0xFF...)` inline | `captcha-compose/.../{SliderCaptcha,ClickCaptcha}.kt` |
| android View | `Color.parseColor("#...")` inline | `widget/*.kt` + `CanvasRenderer.kt` |
| ios SwiftUI | `Color(red:green:blue:)` inline | `SwiftUI/*.swift` |
| ios UIKit | `UIColor(red:green:blue:alpha:)` inline | `Views/*.swift` |

---

### Task 1: web（taro-vue + wrappers + 6 小程序）暗色 + focus trap

**Files:**
- Modify: `packages/taro-vue/src/styles/captcha.scss`
- Modify: `packages/vue/src/components/PopupCaptcha.vue` + `packages/vue2/src/components/PopupCaptcha.vue` + `packages/react/src/components/PopupCaptcha.tsx`
- Modify: 6 小程序 captcha 样式（weixin/uniapp-vue/uniapp-vue2/taro-react/taro-vue/taro-vue2）

**Interfaces:** CSS `@media` 自动跟随系统；focus trap 用 `keydown.tab` + 焦点缓存。

- [ ] **Step 1: captcha.scss 追加暗色覆盖块**

`packages/taro-vue/src/styles/captcha.scss`：在文件末尾追加：
```scss
@media (prefers-color-scheme: dark) {
  .slider-bar { background: #1f1f1f; }
  .slider-thumb { background: #2a2a2a; border-color: #3a3a3a; }
  .slider-hint text { color: #aaaaaa; }
  .prompt-bar { border-color: #3a3a3a; background: #1f1f1f; }
  .prompt-text { color: #aaaaaa; }
  .refresh-btn { background: rgba(60,60,60,0.9); }
  .refresh-icon { color: #aaaaaa; }
  .status-overlay { background: rgba(0,0,0,0.6); }
  .status-overlay.success .status-text { color: #5cb85c; }
  .status-overlay.fail .status-text { color: #ff7875; }
  .popup-content { background: #1f1f1f; box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.4); }
  .popup-header { border-bottom-color: #3a3a3a; }
  /* popup title/close/mask 内联 style 在 .vue 里，需同步改 */
}
```
> 注意：popup title `#333`/close `#999`/mask `rgba(0,0,0,0.5)` 在 .vue 内联 style，需在 Step 2 改 .vue（迁入 scss class 用 `@media` 覆盖）。

- [ ] **Step 2: popup 内联色 dark 适配**

`PopupCaptcha.vue/.tsx`（vue/vue2/react）：内联 `background:'#fff'`/`color:'#333'`/`color:'#999'`/`background:'rgba(0,0,0,0.5)'` 改为 CSS 变量或迁入 captcha.scss 用 `@media` 覆盖。推荐迁入 scss class（`.popup-content`/`.popup-title`/`.popup-close`/`.popup-mask`），便于 `@media` 统一覆盖。

- [ ] **Step 3: focus trap（兑现 2.2.0 推迟）**

`PopupCaptcha.vue`（+ vue2 + react 同步）：打开时——
- 缓存 `document.activeElement`（触发元素）
- 焦点移至 dialog 内首个可聚焦元素（关闭按钮）
- `@keydown.tab.prevent` + `@keydown.shift.tab` handler：在 dialog 内首/末可聚焦元素间循环（Tab 到末则回首，Shift+Tab 到首则回末）
- 关闭时 `requestAnimationFrame(() => triggerEl.focus())`

react 用 `useEffect` + `ref`；vue 用 `onMounted`/`onBeforeUnmount`。

- [ ] **Step 4: 6 小程序暗色同步**

weixin/uniapp-vue/uniapp-vue2/taro-react/taro-vue/taro-vue2：各自 captcha 样式文件追加 `@media (prefers-color-scheme: dark)`（小程序基础库 ≥ 2.11 支持）。逐端验证编译通过。

- [ ] **Step 5: web 构建验证**

Run:
```bash
fnm use 18 && pnpm turbo build
```
Expected: 11 JS 包构建成功。浏览器切 dark 目视比对。

- [ ] **Step 6: focus trap 键盘测**

手动：打开 popup → Tab/Shift+Tab 焦点不出 dialog → Esc/关闭后焦点返触发元素。

- [ ] **Step 7: 提交**

```bash
git add packages/taro-vue packages/vue packages/vue2 packages/react packages/weixin packages/uniapp-vue packages/uniapp-vue2 packages/taro-react packages/taro-vue2
git commit -m "feat(web): dark mode via prefers-color-scheme + popup focus trap"
```

---

### Task 2: flutter 暗色

**Files:**
- Create: `packages/flutter/lib/src/core/theme.dart`
- Modify: `packages/flutter/lib/src/widgets/{slider_captcha,click_captcha,popup_captcha}.dart`

**Interfaces:** `CaptchaColors.of(context)` 返回 `CaptchaColorScheme`（light/dark）。

- [ ] **Step 1: 新建 theme.dart**

`packages/flutter/lib/src/core/theme.dart`：
```dart
class CaptchaColorScheme {
  final Color sliderBarBg, sliderHintText, sliderThumbBg, sliderThumbBorder;
  final Color promptBarBg, promptBarBorder, promptText;
  final Color refreshBtnBg, refreshIcon;
  final Color statusOverlayBg, successText, failText;
  final Color popupCard, popupTitle, popupClose, popupSeparator, popupMask;
  const CaptchaColorScheme({ /* required this.xxx ... */ });
  static const light = CaptchaColorScheme(/* §3.2 light 值 */);
  static const dark  = CaptchaColorScheme(/* §3.2 dark 值 */);
  static CaptchaColorScheme of(BuildContext c) =>
    MediaQuery.platformBrightnessOf(c) == Brightness.dark ? dark : light;
}
```

- [ ] **Step 2: slider_captcha.dart 替换硬编码**

`slider_captcha.dart`：`Color(0xFFF7F9FA)`→`CaptchaColors.of(context).sliderBarBg`、`Color(0xFF666666)`(hint, 2.2.0 已 #999→#666)→`.sliderHintText`、`Colors.white`(thumb)→`.sliderThumbBg`、`Color(0xFFE1E4E8)`→`.sliderThumbBorder`、`Color(0xE6FFFFFF)`(refresh)→`.refreshBtnBg`、`Color(0xFF666666)`→`.refreshIcon`、`Color(0xBFFFFFFF)`(overlay)→`.statusOverlayBg`、`Color(0xFF389E0D)`/`0xFFCF1322`→`.successText`/`.failText`。
> 保留：渐变 `Color(0xFF667EEA)/0xFF764BA2`、`Color(0xFF1991FA)`（箭头）硬编码不变。

- [ ] **Step 3: click_captcha.dart 替换**

同 Step 2 映射。保留：渐变、`#1991FA`（marker/箭头）。

- [ ] **Step 4: popup_captcha.dart 替换**

`popup_captcha.dart`：`Colors.white`(card)→`.popupCard`、`Color(0xFF333333)`→`.popupTitle`、`Color(0xFF999999)`→`.popupClose`、`Color(0xFFEEEEEE)`→`.popupSeparator`、`Color(0x80000000)`→`.popupMask`。

- [ ] **Step 5: flutter 静态分析 + 构建**

Run:
```bash
cd packages/flutter && flutter analyze && flutter build apk --debug 2>&1 | tail -5
```
Expected: 无 error；build 成功。

- [ ] **Step 6: 模拟器暗色目视比对（手动）**

切 dark theme，验证滑块条/prompt/popup 为暗色、渐变区保留。

- [ ] **Step 7: 提交**

```bash
git add packages/flutter/lib/src/core/theme.dart packages/flutter/lib/src/widgets/slider_captcha.dart packages/flutter/lib/src/widgets/click_captcha.dart packages/flutter/lib/src/widgets/popup_captcha.dart
git commit -m "feat(flutter): dark mode via CaptchaColorScheme + MediaQuery.platformBrightness"
```

---

### Task 3: android 暗色（Compose + View）

**Files:**
- Create: `packages/android/captcha-sdk/src/main/res/values/colors.xml` + `values-night/colors.xml`
- Modify: `packages/android/captcha-compose/.../{SliderCaptcha,ClickCaptcha}.kt`
- Modify: `packages/android/captcha-sdk/.../widget/{SliderCaptchaView,ClickCaptchaView,CaptchaDialog}.kt` + `CanvasRenderer.kt`

**Interfaces:** View 用 `ContextCompat.getColor` + 资源限定；Compose 用 `isSystemInDarkTheme()`。

- [ ] **Step 1: 建资源文件**

`res/values/colors.xml`（light）+ `res/values-night/colors.xml`（dark）：定义 `<color name="captcha_slider_bar_bg">#f7f9fa</color>` 等（§3.2 全量），dark 版同 name 不同值。

- [ ] **Step 2: View 端换 ContextCompat.getColor**

`widget/*.kt` + `CanvasRenderer.kt`：`Color.parseColor("#f7f9fa")` → `ContextCompat.getColor(context, R.color.captcha_slider_bar_bg)`（资源限定自动切 dark）。逐处替换 §3.2 所有色。

- [ ] **Step 3: Compose 端 isSystemInDarkTheme + scheme**

`SliderCaptcha.kt`/`ClickCaptcha.kt`：
```kotlin
val dark = isSystemInDarkTheme()
val sliderBarBg = if (dark) Color(0xFF1F1F1F) else Color(0xFFF7F9FA)
// ... §3.2 全量
```
或建 `CaptchaColorScheme` data class + `light`/`dark` factory。

- [ ] **Step 4: android 构建**

Run:
```bash
cd packages/android && ./gradlew :captcha-sdk:assembleDebug :captcha-compose:assembleDebug 2>&1 | tail -5
```
Expected: BUILD SUCCESSFUL。

- [ ] **Step 5: 模拟器 dark theme 目视比对（手动）**

Settings → Dark theme 开，验证各组件暗色、渐变区保留。

- [ ] **Step 6: 提交**

```bash
git add packages/android/captcha-sdk/src/main/res packages/android/captcha-sdk/src/main/java/com/captcha/pro/widget packages/android/captcha-sdk/src/main/java/com/captcha/pro/renderer packages/android/captcha-compose
git commit -m "feat(android): dark mode via values-night resources + isSystemInDarkTheme (Compose+View)"
```

---

### Task 4: ios 暗色（SwiftUI + UIKit）

**Files:**
- Create: `packages/ios/Sources/Core/CaptchaColors.swift`（动态 UIColor 集中层）
- Modify: `packages/ios/Sources/SwiftUI/{SliderCaptcha,ClickCaptcha,PopupCaptcha}.swift`
- Modify: `packages/ios/Sources/Views/{SliderCaptchaView,ClickCaptchaView,CaptchaPopup}.swift`

**Interfaces:** UIKit 用 `UIColor(dynamicProvider:)`；SwiftUI 用 `@Environment(\.colorScheme)` 或动态 `Color(uiImage:)`。

- [ ] **Step 1: 新建 CaptchaColors.swift**

`packages/ios/Sources/Core/CaptchaColors.swift`：
```swift
extension UIColor {
  static let captchaSliderBarBg = UIColor { tc in
    tc.userInterfaceStyle == .dark
      ? UIColor(red: 31/255, green: 31/255, blue: 31/255, alpha: 1)
      : UIColor(red: 247/255, green: 249/255, blue: 250/255, alpha: 1) }
  // ... §3.2 全量 dynamic UIColor
}
extension Color {
  static let captchaSliderBarBg = Color(UIColor.captchaSliderBarBg)
}
```

- [ ] **Step 2: SwiftUI 三组件替换**

`SwiftUI/SliderCaptcha.swift`：`Color(red: 247/255, ...)`→`.captchaSliderBarBg`；`Color(white: 0.4)`(hint, 2.2.0 后)→`.captchaHintText`；`Color(red: 56/255,...)`(success)→`.captchaSuccessText`；等。
> 保留：渐变 `Color(red: 102/255,...)`、`Color(red: 25/255,145/255,250/255)`（箭头/marker）。

`ClickCaptcha.swift`/`PopupCaptcha.swift` 同理映射。

- [ ] **Step 3: UIKit 三组件替换**

`Views/SliderCaptchaView.swift`：`UIColor(red: 247/255,...)`→`UIColor.captchaSliderBarBg`；`UIColor(white: 0.6, ...)`(hint)→`.captchaHintText`；`UIColor(red: 82/255,...)`(success icon)→`.captchaSuccessIconBg`；等。
> 保留：渐变、`UIColor(red: 25/255,145/255,250/255)`（箭头/marker/border）。

`ClickCaptchaView.swift`/`CaptchaPopup.swift` 同理。

- [ ] **Step 4: ios 构建**

Run:
```bash
cd packages/ios && swift build 2>&1 | tail -5
```
Expected: 编译成功。

- [ ] **Step 5: 模拟器 dark + VoiceOver 目视比对（手动）**

`userInterfaceStyle = dark`，验证暗色 + a11y 对比度（dark 文本 #aaa/#5cb85c/#ff7875 达 4.5:1）。

- [ ] **Step 6: 提交**

```bash
git add packages/ios/Sources/Core/CaptchaColors.swift packages/ios/Sources/SwiftUI packages/ios/Sources/Views
git commit -m "feat(ios): dark mode via dynamic UIColor + colorScheme (SwiftUI+UIKit)"
```

---

### Task 5: 文档 + 版本 bump + changeset

**Files:**
- Modify: `docs/accessibility.md`（补暗色说明）
- Modify: 各 README（light/dark 截图占位）
- Create: `.changeset/captcha-pro-2.3.0.md`
- Modify: 各 14 包版本源 + root `package.json` + `CHANGELOG.md`

- [ ] **Step 1: docs/accessibility.md 补暗色段**

追加「暗色模式」段：跟随系统、不提供手动开关、最低基础库版本（小程序）、dark 对比度达标。

- [ ] **Step 2: 写 changeset + 应用**

`.changeset/captcha-pro-2.3.0.md`：11 JS 包 `minor`。`pnpm changeset version`。

- [ ] **Step 3: native 版本 → 2.3.0**

flutter pubspec / android versionName / ios Package.swift + podspec → `2.3.0`。

- [ ] **Step 4: root package.json + CHANGELOG**

`"version": "2.3.0"`；CHANGELOG 顶部插 `[2.3.0]` 条目（暗色模式 + focus trap）。

- [ ] **Step 5: 校验 + 提交**

```bash
grep -rn "2.3.0" package.json packages/flutter/pubspec.yaml packages/ios/Package.swift packages/android/captcha-sdk/build.gradle packages/android/captcha-compose/build.gradle
git add -A && git commit -m "chore: bump all packages to 2.3.0 + changelog"
```

---

### Task 6: 全端构建与回归验证

- [ ] **Step 1: JS 构建** — `fnm use 18 && pnpm turbo build && pnpm turbo test`，全绿。
- [ ] **Step 2: flutter** — `cd packages/flutter && flutter analyze && flutter build apk --debug 2>&1 | tail -5`。
- [ ] **Step 3: android** — `./gradlew :captcha-sdk:assembleDebug :captcha-compose:assembleDebug`。
- [ ] **Step 4: ios** — `swift build`。
- [ ] **Step 5: dark grep 终检** — 各端无遗漏 light 硬编码（应全部走 dark 可适配路径）：
```bash
echo "== flutter ==" && grep -rn "Color(0xFFF7F9FA)\|Color(0xFF999999)\|Color(0xFF666666)\|Color(0xFF333333)\|Color(0xFFEEEEEE)" packages/flutter/lib/src/widgets | wc -l
echo "== android Compose ==" && grep -rn "Color(0xFFF7F9FA)\|Color(0xFFE1E4E8)" packages/android/captcha-compose --include="*.kt" | grep -v "/build/" | wc -l
echo "== ios ==" && grep -rn "UIColor(red: 247/255\|UIColor(red: 225/255\|UIColor(white: 0.6" packages/ios/Sources --include="*.swift" | wc -l
```
Expected: 均为 0（已全部迁入集中层）；保留项（渐变 102/255、25/255/145/255/250/255）不在 grep 列表。

- [ ] **Step 6: 提交（若有修复）**

```bash
git add -A && git commit -m "chore: verify 2.3.0 builds green + dark mode across all platforms"
```

---

## 发版

Task 1-6 完成、全端构建绿、dark grep 终检通过后：
- `git tag v2.3.0`
- `pnpm pub`（JS 包，`--no-git-checks`）
- native 按各平台渠道发布

## 风险

- **颜色散落**：各端 inline 色多处，dark 适配逐处替换易遗漏。grep 终检兜底（Task 6 Step 5）。
- **小程序基础库兼容**：旧版不支持 `prefers-color-scheme`，回退 light。文档声明最低版本。
- **dark a11y 对比度**：2.2.0 a11y 在 dark 下需重验；§3.2 已提亮状态文本，需 VoiceOver/高对比模式抽测。
- **focus trap 极简实现**：不引第三方库，手写 Tab 拦截；需测 Shift+Tab 与 Esc 行为。
- **手动开关缺位**：仅跟随系统；宿主手动覆盖需自行覆 CSS（文档说明）。
- **2.2.0 依赖**：focus trap 需 2.2.0 的 `role="dialog"` 已落地；发版序 2.2.0 先。
