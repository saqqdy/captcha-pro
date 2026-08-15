# captcha-pro 2.1.0 — Native 三端对齐 设计规格

- **日期**：2026-08-10
- **状态**：已批准，待写实施计划
- **基准文档**：`internal/2026-08-08-align-native-to-taro-vue-design.md`
- **基准平台**：`packages/taro-vue`（不改动）

## 1. 背景与目标

2.0.0（2026-08-09）刚完成 14+ 平台多端首发。native 三端（android/ios/flutter）与 taro-vue 基准存在功能契约与样式差异，需在 2.1.0 对齐。

**目标**：android/ios/flutter 三端对齐 taro-vue 的功能契约与视觉样式，全端统一发版 2.1.0。

**非目标**：不改 taro-vue；不涉及 examples/*；不删/不改 invisible、统计、CaptchaPro facade、双范式、设备指纹等 native 附加特性；不引入跨平台样式共享基建。

## 2. 决策

| 维度 | 决策 |
|---|---|
| 主题 | Native 三端对齐（执行 8/8 文档） |
| 深度 | 全量：功能契约 + 样式复刻 |
| native 版本 | android/ios/flutter 全部 → 2.1.0 |
| JS 包 | 全端统一 → 2.1.0（无功能改动的 JS 包也 minor bump 仅为统一信号） |
| 交付路径 | 方案 B：按层分阶段（先全三端功能契约，再全三端样式） |

**版本号**：
- root `@captcha-pro/monorepo`：2.0.0 → 2.1.0
- 11 个 JS 包（core/mp-shared/vue/vue2/react/6 小程序）：2.0.0 → 2.1.0
- 3 个 native 包（android/ios/flutter）：当前各异 → 全部 2.1.0

## 3. 目标契约（三端统一，源自 taro-vue）

### API
- `BackendConfig { getCaptcha: url|fn, verify: url|fn, headers?, timeout?=10000ms }`
- getCaptcha：`GET ?type=&width=&height=&sliderWidth=&sliderHeight=&clickCount=` → `{success, data:{captchaId, type, bgImage, sliderImage?, sliderY?, clickTexts?, clickCharImages?, width, height, expiresAt}, message?}`
- verify：`POST {captchaId, type, target}` → `{success, message?, data?:{verifiedAt}}`
  - target：slider→`[sliderX:number]`；click→`[{x,y}]`
  - **无 timestamp**（native 现带，需移除）
- 图片源：URL / `data:image/...;base64,` / 裸 base64（native 已支持）

### Props
- Slider：`width, height, sliderWidth, sliderHeight, showRefresh=true, backend(必填), locale, onSuccess/onFail/onRefresh/onError`
- Click：`width, height, showRefresh=true, backend(必填), locale, 回调`（无 count prop；内部默认 3，按后端 clickTexts 推断）
- Popup：`type='slider', title='', maskClosable=true, showClose=true, autoClose=true, closeDelay=500ms, sliderOptions, clickOptions, backend, locale, onSuccess/onFail/onOpen/onClose`

### i18n（14 键，zh-CN + en-US）
`loading, slider_slide, slider_hint, slider_success, slider_fail, click_prompt, click_success, click_fail, popup_title, popup_close, error_network, error_expired, error_invalid, error_not_found`
- UI 实际使用 `loading`（loading 态文本）与 `slider_hint`（滑块条提示）。

### 时序
- 失败自动刷新 800ms（flutter 现 500ms）
- popup 成功自动关闭 500ms（flutter 现无）

### 尺寸
native 维持 300×170px / 滑块 42px（约等于 taro-vue 650×380rpx/80 在 375 屏视觉；rpx 无法 1:1 换算，此为判断点，可覆盖）。

## 4. 阶段 1：功能契约对齐（全三端）

### flutter（client-side → backend-only，改动最大）
- 新增 `BackendConfig` 类型 + `fetchCaptcha` / `verifyCaptcha`（http 或 dio）
- 组件改走后端取图 + 后端 verify
- 删除 `lib/src/core/generator.dart` + 客户端 precision 容差验证
- 新增 `locale` 参数 + 14 键 i18n map + `getLocaleMessage`
- Popup 补全 title/maskClosable/showClose/autoClose/closeDelay/sliderOptions/clickOptions/backend/locale；成功 500ms 自动关闭；失败 800ms 刷新
- 补 `onError` 回调
- README 修正（移除虚假的 `PopupCaptchaController` / `backend` 声明）

### android
- i18n：`LocaleMessages`（Types.kt）补 `loading` + `slider_hint` 两键；UI 使用
- 移除 `CaptchaOptions.precision` 死参数（Compose/View/facade 引用同步）
- verify 请求体移除 `timestamp`（`CaptchaGenerator.serializeCaptchaData`）
- timeout 默认 30000 → 10000ms（`BackendVerifyOptions`）
- `CaptchaDialog` 补 `title` prop（自定义标题，空时回退 locale `popup_title`）
- README/VERSION 修正（移除 "AES encryption" 不实陈述）

### ios
- i18n：`LocaleMessages`（Types.swift）补 `loading` + `slider_hint` 两键；UI 使用
- 移除 `CaptchaOptions.precision` 死参数
- verify 请求体移除 `timestamp`（`CaptchaGenerator.serializeCaptchaData`）+ Types（CaptchaData/VerifyRequest）去掉 timestamp 字段
- timeout 默认 30 → 10s（`BackendVerifyOptions`）
- README/Package.swift 修正（iOS13↔.v12 对齐；移除 "AES encryption"）

## 5. 阶段 2：样式复刻（taro-vue → native，三端双范式同步）

样式令牌表：

| 元素 | 规格 |
|---|---|
| 验证码区域底 | 线性渐变 `#667eea→#764ba2` + box-shadow 0 8 32 rgba(0,0,0,.15) + 圆角 16 |
| 状态反馈 | 居中遮罩（白@75%）+ 64 圆图标 ✓/✕ + 文本 + 淡入 0.2s + scale 0.9→1（替换底部条） |
| loading 态 | 渐变底 + 白字 `loading` 文案（替换系统 spinner） |
| 刷新按钮 | 56 白@90% 圆角 8 + `⟳` `#666` |
| 滑块条 | `#f7f9fa` 圆角 8 + `slider_hint` 居中 `#999` |
| 拇指 | 白 + `#e1e4e8` 边框 圆角 8 + `→` `#1991fa` |
| 点击标记 | 48 圆 `#1991fa` 白边 3 |
| 提示条 | `#f7f9fa` 圆角 16 + 边框 `#e8e8e8` + 字符格 56 渐变紫蓝 + 阴影 |
| popup | 自定义卡片（非系统 Dialog）圆角 24 + 阴影 + `×` 文本关闭 + 标题 32 |

- 强调蓝统一 `#1991fa`（android 现为 `#1890FA`，改之）
- 成功：图标底 `rgba(82,196,26,.85)` + 文本 `#389e0d`；失败：图标底 `rgba(255,77,79,.85)` + 文本 `#cf1322`
- 应用范围：android(Compose+View) / ios(UIKit+SwiftUI) / flutter 双范式同步

## 6. 验证与发版

### 验证
- JS 侧：`turbo build` + `turbo test`（core vitest）须全绿——本次无 JS 功能改动，应零回归
- native 侧（无单测基建）：每端 build 通过 + 与 taro-vue 示例 side-by-side 目视比对
  - android：gradle 构建
  - ios：`swift build` / xcodebuild
  - flutter：`flutter analyze` + `flutter build`
- 契约校验：grep 确认 verify 请求体无 `timestamp`、timeout=10s、14 i18n 键齐全、precision 死参数清零

### 发版
- changeset：14 包 + root 一律 2.0.0 → 2.1.0（minor）
- CHANGELOG.md 追加 `[2.1.0]` 条目
- native README / iOS Package.swift / android VERSION 文件 → 2.1.0
- `internal/2026-08-08-*.md` 对齐完成后归档（移入 docs 或删除）

## 7. 风险与判断点

- **rpx→native 换算**：rpx 无法 1:1 换算 dp/pt，尺寸/间距按视觉判断，可覆盖。以 taro-vue 在 375 屏视觉为准。
- **flutter 改动最大**：client-side → backend-only 是破坏性变更，需删 generator + 改组件取图/验证流程，风险集中在阶段 1 的 flutter 部分。
- **样式主观性**：样式复刻无单测兜底，依赖目视比对，三端双范式一致性需逐项核对令牌表。
- **native 无单测**：回归依赖 build + 目视，建议每端阶段 1 完成即比对、阶段 2 完成即再比对。
