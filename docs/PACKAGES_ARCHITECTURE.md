# Captcha Pro 整体 Packages 架构规划

> 更新时间: 2026-07-05
> 范围: `packages/` 下所有子包的架构优化与扩展建议

---

## 一、现状全景

### 1.1 包清单

| 包名 | NPM 名 | 技术栈 | 渲染模式 | 状态 |
|------|--------|--------|----------|------|
| `packages/core` | `@captcha-pro/core` | TS（框架无关） | Canvas 2D + DOM | ✅ 完成 |
| `packages/vue2` | `@captcha-pro/vue2` | Vue 2 Options API | 挂载 core 实例 | ✅ 完成 |
| `packages/vue3` | `@captcha-pro/vue3` | Vue 3 Composition API | 挂载 core 实例 | ✅ 完成 |
| `packages/react` | `@captcha-pro/react` | React Hooks | 挂载 core 实例 | ✅ 完成 |
| `packages/mp` | `@captcha-pro/mp` | WeChat + uni-app(Vue2) + Taro(React) | **Backend-only** | ✅ 完成 |
| `packages/flutter` | — | Dart | 自绘 CustomPainter | ✅ 完成 |
| `packages/android` | — | Kotlin + Compose | Canvas + Compose | ✅ 完成 |
| `packages/ios` | — | Swift + SwiftUI | CoreGraphics + SwiftUI | ✅ 完成 |

### 1.2 架构模式差异

```
Web 端（core / vue2 / vue3 / react）:
  组件 → new SliderCaptcha({ el: container }) → core 实例操控 DOM Canvas
  组件是薄壳，核心逻辑在 @captcha-pro/core

小程序端（mp）:
  组件 → fetchCaptcha(backend) → <image src={bgImage}> → verifyCaptcha(backend)
  无 Canvas，完全依赖后端，组件自身管理状态 + 触摸交互

原生端（flutter / android / ios）:
  组件 → 内置 Generator → 前端 Canvas 渲染 → 本地验证
  自包含，不依赖 @captcha-pro/core
```

**核心矛盾**：Web 端复用 core 实例，小程序端直接绕过 core——两条路径、两种架构模式。

---

## 二、当前问题诊断

### 问题 1：小程序类型三重复制 🔴

`packages/mp/src/` 下 `weixin/types.ts`、`uniapp/types.ts`、`taro/types.ts` 的 `BackendConfig`、`BackendCaptchaParams`、`BackendCaptchaResponse`、`BackendVerifyRequest`、`BackendVerifyResponse` 及三个组件 Props 类型**完全相同**，仅文件不同。

**风险**：改一处忘改其他两处，类型契约漂移。

### 问题 2：request.ts 重复 🔴

`weixin/request.ts`、`uniapp/request.ts`、`taro/request.ts` 逻辑一模一样：
- 判断 `config.getCaptcha` 是函数还是 URL
- 调用对应平台的 HTTP API（`wx.request` / `uni.request` / `Taro.request`）
- `buildQueryString` 在 uniapp 和 taro 中复制了两次

**差异仅一行**：HTTP 调用的 API 不同。

### 问题 3：框架变体缺失 🟡

| 平台 | 已有 | 缺失 |
|------|------|------|
| uni-app | Vue 2 (Options API) | Vue 3 Composables（让用户用 `<script setup>` 自定义组件） |
| Taro | React (Hooks) | Vue 3 (Composables)，Vue 2 (Options API) |

### 问题 4：Web 端与 MP 端状态管理割裂 🟡

- Web 端（vue3/react）：composables/hooks 只是 core 实例的薄封装（`instance.value = new SliderCaptcha(...)`）
- MP 端：组件自身管理 `bgImage`、`sliderX`、`status`、`loading` 等全部状态

两套状态下，添加新功能（如"请求重试"、"倒计时"、"权限校验"）需分别实现。

### 问题 5：Web 端 composables/hooks 之间存在结构重复 🟠

`vue3/composables/useSliderCaptcha.ts` 和 `react/hooks/useSliderCaptcha.ts` 逻辑几乎一致，区别仅在响应式原语不同。这部分重复可以接受（框架差异天然存在），但应确保 API 签名对齐。

---

## 三、整体架构方案

### 3.1 分层架构图

