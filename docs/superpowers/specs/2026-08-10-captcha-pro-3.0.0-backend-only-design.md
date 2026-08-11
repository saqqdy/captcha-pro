# captcha-pro 3.0.0 — 全平台仅后端模式 设计规格

- **日期**：2026-08-10
- **状态**：已批准，待写实施计划
- **前置**：2.1.0（native 三端对齐）落地后开展（触碰不同包集，可并行开发，发版序 2.1.0 先）

## 1. 背景与目标

2.0.0（2026-08-09）完成 14+ 平台多端首发。core（slider.ts/click.ts）仍保留**客户端拼图生成**：`verifyMode` 默认 `'frontend'`，无后端时在浏览器 canvas 上生成背景图/拼图块/缺口位置/点击目标/中文字符图，并在客户端验证答案。6 小程序、android、ios、flutter 均已仅后端，唯 core + 3 web wrapper 仍可客户端模式。

**目标**：3.0.0 将 core + web wrapper 全部改为仅后端模式——移除客户端生成代码、移除 invisible 客户端行为评分、backendVerify 必填、web wrapper 默认后端。全平台统一「fetch 后端 → 渲染 → 用户交互 → 后端 verify」单一路径。

**非目标**：
- 不改后端（server/{node,java,go} 已始终服务端生成，无需改）
- 不改 native（android/ios/flutter 已仅后端）
- 不改小程序（6 端已仅后端）
- 不改后端 API 契约（getCaptcha/verify 请求/响应不变，现为唯一路径）
- 不引入后端评分（留 3.1.0）
- 不移除客户端 AES/HMAC 签名（保留作传输安全层）

## 2. 决策

| 维度 | 决策 |
|---|---|
| 主题 | 全平台仅后端模式 |
| 范围 | core（slider/click/invisible/types/utils）+ vue/vue2/react wrapper + examples |
| 客户端生成代码 | 彻底删除（不保留、不 deprecated） |
| invisible 客户端评分 | 一并移除（calculateBehaviorScore）；invisible 改程序化触发 |
| 客户端签名（AES/HMAC） | 保留（utils.ts generateSignature/generateEncryptedData） |
| verifyMode | 移除（恒为 backend）；backendVerify.getCaptcha 必填 |
| 死 prop | 移除 bgImage/sliderImage/precision/count（保留 secretKey 供签名） |
| 版本 | 3.0.0 major bump 全 14 包 + root |

## 3. 现状（探索结论）

| 包 | 客户端生成？ | 现状 |
|---|---|---|
| core (slider.ts/click.ts) | ✅ 有 | verifyMode 默认 frontend；generateCaptcha/generateSliderPiece/generateClickPoints/CHINESE_WORDS(~140词)/generateCharImage/verifyFrontend + AES/HMAC 签名 |
| vue / vue2 / react | ❌ 无自身生成 | 纯委托 core；默认 verifyMode='frontend'；转发死 prop（bgImage/sliderImage/precision/secretKey/count） |
| 6 小程序 | ❌ 无 | 已仅后端，BackendConfig 必填，无 mode 切换 |
| android / ios | ❌ 无 | 已仅后端，CaptchaGenerator 只 fetch+decode，backendVerify 必填 |
| flutter | ❌ 无 | 2.1.0 已改后端 |
| 3 后端 | N/A | 始终服务端生成，无 mode 概念 |
| invisible.ts | 客户端评分 | calculateBehaviorScore（utils.ts:384）+ threshold 0.7，可选触发 slider/click challenge |

**关键发现**：3.0.0 范围比预想窄——只有 core + 3 web wrapper + examples 需实质改动，其余 11 包已仅后端。

## 4. 详细设计

### 4.1 core slider.ts

**删除**：
- `generateCaptcha()` (:387)：背景绘制 + 噪声
- `generateSliderPiece()` (:508)：形状选择 + 缺口位置计算 + 像素裁剪 + 挖洞 + 诱饵洞
- 形状绘制：`drawShape`/`drawRoundedRect`/`drawTriangle`/`drawTrapezoid`/`drawPentagon`/`drawDecoyHole`/`addNoiseTexture` (:460,596-664,669,705)
- `verifyFrontend()` (:966)：客户端 `Math.abs(currentX - targetX) <= precision`
- `init()` 的 `else { generateCaptcha() }` 分支 (:106) 与 `refresh()` (:1218)
- `drawBackground()` 中 `verifyMode !== 'backend'` guard (:497-499)
- `verifyPosition()` (:949) 中 `verifyMode === 'backend' ? verifyWithBackend : verifyFrontend` 分支 → 恒调 verifyWithBackend
- `verifyWithBackend()` 中 `if (!backendVerify?.verify) { verifyFrontend(); return }` fallback (:1083-1084) → 改为 throw

**保留**：
- `fetchBackendCaptcha()` (:113)：GET 后端取图
- `loadImages()`/`drawBackground()` 渲染后端返回的 bgImage/sliderImage
- `verifyWithBackend()` + `getSignedData()`（含签名）
- 所有 UI 交互（拖拽、refresh、回调）

**改默认**：`verifyMode` 默认 `'frontend'`→`'backend'` (:38)；`init()` 中 `backendVerify.getCaptcha` 缺失 → throw（不再 fallback generateCaptcha）

### 4.2 core click.ts

