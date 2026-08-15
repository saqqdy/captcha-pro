# captcha-pro 3.0.0 — 全平台仅后端模式 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 core + 3 web wrapper 改为仅后端模式——删除客户端拼图生成、删除 invisible 客户端评分、backendVerify 必填、移除死 prop、3.0.0 major bump 全 14 包 + root。

**Architecture:** core 类型先行（types.ts 锁契约）→ 删 slider/click 客户端生成代码 → 删 invisible 评分 + utils.calculateBehaviorScore（耦合）→ 清理测试 → web 三端删死 prop + 翻默认 + backendVerify 必填 → examples 指向 server/node → changeset major。

**Tech Stack:** TypeScript/rollup/vitest（core）；Vue3/Vue2/React（wrappers）；pnpm@9/turbo/changesets。

## Global Constraints

- **契约**：`getCaptcha` `GET /api/captcha?type=slider|click&width=&height=&sliderWidth=&sliderHeight=&clickCount=` → `{success, data:{captchaId, type, bgImage, sliderImage?, sliderY?, clickTexts?, clickCharImages?, width, height, timestamp?}}`；`verify` `POST /api/captcha/verify {captchaId, type, target, signature?, nonce?}` → `{success, message?, data?:{verifiedAt}}`。后端契约不变，现为唯一路径。
- **verifyMode**：移除（恒为 backend）。`VerifyMode` 类型 + 所有 `verifyMode` 字段/分支/默认全删。
- **backendVerify**：必填（`getCaptcha` + `verify` 均从 optional → required）。缺失 → throw，无 fallback。
- **签名保留**：`utils.ts` 的 `generateSignature`/`generateEncryptedData`/`aesEncrypt`/`aesDecrypt`/`decryptCaptchaData` 不动。`CaptchaData.signature?`/`nonce?` 保留。
- **死 prop 移除**：`bgImage`/`sliderImage`/`precision`（SliderCaptchaOptions）、`bgImage`/`count`（ClickCaptchaOptions）。保留 `secretKey`（SecurityOptions.secretKey）。
- **不动项**：native（android/ios/flutter 已仅后端）、6 小程序（已仅后端）、server/{node,java,go}（契约不变）、`BackendCaptchaResponse`（后端返回字段不动）。
- **node**：JS 构建用 node 18（`fnm use 18`）。canvas 装新依赖需 `PYTHON=/usr/local/bin/python3.11`。
- **行号漂移**：删除会使后续行号偏移——按**函数签名/grep**重定位，勿拘泥静态行号。JSDoc 注释行含在删除范围内。
- **基准探索**：精确源码审计见本会话 Workflow `wf_33b86954-1f0` 9 份报告（journal: `subagents/workflows/wf_33b86954-1f0/journal.jsonl`）。

---

### Task 1: core types.ts — 类型契约锁定

**Files:**
- Modify: `packages/core/src/types.ts`
- Modify: `packages/core/src/index.ts`（删 `VerifyMode` 类型再导出）

**Interfaces:**
- Produces: 删除 `VerifyMode`；`BackendVerifyOptions.getCaptcha/verify` required；`BaseCaptchaOptions.backendVerify` required + 删 `verifyMode`；`SliderCaptchaOptions` 删 `bgImage/sliderImage/precision`；`ClickCaptchaOptions` 删 `bgImage/count`；删 `RiskAssessmentOptions` + `InvisibleCaptchaOptions.riskAssessment`。

- [ ] **Step 1: 删 VerifyMode 类型（types.ts:6-9）**

删除 JSDoc + 类型：
```ts
// 删除：
/**
 * Verification mode
 */
export type VerifyMode = 'frontend' | 'backend'
```

- [ ] **Step 2: BackendVerifyOptions getCaptcha/verify required（types.ts:36,40）**

```ts
// 改（两处，去 `?`）：
getCaptcha: string | ((params?: Record<string, unknown>) => Promise<BackendCaptchaResponse>)
verify: string | ((data: CaptchaData) => Promise<BackendVerifyResponse>)
// headers? / timeout? 保持 optional
```

- [ ] **Step 3: BaseCaptchaOptions（types.ts:249-256）**

删除 `verifyMode` 字段 + JSDoc（:249-252）；`backendVerify` 去 `?`（:256）：
```ts
// 删除：
/**
 * Verification mode
 */
verifyMode?: VerifyMode
// 改：
backendVerify: BackendVerifyOptions   // 去掉 ?
```

- [ ] **Step 4: SliderCaptchaOptions 删死 prop（types.ts:283-302）**

删除 `bgImage`（:283-286）+ `sliderImage`（:287-290）+ `precision`（:299-302），含各自 JSDoc。保留 `sliderWidth`/`sliderHeight`。

- [ ] **Step 5: ClickCaptchaOptions 删死 prop（types.ts:309-316）**

删除 `bgImage`（:309-312）+ `count`（:313-316），含 JSDoc。

- [ ] **Step 6: 删 RiskAssessmentOptions + InvisibleCaptchaOptions.riskAssessment**

定位 `RiskAssessmentOptions`（~types.ts:170-192）整型删除。定位 `InvisibleCaptchaOptions` 中的 `riskAssessment?: RiskAssessmentOptions` 字段删除。

- [ ] **Step 7: index.ts 删 VerifyMode 再导出**