```
┌──────────────────────────────────────────────────────┐
│                  应用层 (examples/)                   │
├──────────────────────────────────────────────────────┤
│    组件层     │  vue2   │  vue3   │  react  │  mp-*  │
│ (薄壳渲染)   │  .vue   │  .vue   │  .tsx   │  .vue  │
│              │ Options │  setup  │  Hooks  │  .tsx  │
│              │  API    │ script  │         │  .wxml │
├──────────────┼─────────┼─────────┼─────────┼────────┤
│  逻辑层      │ mixins  │ compos- │ hooks   │ hooks/ │
│ (状态+逻辑)  │         │ ables   │         │ compos-│
│              │         │         │         │ ables  │
├──────────────┴─────────┴─────────┴─────────┴────────┤
│              适配层 (平台差异)                        │
│         web-renderer    │      mp-shared             │
│         (DOM+Canvas)    │ (types+utils+captcha-logic)│
├─────────────────────────┴───────────────────────────┤
│                  核心层 @captcha-pro/core                 │
│       generator.ts / validator.ts / types.ts         │
└──────────────────────────────────────────────────────┘
```

### 3.2 推荐目录结构（完整版）

```
packages/
├── core/                            # @captcha-pro/core（不变）
│   └── src/
│       ├── index.ts
│       ├── types.ts                 # 全局类型基础
│       ├── slider.ts                # SliderCaptcha 类
│       ├── click.ts                 # ClickCaptcha 类
│       ├── popup.ts                 # PopupCaptcha 类
│       ├── utils.ts
│       ├── locales/
│       └── styles/
│
├── vue2/                            # @captcha-pro/vue2（不变）
│   └── src/
│       ├── components/              # Options API 组件
│       │   ├── SliderCaptcha.vue
│       │   ├── ClickCaptcha.vue
│       │   └── PopupCaptcha.vue
│       ├── mixins/                  # Vue 2 逻辑复用
│       │   ├── sliderCaptcha.js
│       │   └── clickCaptcha.js
│       └── index.js
│
├── vue3/                            # @captcha-pro/vue3（不变）
│   └── src/
│       ├── components/              # <script setup> 组件
│       │   ├── SliderCaptcha.vue
│       │   ├── ClickCaptcha.vue
│       │   └── PopupCaptcha.vue
│       ├── composables/             # Composition API 逻辑
│       │   ├── useSliderCaptcha.ts
│       │   ├── useClickCaptcha.ts
│       │   └── usePopupCaptcha.ts
│       └── index.ts
│
├── react/                           # @captcha-pro/react（不变）
│   └── src/
│       ├── components/              # React 组件
│       │   ├── SliderCaptcha.tsx
│       │   ├── ClickCaptcha.tsx
│       │   └── PopupCaptcha.tsx
│       ├── hooks/                   # React Hooks 逻辑
│       │   ├── useSliderCaptcha.ts
│       │   ├── useClickCaptcha.ts
│       │   └── usePopupCaptcha.ts
│       └── index.ts
│
├── mp/                              # @captcha-pro/mp（重构）
│   └── src/
│       ├── shared/                  # 🆕 共享层（消除重复）
│       │   ├── types.ts             # BackendConfig 等 — 唯一来源
│       │   ├── constants.ts         # 默认宽高/超时等常量
│       │   ├── utils.ts             # buildQueryString 等
│       │   ├── captcha-logic.ts     # 共享状态管理纯函数
│       │   └── index.ts
│       │
│       ├── weixin/                  # 微信原生
│       │   ├── request.ts           # wx.request 封装
│       │   ├── components/
│       │   │   ├── slider-captcha/
│       │   │   │   ├── slider-captcha.js
│       │   │   │   ├── slider-captcha.wxml
│       │   │   │   ├── slider-captcha.wxss
│       │   │   │   └── slider-captcha.json
│       │   │   ├── click-captcha/
│       │   │   └── popup-captcha/
│       │   └── index.ts
│       │
│       ├── uniapp/                  # uni-app
│       │   ├── composables/         # 🆕 Vue 3 Composables（进阶用）
│       │   │   ├── useSliderCaptcha.ts
│       │   │   ├── useClickCaptcha.ts
│       │   │   └── usePopupCaptcha.ts
│       │   ├── components/          # Options API（兼容 Vue 2 + Vue 3）
│       │   │   ├── slider-captcha.vue
│       │   │   ├── click-captcha.vue
│       │   │   └── popup-captcha.vue
│       │   ├── request.ts           # uni.request 封装
│       │   └── index.ts
│       │
│       ├── taro/                    # Taro
│       │   ├── request.ts           # Taro.request 封装
│       │   ├── hooks/               # React Hooks
│       │   │   ├── useSliderCaptcha.ts
│       │   │   ├── useClickCaptcha.ts
│       │   │   └── usePopupCaptcha.ts
│       │   ├── composables/         # 🆕 Vue 3 Composables
│       │   │   ├── useSliderCaptcha.ts
│       │   │   ├── useClickCaptcha.ts
│       │   │   └── usePopupCaptcha.ts
│       │   ├── styles/captcha.scss
│       │   ├── components/          # React 组件
│       │   │   ├── SliderCaptcha.tsx
│       │   │   ├── ClickCaptcha.tsx
│       │   │   └── PopupCaptcha.tsx
│       │   ├── components-vue/      # 🆕 Taro + Vue 3 组件（<script setup>）
│       │   │   ├── slider-captcha.vue
│       │   │   ├── click-captcha.vue
│       │   │   └── popup-captcha.vue
│       │   ├── components-vue2/     # 🆕 Taro + Vue 2 组件（Options API）
│       │   │   ├── slider-captcha.vue
│       │   │   ├── click-captcha.vue
│       │   │   └── popup-captcha.vue
│       │   └── index.ts
│       │
│       └── index.ts                 # 统一 re-export
│
├── flutter/                         # captcha_pro (pub.dev)（不变）
├── android/                         # com.captcha.pro (Maven)（不变）
└── ios/                             # CaptchaPro (SPM/CocoaPods)（不变）
```

