# captcha-pro 2.4.0 — i18n 多语言扩展 设计规格

- **日期**：2026-08-11
- **状态**：已批准，待写实施计划
- **前置**：2.3.0（暗色模式）落地后开展。2.4.0 不改 API 契约（`locale` prop/option 已存在，仅扩可选值），可并行开发，发版序 2.3.0 先。是 3.0.0（major breaking：移除客户端生成）前最后一个 minor。
- **承接**：2.2.0 spec §4.8 扩 i18n 键（14→15 加 `refresh`，2.4.0 假设键集已含 `refresh`；若 2.2.0 未落地则键集回退到 14）。2.4.0 在现有键集上扩语言，不改键。

## 1. 背景与目标

i18n 现仅 `zh-CN` + `en-US` 两语言（14 键 × 2 = 28 条文案），4 处源同步（mp-shared `i18n.ts` / flutter `i18n.dart` / android `Types.kt` LocaleMessages / ios `Types.swift` LocaleMessages）。出海应用接入日韩欧市场时文案不足，宿主只能自行 hack 文案或 fork。

**目标**：扩到 6 语言——保留 `zh-CN` + `en-US`，新增 `zh-TW` + `fr-FR` + `de-DE` + `es-ES`，共 4 新语言 × 14 键 = 56 条文案，4 处源同步。`locale` prop/option 仅扩可选值，无 API 破坏。

**非目标**：
- 不改 i18n 键集（2.2.0 已定 14/15 键；2.4.0 仅扩语言维度）
- 不改 API 契约（`getCaptcha`/`verify` 不变；`locale` 字段已存在，仅扩可选值）
- 不改后端 i18n（`server/{node,java,go}` 不改；后端返回 errorCode，客户端按 code 查 i18n；后端 `message` 字段不经客户端 i18n——现状不变）
- 不引入运行时语言检测（locale 由宿主显式传，不自动嗅探 `navigator.language`——保 API 稳定）
- 不做 RTL 语言（ar/he——RTL 布局适配复杂，留后续）
- 不做日韩（ja/ko——用户未选，留后续）

## 2. 决策

| 维度 | 决策 |
|---|---|
| 主题 | i18n 多语言扩展 |
| 语言集 | `zh-CN` + `zh-TW` + `en-US` + `fr-FR` + `de-DE` + `es-ES`（6 语言，新增 4） |
| 键集 | 不改（沿用 2.2.0 后的 14/15 键） |
| 4 处源 | 同步扩 `CaptchaLocale` 类型 + 文案 Map：mp-shared `i18n.ts`、flutter `i18n.dart`、android `Types.kt`、ios `Types.swift` |
| API | `locale` prop/option 仅扩可选值，无破坏 |
| 默认 | `DEFAULT_LOCALE` 保持 `zh-CN` |
| 回退 | 现有链不变：`locale → defaultLocale → key`（新语言缺键自动回退 zh-CN） |
| 翻译来源 | AI 翻译初稿 + 文档声明「非母语审校，欢迎 PR」；`zh-TW` 用字转换 + 词汇人工校对 |
| 版本 | 2.4.0 minor bump 全 14 包 + root（无 API 破坏） |

## 3. 现状（i18n 源审计，已确认）

| 源 | 文件 | 类型定义 | 数据结构 | 语言数 |
|---|---|---|---|---|
| mp-shared | `packages/mp-shared/src/i18n.ts` | `type CaptchaLocale = 'zh-CN' \| 'en-US'` | `LOCALE_MESSAGES: Record<CaptchaLocale, Record<string,string>>` | 2 |
| flutter | `packages/flutter/lib/src/core/i18n.dart` | （字符串 literal，无类型） | `Map<String, Map<String, String>> localeMessages` | 2 |
| android | `packages/android/captcha-sdk/.../core/Types.kt` | `enum class CaptchaLocale { ZH_CN, EN_US }` | `object LocaleMessages` 内 `mapOf(...)` | 2 |
| ios | `packages/ios/Sources/Core/Types.swift` | `enum CaptchaLocale: String { case zhCN, enUS }` | `struct LocaleMessages` 内 `messages: [CaptchaLocale: [String:String]]` | 2 |

