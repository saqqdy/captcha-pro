# captcha-pro 2.5.0 — RTL 支持 + ja/ko 语言补全 设计规格

- **日期**：2026-08-11
- **状态**：已批准，待写实施计划
- **前置**：2.4.0（i18n 6 语言）落地后开展。2.5.0 不改 API 契约（`locale` prop/option 已存在，仅扩可选值 + 自动判 RTL），可并行开发，发版序 2.4.0 先。是 3.0.0（major breaking：移除客户端生成）前最后一个 minor。
- **承接**：2.4.0 spec §1 推迟"不做 RTL 语言（ar/he——RTL 布局适配复杂，留后续）"+"不做日韩（ja/ko——用户未选，留后续）"。2.5.0 兑现这两项。

## 1. 背景与目标

2.4.0 扩到 6 语言（zh-CN/zh-TW/en-US/fr-FR/de-DE/es-ES），均为 LTR。出海中东/日韩市场接入时缺 ar/ja/ko。其中 ar 是 RTL 语言，需布局方向翻转——全端当前零 RTL 处理（审计确认：CSS `direction`/flutter `Directionality`/android `layoutDirection`/ios `semanticContentAttribute` 均无使用）。

**目标**：
1. 新增 3 语言：`ja-JP` + `ko-KR` + `ar-SA`（共 9 语言），4 处 i18n 源同步。
2. ar-SA 触发 RTL 布局——全端组件方向翻转：滑块从右起、箭头翻转、popup 关闭按钮位、prompt 文本右起。方向自动随 locale 判定，无新 prop。
3. `locale` prop/option 仅扩可选值，无 API 破坏。

**非目标**：
- 不改 i18n 键集（沿用 2.4.0 后 14/15 键）
- 不改 API 契约（`getCaptcha`/`verify` 不变；`locale` 字段已存在）
- 不改后端（`server/{node,java,go}` 不动；click captcha 字符图仍后端返回——见 §6 限制）
- 不做 he（希伯来文）——用户未选，留后续
- 不引入手动 `direction` prop（自动随 locale，保 API 稳定）
- 不做 ar 数字/历法本地化（仅文案 + 布局方向）

## 2. 决策

| 维度 | 决策 |
|---|---|
| 主题 | RTL 支持 + ja/ko 语言补全 |
| 新语言 | `ja-JP` + `ko-KR` + `ar-SA`（2.4.0 后 6 → 9 语言） |
| RTL 触发 | `locale === 'ar-SA'` → RTL；其余 LTR。自动判定，无 prop |
| 键集 | 不改（沿用 2.4.0 后 14/15 键） |
| 4 处源 | 同步扩 `CaptchaLocale` + 文案：mp-shared/flutter/android/ios |
| slider RTL | 跟随语言方向：ar 下滑块从右起、缺口在左、箭头指左 |
| click captcha ar | 文案 ar 化；字符图仍后端返回（2.5.0 不改后端）——见 §6 限制 |
| 翻译来源 | AI 翻译初稿 + 文档声明 community translation |
| 版本 | 2.5.0 minor bump 全 14 包 + root（无 API 破坏） |

## 3. 现状（审计已确认）

| 项 | 现状 | 证据 |
|---|---|---|
| i18n 语言数 | 2（zh-CN/en-US）源码现状；2.4.0 spec 计划 6 | `i18n.ts: CaptchaLocale = 'zh-CN' \| 'en-US'` |
| RTL 处理 | 全端零 | grep `Directionality/layoutDirection/semanticContentAttribute/direction:rtl` 无命中 |
| slider 起点 | LTR（sliderX=0 在左，拖右匹配缺口） | `useSliderCaptcha` 拖拽逻辑 |
| click 字符来源 | 后端返回 `clickTexts`/`clickCharImages` | `core/click.ts:189-195` 消费 `response.data` |
| 4 源结构 | 对齐（type/Map/enum+object/enum+struct） | 2.4.0 spec §3 审计 |

## 4. 详细设计