---

## 四、关键设计决策

### 4.1 小程序 request 层：保留独立文件，不引入 adapter 模式

**现状**：3 个 `request.ts` 各约 60 行，逻辑重复，仅 HTTP API 调用不同。

**方案**：提取 `shared/types.ts` + `shared/utils.ts`（buildQueryString）后，**保留 3 个独立 request.ts**。

**为什么不用 adapter 模式**：

| 维度 | adapter 模式 | 独立文件 |
|------|-------------|---------|
| 代码量 | ~155 行（共享 40 + 接口 10 + 3×15 adapter） | ~185 行（3×60，含 buildQueryString 从 shared 引入） |
| 省行数 | 30 行 | — |
| 调试跳转 | 报错 → shared/request.ts → adapter.ts → wx.request（3 层） | 报错 → weixin/request.ts → wx.request（2 层） |
| 新平台接入 | 新增 adapter 文件 + 改 shared/type | 新增 request.ts |
| 认知成本 | 需理解接口约定 | 一眼看完全部逻辑 |

60 行的显式代码比 40 行抽象 + 15 行适配器更好维护。等到支付宝/字节/鸿蒙等第 4、5 个平台接入时再考虑 adapter（YAGNI）。`buildQueryString` 提取到 `shared/utils.ts` 后已消除主要重复。

### 4.2 小程序共享状态逻辑：纯函数直接修改 state

**现状**：3 套组件各自管理 `bgImage`、`sliderX`、`status`、`loading`、`captchaId` 等状态。

**方案**：提取 `shared/captcha-logic.ts`，用**普通可变函数**直接修改 state 对象：

```typescript
// packages/mp/src/shared/captcha-logic.ts
import type { BackendConfig, BackendCaptchaParams, BackendCaptchaResponse, CaptchaType, Point } from './types'
import { buildQueryString } from './utils'

/** 所有平台共用的验证码状态结构 */
export interface CaptchaState {
  bgImage: string
  sliderImage: string
  sliderX: number
  sliderY: number
  captchaId: string
  status: '' | 'success' | 'fail'
  loading: boolean
  errorMsg: string
}

export function createInitialState(): CaptchaState {
  return {
    bgImage: '', sliderImage: '', sliderX: 0, sliderY: 0,
    captchaId: '', status: '', loading: false, errorMsg: '',
  }
}

/**
 * 加载验证码 — 直接修改 state 对象
 * 在 Vue reactive() 或 React setState 包裹后即可触发视图更新
 */
export async function loadCaptcha<State extends CaptchaState>(
  state: State,
  config: BackendConfig,
  params: BackendCaptchaParams,
  requestFn: (config: BackendConfig, params: BackendCaptchaParams) => Promise<BackendCaptchaResponse>,
): Promise<void> {
  state.loading = true
  state.errorMsg = ''
  state.status = ''
  state.sliderX = 0
  try {
    const res = await requestFn(config, params)
    if (!res.success || !res.data) throw new Error(res.message || 'Failed to get captcha')
    state.captchaId = res.data.captchaId
    state.bgImage = res.data.bgImage
    state.sliderImage = res.data.sliderImage ?? ''
    state.sliderY = res.data.sliderY ?? 0
  } catch (err) {
    state.errorMsg = (err as Error).message
  } finally {
    state.loading = false
  }
}

/**
 * 验证验证码 — 直接修改 state 对象
 */
export async function verifyCaptcha<State extends CaptchaState>(
  state: State,
  config: BackendConfig,
  captchaId: string,
  type: CaptchaType,
  target: number[] | Point[],
  requestFn: (config: BackendConfig, data: { captchaId: string; type: CaptchaType; target: number[] | Point[] }) => Promise<{ success: boolean; data?: { verifiedAt: number }; message?: string }>,
  onSuccess?: (data?: { verifiedAt: number }) => void,
  onFail?: () => void,
): Promise<void> {
  try {
    const res = await requestFn(config, { captchaId, type, target })
    if (res.success) {
      state.status = 'success'
      onSuccess?.(res.data)
    } else {
      state.status = 'fail'
      onFail?.()
    }
  } catch {
    state.status = 'fail'
    onFail?.()
  }
}
```

