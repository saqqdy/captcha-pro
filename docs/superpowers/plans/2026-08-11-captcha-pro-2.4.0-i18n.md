# captcha-pro 2.4.0 — i18n 多语言扩展 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** i18n 从 2 语言扩到 6 语言（zh-CN + zh-TW + en-US + fr-FR + de-DE + es-ES），4 处源同步，新增 4 语言 × 14 键 = 56 条文案。`locale` prop/option 仅扩可选值，无 API 破坏。

**Architecture:** 4 处 i18n 源结构已对齐（type/Map/enum+object/enum+struct）。扩展 = 在每处追加 4 语言条目 + 扩 `CaptchaLocale` 类型可选值。回退链已存在，新语言缺键自动回退 zh-CN。无 API 新增。

**Tech Stack:** TypeScript/pnpm/turbo/changesets、Dart/Flutter、Kotlin/Android、Swift/iOS。

**Design spec:** `docs/superpowers/specs/2026-08-11-captcha-pro-2.4.0-i18n-design.md`（文案翻译表 §4.2、4 源扩展点 §4.1、风险 §6 见此）。

## Global Constraints

- **不改键集**：2.2.0 后键集（14 或 15，Task 1 Step 1 确认）不动，仅扩语言。
- **不改 API**：`locale` prop/option 已存在，仅扩可选值；`getCaptcha`/`verify` 不变；`DEFAULT_LOCALE` 保持 `zh-CN`。
- **不改后端**：`server/{node,java,go}` 不动。
- **4 源同步**：mp-shared `i18n.ts` / flutter `i18n.dart` / android `Types.kt` / ios `Types.swift` 必须同步，键数/语言数一致。
- **文案以 spec §4.2 为准**：翻译见 spec 表，勿自行改译。
- **node**：JS 构建用 node 18（`fnm use`）。

## 现状审计（已确认，勿重复）

| 源 | 文件 | 现语言 | 结构 |
|---|---|---|---|
| mp-shared | `packages/mp-shared/src/i18n.ts` | zh-CN/en-US | `type CaptchaLocale` + `LOCALE_MESSAGES: Record<...>` |
| flutter | `packages/flutter/lib/src/core/i18n.dart` | zh-CN/en-US | `Map<String, Map<String,String>> localeMessages` |
| android | `packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt` | zh-CN/en-US | `enum CaptchaLocale` + `object LocaleMessages` |
| ios | `packages/ios/Sources/Core/Types.swift` | zh-CN/en-US | `enum CaptchaLocale: String` + `struct LocaleMessages` |

---

### Task 1: 2.2.0 refresh 键确认 + mp-shared i18n.ts 扩展

**Files:**
- Modify: `packages/mp-shared/src/i18n.ts`

**Interfaces:** `CaptchaLocale` 类型扩 4 literal；`LOCALE_MESSAGES` 追加 4 条 Record。

- [ ] **Step 1: 确认 2.2.0 refresh 键是否已落地**

Run:
```bash
grep -n "'refresh'\|\"refresh\"" packages/mp-shared/src/i18n.ts packages/flutter/lib/src/core/i18n.dart packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt packages/ios/Sources/Core/Types.swift || echo "无 refresh 键（14 键集）"
```
Expected: 4 源均含 `refresh` → 键集 15，新语言条目须含 `refresh`；或均无 → 键集 14。记录键数 N。

- [ ] **Step 2: 扩 `CaptchaLocale` 类型**

`packages/mp-shared/src/i18n.ts`:
```ts
export type CaptchaLocale = 'zh-CN' | 'zh-TW' | 'en-US' | 'fr-FR' | 'de-DE' | 'es-ES'
```
`DEFAULT_LOCALE` 保持 `'zh-CN'` 不变。

- [ ] **Step 3: 追加 4 条文案 Record**