`packages/core/src/index.ts` 类型导出块（:11-37）删 `VerifyMode`：
```ts
// 删除该行：
VerifyMode,
```

- [ ] **Step 8: 生成类型 + 类型检查**

Run:
```bash
cd packages/core && fnm use 18 && pnpm build:types
```
Expected: 类型生成成功。**预期有下游类型错误**（slider/click/invisible/web 引用了已删字段）——这些在后续 Task 修复。本步只确认 types.ts 自身无语法错误。

- [ ] **Step 9: 提交**

```bash
git add packages/core/src/types.ts packages/core/src/index.ts
git commit -m "refactor(core/types)!: remove VerifyMode, make backendVerify required, drop dead props"
```

---

### Task 2: core slider.ts — 删客户端生成 + 改分支

**Files:**
- Modify: `packages/core/src/slider.ts`
- Test: `packages/core/test/slider.test.ts`（Task 5 统一处理测试；本 Task 只删源码）

**Interfaces:**
- Consumes: Task 1 的新类型（`backendVerify` required、无 `verifyMode`/`bgImage`/`sliderImage`/`precision`）
- Produces: slider 仅后端路径——fetchBackendCaptcha → loadImages → drawBackground/drawSlider → 拖拽 → verifyWithBackend

**删除清单（按签名 grep 定位）：**

- [ ] **Step 1: 删客户端生成/绘制/噪声/前端验证方法**

删除以下 `private` 方法（含前置 JSDoc）：
- `generateCaptcha()` — 客户端渐变背景 + 形状 + 噪声 + generateSliderPiece
- `generateSliderPiece()` — 拼图块裁剪 + 挖洞 + 诱饵洞
- `addNoiseTexture(ctx, width, height, opacity)` — 像素噪声
- `drawShape(ctx, x, y, w, h, r)` — 形状分发
- `drawRoundedRect(ctx, x, y, w, h, r)` — 圆角矩形
- `drawTriangle(ctx, x, y, w, h)` — 三角形
- `drawTrapezoid(ctx, x, y, w, h)` — 梯形
- `drawPentagon(ctx, x, y, w, h)` — 五边形
- `drawDecoyHole(ctx, w, h, r)` — 诱饵洞
- `verifyFrontend()` — 客户端 `Math.abs(currentX - targetX) <= precision`
- 删 `public verify(data)` — 客户端同步验证（公开方法，**先 grep 调用方**：`grep -rn "\.verify(" packages/*/src examples` 确认无外部调用再删）

- [ ] **Step 2: 删孤儿字段 + import**

- 删字段 `currentShape`（`private currentShape: 'square' | 'triangle' | 'trapezoid' | 'pentagon'`）——仅被已删 drawShape 路径使用
- 删 `import { ..., random, ... } from './utils'` 中的 `random`——仅被已删 generate* 使用

- [ ] **Step 3: 改 defaultOptions（:38）**

```ts
// 删除该行（verifyMode 已从类型移除）：
verifyMode: 'frontend',
// 同时删 precision: 5（已从 SliderCaptchaOptions 移除）
```

- [ ] **Step 4: 改 init() 三分支 → 单路径（:90-108）**

```ts
// 改为（删 else if bgImage + else generateCaptcha 分支）：
private async init(): Promise<void> {
    const el = getElement(this.options.el)
    if (!el) { console.error('Captcha container not found'); return }
    this.container = el
    this.render()
    this.bindEvents()
    if (!this.options.backendVerify?.getCaptcha) {
        throw new Error('backendVerify.getCaptcha is required')
    }
    await this.fetchBackendCaptcha()
}
```

- [ ] **Step 5: 改 drawBackground() 删 guard（:497-499）**

删除 `if (this.options.verifyMode !== 'backend') { this.generateSliderPiece() }` 整块。drawBackground 只负责绘制后端返回的 bgImage。

- [ ] **Step 6: 改 verifyPosition() 删分支（:949-961）**

```ts
// 删除 if/else，恒调 verifyWithBackend：
private async verifyPosition(): Promise<void> {
    // ... statistics 累加保留 ...
    await this.verifyWithBackend()
}
```

- [ ] **Step 7: 改 verifyWithBackend() 删 fallback（:1083-1085）**

```ts
// 删除：
if (!backendVerify?.verify) { this.verifyFrontend(); return }
// 改为：
if (!this.options.backendVerify?.verify) {
    throw new Error('backendVerify.verify is required')
}
```

- [ ] **Step 8: 改 refresh() 删分支（:1207-1220）**

```ts
// 删除 else if bgImage + else generateCaptcha 分支，保留：
async refresh(): Promise<void> {
    this.reset()
    if (!this.options.backendVerify?.getCaptcha) {
        throw new Error('backendVerify.getCaptcha is required')
    }
    try { await this.fetchBackendCaptcha() }
    catch (error) { console.error('Failed to refresh captcha from backend', error) }
}
```

- [ ] **Step 9: 修 getData() — targetX → currentX（:1243-1245）**

**问题**：`getData()` 现返回 `buildCaptchaData([this.targetX])`——`targetX` 是秘密答案，客户端生成时才有；后端模式下 host 不应持有秘密。
**修复**：改为返回用户输入位置（currentX），与 getSignedData 一致（无签名版）：
```ts
getData(): CaptchaData {
    return this.buildCaptchaData([this.currentX])
}
```
> 若 `targetX` 字段删除后无其他引用，一并删除该字段。