**为什么不使用 Redux 风格 reducer**：

验证码的状态机只有 ~5 个状态、~5 种转换，用 `dispatch({ type: 'LOAD_START' })` 模式过度抽象。Vue/React 开发者更习惯直接修改属性：

```typescript
// ❌ Redux 风格 — 对 5 个状态来说太重了
dispatch({ type: 'LOAD_START' })
dispatch({ type: 'LOAD_SUCCESS', payload: res.data })

// ✅ 纯函数直接修改 — Vue reactive() 和 React setState 都能感知
state.loading = true
state.bgImage = res.data.bgImage
```

各框架的 composable/hook 只需用响应式系统包裹：

```typescript
// packages/mp/src/uniapp/composables/useSliderCaptcha.ts（Vue 3 版）
import { reactive, toRefs, onMounted } from 'vue'
import { createInitialState, loadCaptcha, verifyCaptcha } from '../../shared/captcha-logic'
import type { BackendConfig } from '../../shared/types'
import { fetchCaptcha, verifyCaptcha as verifyFn } from '../request'

export function useSliderCaptcha(config: BackendConfig, options?: { width?: number; height?: number }) {
  const state = reactive(createInitialState())

  const refresh = () =>
    loadCaptcha(state, config, { type: 'slider', ...options }, fetchCaptcha)

  const verify = () =>
    verifyCaptcha(state, config, state.captchaId, 'slider', [state.sliderX], verifyFn,
      /* onSuccess */ undefined,
      /* onFail */ () => setTimeout(refresh, 800),
    )

  onMounted(refresh)
  return { ...toRefs(state), refresh, verify }
}
```

```typescript
// packages/mp/src/taro/hooks/useSliderCaptcha.ts（React 版）
import { useState, useCallback, useEffect } from 'react'
import { createInitialState, loadCaptcha, verifyCaptcha, type CaptchaState } from '../../shared/captcha-logic'
import type { BackendConfig } from '../../shared/types'
import { fetchCaptcha, verifyCaptcha as verifyFn } from '../request'

export function useSliderCaptcha(config: BackendConfig, options?: { width?: number; height?: number }) {
  const [state, setState] = useState<CaptchaState>(createInitialState)

  // 纯函数修改的是可变对象，React 需要触发 setState
  const refresh = useCallback(() => {
    const draft = { ...state }
    draft.loading = true; draft.status = ''; draft.sliderX = 0
    setState(draft)
    loadCaptcha(draft, config, { type: 'slider', ...options }, fetchCaptcha).then(() => setState({ ...draft }))
  }, [config, options])

  useEffect(() => { refresh() }, [])

  return { state, refresh, verify: () => { /* 同理 */ } }
}
```

**收益**：状态逻辑一份代码；不做响应式绑定假设（可变对象在 Vue `reactive()` 下自动追踪，React 需手动 setState）；5 个状态不值得上 reducer。

### 4.3 MP 包的条件导出策略

```jsonc
// packages/mp/package.json — exports 字段
{
  "exports": {
    // 共享类型（高级用户可直接引用）
    "./shared": {
      "types": "./dist/shared/index.d.ts",
      "import": "./dist/shared/index.js",
      "require": "./dist/shared/index.cjs"
    },

    // 微信原生
    "./weixin": {
      "types": "./dist/weixin/index.d.ts",
      "import": "./dist/weixin/index.js",
      "require": "./dist/weixin/index.cjs"
    },

    // uni-app（Options API 组件兼容 Vue 2 + Vue 3，含 composables 供 Vue 3 进阶）
    "./uniapp": {
      "types": "./dist/uniapp/index.d.ts",
      "import": "./dist/uniapp/index.js",
      "require": "./dist/uniapp/index.cjs"
    },

    // Taro + React（默认）
    "./taro": {
      "types": "./dist/taro/index.d.ts",
      "import": "./dist/taro/index.js",
      "require": "./dist/taro/index.cjs"
    },
    // Taro + Vue 3
    "./taro-vue": {
      "types": "./dist/taro/index-vue.d.ts",
      "import": "./dist/taro/index-vue.js",
      "require": "./dist/taro/index-vue.cjs"
    },
    // Taro + Vue 2
    "./taro-vue2": {
      "types": "./dist/taro/index-vue2.d.ts",
      "import": "./dist/taro/index-vue2.js",
      "require": "./dist/taro/index-vue2.cjs"
    }
  }
}
```

用户使用：