### 4.1 i18n 扩展（3 新语言 × 14 键 = 42 条 × 4 源）

四源扩展点同 2.4.0 §4.1（`CaptchaLocale` 类型扩 + 文案 Map 追加），此处不重复结构，仅给文案。

#### 4.1.1 文案翻译表（ja/ko/ar × 14 键）

| 键 | ja-JP | ko-KR | ar-SA |
|---|---|---|---|
| `loading` | 読み込み中... | 로딩 중... | جار التحميل... |
| `slider_slide` | スライドして認証を完了してください | 슬라이드하여 인증을 완료하세요 | اسحب للتحقق |
| `slider_hint` | → スライダーを長押ししてドラッグし認証を完了 | → 슬라이더를 길게 누르고 드래그하여 인증 완료 | → اضغط مع الاستمرار على الشريط واسحب للتحقق |
| `slider_success` | 認証成功 | 인증 성공 | تم التحقق بنجاح |
| `slider_fail` | 認証失敗 | 인증 실패 | فشل التحقق |
| `click_prompt` | 順番にクリック： | 순서대로 클릭: | انقر بالترتيب: |
| `click_success` | 認証成功 | 인증 성공 | تم التحقق بنجاح |
| `click_fail` | 認証失敗 | 인증 실패 | فشل التحقق |
| `popup_title` | セキュリティ認証を完了してください | 보안 인증을 완료해 주세요 | يرجى إكمال التحقق الأمني |
| `popup_close` | 閉じる | 닫기 | إغلاق |
| `error_network` | ネットワークエラー | 네트워크 오류 | خطأ في الشبكة |
| `error_expired` | 認証の有効期限が切れました | 인증 만료됨 | انتهت صلاحية التحقق |
| `error_invalid` | 認証失敗 | 인증 실패 | فشل التحقق |
| `error_not_found` | 認証が見つかりません | 인증을 찾을 수 없음 | التحقق غير موجود |

> 若 2.4.0 落地含 `refresh` 键（15 键），3 新语言各加：ja `更新` / ko `새로고침` / ar `تحديث`。

### 4.2 RTL 布局适配（ar-SA）

#### 4.2.1 方向判定
- 共享逻辑：`isRTL(locale)` = `locale === 'ar-SA'`（mp-shared 导出 `isRTL`，4 端各自实现等价）。
- 不增 `direction` prop；方向自动随 `locale`。

#### 4.2.2 web（vue/vue2/react + 6 小程序 + taro-vue）
- 容器加 `dir={isRTL(locale) ? 'rtl' : 'ltr'}`（HTML attribute）+ CSS `direction: rtl`。
- `captcha.scss` 追加 `[dir="rtl"] { ... }` 覆盖块：
  - `.slider-arrow { transform: scaleX(-1); }`（箭头翻转指左）
  - `.refresh-btn` / `.popup-close` 左右对调（`left`↔`right`）
  - `.prompt-text` `text-align: right`
  - `.click-marker` 边距方向反转
- 滑块起点：ar 下 `currentX` 起点 = `trackWidth - sliderWidth`（右端），拖拽方向反转（向左减 X）。或保持 LTR 交互（缺口位置由后端给，客户端仅翻转视觉）——**判断点见 §6**。

#### 4.2.3 flutter
- 根 widget 包 `Directionality(textDirection: isRTL(locale) ? TextDirection.rtl : TextDirection.ltr, ...)`。
- 箭头 `Transform.scale(scaleX: -1)`；按钮位置用 `Align` + RTL 自动翻转。

#### 4.2.4 android — Compose
- `LocalLayoutDirection.current` 自动随系统；或 `CompositionLocalProvider(LocalLayoutDirection provides rtl)`。
- 箭头 `Modifier.scale(scaleX = -1f)`。

#### 4.2.5 android — View
- `view.layoutDirection = LAYOUT_DIRECTION_RTL`（或资源限定 `ldrtl/`）。
- 箭头 drawable 用 `autoMirrored` vector（API 21+）。