- [ ] **Step 10: 构建验证**

Run:
```bash
cd packages/core && fnm use 18 && pnpm build
```
Expected: 编译成功（无 verifyMode/bgImage/sliderImage/precision 引用）。若有残留引用——grep 定位修复。

- [ ] **Step 11: 提交**

```bash
git add packages/core/src/slider.ts
git commit -m "refactor(core/slider)!: remove client-side generation, backend-only sole path"
```

---

### Task 3: core click.ts — 删客户端生成 + 改分支

**Files:**
- Modify: `packages/core/src/click.ts`

**Interfaces:**
- Consumes: Task 1 新类型
- Produces: click 仅后端路径——fetchBackendCaptcha → loadBackgroundImage → updatePrompt → 点击 → verifyWithBackend

**删除清单：**

- [ ] **Step 1: 删 CHINESE_WORDS 词库（:30-82）**

删除整块常量（含注释）。

- [ ] **Step 2: 删客户端生成/噪声/验证方法**

删除（含前置 JSDoc）：
- `generateCaptcha()`
- `addNoiseTexture(ctx, width, height, opacity)`
- `generateClickPoints()` — 选词/切字/诱饵/位置
- `isOverlapping(x, y, size, checkDecoys)`
- `generateCharImage(char)` — base64 PNG 字符图
- `verifyFrontend()` — 客户端距离校验
- `public verify(data)` — 客户端同步验证（**先 grep 调用方**再删）

- [ ] **Step 3: 删孤儿字段**

- `targetPoints: Point[]`（:102）——仅 generateClickPoints 设置
- `decoyTexts: string[]`（:106）
- `decoyPoints: Point[]`（:107）

- [ ] **Step 4: 删 `random` import（:24）**

`random` 仅被已删 generate* 使用。

- [ ] **Step 5: 改 defaultOptions（:89）**

删 `verifyMode: 'frontend',`（类型已移除）。

- [ ] **Step 6: 改 init() 删分支（:151-157）**

```ts
// 改为单路径：
if (!this.options.backendVerify?.getCaptcha) {
    throw new Error('backendVerify.getCaptcha is required')
}
await this.fetchBackendCaptcha()
```

- [ ] **Step 7: 改 loadBackgroundImage() 删 guard（:388-394）**

删除 `if (verifyMode !== 'backend') { generateClickPoints() } else { updatePrompt() }` 分支，保留 `this.updatePrompt()` 无条件调用。

- [ ] **Step 8: 改 updatePrompt() 删前端分支（:680-689）**

删除 `if (clickCharImages.length > 0) {...} else { 生成 generateCharImage }` 的 else 分支（调用已删 generateCharImage），保留后端 `clickCharImages.map(...)` 无条件路径。

- [ ] **Step 9: 改 verifyPoints() 删分支（:856-860）**

删除 `if (verifyMode === 'backend') {...} else { verifyFrontend() }`，恒 `await this.verifyWithBackend()`。

- [ ] **Step 10: 改 verifyWithBackend() 删 fallback（:901-904）**

```ts
// 替换 verifyFrontend() fallback：
if (!this.options.backendVerify?.verify) {
    throw new Error('backendVerify.verify is required')
}
```

- [ ] **Step 11: 改 refresh() 删分支（:1002-1031）**

删除 `verifyMode` 条件 + `else` 块（:1021-1029，含 `else if bgImage` / `else generateCaptcha`）。保留 backend fetch-with-rollback 块（:1007-1020）。删 `this.options.count = undefined`（:1005）——count 已从类型移除。

- [ ] **Step 12: 构建验证**

Run:
```bash
cd packages/core && fnm use 18 && pnpm build
```
Expected: 编译成功。残留 `verifyMode`/`bgImage`/`count`/`CHINESE_WORDS` 引用 → grep 修复。

- [ ] **Step 13: 提交**

```bash
git add packages/core/src/click.ts
git commit -m "refactor(core/click)!: remove client-side generation, backend-only sole path"
```

---

### Task 4: core invisible.ts + utils.ts — 删客户端风险评分

**Files:**
- Modify: `packages/core/src/invisible.ts`
- Modify: `packages/core/src/utils.ts`

**Interfaces:**
- Consumes: Task 1 新类型（无 `RiskAssessmentOptions`）
- Produces: invisible 变程序化触发器——`show()`/`hide()` 公开，无客户端评分；utils 删 `calculateBehaviorScore` + `generateFingerprint`。

- [ ] **Step 1: invisible.ts 删评分 import + 字段**

- 删 import 中的 `calculateBehaviorScore`、`generateFingerprint`（:12，保留 `getElement`/`off`/`on`）
- 删字段：`riskScore`、`interactionStartTime`、`tracks`、`clickCount`、`isMonitoring`、`_fingerprint`

- [ ] **Step 2: 删 defaultOptions.riskAssessment（:17-23）**

```ts
// 保留：
const defaultOptions: Partial<InvisibleCaptchaOptions> = {
    trigger: 'click',
    challengeType: 'slider',
}
// 删整个 riskAssessment 块
```

- [ ] **Step 3: 删监控方法 + 事件 handler**

删除：`startMonitoring()`、`stopMonitoring()`、`onMouseMove`、`onTouchMove`、`onClick`。在 `init()` 删 `this.startMonitoring()` 调用。在 `destroy()` 删 `this.stopMonitoring()` 调用。