```ts
// 微信原生
import { SliderCaptcha } from '@captcha-pro/mp/weixin'

// uni-app（Options API 组件兼容 Vue 2 + Vue 3）
import { SliderCaptcha } from '@captcha-pro/mp/uniapp'

// uni-app + Vue 3（使用 composables 自定义组件）
import { useSliderCaptcha } from '@captcha-pro/mp/uniapp'

// Taro + React
import { SliderCaptcha } from '@captcha-pro/mp/taro'

// Taro + Vue 3
import { SliderCaptcha } from '@captcha-pro/mp/taro-vue'

// Taro + Vue 2
import { SliderCaptcha } from '@captcha-pro/mp/taro-vue2'

// 直接引用共享类型
import type { BackendConfig } from '@captcha-pro/mp/shared'
```


**Taro 为何需要三个子路径**：Taro 支持 React 和 Vue 两种框架，Vue 还有 2/3 之分，组件写法完全不同，无法通过一个入口兼容。

### 4.4 为什么不拆成多个包？

| 维度 | 单包 `@captcha-pro/mp` | 多包 |
|------|-------------------|------|
| 安装 | `npm i @captcha-pro/mp` | 用户需判断装 `@captcha-pro/mp-weixin` 还是 `@captcha-pro/mp-uniapp` |
| 类型共享 | 内部直接引用，零成本 | 需 `@captcha-pro/mp-shared` 包，多一层间接 |
| 发版 | 1 次发版 | 5-6 次发版 + 版本号同步 |
| Tree-shaking | 条件导出支持，未引用的子路径不打包 | 天然支持 |
| 代码复用 | 跨平台共享通过 `shared/` 内部解决 | 跨包共享需发包 |
| 复杂度边界 | 当前 28 个源文件，可控 | 拆包后管理成本更高 |

**结论**：当前阶段单包更优。当某个子平台（如 Taro）代码量超过 1000 行或需要独立发版节奏时，再考虑拆分。

---

## 五、Web 端与 MP 端的对齐策略

### 5.1 Composables / Hooks API 签名对齐

确保 Web 端和 MP 端的同名函数签名尽量一致，降低用户跨端心智负担：

```typescript
// ===== Web 端 (vue3) =====
useSliderCaptcha(options: {
  el: () => HTMLElement | undefined    // Web 需要 DOM 容器
  width?: number
  height?: number
  backendVerify?: BackendVerifyOptions // 可选后端
  onSuccess?: () => void
  ...
})

// ===== MP 端 (uniapp Vue3) =====
useSliderCaptcha(backend: BackendConfig, options?: {
  width?: number
  height?: number                      // 无 el，无 DOM
  onSuccess?: () => void               // backend 必填
  ...
})
```

**关键差异**（架构模式决定，无法抹平）：
- Web 的 `el` 参数在 MP 不存在（MP 无 DOM）
- MP 的 `backend` 是必填（MP 只有 backend-only 模式）
- Web 的 `backendVerify` 是可选的（默认前端渲染 + 验证）

但回调和事件签名应保持一致。

### 5.2 事件/回调命名统一

| 事件 | Web 端 | MP 端 | 是否对齐 |
|------|--------|-------|----------|
| 验证成功 | `onSuccess` | `onSuccess` | ✅ |
| 验证失败 | `onFail` | `onFail` | ✅ |
| 刷新 | `onRefresh` | `onRefresh` | ✅ |
| 错误 | — | `onError` | 🔄 Web 端应补充 |
| 准备就绪 | `onReady` | — | — MP 无需（组件 mount 即加载） |

### 5.3 不强求统一的方向

| 维度 | Web | MP | 原因 |
|------|-----|-----|------|
| 渲染模式 | Canvas | `<image>` | 平台限制，无法也不应统一 |
| 验证模式 | frontline + 可选 backend | 仅 backend | 架构差异，合理 |
| 样式系统 | CSS | SCSS / WXSS | 各端自行管理 |
| 状态管理 | core 实例内聚 | 组件自管理 | 两种架构模式各有道理 |

---

## 六、跨端组件复用可行性分析

> 能否让 Taro（Vue2/Vue3/React）和 uni-app（Vue2/Vue3）直接复用 `packages/vue2`、`packages/vue3`、`packages/react` 这些 Web 端组件？

### 6.1 结论速览

**Web 组件本身不可复用，但逻辑层可部分复用。** 共享只能做到"类型 + 工具函数"这一最小公约数，再往上强求统一得不偿失。