**键集**（14 键，4 源一致）：`loading` / `slider_slide` / `slider_hint` / `slider_success` / `slider_fail` / `click_prompt` / `click_success` / `click_fail` / `popup_title` / `popup_close` / `error_network` / `error_expired` / `error_invalid` / `error_not_found`。
> 若 2.2.0 已落地 `refresh` 键（15 键），4 源均含；2.4.0 新语言条目须含该键。

**回退链**（4 源一致）：`getLocaleMessage(locale, key)` → `locale` 缺失回退 `defaultLocale(zh-CN)` → 仍缺返回 `key` 本身。

## 4. 详细设计

### 4.1 四源扩展点

#### 4.1.1 mp-shared `i18n.ts`
```ts
export type CaptchaLocale = 'zh-CN' | 'zh-TW' | 'en-US' | 'fr-FR' | 'de-DE' | 'es-ES'
// DEFAULT_LOCALE 保持 'zh-CN'
// LOCALE_MESSAGES 追加 'zh-TW'/'fr-FR'/'de-DE'/'es-ES' 四条 Record（文案见 §4.2）
// getLocaleMessage 不改（回退链已覆盖）
```

#### 4.1.2 flutter `i18n.dart`
```dart
// localeMessages Map 追加四条 entry（文案见 §4.2）
// getLocaleMessage 不改
```

#### 4.1.3 android `Types.kt`
```kotlin
enum class CaptchaLocale(val code: String) {
    ZH_CN("zh-CN"), ZH_TW("zh-TW"),
    EN_US("en-US"),
    FR_FR("fr-FR"), DE_DE("de-DE"), ES_ES("es-ES");
    // companion object from(code) 不改（按 code 匹配，新 code 自动支持）
}
// LocaleMessages object 内追加四组 mapOf(...)（文案见 §4.2）
```

#### 4.1.4 ios `Types.swift`
```swift
public enum CaptchaLocale: String {
    case zhCN = "zh-CN", zhTW = "zh-TW"
    case enUS = "en-US"
    case frFR = "fr-FR", deDE = "de-DE", esES = "es-ES"
    // from(code) 不改
}
// LocaleMessages.messages 追加四条 [String:String]（文案见 §4.2）
```

### 4.2 文案翻译表（14 键 × 4 新语言 = 56 条）

> `zh-CN` / `en-US` 已存在，不列。下表仅 4 新语言。

| 键 | zh-TW | fr-FR | de-DE | es-ES |
|---|---|---|---|---|
| `loading` | 載入中... | Chargement... | Laden... | Cargando... |
| `slider_slide` | 請拖動滑塊完成驗證 | Veuillez faire glisser pour vérifier | Bitte schieben, um zu bestätigen | Deslice para verificar |
| `slider_hint` | → 按住滑塊，拖動完成驗證 | → Maintenez et faites glisser le curseur pour vérifier | → Halten und schieben Sie den Schieber, um zu bestätigen | → Mantenga y arrastre el control deslizante para verificar |
| `slider_success` | 驗證成功 | Vérification réussie | Bestätigung erfolgreich | Verificación exitosa |
| `slider_fail` | 驗證失敗 | Vérification échouée | Bestätigung fehlgeschlagen | Verificación fallida |
| `click_prompt` | 請依序點擊： | Veuillez cliquer dans l'ordre : | Bitte in der Reihenfolge klicken: | Haga clic en orden: |
| `click_success` | 驗證成功 | Vérification réussie | Bestätigung erfolgreich | Verificación exitosa |
| `click_fail` | 驗證失敗 | Vérification échouée | Bestätigung fehlgeschlagen | Verificación fallida |
| `popup_title` | 請完成安全驗證 | Veuillez compléter la vérification de sécurité | Bitte Sicherheitsbestätigung abschließen | Complete la verificación de seguridad |
| `popup_close` | 關閉 | Fermer | Schließen | Cerrar |
| `error_network` | 網路錯誤 | Erreur réseau | Netzwerkfehler | Error de red |
| `error_expired` | 驗證碼已過期 | Captcha expiré | Captcha abgelaufen | Captcha expirado |
| `error_invalid` | 驗證失敗 | Vérification échouée | Bestätigung fehlgeschlagen | Verificación fallida |
| `error_not_found` | 驗證碼不存在 | Captcha introuvable | Captcha nicht gefunden | Captcha no encontrado |

**zh-TW 用字说明**：`网络`→`網路`（非纯字符转换，台湾惯用「網路」）；其余为简繁字符映射 + 词汇校对（`点击`→`點擊`）。已人工校对，非纯机转。