在 `LOCALE_MESSAGES` 的 `'en-US'` 条目后追加（文案见 spec §4.2；若 Step 1 确认含 `refresh`，每条加 `refresh: ...` 键——zh-TW `刷新` / fr `Actualiser` / de `Aktualisieren` / es `Actualizar`）：
```ts
  'zh-TW': { /* spec §4.2 zh-TW 列，14(或15) 键 */ },
  'fr-FR': { /* spec §4.2 fr-FR 列 */ },
  'de-DE': { /* spec §4.2 de-DE 列 */ },
  'es-ES': { /* spec §4.2 es-ES 列 */ },
```

- [ ] **Step 4: 类型校验**

Run:
```bash
fnm use 18 && pnpm turbo build --filter=@captcha-pro/mp-shared
```
Expected: 类型编译通过。

- [ ] **Step 5: 提交**

```bash
git add packages/mp-shared/src/i18n.ts
git commit -m "feat(mp-shared): add zh-TW/fr-FR/de-DE/es-ES locales (4 new languages)"
```

---

### Task 2: flutter i18n.dart 扩展

**Files:**
- Modify: `packages/flutter/lib/src/core/i18n.dart`

**Interfaces:** `localeMessages` Map 追加 4 条 entry。

- [ ] **Step 1: 追加 4 条文案**

在 `i18n.dart` 的 `'en-US'` entry 后追加（文案见 spec §4.2）：
```dart
  'zh-TW': { 'loading': '載入中...', /* ... 14(或15) 键 */ },
  'fr-FR': { 'loading': 'Chargement...', /* ... */ },
  'de-DE': { 'loading': 'Laden...', /* ... */ },
  'es-ES': { 'loading': 'Cargando...', /* ... */ },
```
> `defaultLocale` 保持 `'zh-CN'`。`getLocaleMessage` 不改。

- [ ] **Step 2: flutter 静态分析**

Run:
```bash
cd packages/flutter && flutter analyze
```
Expected: 无 error。

- [ ] **Step 3: 提交**

```bash
git add packages/flutter/lib/src/core/i18n.dart
git commit -m "feat(flutter): add zh-TW/fr-FR/de-DE/es-ES locales"
```

---

### Task 3: android Types.kt 扩展

**Files:**
- Modify: `packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt`

**Interfaces:** `CaptchaLocale` enum 加 4 case；`LocaleMessages` object 加 4 组 `mapOf`。

- [ ] **Step 1: 扩 `CaptchaLocale` enum**

`Types.kt`:
```kotlin
enum class CaptchaLocale(val code: String) {
    ZH_CN("zh-CN"), ZH_TW("zh-TW"),
    EN_US("en-US"),
    FR_FR("fr-FR"), DE_DE("de-DE"), ES_ES("es-ES");
    // companion object from(code) 不改
}
```

- [ ] **Step 2: `LocaleMessages` object 追加 4 组**

在 `EN_US` 的 `mapOf(...)` 后追加（文案见 spec §4.2）：
```kotlin
        CaptchaLocale.ZH_TW to mapOf(
            "loading" to "載入中...",
            // ... 14(或15) 键
        ),
        CaptchaLocale.FR_FR to mapOf(
            "loading" to "Chargement...",
            // ...
        ),
        CaptchaLocale.DE_DE to mapOf(
            "loading" to "Laden...",
            // ...
        ),
        CaptchaLocale.ES_ES to mapOf(
            "loading" to "Cargando...",
            // ...
        ),
```
> `get(locale, key)` 不改（回退链已覆盖）。

- [ ] **Step 3: android 构建**

Run:
```bash
cd packages/android && ./gradlew :captcha-sdk:assembleDebug 2>&1 | tail -5
```
Expected: BUILD SUCCESSFUL。

- [ ] **Step 4: 提交**

```bash
git add packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt
git commit -m "feat(android): add zh-TW/fr-FR/de-DE/es-ES locales"
```

---

### Task 4: ios Types.swift 扩展

**Files:**
- Modify: `packages/ios/Sources/Core/Types.swift`

**Interfaces:** `CaptchaLocale` enum 加 4 case；`LocaleMessages.messages` 加 4 条。

- [ ] **Step 1: 扩 `CaptchaLocale` enum**

