# 小程序端去除前端模式 — 详细修改计划

## 目标

小程序端（Taro / 微信原生 / uni-app）统一去除「前端库 + 可选后端服务」的双模式，**仅保留后端服务模式**，`backend` prop 强制必填，不传则 TypeScript 编译报错。

三平台架构对齐，共享同一套后端 API 类型契约，仅请求层使用各自平台 API（`Taro.request` / `wx.request` / `uni.request`）。

## 背景分析

### 当前架构

```
packages/mp/src/
├── taro/              ← 已完成 backend-only 改造
│   ├── components/
│   │   ├── SliderCaptcha.tsx
│   │   ├── ClickCaptcha.tsx
│   │   └── PopupCaptcha.tsx
│   ├── types.ts       ← 后端 API 类型定义
│   ├── request.ts     ← Taro.request 封装
│   └── index.ts
├── weixin/            ← 仍为前端模式（本次改造）
│   ├── components/
│   │   ├── slider-captcha.{js,wxml,wxss,json}
│   │   └── click-captcha.{js,wxml,wxss,json}
│   ├── renderer.ts    ← WxRenderer，待删除
│   └── index.ts
└── uniapp/            ← 仍为前端模式（本次改造）
    ├── components/
    │   ├── slider-captcha.vue
    │   └── click-captcha.vue
    └── index.ts
```

**问题**：weixin / uniapp 组件在前端 Canvas 上随机生成目标位置并本地验证，验证答案直接暴露在前端代码中，小程序场景下极不安全。

**Taro 已完成的改造可作模板**：`packages/mp/src/taro/types.ts` 和 `request.ts` 可直接复用结构，仅替换平台请求 API。

### 后端 API 契约

基于 `server/node/src/` 的实际实现：

| 端点 | 方法 | 说明 | 请求参数 | 响应 |
|------|------|------|----------|------|
| `/api/captcha` | GET | 生成验证码 | `type=slider\|click`, `width`, `height`, `sliderWidth`, `sliderHeight`, `clickCount` | 见下方 |
| `/api/captcha/verify` | POST | 验证 | `{ captchaId, type, target, signature?, nonce?, timestamp? }` | `{ success, message, data? }` |

**GET /api/captcha 响应 data 字段**：

```typescript
// Slider 类型
{
  captchaId: string
  type: 'slider'
  bgImage: string          // base64 PNG
  sliderImage: string      // base64 PNG
  sliderY: number          // 滑块 Y 坐标（px）
  width: number
  height: number
  expiresAt: number        // 过期时间戳
}

// Click 类型
{
  captchaId: string
  type: 'click'
  bgImage: string          // base64 PNG
  clickTexts: string[]     // 需点击的字符列表
  clickCharImages: string[] // 每个字符的 base64 小图（用于提示区）
  width: number
  height: number
  expiresAt: number
}
```

**POST /api/captcha/verify 请求体**：

```typescript
// Slider
{
  captchaId: string
  type: 'slider'
  target: [number]         // 用户滑动到的 X 坐标
}

// Click
{
  captchaId: string
  type: 'click'
  target: [{ x: number; y: number }, ...]  // 用户点击的坐标序列（按顺序）
}
```

---

## 共享类型契约（三平台一致）

三平台的 `types.ts` 使用完全相同的接口定义，仅文件位置不同：

```typescript
import type { CaptchaType, Point } from '@captcha/core'

/** 后端 API 配置（必填） */
export interface BackendConfig {
  getCaptcha: string | ((params?: BackendCaptchaParams) => Promise<BackendCaptchaResponse>)
  verify: string | ((data: BackendVerifyRequest) => Promise<BackendVerifyResponse>)
  headers?: Record<string, string>
  timeout?: number  // 默认 10000
}

export interface BackendCaptchaParams {
  type: CaptchaType
  width?: number
  height?: number
  sliderWidth?: number
  sliderHeight?: number
  clickCount?: number
}

export interface BackendCaptchaResponse {
  success: boolean
  data: {
    captchaId: string
    type: CaptchaType
    bgImage: string
    sliderImage?: string
    sliderY?: number
    clickTexts?: string[]
    clickCharImages?: string[]
    width: number
    height: number
    expiresAt: number
  }
  message?: string
}

export interface BackendVerifyRequest {
  captchaId: string
  type: CaptchaType
  target: number[] | Point[]
}

export interface BackendVerifyResponse {
  success: boolean
  message?: string
  data?: { verifiedAt: number }
}
```

各组件 Props 中 `backend: BackendConfig` 必填（无 `?`），不传则 TS 编译报错。

---

## 修改清单

### Part A: Taro 包（已完成）

> ✅ 当前 `packages/mp/src/taro/` 已是 backend-only 模式，含 `types.ts`、`request.ts`、三个组件。本部分无需改动，作为 weixin / uniapp 改造的模板。

### Part B: weixin 包改造

#### B1: 新建 `packages/mp/src/weixin/types.ts`

复制 `taro/types.ts` 全部类型定义。

#### B2: 新建 `packages/mp/src/weixin/request.ts`