**删除**：
- `CHINESE_WORDS` 词库 (:31-82, ~140 成语)
- `generateCaptcha()` (:403)
- `generateClickPoints()` (:491)：选词/切字/生成诱饵字/非重叠位置
- `generateCharImage()` (:650)：渲染字符到 canvas → toDataURL
- `isOverlapping()` (:627)
- `addNoiseTexture` (:476)
- `verifyFrontend()` (:866)
- `init()` 的 generateCaptcha 分支 (:156) + `refresh()` (:1028)
- `loadBackgroundImage()` 的 `verifyMode !== 'backend'` guard (:389-394)
- `verifyPoints()` (:850) 的分支 → 恒 verifyWithBackend
- `verifyWithBackend()` fallback (:901) → throw

**保留**：fetchBackendCaptcha、渲染、交互、签名

**改默认**：verifyMode → 'backend' (:89)；getCaptcha 缺失 → throw

### 4.3 core invisible.ts

**删除**：
- `calculateBehaviorScore` 逻辑（utils.ts:384）+ threshold（默认 0.7）
- 自动触发判定（score < threshold → showChallenge）

**保留/改为**：
- `show()`/`hide()` API
- challenge 实例化（slider/click，继承后端模式）
- invisible 变为**程序化触发**：host 调 `show()` → 弹出后端 challenge；无客户端预判
- 3.1.0 后端评分可后续回填「是否触发」决策

### 4.4 core types.ts

- `VerifyMode` (:9)：移除（恒为 backend）
- `BackendVerifyOptions` (:32-49)：`getCaptcha`/`verify` 从 optional → required
- `BaseCaptchaOptions` (:228-277)：`backendVerify` 从 optional → required；移除 `bgImage`/`sliderImage`/`precision`/`count`；保留 `secretKey`（签名用）
- `CaptchaData` (:426-459)：保留 `signature?`/`nonce?`（签名留）

### 4.5 core utils.ts

- **删除** `calculateBehaviorScore` (:384)
- **保留** `generateSignature`/`generateEncryptedData`/`aesEncrypt` (:215-327)（按用户决定）
- 保留 `request`/`buildUrl`（后端 fetch）

### 4.6 web wrappers (vue / vue2 / react)

每端 SliderCaptcha + ClickCaptcha + PopupCaptcha：
- `verifyMode` 默认 `'frontend'`→`'backend'`（或移除 prop）
- `backendVerify` Props 从 optional → **required**
- 收窄 `verifyMode` 类型（移除 `'frontend'` 或删 prop）
- 移除死 prop：`bgImage`/`sliderImage`/`precision`/`count`（保留 `secretKey`）
- PopupCaptcha：转发 captchaOptions，文档/示例改 `verifyMode:'backend' + backendVerify`

涉及文件：
- vue：`SliderCaptcha.vue:31`/`ClickCaptcha.vue:26`/`PopupCaptcha.vue` + composables（useSliderCaptcha.ts/useClickCaptcha.ts）
- vue2：`SliderCaptcha.vue:16`/`ClickCaptcha.vue:13`/`PopupCaptcha.vue`
- react：`SliderCaptcha.tsx:50`/`ClickCaptcha.tsx:49`/`PopupCaptcha.tsx`

### 4.7 examples

- example-vue / example-react / example-vue2：从客户端模式改为指向 `server/node` 后端（提供 backendVerify URL）
- 小程序 examples：已后端，无需改

## 5. 契约（后端不变，现为唯一路径）

### getCaptcha
```
GET /api/captcha?type=slider|click&width=&height=&sliderWidth=&sliderHeight=&clickCount=
→ { success, data: { captchaId, type, bgImage, sliderImage?, sliderY?, clickTexts?, clickCharImages?, width, height, expiresAt } }
```

### verify
```
POST /api/captcha/verify { captchaId, type, target, signature?, nonce? }
→ { success, message?, data?: { verifiedAt } }
```
- target：slider → `[sliderX]`；click → `[{x,y}...]`
- signature/nonce：core 可选签名（web）；native/小程序不签——不一致按用户决定保留，后端均支持

## 6. 破坏性变更

| 变更 | 用户影响 | 迁移 |
|---|---|---|
| verifyMode 移除/锁定 backend | frontend 用户须配后端 | 配 backendVerify |
| backendVerify 必填 | 无后端不能用 | 部署 server/{node,java,go} |
| bgImage/sliderImage/precision/count prop 移除 | 传这些 prop 报错 | 删除 prop |
| invisible 无自动评分 | 依赖自动触发的用户 | 改程序化 show() |
| 客户端生成代码删除 | 无 fallback | 确保后端可用 |

## 7. 验证与版本

### 验证
- **core vitest**：删除生成相关测试；保留/新增后端 fetch + verify + 签名测试
- **web wrappers**：Props 类型变更，example 改后端能跑
- **契约 grep**：确认 core 无 `generateCaptcha`/`verifyFrontend`/`CHINESE_WORDS` 残留；`backendVerify` required
- **构建**：`fnm use 18 && pnpm turbo build && pnpm turbo test` 全绿

### 版本
3.0.0 major bump 全 14 包 + root。changeset `major`。

## 8. 风险与判断点

- **无 fallback**：后端不可用则 captcha 完全不工作。需文档强调部署后端 + 监控。
- **invisible 语义变化**：从「自动风险预判」变「程序化触发」，依赖自动触发的用户需改代码。迁移指南需明确。
- **签名不一致**：core 签名、native/小程序不签——后端均支持，但安全模型不统一。可接受（按用户决定），后续版本可统一。
- **删除代码量大**：slider.ts ~300 行、click.ts ~250 行删除，需确保渲染/交互逻辑不被误删。TDD + 构建验证兜底。
- **examples 需后端**：example 跑需先起 server/node。文档需说明。
- **2.1.0 依赖**：3.0.0 发版序在 2.1.0 后；但触碰包集不同（2.1.0=native，3.0.0=core+web），可并行开发。