| 层次 | 能否跨端复用 | 原因 |
|------|-------------|------|
| 组件模板（Template/JSX/WXML） | ❌ | Web 是空 div 让 Core 挂载 Canvas；MP 是 `<image>` + 触摸事件 |
| Composables / Hooks | ❌ | Web 依赖 `new Core({ el: domElement })`；MP 依赖 HTTP 请求 + 自管状态 |
| Core 类本身 | ❌ | 依赖 `document`、`Canvas.getContext('2d')`、`addEventListener`，小程序无此 API |
| 类型定义 | ✅ | 后端 API 契约两端相同 |
| 状态逻辑 | ⚠️ 仅 MP 内部 | Web 状态在 Core 内部，MP 状态在 `captcha-logic.ts`，两套逻辑 |
| 工具函数 | ✅ | `buildQueryString` 等纯函数无平台依赖 |

### 6.2 根本原因：渲染模式不同，而非框架不同

```
Web:  组件 → new Core({ el: div }) → Core 操控 Canvas → DOM 事件
MP:   组件 → fetchCaptcha(backend) → <image src> 触摸事件 → verifyCaptcha(backend)
```

一个绑定 DOM Canvas，一个连 DOM 都不存在。这不是适配层能弥合的差异——是**两套不同的架构模式**，不是"同一套逻辑的两个适配器"。

### 6.3 逐层拆解

#### 6.3.1 组件模板不可复用

```vue
<!-- @captcha-pro/vue3 的 SliderCaptcha.vue -->
<template>
  <div ref="containerRef" class="captcha-container">
    <!-- Core 自己创建 Canvas 元素并挂载到这里 -->
  </div>
</template>
```

```vue
<!-- @captcha-pro/mp uni-app 的 slider-captcha.vue -->
<template>
  <view class="captcha-container" :style="{ width: width + 'rpx', height: height + 'rpx' }">
    <image class="bg-image" :src="bgImage" mode="aspectFill" />
    <image class="slider-image" :src="sliderImage"
      :style="{ top: sliderY + 'rpx', left: sliderX + 'rpx' }"
      @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd" />
  </view>
</template>
```

Web 端只需空 div 让 Core 挂载 Canvas；MP 端需手动写 `<image>` + 触摸事件。模板结构完全不同。

#### 6.3.2 Composables / Hooks 不可复用

```typescript
// @captcha-pro/vue3/src/composables/useSliderCaptcha.ts
export function useSliderCaptcha(options: UseSliderCaptchaOptions) {
  const containerRef = ref<HTMLElement>()          // ← DOM 引用
  const instance = ref<SliderCaptchaInstance>()    // ← Core 实例

  onMounted(() => {
    instance.value = new SliderCaptchaCore({
      el: containerRef.value!,    // ← 需要 DOM
      // ...
    })
  })

  onUnmounted(() => instance.value?.destroy())
  return { containerRef, instance, refresh, getData }
}
```

```typescript
// @captcha-pro/mp/uniapp/composables/useSliderCaptcha.ts
export function useSliderCaptcha(config: BackendConfig, options?: {...}) {
  const state = reactive(createInitialState())  // ← 自管状态，无 Core 实例

  const refresh = async () => {
    const res = await fetchCaptcha(config, { type: 'slider', ...options })  // ← HTTP
    state.bgImage = res.data.bgImage
    state.sliderImage = res.data.sliderImage
    state.captchaId = res.data.captchaId
  }

  const verify = async () => {
    const res = await verifyCaptcha(config, state.captchaId, 'slider', [state.sliderX])
    // ...
  }

  onMounted(refresh)
  return { ...toRefs(state), refresh, verify }
}
```

不可复用原因：
- Web composable 核心是 `new Core({ el: domElement })` —— 依赖 DOM + Core 类
- MP composable 核心是 HTTP 请求 + 自管状态 —— 完全不依赖 Core 类
- 返回接口也不同：Web 返回 `containerRef` + `instance`，MP 返回 `bgImage` + `sliderX` + `sliderImage`

#### 6.3.3 Core 类不可在小程序中使用

```typescript
// @captcha-pro/core 的 SliderCaptcha 构造函数
class SliderCaptcha {
  constructor(options: SliderCaptchaOptions) {
    this.bgCanvas = document.createElement('canvas')  // ← DOM API
    this.ctx = this.bgCanvas.getContext('2d')!        // ← Canvas 2D API
    this.bindDOMEvents()                              // ← DOM 事件
  }

  private bindDOMEvents() {
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
  }
}
```

小程序没有 `document`、`Canvas.getContext('2d')`、`addEventListener` 这些 API。

### 6.4 业界通用做法：三层分离

跨平台组件复用的标准模式是三层分离：