- [ ] **Step 4: 删 calculateRisk()（:159-183）**

整方法删除。

- [ ] **Step 5: 改 onTrigger() — 删评分分支（:138-157）**

```ts
private onTrigger = async (e: Event): Promise<void> => {
    e.preventDefault()
    this.options.onChallenge?.()
    await this.show()
}
```

- [ ] **Step 6: 改 trigger() — 无条件触发（:263-276）**

```ts
trigger(): void {
    this.options.onChallenge?.()
    this.show()
}
```

- [ ] **Step 7: 重命名 showChallenge→show、hideChallenge→hide 并改 public**

- `private async showChallenge()` → `public async show()`
- `private hideChallenge()` → `public hide()`
- **保留 show() 主体**：challenge 实例化逻辑（创建 SliderCaptcha/ClickCaptcha 实例 + mount overlay）原样保留——slider/click 已是 backend-only（Task 2/3），challenge 自动继承后端模式
- 全文更新内部调用（`onTrigger`、`trigger`、`destroy`、overlay click handler、onSuccess wrapper）

- [ ] **Step 8: 删 getRiskScore()（:278-283）**

整方法删除（`riskScore` 字段已删）。

- [ ] **Step 9: 改 getData/getSignedData/verify/reset/getStatistics/resetStatistics**

- `getData()`：删 `target: [this.riskScore]`；改为委托 `captchaInstance?.getData()` 或返回 `{type:'invisible', target: [], timestamp: Date.now()}`
- `getSignedData()`：委托 `captchaInstance?.getSignedData()` 或同 getData
- `verify(_data)`：后端权威——委托 `captchaInstance?.verify(data)` 或 `return true`（后端决定）
- `reset()`：删 riskScore/tracks/clickCount/interactionStartTime 行
- `getStatistics()`：删 `avgClickCount` 行
- `resetStatistics()`：删 `this.clickCount = 0` 行

- [ ] **Step 10: utils.ts 删 calculateBehaviorScore + generateFingerprint**

- 删 `calculateBehaviorScore`（utils.ts:384-462）
- 删 `generateFingerprint`（utils.ts:332-379）
- 两者唯一调用方是 invisible.ts（本 Task 已删）——grep 确认无其他引用：
```bash
grep -rn "calculateBehaviorScore\|generateFingerprint" packages/*/src server
```
Expected: 仅 invisible.ts（已改）命中或无命中。

- [ ] **Step 11: 构建验证**

Run:
```bash
cd packages/core && fnm use 18 && pnpm build && pnpm build:types
```
Expected: 成功。invisible 无 calculateBehaviorScore 引用。

- [ ] **Step 12: 提交**

```bash
git add packages/core/src/invisible.ts packages/core/src/utils.ts
git commit -m "refactor(core/invisible+utils)!: remove client-side risk scoring, programmatic trigger"
```

---

### Task 5: core 测试 — 删客户端测试 + 加后端测试

**Files:**
- Modify: `packages/core/test/slider.test.ts`（删 11 block）
- Modify: `packages/core/test/click.test.ts`（删 14 block）
- Modify: `packages/core/test/invisible.test.ts`（删 3 block）
- Modify: `packages/core/test/index.test.ts`（若测了 VerifyMode 导出则删）
- Create: `packages/core/test/backend.test.ts`（后端流程测试）

**Interfaces:**
- Consumes: Task 2/3/4 后的仅后端 core
- Produces: 测试套件全绿，覆盖 backend fetch/verify/signing。

- [ ] **Step 1: slider.test.ts 删 11 block**

删除测试客户端生成/前端验证的 it-block（按 it 描述 grep 定位）：
- `should render captcha elements`（:43，调 generateCaptcha）
- `should call onSuccess callback when verified correctly`（:56，调 verify → verifyFrontend）
- `should reset captcha`（:74，客户端状态）
- `should return captcha data`（:88，getData 生成输出）
- `should use default dimensions`（:114）
- `should generate background with gradient and patterns`（:125）
- `should generate only one decoy hole`（:165）
- `should verify with precision tolerance`（:295）
- `should fail verification when position is too far`（:311）
- `should update statistics after verification via drag`（:327）
- `should return false for verification with wrong position`（:346）

保留：instance 创建（:17）、factory（:33）、destroy（:104）、custom dimensions（:137）、statistics（:151）、backend mode（:200）、getSignedData（:216）、resetStatistics（:233）、locale（:245）、className（:256）、showRefresh（:267）、onRefresh（:278）、el selector（:359）。

> 注：`should support custom background image`（:184）测 bgImage prop——prop 已删，需改为测 backend fetch 渲染后端返回的 bgImage。若改写困难则删，在 backend.test.ts 补。

- [ ] **Step 2: click.test.ts 删 14 block**

删除（按 it 描述定位）：`:43, :56, :68, :84, :96, :122, :134, :157, :182, :250, :319, :336, :353, :368, :391`（generateCaptcha/verifyFrontend/CHINESE_WORDS 相关）。

保留：:17, :33, :112, :145, :203（backend mode）, :221（getSignedData）, :238, :269, :280, :291, :302, :380。

- [ ] **Step 3: invisible.test.ts 删 3 block**