用 `wx.request` 封装（对齐 `taro/request.ts`，仅把 `Taro.request` → `wx.request`）：

```typescript
wx.request({ url, method, header, timeout, data, success, fail })
```

#### B3: 改造 `components/slider-captcha.js`

| 删除项 | 原因 |
|--------|------|
| `initCanvas()` / Canvas 初始化 | 不再前端绘图 |
| `drawBackground()` | 改用 `<image>` 渲染后端图片 |
| `targetX` / `precision` | 答案不在前端 |
| 本地 `verify()` | 改为调后台 verify |

新增：`properties.backend`（必填 Object）、`attached()` 调 `fetchCaptcha()`、`onTouchEnd` 调 `verifyCaptcha()`、`loading`/`errorMsg`/`captchaId` data。

#### B4: 改造 `components/slider-captcha.wxml`

```xml
<!-- 原来：Canvas 绘制 -->
<canvas type="2d" id="bgCanvas" />
<canvas type="2d" id="sliderCanvas" />

<!-- 改为：Image 渲染后端图片 -->
<image src="{{bgImage}}" mode="aspectFill" class="bg-image"
  style="width:{{width}}px;height:{{height}}px;" />
<image src="{{sliderImage}}" class="slider-image"
  style="width:{{sliderWidth}}px;height:{{sliderHeight}}px;left:{{sliderX}}px;top:{{sliderY}}px;" />
```

#### B5: 改造 `components/click-captcha.js`

| 删除项 | 原因 |
|--------|------|
| `initCanvas()` / Canvas 初始化 | 不再前端绘图 |
| `drawBackground()` / 本地字符库 `chars` | 词库在后端 |
| `targetPoints` / `precision` / `count` | 由后端决定 |
| 本地 `verify()` | 改为调后台 verify |

新增：`properties.backend`（必填 Object）、`attached()` 调 `fetchCaptcha()` 获取 bgImage/clickTexts/clickCharImages、点击坐标满数后调 `verifyCaptcha()`。

#### B6: 改造 `components/click-captcha.wxml`

Canvas → `<image>`，提示区显示 `clickCharImages` 或 `clickTexts`。

#### B7: 新建 `components/popup-captcha.{js,wxml,wxss,json}`

对齐 taro 的 `PopupCaptcha` 组件：

- `properties`: `type`、`title`、`maskClosable`、`showClose`、`autoClose`、`closeDelay`、`sliderOptions`、`clickOptions`、`backend`（必填）、事件回调
- 内部组合 slider-captcha / click-captcha
- 提供 `show()` / `hide()` 方法

#### B8: 更新 wxss 文件

删除 `.bg-canvas` / `.slider-canvas` 等 Canvas 样式，新增 `.bg-image` / `.slider-image` / `.click-marker` / popup 相关样式。

#### B9: 删除 `renderer.ts`

不再需要 `WxRenderer`。

#### B10: 更新 `index.ts`

```typescript
// 删除：export { WxRenderer } from './renderer'
export type { BackendConfig, BackendCaptchaParams, ... } from './types'
export { fetchCaptcha, verifyCaptcha } from './request'
```

### Part C: uniapp 包改造

#### C1: 新建 `packages/mp/src/uniapp/types.ts`

同 weixin，复制 `taro/types.ts` 类型定义。

#### C2: 新建 `packages/mp/src/uniapp/request.ts`

用 `uni.request` 封装（对齐 `taro/request.ts`，替换为 uni API）。

#### C3: 改造 `components/slider-captcha.vue`

| 删除项 | 原因 |
|--------|------|
| `initCanvas()` / Canvas 初始化 | 不再前端绘图 |
| `drawBackground()` | 改用 `<image>` |
| `targetX` / `precision` prop | 答案不在前端 |
| 本地 `verify()` | 改为调后台 verify |

新增：`backend` prop（必填 Object）、`mounted()` 调 `loadCaptcha()`、模板改用 `<image>`、`onTouchEnd` 调 `verifyCaptcha()`、`loading`/`errorMsg`/`captchaId` data。

#### C4: 改造 `components/click-captcha.vue`

| 删除项 | 原因 |
|--------|------|
| `CHINESE_WORDS` 常量 | 词库在后端 |
| `initCanvas()` / `generateCaptcha()` / `drawBackground()` | 改用 `<image>` |
| `generateClickPoints()` / `isOverlapping()` | 不再前端生成位置 |
| `targetPoints` / `precision` / `count` prop | 由后端决定 |
| 本地 `verify()` | 改为调后台 verify |

新增：`backend` prop（必填 Object）、`mounted()` 调 `loadCaptcha()`、点击坐标满数后调 `verifyCaptcha()`、提示区渲染 `clickCharImages` 或 `clickTexts`。

#### C5: 新建 `components/popup-captcha.vue`

对齐 taro 的 `PopupCaptcha` 组件：

- `props`: `type`、`title`、`maskClosable`、`showClose`、`autoClose`、`closeDelay`、`sliderOptions`、`clickOptions`、`backend`（必填）、事件回调
- 内部组合 SliderCaptcha / ClickCaptcha
- 通过 `defineExpose` 提供 `show()` / `hide()` 方法