#### 4.2.6 ios — SwiftUI
- `.environment(\.layoutDirection, isRTL(locale) ? .rightToLeft : .leftToRight)`。
- 箭头 `.rotation3DEffect(.degrees(180), axis: (0,1,0))` 或 `scaleEffect(x: -1)`。

#### 4.2.7 ios — UIKit
- `view.semanticContentAttribute = .forceRightToLeft`。
- 箭头 `imageView.transform = CGAffineTransform(scaleX: -1, y: 1)`。

### 4.3 API 与 locale 传递
- `locale` prop/option 扩可选值（+ja-JP/ko-KR/ar-SA）；方向自动随 locale，无新 prop/field。
- web/native 均已支持 `locale` 字段（2.4.0 确认）。

### 4.4 文档
- `docs/i18n.md`（2.4.0 建）补 3 语言 + RTL 说明 + ar 限制。
- README i18n 段列 9 语言 + RTL 支持声明。

## 5. 验证与发版

### 验证
- **4 源语言数 grep**：每源 9 语言 code。
```bash
for f in packages/mp-shared/src/i18n.ts packages/flutter/lib/src/core/i18n.dart packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/Types.kt packages/ios/Sources/Core/Types.swift; do printf "%s: " "$f"; grep -oE "zh-CN|zh-TW|en-US|fr-FR|de-DE|es-ES|ja-JP|ko-KR|ar-SA" "$f" | sort -u | wc -l; done
```
Expected: 每源 9。
- **core 单测**：`i18n.test.ts` 扩 9 语言断言 + `isRTL('ar-SA')===true` + `isRTL('ja-JP')===false`。
- **构建**：`fnm use 18 && pnpm turbo build`；`flutter analyze`；`./gradlew assembleDebug`；`swift build`。
- **RTL 目视（手动）**：example 切 `ar-SA`，验证滑块从右起、箭头指左、popup 关闭按钮位、prompt 右对齐。
- **LTR 回归**：切 `ja-JP`/`ko-KR` 仍 LTR，无视觉破坏。

### 发版
- changeset：14 包 + root 一律 2.4.0 → 2.5.0（minor）。
- CHANGELOG 顶部 `[2.5.0]` 条目（新增 ja/ko/ar + RTL 布局）。
- `docs/i18n.md` 更新。

## 6. 风险与判断点

- **slider RTL 交互方向**：ar 下滑块从右起拖左？还是保持 LTR（缺口位置后端给，仅翻转视觉）？**判断点**：推荐跟随语言方向（从右起）符合 RTL 习惯；但后端缺口坐标是 LTR 语义，需客户端 `targetX = trackWidth - backendX` 映射。复杂度中等。若判断成本过高，可 ar 下保持 LTR 交互仅翻转文案/箭头视觉——降级方案。
- **click captcha ar 字符**：`clickTexts`/`clickCharImages` 后端返回（`core/click.ts:189-195`）。ar 用户看到中文字符无法读。**判断点**：2.5.0 不改后端（保范围），ar locale 下 click captcha 文案 ar 化但字符仍后端值；文档声明"ar 推荐用 slider captcha，click captcha 字符待后端 i18n（后续）"。后端 ar 字符生成留后续。
- **翻译准确性**：ja/ko/ar AI 翻译初稿。文档声明 community translation + 欢迎 PR。
- **ar 字体**：系统默认含 ar 字形（iOS/Android/Flutter/web 均支持）；无需内嵌字体。但 ar 连字/字距需目视验证。
- **RTL 视觉对称**：箭头/按钮位置翻转易遗漏不对称组件。grep 兜底难（视觉问题），依赖目视。逐端 example 切 ar 抽测。
- **小程序 RTL**：6 小程序对 `dir="rtl"` 支持度不一（基础库版本）。判断点：weixin/uniapp/taro 各测；不支持则回退 LTR + 文档声明。
- **2.4.0 依赖**：2.5.0 发版序在 2.4.0 后；i18n 4 源须含 6 语言基线后扩 3 语言。plan Task 1 须 grep 确认 2.4.0 状态。