删除：`should return risk score`（:40）、`should support risk assessment config`（:53）、`should call onSuccess callback`（:81）——均依赖已删 calculateBehaviorScore。

保留：:30（factory）、:70（challengeType）、:109（trigger）、:124（destroy）。若 :18 测 `getRiskScore` 方法存在性 → 删该断言。

- [ ] **Step 4: index.test.ts 删 VerifyMode 引用（若有）**

grep `VerifyMode` in index.test.ts；若有导出存在性断言则删该行。

- [ ] **Step 5: 新增 backend.test.ts — 后端 fetch + verify 流程**

`packages/core/test/backend.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest'
import { SliderCaptcha } from '../src'
import type { BackendCaptchaResponse, BackendVerifyResponse } from '../src'

// mock 后端响应
const mockCaptchaResponse: BackendCaptchaResponse = {
  data: {
    captchaId: 'test-id',
    type: 'slider',
    bgImage: 'data:image/png;base64,mockbg',
    sliderImage: 'data:image/png;base64,mockslider',
    sliderY: 10,
    width: 300, height: 170,
  }
}
const mockVerifyOk: BackendVerifyResponse = { success: true, data: { verifiedAt: Date.now() } }

// flush 异步 init() 的 microtask（构造器调 private init()，无法直接 await）
const flush = () => new Promise<void>(r => setTimeout(r, 0))

describe('backend-only flow', () => {
  it('SliderCaptcha fetches from backend getCaptcha', async () => {
    const getCaptcha = vi.fn(async () => mockCaptchaResponse)
    new SliderCaptcha({
      el: document.createElement('div'),
      backendVerify: { getCaptcha, verify: async () => mockVerifyOk },
    })
    await flush()
    expect(getCaptcha).toHaveBeenCalled()
  })

  it('throws when backendVerify.getCaptcha missing', () => {
    expect(() => new SliderCaptcha({ el: document.createElement('div') } as any))
      .toThrow()
  })

  it('getSignedData returns signature when secretKey set', async () => {
    const getCaptcha = vi.fn(async () => mockCaptchaResponse)
    const captcha = new SliderCaptcha({
      el: document.createElement('div'),
      secretKey: 'test-key',
      backendVerify: { getCaptcha, verify: async () => mockVerifyOk },
    })
    await flush()
    const data = await captcha.getSignedData()
    expect(data.signature).toBeDefined()
    expect(data.captchaId).toBe('test-id')
  })
})
```

> 注：构造器内部调 `private async init()`，测试用 `setTimeout(0)` flush microtask 等待 fetch 完成。若 SliderCaptcha 暴露了显式 ready Promise/方法（grep `packages/core/src/slider.ts` 确认），可改用之；否则 `flush()` 模式可靠。

- [ ] **Step 6: 跑全量测试**

Run:
```bash
cd packages/core && fnm use 18 && pnpm vitest run
```
Expected: 全绿。若删除的 it-block 有残留引用 → 清理。

- [ ] **Step 7: 提交**

```bash
git add packages/core/test
git commit -m "test(core): drop client-side gen/verify tests, add backend flow tests"
```

---

### Task 6: vue wrappers — 删死 prop + 翻默认 + backendVerify 必填

**Files:**
- Modify: `packages/vue/src/components/SliderCaptcha.vue`
- Modify: `packages/vue/src/components/ClickCaptcha.vue`
- Modify: `packages/vue/src/components/PopupCaptcha.vue`
- Modify: `packages/vue/src/composables/useSliderCaptcha.ts`
- Modify: `packages/vue/src/composables/useClickCaptcha.ts`
- Modify: `packages/vue/src/index.ts`（version → 3.0.0）

**Interfaces:**
- Consumes: Task 1 新 core 类型
- Produces: vue 组件 backend-only——verifyMode 删、backendVerify required、死 prop 删、死 watch 删。

- [ ] **Step 1: SliderCaptcha.vue（:9-32 props + withDefaults + 转发）**

Props interface 删：`bgImage?`（:12）、`sliderImage?`（:13）、`precision?`（:16）；`backendVerify?` → `backendVerify`（去 ?，:21）；删 `verifyMode?`（:18）。

withDefaults 删：`precision: 5`（:29）、`verifyMode: 'frontend'`（:31）。

转发对象删：`bgImage: props.bgImage`（:47）、`sliderImage: props.sliderImage`（:48）、`precision: props.precision`（:51）、`verifyMode: props.verifyMode`（:53）。

- [ ] **Step 2: ClickCaptcha.vue（:9-27）**

Props 删：`bgImage?`（:12）、`count?`（:13）；`backendVerify?` → required（:18）；删 `verifyMode?`（:15）。

withDefaults 删：`count: 3`（:24）、`verifyMode: 'frontend'`（:26）。

转发删：`bgImage`（:42）、`count`（:44）、`verifyMode`（:45）。

- [ ] **Step 3: useSliderCaptcha.ts — 删死 prop + 死 watch**

Options interface 删：`bgImage?`（:16）、`sliderImage?`（:17）、`precision?`（:20）、`verifyMode?`（:22）；`backendVerify?` → required（:25）。

coreOptions 转发删：`bgImage`（:51）、`sliderImage`（:52）、`precision`（:55）、`verifyMode`（:57）。