```
┌─────────────────────────────────────┐
│  表现层 (不可复用)                    │
│  Template / JSX / WXML / 样式       │
│  每个平台各自写                      │
├─────────────────────────────────────┤
│  交互层 (部分可复用)                  │
│  Composable / Hook 的响应式绑定      │
│  Vue reactive / React useState 等    │
├─────────────────────────────────────┤
│  逻辑层 (完全可复用)                  │
│  纯 JS/TS，无框架/平台依赖           │
│  状态机、业务规则、数据转换           │
└─────────────────────────────────────┘
```

**本项目特殊性**：Web 端和 MP 端的**逻辑层本身就不同**。
- Web：逻辑在 `@captcha-pro/core` 内部（Canvas 渲染 + 前端验证）
- MP：逻辑是 HTTP 请求 + 状态管理（后端渲染 + 后端验证）

共享层只能抽到两边都有的最小公约数——类型定义和工具函数。

### 6.5 强行统一的代价

假设让 Web 也走 backend-only 模式以实现统一：

```typescript
// 假设的统一 composable（Web 和 MP 共用）
export function useSliderCaptcha(config: BackendConfig, options?: {...}) {
  const state = reactive(createInitialState())
  const refresh = () => loadCaptcha(state, config, { type: 'slider' }, fetchCaptcha)
  const verify = () => verifyCaptcha(state, config, ..., fetchCaptcha, onSuccess, onFail)
  onMounted(refresh)
  return { ...toRefs(state), refresh, verify }
}
```

Web 模板也改成 `<image>`：

```vue
<template>
  <div class="captcha-container">
    <img :src="bgImage" />
    <img :src="sliderImage" :style="{ top: sliderY + 'px', left: sliderX + 'px' }" />
  </div>
</template>
```

代价评估：

| 维度 | Web Canvas 渲染（现状） | 统一为 Image 渲染 |
|------|----------------------|-------------------|
| 前端验证 | ✅ 支持 | ❌ 必须后端验证 |
| 离线使用 | ✅ 支持 | ❌ 必须联网 |
| 安全性 | 低（解暴露在客户端） | ✅ 高 |
| 延迟 | 零（本地渲染） | 网络请求耗时 |
| 自定义样式 | ✅ Canvas 可高度定制 | 受限于图片 |
| Core 能力 | ✅ 完整保留 | ❌ 完全废弃 |

**拿 Core 的全部能力换来了 ~60 行 composable 复用**——典型的过度统一，得不偿失。

### 6.6 最优做法：承认两条路径，共享最小公约数

```
                    shared/types.ts    ← 类型契约
                    shared/utils.ts    ← buildQueryString 等
                    shared/constants.ts ← 默认值
                         │
          ┌──────────────┴──────────────┐
          │                             │
    Web 路径                         MP 路径
    ┌─────────┐                  ┌──────────┐
    │  Core   │                  │ captcha-  │
    │  类实例  │                  │ logic.ts  │
    └────┬────┘                  └─────┬─────┘
         │                             │
    vue3 composable              uniapp composable
    vue2 mixin                   taro hook
    react hook                   taro composable
         │                             │
    vue3/vue2/react 组件           uniapp/taro 组件
    (空 div，Core 挂载)           (<image> + touch)
```

**两条路径各有不可替代的价值**：
- Web 路径：零延迟、离线可用、Core 的全部前端渲染和验证能力
- MP 路径：安全性高、适配小程序限制、后端集中管控

共享层做到**类型 + 工具函数**这一层，不再往上强求。这比强行统一更诚实、也更可持续。

### 6.7 实践指引

| 场景 | 推荐做法 |
|------|----------|
| Web 项目 | 用 `@captcha-pro/vue2` / `@captcha-pro/vue3` / `@captcha-pro/react`，走 Core 路径 |
| 小程序项目 | 用 `@captcha-pro/mp/<platform>`，走 backend-only 路径 |
| Web + 小程序混合 | 两端各用各的包，共享 `BackendConfig` 类型确保后端契约一致 |
| 想自定义小程序组件 | 用 `@captcha-pro/mp/<platform>` 导出的 composables/hooks 自写模板 |
| 想自定义 Web 组件 | 用 `@captcha-pro/vue3` 等导出的 composables/hooks + Core 实例 |

---

## 七、各端 Composables / Hooks 复用度矩阵

| 逻辑模块 | vue2 mixins | vue3 composables | react hooks | weixin | uniapp vue3 | taro react | taro vue3 | taro vue2 |
|----------|------------|-------------------|-------------|--------|-------------|------------|-----------|-----------|
| Slider 状态 | ✅ | ✅ | ✅ | ✅ 内嵌 | ✅ 复用shared | ✅ 复用shared | ✅ 复用shared | ✅ 复用shared |
| Click 状态 | ✅ | ✅ | ✅ | ✅ 内嵌 | ✅ 复用shared | ✅ 复用shared | ✅ 复用shared | ✅ 复用shared |
| Popup 状态 | ✅ | ✅ | ✅ | ✅ 内嵌 | ✅ 复用shared | ✅ 复用shared | ✅ 复用shared | ✅ 复用shared |
| 请求逻辑 | N/A（走core） | N/A | N/A | ✅ | ✅ 复用shared | ✅ 复用shared | ✅ 复用shared | ✅ 复用shared |
| 触摸交互 | N/A（core处理） | N/A | N/A | ✅ 内嵌 | ✅ 组件内 | ✅ 组件内 | ✅ 组件内 | ✅ 组件内 |