`Types.swift`:
```swift
public enum CaptchaLocale: String {
    case zhCN = "zh-CN", zhTW = "zh-TW"
    case enUS = "en-US"
    case frFR = "fr-FR", deDE = "de-DE", esES = "es-ES"
    public static func from(code: String) -> CaptchaLocale { CaptchaLocale(rawValue: code) ?? .zhCN }
}
```

- [ ] **Step 2: `LocaleMessages.messages` 追加 4 条**

在 `.enUS:` 条目后追加（文案见 spec §4.2）：
```swift
        .zhTW: [
            "loading": "載入中...", "slider_slide": "請拖動滑塊完成驗證",
            // ... 14(或15) 键
        ],
        .frFR: [
            "loading": "Chargement...", // ...
        ],
        .deDE: [
            "loading": "Laden...", // ...
        ],
        .esES: [
            "loading": "Cargando...", // ...
        ],
```
> `get(_ locale, key)` 不改。

- [ ] **Step 3: ios 构建**

Run:
```bash
cd packages/ios && swift build 2>&1 | tail -5
```
Expected: 编译成功。

- [ ] **Step 4: 提交**

```bash
git add packages/ios/Sources/Core/Types.swift
git commit -m "feat(ios): add zh-TW/fr-FR/de-DE/es-ES locales"
```

---

### Task 5: core 单测 + 6 小程序 locale 透传校验

**Files:**
- Modify: `packages/core/test/i18n.test.ts`

**Interfaces:** 扩 6 语言 × N 键断言；回退测（未支持 locale → zh-CN）。

- [ ] **Step 1: 扩 i18n 单测**

`packages/core/test/i18n.test.ts`：为 6 语言各断言 N 键（14 或 15）文案匹配 spec §4.2；新增回退测：`getLocaleMessage('ja-JP', 'loading')` === zh-CN 值。

- [ ] **Step 2: 跑单测**

Run:
```bash
fnm use 18 && pnpm turbo test --filter=@captcha-pro/core
```
Expected: 全绿。

- [ ] **Step 3: 6 小程序 locale 透传 grep 校验**

Run:
```bash
grep -rn "locale" packages/weixin/src packages/uniapp-vue/src packages/uniapp-vue2/src packages/taro-react/src packages/taro-vue/src packages/taro-vue2/src --include="*.ts" --include="*.vue" --include="*.js" -l
```
Expected: 各端 init/options 接受 `locale` 并透传 mp-shared `getLocaleMessage`。若任一端未透传 → 补。

- [ ] **Step 4: 提交**

```bash
git add packages/core/test/i18n.test.ts
git commit -m "test(core): assert 6 locales + fallback for unsupported locale"
```
（小程序若需补透传一并提交。）

---

### Task 6: docs/i18n.md + README + examples 演示

**Files:**
- Create: `docs/i18n.md`
- Modify: 各 README（补 i18n 段）
- Modify（可选）: `examples/vue/`、`examples/react/` 加 locale 切换演示

- [ ] **Step 1: 新建 docs/i18n.md**

列支持语言（6）+ 各语言文案表（引 spec §4.2）+ `locale` 传参示例（web/小程序/native）+ 翻译贡献指南（声明 AI 翻译初稿，欢迎母语 PR）+ 后端 message 不 i18n 限制说明。

- [ ] **Step 2: README 补 i18n 段**

root `README.md` + native README 补「i18n」段，列 6 语言 + 指向 `docs/i18n.md`。

- [ ] **Step 3: examples locale 演示（可选）**

`examples/vue/index.html`、`examples/react/`：加 locale 下拉切换 zh-CN/zh-TW/en-US/fr/de/es，目视验证文案 + 布局（fr/de 长文案不撑破）。

- [ ] **Step 4: 提交**

```bash
git add docs/i18n.md README.md packages/*/README*.md examples
git commit -m "docs: add i18n guide + README i18n section + locale demo"
```

---

### Task 7: 版本 bump + changeset + CHANGELOG

**Files:**
- Create: `.changeset/captcha-pro-2.4.0.md`
- Modify: 14 包版本源 + root `package.json` + `CHANGELOG.md`