### 4.3 API 与 locale 传递

- **web wrappers（vue/vue2/react）**：`locale` prop 已存在（`BaseCaptchaOptions.locale`），类型现为 `CaptchaLocale`，扩可选值后自动支持新语言。无 prop 新增。
- **6 小程序**：`locale` 在 init options 已支持（mp-shared `getLocaleMessage` 消费）。无改动。
- **flutter / android / ios**：`CaptchaOptions.locale` 字段已存在，类型扩 `CaptchaLocale` 可选值。无字段新增。

### 4.4 文档

- 新建 `docs/i18n.md`：支持语言列表 + 各语言文案表 + `locale` 传参示例 + 翻译贡献指南（声明 AI 翻译初稿，欢迎母语 PR）。
- README 各端补「i18n」段，列支持语言。
- examples：example-vue/react 等可加 locale 切换演示（可选，非阻塞）。

## 5. 验证与发版

### 验证
- **4 源键数 grep**：每源每语言键数 = 14（或 15，若 2.2.0 含 refresh）。
```bash
for f in packages/mp-shared/src/i18n.ts packages/flutter/lib/src/core/i18n.dart packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt packages/ios/Sources/Core/Types.swift; do echo "== $f =="; grep -cE "'loading'|\"loading\"" "$f"; done
```
- **语言数 grep**：每源 6 语言 code 出现。
```bash
for f in packages/mp-shared/src/i18n.ts packages/flutter/lib/src/core/i18n.dart packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt packages/ios/Sources/Core/Types.swift; do echo "== $f =="; grep -oE "zh-CN|zh-TW|en-US|fr-FR|de-DE|es-ES" "$f" | sort -u; done
```
- **core 单测**：`packages/core/test/i18n.test.ts` 扩 6 语言 × 14 键断言；`pnpm turbo test` 全绿。
- **构建**：`fnm use 18 && pnpm turbo build`；`flutter analyze`；`./gradlew assembleDebug`；`swift build`。
- **回退测**：传未支持 locale（如 `'ja-JP'`）→ 回退 zh-CN，不报错。
- **UI 布局**：fr/de 文案较长，验证 `popup_title`/`slider_hint` 不撑破容器（手动或 example 目视）。

### 发版
- changeset：14 包 + root 一律 2.3.0 → 2.4.0（minor）。
- CHANGELOG.md 顶部追加 `[2.4.0]` 条目（i18n 新增 4 语言）。
- `docs/i18n.md` 新建；README 补 i18n 段。

## 6. 风险与判断点

- **翻译准确性**：fr/de/es 为 AI 翻译初稿，未经母语审校。**判断点**：声明「community translation」+ 欢迎 PR；或付费母语审校。推荐前者（成本/收益合理），文档显式标注。
- **zh-TW 词汇差异**：简繁非纯字符转换（`网络`→`網路`），已人工校对关键词条。**判断点**：可请台湾母语复核；当前校对覆盖核心词，可接受。
- **文案长度撑破 UI**：fr/de 比 zh/en 长 ~30%。`popup_title`（32rpx 字号）、`slider_hint` 可能超宽。**判断点**：CSS 已 `white-space: nowrap` + `text-overflow: ellipsis`？需验证；若撑破，调字号或允许换行。2.1.0 样式令牌表需复核文案容器宽度。
- **后端 message 不 i18n**：`verify` 响应 `message` 是后端字符串，不经客户端 i18n。非中文用户看到后端中文 message。**判断点**：2.4.0 不改后端（保范围）；后端 i18n 留后续（3.x+）。文档说明此限制。
- **无运行时语言嗅探**：宿主须显式传 `locale`。**判断点**：不自动读 `navigator.language`/系统语言（保 API 稳定 + 避免误判）；文档给 `locale = navigator.language` 示例供宿主自行接。
- **小程序 locale 传递**：6 小程序 init options 的 locale 字段是否已全端支持？**判断点**：2.1.0 契约对齐已确认；2.4.0 grep 校验各小程序 init 接受 locale 并透传 mp-shared。
- **2.2.0 依赖**：若 2.2.0 未落地 `refresh` 键，2.4.0 新语言条目不含该键（14 键）；若已落地则含（15 键）。plan 须 grep 确认 2.2.0 状态后决定键数。