**删死 watch（:82-84）**：
```ts
// 删除整块（引用已删字段，会 TS 报错）：
if (options.bgImage || options.sliderImage) {
  watch(() => [options.bgImage, options.sliderImage], () => refresh())
}
```

- [ ] **Step 4: useClickCaptcha.ts — 同 Step 3**

Options 删：`bgImage?`（:16）、`count?`（:17）、`verifyMode?`（:19）；`backendVerify?` → required（:22）。

转发删：`bgImage`（:48）、`count`（:49）、`verifyMode`（:51）。

**删死 watch（:76-78）**：`if (options.bgImage) { watch(...) }`。

- [ ] **Step 5: PopupCaptcha.vue — 类型化 captchaOptions（:20, :46）**

```ts
// 改 Props interface（:20）：
import type { SliderCaptchaOptions, ClickCaptchaOptions } from '@captcha-pro/core'
captchaOptions: SliderCaptchaOptions | ClickCaptchaOptions  // 去 ?，去 Record<string,unknown>
// initPopup（:46）去掉 `as any`：
captchaOptions: props.captchaOptions,
```

- [ ] **Step 6: index.ts version（:14）**

```ts
export const version = '3.0.0'
```

- [ ] **Step 7: 构建验证**

Run:
```bash
cd packages/vue && fnm use 18 && pnpm build
```
Expected: 成功。残留 bgImage/sliderImage/precision/count/verifyMode 引用 → grep 修复。

- [ ] **Step 8: 提交**

```bash
git add packages/vue/src
git commit -m "refactor(vue)!: backend-only, drop dead props, require backendVerify"
```

---

### Task 7: vue2 wrappers — 删死 prop + 翻默认 + 修 mixin

**Files:**
- Modify: `packages/vue2/src/components/SliderCaptcha.vue`
- Modify: `packages/vue2/src/components/ClickCaptcha.vue`
- Modify: `packages/vue2/src/mixins/sliderCaptcha.js`
- Modify: `packages/vue2/src/mixins/clickCaptcha.js`
- Modify: `packages/vue2/src/index.js`（version）

**Interfaces:** 同 Task 6（Options API 形态）。

> 注：vue2 组件为 `<script>`（非 TS），无编译期类型检查，但死 prop 须删以对齐 3.0.0 契约。mixins 公开导出但组件未用——须补 backendVerify 以保 API 一致。

- [ ] **Step 1: SliderCaptcha.vue props 删死 prop + 翻默认**

props（:7-20）删：`bgImage`（:10）、`sliderImage`（:11）、`precision`（:14）；删 `verifyMode`（:16，core 已无 verifyMode）；`backendVerify`（:19）保持（vue2 Options API 无 `required`，保持 default undefined + 文档说明必填）。

options 转发对象（:40-63）删：`bgImage`（:44）、`sliderImage`（:45）、`precision`（:48）、`verifyMode`（:50）。

watch（:91-98）删 `bgImage`/`sliderImage` → refresh 的两个 watch（引用已删字段）。

- [ ] **Step 2: ClickCaptcha.vue 同理**

props（:7-17）删：`bgImage`（:10）、`count`（:11）；删 `verifyMode`（:13）。

options（:37-57）删：`bgImage`（:41）、`count`（:42）、`verifyMode`（:44）。

watch（:85-89）删 `bgImage` → refresh。

- [ ] **Step 3: mixins/sliderCaptcha.js 补 backendVerify + 删死 prop**

props（:15-27）：删 `bgImage`（:18）、`sliderImage`（:19）、`precision`（:22）、`verifyMode`（:24）；**补** `backendVerify: { type: Object, default: undefined }`。

options（:56-81）：删 `bgImage`（:60）、`sliderImage`（:61）、`precision`（:64）、`verifyMode`（:66）；**补** `backendVerify: this.backendVerify`。

watch（:105-112）删 bgImage/sliderImage。

- [ ] **Step 4: mixins/clickCaptcha.js 同理**

props：删 `bgImage`（:18）、`count`（:19）、`verifyMode`（:21）；补 `backendVerify`。

options：删 `bgImage`（:57）、`count`（:58）、`verifyMode`（:60）；补 `backendVerify: this.backendVerify`。

watch（:99-103）删 bgImage。

- [ ] **Step 5: index.js version**

`packages/vue2/src/index.js:20` `export const version = '__VERSION__'`（rollup 注入，构建版本号经 Task 10 changeset 统一）。

- [ ] **Step 6: 构建验证**

Run:
```bash
cd packages/vue2 && fnm use 18 && pnpm build
```
Expected: 成功。

- [ ] **Step 7: 提交**

```bash
git add packages/vue2/src
git commit -m "refactor(vue2)!: backend-only, drop dead props, fix mixin backendVerify gap"
```

---

### Task 8: react wrappers — 删死 prop + 翻默认 + 修 Popup bug

**Files:**
- Modify: `packages/react/src/components/SliderCaptcha.tsx`
- Modify: `packages/react/src/components/ClickCaptcha.tsx`
- Modify: `packages/react/src/components/PopupCaptcha.tsx`
- Modify: `packages/react/src/index.ts`（version）

**Interfaces:** 同 Task 6。

- [ ] **Step 1: SliderCaptcha.tsx（:12-30 props + :42-58 destructure + :67-84 options + :93 deps）**

Props interface 删：`bgImage`（:15）、`sliderImage`（:16）、`precision`（:19）、`verifyMode`（:21）；`backendVerify?` → required（:24）；`secretKey` 保留（:23）。