#### C6: 更新 `index.ts`

新增 types + request + popup-captcha 导出。

### Part D: 主入口与示例

#### D1: 更新 `packages/mp/src/index.ts`

添加 weixin 和 uniapp 的类型重导出（对标 taro 现有导出模式）：

```typescript
export type {
  BackendConfig as TaroBackendConfig,
  // ... 现有 taro 导出
} from './taro/types'

// 新增
export type {
  BackendConfig as WxBackendConfig,
  SliderCaptchaProps as WxSliderCaptchaProps,
  // ...
} from './weixin/types'

export type {
  BackendConfig as UniBackendConfig,
  // ...
} from './uniapp/types'
```

#### D2: 更新示例

- `examples/weixin/miniprogram/pages/slider/` & `click/`：添加 `backend` 属性到组件，page js 中定义 backend 配置
- `examples/uniapp/pages/slider/index.vue` & `click/index.vue`：传入 `backend` prop

示例对接后端 API：

```xml
<!-- weixin -->
<slider-captcha
  width="{{300}}"
  height="{{170}}"
  backend="{{backend}}"
  bind:success="onSuccess"
  bind:fail="onFail"
/>
```

```javascript
// page js
data: {
  backend: {
    getCaptcha: 'http://localhost:3001/api/captcha',
    verify: 'http://localhost:3001/api/captcha/verify',
  }
}
```

### Part E: 文档

#### E1: `packages/mp/README.md` & `README_CN.md`

weixin 和 uniapp 章节加 ⚠️ 标注"仅支持后端服务模式"，示例代码改为传入 `backend` prop。

#### E2: `docs/comparison.md`

小程序端统一标注后端模式：

| 行号 | 当前内容 | 修改后 |
|------|---------|--------|
| 7 | `前端库 + 可选后端服务` | `前端库 + 后端服务（小程序端仅后端模式）` |
| 36 | `❌ 可选` | Captcha-Pro 行改为 `✅ 必须（小程序）/ ❌ 可选（Web）` |
| 42 | `✅ 支持（前端模式）` | `⚠️ 仅 Web 支持 / ❌ 小程序不支持` |
| 264 | `✅ 内置`（前端验证） | `✅ 内置（Web）/ ❌ 不支持（小程序，仅后端验证）` |
| 388 | `快 (无网络请求)` | `快（Web 前端模式）/ 需请求后端（小程序）` |

安全性排序更新：小程序端全部归入后端验证档位。

---

## 不变的文件

| 文件/目录 | 原因 |
|-----------|------|
| `packages/core/` | core 包仍保留双模式，供 Web 端使用 |
| `packages/mp/src/core/renderer.ts` | 抽象接口保留（Web 端仍用） |
| `packages/react/`, `packages/vue2/`, `packages/vue3/` | Web 端组件不受影响 |
| `server/` | 后端代码不受影响 |

> 注：相比旧版本，`packages/mp/src/weixin/` 和 `packages/mp/src/uniapp/` 不再属于"不变"范围，本次纳入改造。

---

## 执行顺序与验证检查表

| # | 步骤 | 涉及文件 | 验证方式 |
|---|------|----------|----------|
| 1 | weixin `types.ts` | `packages/mp/src/weixin/types.ts` | `tsc --noEmit` 通过 |
| 2 | weixin `request.ts` | `packages/mp/src/weixin/request.ts` | 类型检查通过 |
| 3 | weixin slider-captcha 改造 | `components/slider-captcha.{js,wxml,wxss}` | 渲染后端图片；滑动松手触发 verify |
| 4 | weixin click-captcha 改造 | `components/click-captcha.{js,wxml,wxss}` | 渲染后端图片；点击满数触发 verify |
| 5 | weixin popup-captcha 新建 | `components/popup-captcha.{js,wxml,wxss,json}` | 透传 backend；不传 backend 报错 |
| 6 | weixin 删除 renderer + 更新 index | `renderer.ts`(删), `index.ts` | 无残留引用 |
| 7 | uniapp `types.ts` + `request.ts` | `packages/mp/src/uniapp/{types,request}.ts` | 类型检查通过 |
| 8 | uniapp slider-captcha 改造 | `components/slider-captcha.vue` | 渲染后端图片；滑动松手触发 verify |
| 9 | uniapp click-captcha 改造 | `components/click-captcha.vue` | 渲染后端图片；点击满数触发 verify |
| 10 | uniapp popup-captcha 新建 | `components/popup-captcha.vue` | 透传 backend；不传 backend 报错 |
| 11 | uniapp 更新 index | `packages/mp/src/uniapp/index.ts` | 导出正确 |
| 12 | 更新 `packages/mp/src/index.ts` | `packages/mp/src/index.ts` | 三平台类型重导出正确 |
| 13 | 更新示例 | `examples/weixin/`, `examples/uniapp/` | 传入 backend，编译通过 |
| 14 | 更新文档 | `README*.md`, `docs/comparison.md` | 内容与代码一致 |
| 15 | 全量构建 | 项目根 | `pnpm build` 全部通过 |