说明：
- **Web 端**（vue2/vue3/react）交互由 `@captcha-pro/core` 内部处理，composables/hooks 是薄封装
- **MP 端**触摸交互由各组件自行实现（`@touchstart/move/end`），状态逻辑可复用 `shared/captcha-logic.ts`

---

## 八、实施路线

### Phase 0 — 基础设施（1-2 天）

- [x] 创建 `packages/mp/src/shared/` 目录
- [x] 提取 `shared/types.ts`（从任一 `types.ts` 搬过来，删除另外两个的重复定义）
- [x] 提取 `shared/constants.ts`（默认宽高、超时等）
- [x] 提取 `shared/utils.ts`（`buildQueryString`）
- [x] 三平台 `types.ts` 改为 `export type { ... } from '../shared/types'`
- [x] 确认构建通过、类型正常

### Phase 1 — 状态层抽取（1-2 天）

- [x] 创建 `shared/captcha-logic.ts`（可变纯函数版本）
- [x] uni-app 创建 `composables/` 目录，实现 Vue 3 版 composables
- [x] taro 创建 `composables/` 目录，实现 Vue 3 版 composables
- [x] taro 创建 `hooks/` 目录，实现 React 版 hooks
- [x] 调整现有 uniapp/taro 组件使用 composables/hooks
- [x] 微信原生组件仍保持内嵌逻辑（无 reactivity 系统可绑定）

### Phase 2 — 新框架变体（2-3 天）

- [x] taro 新增 `components-vue/`（Vue 3 组件）
- [x] taro 新增 `components-vue2/`（Vue 2 组件）
- [x] 更新 `package.json` exports 字段（`./taro-vue` 和 `./taro-vue2`）
- [x] 更新 `vite.config.ts` entry 配置
- [x] 添加对应 examples 或更新现有 examples

### Phase 3 — Web 端对齐（1 天）

- [x] vue3/react 补充 `onError` 回调至 composables/hooks 签名
- [x] 确认 composables/hooks 回调签名一致
- [x] 更新 TypeScript 类型导出

### Phase 4 — 可选扩展（按需）

- [ ] 支付宝小程序适配（新增 `alipay/` request.ts）
- [ ] 字节小程序适配（新增 `bytedance/` request.ts）
- [ ] 鸿蒙 HAR/SPA 适配（新增 `harmony/` 适配层）
- [ ] 当接入第 4+ 个平台时，评估是否引入 adapter 模式重构 request 层

---

## 九、风险与取舍

| 风险 | 影响 | 缓解 |
|------|------|------|
| shared 层改动影响三端 | 高 | 先加测试再重构；每步保持三端 examples 可运行 |
| Vue 2 / Vue 3 组件维护成本翻倍（Taro） | 中 | Vue 2 组件只做功能等价，不追求特性对等 |
| Vite 同时编译 Vue + React + Vue2 的兼容性 | 中 | 已有先例（当前 vite.config.ts 同时引入两个插件）；确认版本锁定；Taro Vue 2 可能需要额外的 vite 插件 |
| 微信原生组件无法复用 captcha-logic | 低 | 微信组件逻辑相对简单，内嵌可接受；如需共享可 import JS 模块 |
| 纯函数修改 state 在 React 下需手动 setState | 中 | 提供 React 专用 hook 封装，用户无需直接调用 captcha-logic |

---

## 十、包发布全景

| 包名 | 注册表 | 目标用户 |
|------|--------|----------|
| `@captcha-pro/core` | npm | 所有 Web 端底层 |
| `@captcha-pro/vue2` | npm | Vue 2 Web 项目 |
| `@captcha-pro/vue3` | npm | Vue 3 Web 项目 |
| `@captcha-pro/react` | npm | React Web 项目 |
| `@captcha-pro/mp` | npm | 所有小程序端 |
| `captcha_pro` | pub.dev | Flutter 项目 |
| `com.captcha.pro:captcha-sdk` | Maven Central | Android 原生 |
| `com.captcha.pro:captcha-compose` | Maven Central | Android Compose |
| `CaptchaPro` | CocoaPods / SPM | iOS 原生 |

所有 NPM 包统一版本号，使用 changesets 管理发版。

---

*文档更新时间: 2026-07-05*