destructure 删：`bgImage`（:44）、`sliderImage`（:45）、`precision = 5`（:48）、`verifyMode = 'frontend'`（:50）。

core options 删：`bgImage`（:71）、`sliderImage`（:72）、`precision`（:75）、`verifyMode`（:77）。

useEffect deps（:93）删 `verifyMode`。

- [ ] **Step 2: ClickCaptcha.tsx 同理**

Props 删：`bgImage`（:15）、`count`（:16）、`verifyMode`（:18）；`backendVerify?` → required（:21）。

destructure 删：`bgImage`（:41）、`count = 3`（:42）、`verifyMode`（:44）。

options 删：`bgImage`（:65）、`count`（:66）、`verifyMode`（:68）。

deps（:84）删 verifyMode。

- [ ] **Step 3: PopupCaptcha.tsx — 修空 dep array bug + 类型化 captchaOptions**

**Bug 修复**：useEffect dep array（:75 `[]`）为空——prop 变更不触发重建。改为完整 deps：
```ts
}, [type, trigger, modal, autoClose, closeDelay, captchaOptions, onOpen, onClose, onSuccess, onFail, onReady])
```

captchaOptions（:21）类型化：
```ts
import type { SliderCaptchaOptions, ClickCaptchaOptions } from '@captcha-pro/core'
captchaOptions: SliderCaptchaOptions | ClickCaptchaOptions  // 去 ?
```
转发处（:61）去 `as any`。

- [ ] **Step 4: index.ts version**

`packages/react/src/index.ts` version → `'3.0.0'`。

- [ ] **Step 5: 构建验证**

Run:
```bash
cd packages/react && fnm use 18 && pnpm build
```
Expected: 成功。

- [ ] **Step 6: 提交**

```bash
git add packages/react/src
git commit -m "refactor(react)!: backend-only, drop dead props, fix popup dep-array bug"
```

---

### Task 9: examples — SliderDemo 指向 server/node 后端

**Files:**
- Modify: `examples/vue/src/pages/SliderDemo.vue`
- Modify: `examples/react/src/pages/SliderDemo.tsx`
- Modify: `examples/vue2/src/pages/SliderDemo.vue`

**Interfaces:** 无（纯 demo 配置）。

> 注：路径是 `examples/{vue,react,vue2}/`（非 `packages/example-*`）。BackendDemo 已正确指向 server:3001，本 Task 只改默认 SliderDemo。server/node 不自动启动——文档说明 `pnpm dev:server`。

- [ ] **Step 1: examples/vue/src/pages/SliderDemo.vue**

加 `backendUrl` ref + SliderCaptcha 加 backendVerify：
```vue
const backendUrl = ref('http://localhost:3001')
```
template（:64-73）加：
```vue
      <SliderCaptcha
        ref="captchaRef"
        :width="320"
        :height="180"
        :backend-verify="{
          getCaptcha: `${backendUrl}/api/captcha?type=slider`,
          verify: `${backendUrl}/api/captcha/verify`
        }"
        :show-refresh="config.showRefresh"
        :locale="currentLocale"
        @success="onSuccess"
      />
```
删 `:precision`、`:verify-mode`（prop 已删）。

- [ ] **Step 2: examples/react/src/pages/SliderDemo.tsx（:40-47）**

```tsx
        <SliderCaptcha
          ref={captchaRef}
          width={320}
          height={180}
          backendVerify={{
            getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
            verify: 'http://localhost:3001/api/captcha/verify',
          }}
          locale={currentLocale}
          onSuccess={() => { updateStats() }}
        />
```
删 `precision`、`verifyMode`。

- [ ] **Step 3: examples/vue2/src/pages/SliderDemo.vue（:65-73）**

```vue
      <SliderCaptcha
        ref="captchaRef"
        :width="320"
        :height="180"
        :backend-verify="{ getCaptcha: 'http://localhost:3001/api/captcha?type=slider', verify: 'http://localhost:3001/api/captcha/verify' }"
        :show-refresh="showRefresh"
        :locale="locale"
        @success="onSuccess"
      />
```
删 `:precision`。

- [ ] **Step 4: 提交**

```bash
git add examples/vue/src/pages/SliderDemo.vue examples/react/src/pages/SliderDemo.tsx examples/vue2/src/pages/SliderDemo.vue
git commit -m "docs(examples): point SliderDemo at server/node backend (3.0.0 backend-only)"
```

---

### Task 10: changeset 3.0.0 major + CHANGELOG + 版本号

**Files:**
- Create: `.changeset/captcha-pro-3.0.0.md`
- Modify: `CHANGELOG.md`
- Modify: `package.json`（root version）
- Modify: 各 JS 包 `package.json`（经 changeset version）

**Interfaces:** 无。

- [ ] **Step 1: changeset（major 全 11 JS 包）**

`.changeset/captcha-pro-3.0.0.md`:
```markdown
---
"@captcha-pro/core": major
"@captcha-pro/mp-shared": major
"@captcha-pro/vue": major
"@captcha-pro/vue2": major
"@captcha-pro/react": major
"@captcha-pro/weixin": major
"@captcha-pro/uniapp-vue": major
"@captcha-pro/uniapp-vue2": major
"@captcha-pro/taro-react": major
"@captcha-pro/taro-vue": major
"@captcha-pro/taro-vue2": major
---

Remove client-side captcha generation entirely; all platforms backend-only. Breaking: verifyMode removed, backendVerify required, dead props (bgImage/sliderImage/precision/count) removed, invisible no auto-scoring. AES/HMAC signing retained.
```

