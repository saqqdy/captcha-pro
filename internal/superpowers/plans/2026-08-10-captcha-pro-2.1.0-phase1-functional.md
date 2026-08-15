# captcha-pro 2.1.0 Phase 1 — Native 功能契约对齐 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 android / ios / flutter 三端对齐 taro-vue 功能契约，并全端统一发版 2.1.0。

**Architecture:** 源码审计发现契约对齐工作已 ~90% 落地（flutter backend.dart+i18n.dart 完整、android/ios 的 LocaleMessages 含 loading+slider_hint、precision 已删、timeout=10s、serializeCaptchaData 已不含 timestamp）。Phase 1 因此是「审计 + 小补缺 + README/版本修正 + 发版」，非从零实现。Phase 2（样式复刻）依赖 Phase 1 稳定基线，单独成计划。

**Tech Stack:** Dart/Flutter、Kotlin/Android、Swift/iOS、TypeScript/pnpm/turbo/changesets。

## Global Constraints

- **基准**：`packages/taro-vue` 不改动（契约来源）。
- **不动项**：invisible、统计、CaptchaPro facade、双范式、设备指纹等 native 附加特性保留；examples/* 不涉及。
- **无单测**：native 包无测试基建，验证 = build 通过 + grep 契约校验 + 与 taro-vue 示例目视比对。偏离严格 TDD。
- **契约**：verify 请求体只含 `{captchaId, type, target}`（**无 timestamp**）；timeout 默认 10s；14 个 i18n 键齐全（含 `loading`、`slider_hint`）；无 `precision` 死参数。
- **版本**：root + 14 包全部 2.0.0 → 2.1.0。
- **node**：JS 侧构建用 node 18（`.node-version` + `fnm use`），canvas 包需 `PYTHON=/usr/local/bin/python3.11`（仅当装新依赖）。

## 现状审计（已确认完成，勿重复实现）

| 项 | 文件 | 现状 |
|---|---|---|
| flutter BackendConfig+fetch/verify | `packages/flutter/lib/src/core/backend.dart` | ✅ 完整，line 141 注释 "no timestamp" |
| flutter 14 键 i18n | `packages/flutter/lib/src/core/i18n.dart` | ✅ 含 loading/slider_hint |
| flutter PopupCaptcha | `packages/flutter/lib/src/widgets/popup_captcha.dart` | ✅ 全 props + 500ms 自动关闭 + onError 透传 |
| android LocaleMessages | `core/Types.kt:20-59` | ✅ 含 loading/slider_hint |
| android precision 死参数 | `core/Types.kt` CaptchaOptions | ✅ 已无 precision |
| android timeout=10000 | `core/Types.kt:106,113` | ✅ |
| android serializeCaptchaData | `core/CaptchaGenerator.kt:169-193` | ✅ 只含 captchaId/type/target，无 timestamp |
| android CaptchaDialog title | `widget/CaptchaDialog.kt:29,138` | ✅ title prop + popup_title 回退 |
| ios LocaleMessages | `Core/Types.swift:11-27` | ✅ 含 loading/slider_hint |
| ios precision 死参数 | `Core/Types.swift` CaptchaOptions | ✅ 已无 precision |
| ios timeout=10 | `Core/Types.swift:56,61,65` | ✅ |
| ios serializeCaptchaData | `Core/CaptchaGenerator.swift:129-148` | ✅ 只含 captchaId/type/target |

---

### Task 1: 契约合规 grep 审计（确认无回归）

**Files:** 无修改，只读校验。

**Interfaces:** 产出审计结论，供后续 task 判定是否需补缺。

- [ ] **Step 1: 校验 verify 请求体无 timestamp（android/ios）**

Run:
```bash
grep -n "timestamp" packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/CaptchaGenerator.kt packages/ios/Sources/Core/CaptchaGenerator.swift
```
Expected: `serializeCaptchaData` 函数体内**不出现** `timestamp`（android line 169-193、ios line 129-148）。若 serializeCaptchaData 内出现 timestamp 字段 put → 回归，需移除。

- [ ] **Step 2: 校验 14 个 i18n 键齐全**

Run:
```bash
for f in packages/flutter/lib/src/core/i18n.dart packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt packages/ios/Sources/Core/Types.swift; do echo "== $f =="; grep -cE '"(loading|slider_slide|slider_hint|slider_success|slider_fail|click_prompt|click_success|click_fail|popup_title|popup_close|error_network|error_expired|error_invalid|error_not_found)"' "$f"; done
```
Expected: flutter 文件计数 ≥14；android/ios 因 zh+en 各 14，计数 ≥28。

- [ ] **Step 3: 校验无 precision 死参数**

Run:
```bash
grep -rn "precision" packages/android/captcha-sdk/src packages/ios/Sources packages/flutter/lib/src || echo "OK: no precision refs"
```
Expected: `OK: no precision refs`（或仅注释/无关上下文）。

- [ ] **Step 4: 校验 timeout 默认 10s**

Run:
```bash
grep -n "timeout" packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt packages/ios/Sources/Core/Types.swift | grep -iE "10000|= 10[^0]"
```
Expected: android `timeout: Long = 10000`；ios `timeout: TimeInterval = 10`。

- [ ] **Step 5: 记录审计结论**

若 Step 1-4 全绿 → 契约已合规，跳到 Task 3。若任一项回归 → 在 Task 2 针对性修复。

- [ ] **Step 6: 提交审计记录**

```bash
git add -A
git commit -m "chore: audit native contract compliance for 2.1.0"
```
（若无可提交改动则跳过。）

---

### Task 2: flutter 叶子组件 800ms 失败刷新校验

**Files:**
- Modify (若缺失): `packages/flutter/lib/src/widgets/slider_captcha.dart`
- Modify (若缺失): `packages/flutter/lib/src/widgets/click_captcha.dart`

**Interfaces:**
- Consumes: `getLocaleMessage(locale, 'slider_fail')` from `i18n.dart`
- Produces: 失败后 800ms 自动刷新（与 taro-vue 时序一致）

**背景**：spec 要求失败自动刷新 800ms（flutter 现文档称 500ms）。PopupCaptcha 自身只做成功 500ms 关闭；失败刷新在叶子 slider/click 组件内。

- [ ] **Step 1: 检查现有失败刷新时序**

Run:
```bash
grep -nE "800|500|Future.delayed|onFail|refresh" packages/flutter/lib/src/widgets/slider_captcha.dart packages/flutter/lib/src/widgets/click_captcha.dart | head -40
```
记录当前失败后的延迟值与刷新调用。

- [ ] **Step 2: 若非 800ms 则修正**

在 slider_captcha.dart / click_captcha.dart 的失败处理分支，将失败后自动刷新延迟改为 `Duration(milliseconds: 800)`：

```dart
// 失败反馈后 800ms 自动刷新（对齐 taro-vue 时序）
Future.delayed(const Duration(milliseconds: 800), () {
  if (mounted) refresh();
});
```

若已是 800ms 或无自动刷新逻辑且 taro-vue 基准亦无 → 跳过，在审计记录注明。

- [ ] **Step 3: flutter 静态分析**

Run:
```bash
cd packages/flutter && flutter analyze
```
Expected: 无 error（warning 可接受）。

- [ ] **Step 4: 提交**

```bash
git add packages/flutter/lib/src/widgets/slider_captcha.dart packages/flutter/lib/src/widgets/click_captcha.dart
git commit -m "fix(flutter): align fail-auto-refresh to 800ms per taro-vue contract"
```
（无改动则跳过。）

---

### Task 3: native README 虚假声明修正

**Files:**
- Modify: `packages/android/README*.md`、`packages/ios/README*.md`、`packages/flutter/README*.md`

**Interfaces:** 无（纯文档）。

**目标**：移除 "AES encryption" / "AES-256" / "数据加密" 等不实声明（native 现为后端验证，无客户端加密）。

- [ ] **Step 1: 定位虚假加密声明**

Run:
```bash
grep -rniE "aes|encryption|加密|256-gcm|pbkdf2" packages/android/README*.md packages/ios/README*.md packages/flutter/README*.md
```

- [ ] **Step 2: 删除匹配行/段落**

逐一移除上一步命中的加密相关声明，保持上下文通顺。

- [ ] **Step 3: 校验无残留**

Run:
```bash
grep -rniE "aes|encryption|加密|pbkdf2" packages/android/README*.md packages/ios/README*.md packages/flutter/README*.md || echo "OK: no false crypto claims"
```
Expected: `OK: no false crypto claims`。

- [ ] **Step 4: 提交**

```bash
git add packages/android/README*.md packages/ios/README*.md packages/flutter/README*.md
git commit -m "docs(native): remove false AES/encryption claims from READMEs"
```

---

### Task 4: native 版本号 → 2.1.0

**Files:**
- Modify: `packages/flutter/pubspec.yaml`（`version:` 行）
- Modify: android 版本源（`packages/android/captcha-sdk/build.gradle` 或 `gradle.properties` 的 `VERSION_NAME`/`versionName`，及 `captcha-compose` 同理）
- Modify: `packages/ios/Package.swift`（`version` 字段）及 any `.podspec` `s.version`

**Interfaces:** 无。

**现状**：flutter pubspec 已是 `version: 2.0.0`；android/ios 版本号待定位确认。

- [ ] **Step 1: 定位 native 版本源**

Run:
```bash
echo "== flutter ==" && grep -n "^version:" packages/flutter/pubspec.yaml
echo "== android ==" && grep -rnE "versionName|VERSION_NAME|version =" packages/android/captcha-sdk/build.gradle packages/android/captcha-sdk/gradle.properties packages/android/captcha-compose/build.gradle packages/android/captcha-compose/gradle.properties 2>/dev/null
echo "== ios ==" && grep -rn "version" packages/ios/Package.swift packages/ios/*.podspec 2>/dev/null
```
记录当前各值（spec 提及 android 1.0.0↔1.1.0、ios iOS13↔.v12 等历史不一致）。

- [ ] **Step 2: flutter 升 2.1.0**

`packages/flutter/pubspec.yaml`:
```yaml
version: 2.1.0
```

- [ ] **Step 3: android 升 2.1.0**

将 Step 1 定位到的 `captcha-sdk` 与 `captcha-compose` 的 versionName/VERSION_NAME 改为 `2.1.0`。

- [ ] **Step 4: ios 升 2.1.0**

`packages/ios/Package.swift` 的 `version: "x.x.x"` → `version: "2.1.0"`；podspec `s.version = 'x.x.x'` → `'2.1.0'`。

- [ ] **Step 5: 校验**

Run:
```bash
grep -rn "2.1.0" packages/flutter/pubspec.yaml packages/android/captcha-sdk/build.gradle packages/android/captcha-compose/build.gradle packages/ios/Package.swift
```
Expected: 各文件出现 `2.1.0`。

- [ ] **Step 6: 提交**

```bash
git add packages/flutter/pubspec.yaml packages/android packages/ios
git commit -m "chore(native): bump android/ios/flutter to 2.1.0"
```

---

### Task 5: JS 包 + root changeset → 2.1.0

**Files:**
- Create: `.changeset/captcha-pro-2.1.0.md`
- Modify: `CHANGELOG.md`

**Interfaces:** 无。

**目标**：root + 11 个 JS 包 minor bump 2.0.0 → 2.1.0（无功能改动，统一信号）。

- [ ] **Step 1: 写 changeset 文件**

创建 `.changeset/captcha-pro-2.1.0.md`：

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

Align android/ios/flutter to taro-vue functional contract; unify all packages to 2.1.0.
```

- [ ] **Step 2: 应用 changeset**

Run:
```bash
pnpm changeset version
```
Expected: 11 个 JS 包 package.json `version` → `2.1.0`。

- [ ] **Step 3: root package.json 升 2.1.0**

`package.json`:
```json
  "version": "2.1.0",
```

- [ ] **Step 4: CHANGELOG 追加 2.1.0 条目**

在 `CHANGELOG.md` 顶部（`## [2.0.0]` 之前）插入：

```markdown
## [2.1.0] - 2026-08-10

### Native 三端功能契约对齐

- **flutter**: BackendConfig + fetchCaptcha/verifyCaptcha（后端模式，无客户端生成）、14 键 i18n、PopupCaptcha 全 props（autoClose 500ms / 失败刷新 800ms）、onError 回调
- **android**: LocaleMessages 补 loading/slider_hint、移除 precision 死参数、verify 请求体移除 timestamp、timeout 默认 10s、CaptchaDialog title prop
- **ios**: 同 android 对齐（UIKit + SwiftUI 双范式）

### 全端版本统一

- root + 11 个 JS 包 + 3 个 native 包（android/ios/flutter）统一 2.1.0

### Documentation

- 移除 native README 中的 AES/encryption 不实声明
```

- [ ] **Step 5: 提交**

```bash
git add .changeset CHANGELOG.md package.json packages/*/package.json
git commit -m "chore: bump all packages to 2.1.0 + changelog"
```

---

### Task 6: 全端构建与回归验证

**Files:** 无修改。

**Interfaces:** 产出构建结论。

- [ ] **Step 1: JS 侧构建**

Run:
```bash
fnm use 18 && pnpm turbo build
```
Expected: 全部 11 个 JS 包构建成功（零回归，因无 JS 功能改动）。

- [ ] **Step 2: core 单测**

Run:
```bash
fnm use 18 && pnpm turbo test
```
Expected: vitest 全绿。

- [ ] **Step 3: flutter 构建**

Run:
```bash
cd packages/flutter && flutter analyze && flutter build apk --debug 2>&1 | tail -5
```
（或在 example 项目中引用 flutter 包构建。）
Expected: analyze 无 error；build 成功。

- [ ] **Step 4: android 构建**

Run:
```bash
cd packages/android && ./gradlew :captcha-sdk:assembleDebug :captcha-compose:assembleDebug 2>&1 | tail -5
```
Expected: BUILD SUCCESSFUL。

- [ ] **Step 5: ios 构建**

Run:
```bash
cd packages/ios && swift build 2>&1 | tail -5
```
Expected: 编译成功。

- [ ] **Step 6: 契约终检（grep 复跑 Task 1 Step 1-4）**

Run Task 1 的 Step 1/2/3/4 命令。Expected: 全绿。

- [ ] **Step 7: 提交构建验证记录（若有修复）**

```bash
git add -A
git commit -m "chore: verify 2.1.0 builds green across all platforms"
```
（无改动则跳过；若构建失败则回到对应 Task 修复。）

---

## Phase 2（样式复刻）— 单独计划

样式复刻（taro-vue 视觉 → native，三端双范式）依赖 Phase 1 稳定基线，且需在 Phase 1 落地后读取当时 native Compose/View/UIKit/SwiftUI/Dart widget 源码方可写精确编辑步骤。Phase 1 完成后另起 `docs/superpowers/plans/2026-08-xx-captcha-pro-2.1.0-phase2-style.md`。

样式令牌表见 spec `docs/superpowers/specs/2026-08-10-captcha-pro-2.1.0-native-alignment-design.md` 第 5 节。

## 发版

Phase 1 + Phase 2 均完成、全端构建绿后：
- `git tag v2.1.0`
- `pnpm pub`（JS 包，`--no-git-checks`）
- native 按各平台渠道发布（Maven Central / CocoaPods+SPM / pub.dev）

## 风险

- **flutter build apk** 需 Android SDK/NDK 环境；若 CI 无 Android 环境，至少跑 `flutter analyze` + dart 单测。
- **android/ios 版本源** 可能在多文件（gradle.properties + build.gradle），Step 1 grep 须覆盖全。
- **changeset version** 可能改动多个 package.json，提交前 `git diff` 复核。