- [ ] **Step 1: 写 changeset + 应用**

`.changeset/captcha-pro-2.4.0.md`：11 JS 包 `minor`。`pnpm changeset version`。

- [ ] **Step 2: native 版本 → 2.4.0**

flutter pubspec / android versionName / ios Package.swift + podspec → `2.4.0`。

- [ ] **Step 3: root package.json + CHANGELOG**

`"version": "2.4.0"`；CHANGELOG 顶部插 `[2.4.0]` 条目（i18n 新增 zh-TW/fr-FR/de-DE/es-ES）。

- [ ] **Step 4: 校验 + 提交**

```bash
grep -rn "2.4.0" package.json packages/flutter/pubspec.yaml packages/ios/Package.swift packages/android/captcha-sdk/build.gradle packages/android/captcha-compose/build.gradle
git add -A && git commit -m "chore: bump all packages to 2.4.0 + changelog"
```

---

### Task 8: 全端构建与回归验证

- [ ] **Step 1: JS 构建 + 单测** — `fnm use 18 && pnpm turbo build && pnpm turbo test`，全绿。
- [ ] **Step 2: flutter** — `cd packages/flutter && flutter analyze && flutter build apk --debug 2>&1 | tail -5`。
- [ ] **Step 3: android** — `./gradlew :captcha-sdk:assembleDebug :captcha-compose:assembleDebug`。
- [ ] **Step 4: ios** — `swift build`。
- [ ] **Step 5: 4 源语言/键数 grep 终检**:
```bash
echo "== 语言数（应 6）==" && for f in packages/mp-shared/src/i18n.ts packages/flutter/lib/src/core/i18n.dart packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt packages/ios/Sources/Core/Types.swift; do printf "%s: " "$f"; grep -oE "zh-CN|zh-TW|en-US|fr-FR|de-DE|es-ES" "$f" | sort -u | tr '\n' ' '; echo; done
echo "== loading 键出现次数（应 = 语言数 6，每语言一处 loading 定义）==" && for f in packages/mp-shared/src/i18n.ts packages/flutter/lib/src/core/i18n.dart packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt packages/ios/Sources/Core/Types.swift; do printf "%s: " "$f"; grep -cE "'loading'|\"loading\"" "$f"; done
```
Expected: 每源 6 语言 code；`loading` 计数 = 6（若 2.2.0 含 refresh 仍为 6，因 loading 每语言一处）。

- [ ] **Step 6: 回退测（手动）** — 传 `locale='ja-JP'` 启动 example，文案回退 zh-CN，无报错。
- [ ] **Step 7: UI 布局（手动）** — example 切 fr/de，验证 `popup_title`/`slider_hint` 不撑破。
- [ ] **Step 8: 提交（若有修复）**

```bash
git add -A && git commit -m "chore: verify 2.4.0 builds green + 6 locales across all platforms"
```

---

## 发版

Task 1-8 完成、全端构建绿、grep 终检通过后：
- `git tag v2.4.0`
- `pnpm pub`（JS 包，`--no-git-checks`）
- native 按各平台渠道发布

## 风险

- **翻译准确性**：fr/de/es AI 翻译初稿，非母语审校。`docs/i18n.md` 声明 community translation + 欢迎 PR。
- **zh-TW 用字**：`网络`→`網路` 已人工校对；其余简繁字符映射。可接受；母语 PR 欢迎。
- **文案长度撑破 UI**：fr/de 长 ~30%。Task 8 Step 7 目视验证 `popup_title`/`slider_hint`；若撑破，调字号或允许换行（需评估是否破坏 2.1.0 样式令牌）。
- **后端 message 不 i18n**：非中文用户看到后端中文 message。2.4.0 不改后端，文档说明限制。
- **4 源不同步**：人工追加易漏键/漏语言。Task 8 Step 5 grep 终检兜底（6 语言 code + loading 计数=6）。
- **2.2.0 依赖**：Task 1 Step 1 grep 确认 refresh 键状态，决定键集 14 或 15；4 源须一致。