> native（android/ios/flutter）不在 changeset——它们的版本号在 2.1.0 已升；3.0.0 JS major 与 native 版本号独立（native 已仅后端，无功能改动）。若需统一 native 也升 3.0.0，在 Plan B 或单独 chore 处理。

- [ ] **Step 2: 应用 changeset**

Run:
```bash
pnpm changeset version
```
Expected: 11 个 JS 包 package.json `version` → `3.0.0`。`git diff` 复核。

- [ ] **Step 3: root package.json → 3.0.0**

`package.json` `version` → `"3.0.0"`。

- [ ] **Step 4: CHANGELOG 追加 3.0.0 条目**

`CHANGELOG.md` 顶部插入：
```markdown
## [3.0.0] - 2026-08-10

### 全平台仅后端模式

- **core**: 删除客户端拼图生成（slider ~300 行、click ~250 行）、删除 invisible 客户端行为评分（calculateBehaviorScore）、verifyMode 移除（恒为 backend）、backendVerify 必填
- **web (vue/vue2/react)**: 删死 prop（bgImage/sliderImage/precision/count）、verifyMode 默认 backend、backendVerify required、Popup captchaOptions 类型化
- **签名保留**: AES/HMAC（generateSignature/generateEncryptedData/aesEncrypt）保留作传输安全层
- **invisible**: 改程序化触发（show()），无客户端预判

### Breaking Changes

- `verifyMode` 移除——frontend 用户须配后端
- `backendVerify` 必填——无后端不能用
- `bgImage`/`sliderImage`/`precision`/`count` prop 移除——传这些 prop 报错
- `invisible` 无自动评分——改程序化 `show()`
- 客户端生成代码删除——无 fallback，须确保后端可用
```

- [ ] **Step 5: 提交**

```bash
git add .changeset CHANGELOG.md package.json packages/*/package.json
git commit -m "chore: bump all packages to 3.0.0 + changelog"
```

---

### Task 11: 全端构建 + 契约校验

**Files:** 无修改。

- [ ] **Step 1: JS 全量构建**

Run:
```bash
fnm use 18 && pnpm turbo build
```
Expected: 11 个 JS 包全绿。

- [ ] **Step 2: core 全量测试**

Run:
```bash
fnm use 18 && pnpm turbo test
```
Expected: vitest 全绿（backend.test.ts + 保留的签名/lifecycle 测试）。

- [ ] **Step 3: 契约 grep 校验**

Run:
```bash
# 无客户端生成残留
grep -rn "generateCaptcha\|verifyFrontend\|CHINESE_WORDS\|calculateBehaviorScore" packages/core/src || echo "OK: no client-gen residue"
# 无 verifyMode 残留
grep -rn "verifyMode" packages/core/src packages/vue/src packages/vue2/src packages/react/src || echo "OK: no verifyMode residue"
# 无死 prop 残留
grep -rn "bgImage\|sliderImage" packages/vue/src/components packages/vue2/src/components packages/react/src/components | grep -v "response.data\|backend" || echo "OK: no dead prop residue"
# backendVerify required（类型层）
grep -n "backendVerify?" packages/core/src/types.ts || echo "OK: backendVerify required"
```
Expected: 全 OK 或仅后端响应字段命中（bgImage/sliderImage 在 BackendCaptchaResponse.data 保留）。

- [ ] **Step 4: examples 跑通（手动，需 server）**

```bash
# 终端 1
pnpm dev:server
# 终端 2
pnpm play:vue
```
打开 SliderDemo，确认 fetch 后端 + 渲染 + 拖拽 verify 成功。

- [ ] **Step 5: 提交构建记录（若有修复）**

```bash
git add -A
git commit -m "chore: verify 3.0.0 builds green + contract grep"
```
（无改动则跳过。）

---

## 发版

全端构建绿 + 契约校验通过后：
- `git tag v3.0.0`
- `pnpm pub`（JS 包，`--no-git-checks`）
- native 不发（2.1.0 已发或随 Plan B）

## 风险

- **无 fallback**：后端不可用则 captcha 完全不工作。文档强调部署 server + 监控。
- **getData() 语义变更**：slider.ts getData() 从返回秘密 targetX 改为返回用户 currentX——若有外部调用方依赖旧行为会 break。grep 确认。
- **invisible 语义变化**：从「自动风险预判」变「程序化触发」。迁移指南需明确（CHANGELOG 已列）。
- **删除代码量大**：slider ~300 行、click ~250 行删除——TDD + 构建验证 + 契约 grep 兜底，防止误删渲染/交互逻辑。
- **vue2 mixins**：公开导出但组件未用——补 backendVerify 保 API 一致；或考虑标记 deprecated。
- **react Popup dep array bug**：本 Plan 顺带修复（空 → 完整 deps），属必要修复非超范围。
- **行号漂移**：每个 Task 内删除会使后续行号偏移——按签名/grep 重定位。
- **native 版本**：3.0.0 JS major 不动 native 版本号（native 已仅后端无功能改动）；若要全端统一 3.0.0，另起 chore。
