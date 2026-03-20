# Captcha-Pro 升级路线图

基于与 AJ-Captcha、腾讯验证码的对比分析，提出以下升级建议。

---

## 〇、NPM 包发布策略

### 当前策略：单一包发布

**阶段一（当前）**：仅发布 `captcha-pro` 单一 NPM 包

```
captcha-pro          # 框架无关的核心库
├── dist/
│   ├── index.mjs    # ESM
│   ├── index.cjs    # CommonJS
│   └── index.global.min.js  # UMD
└── package.json
```

**优势**：
- 发布流程简单，维护成本低
- 用户安装方便，一个包即可
- 适合初期快速迭代

---

### Monorepo 架构 ✅ 已完成

**阶段二（已完成）**：已改造成 monorepo，子包使用 `@captcha/*` 作用域

```
captcha-pro/
├── packages/
│   ├── core/                    # @captcha/core - 核心逻辑 ✅
│   ├── vue3/                    # @captcha/vue3 - Vue 3 组件 ✅
│   ├── vue2/                    # @captcha/vue2 - Vue 2 组件 ✅
│   ├── react/                   # @captcha/react - React 组件 ✅
│   ├── mp/                      # @captcha/mp - 小程序版本 ✅
│   ├── svelte/                  # @captcha/svelte - Svelte 组件 (规划中)
│   └── solid/                   # @captcha/solid - Solid 组件 (规划中)
├── server/                      # 后端服务 ✅
├── examples/                    # 示例项目
├── docs/                        # 文档站点
├── pnpm-workspace.yaml          # ✅
├── turbo.json                   # ✅
└── package.json                 # ✅
```

**包依赖关系**：

```
@captcha/vue3 ─────┐
@captcha/react ────┼──▶ @captcha/core ──▶ captcha-pro (主包兼容)
@captcha/svelte ───┘
```

**迁移策略**：

1. **保持向后兼容**：`captcha-pro` 主包继续存在，内部引用 `@captcha/core`
2. **渐进式迁移**：新功能优先在框架特定包中开发
3. **统一版本号**：所有包使用相同版本号，便于管理

**发布配置示例**：

```json
// packages/core/package.json
{
  "name": "@captcha/core",
  "version": "2.0.0",
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts"
}

// packages/vue3/package.json
{
  "name": "@captcha/vue3",
  "version": "2.0.0",
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "vue": "^3.0.0",
    "@captcha/core": "2.0.0"
  }
}

// 主包保持兼容
// captcha-pro/package.json
{
  "name": "captcha-pro",
  "version": "2.0.0",
  "dependencies": {
    "@captcha/core": "2.0.0"
  }
}
```

**框架包使用示例**：

```vue
<!-- @captcha/vue3 -->
<script setup lang="ts">
import { SliderCaptcha } from '@captcha/vue3'
import '@captcha/vue3/dist/style.css'
</script>

<template>
  <SliderCaptcha
    :width="300"
    :height="200"
    @success="onSuccess"
    @fail="onFail"
  />
</template>
```

```tsx
// @captcha/react
import { SliderCaptcha } from '@captcha/react'
import '@captcha/react/dist/style.css'

function App() {
  return (
    <SliderCaptcha
      width={300}
      height={200}
      onSuccess={() => console.log('success')}
      onFail={() => console.log('fail')}
    />
  )
}
```

**Monorepo 工具选型**：

| 工具 | 用途 | 优势 |
|------|------|------|
| pnpm workspace | 包管理 | 依赖共享、磁盘高效 |
| Turborepo | 构建编排 | 缓存、并行构建 |
| Changesets | 版本管理 | 自动化版本发布 |

**触发条件**：

当出现以下情况时，考虑迁移到 monorepo：
- 需要为特定框架提供组件封装
- 用户反馈框架集成体验不佳
- 包体积需要进一步优化（tree-shaking）
- 社区贡献特定框架适配

---

## 一、v1.0 核心功能 (当前版本)

### 1.1 安全性增强 🔴 高优先级

#### 1.1.1 验证数据签名

**问题**：当前验证结果可被前端篡改

**方案**：添加可选的签名验证机制

```typescript
interface SecurityOptions {
  // 签名密钥（前端可选，后端验证用）
  secretKey?: string
  // 时间戳有效期（毫秒）
  timestampTolerance?: number  // 默认 60000
  // 是否启用签名
  enableSign?: boolean
}

interface SliderCaptchaOptions {
  // ... 现有配置
  security?: SecurityOptions
}

// 返回签名后的验证数据
interface CaptchaData {
  type: 'slider' | 'click'
  target: number[] | Point[]
  timestamp: number
  // 签名相关
  signature?: string  // HMAC-SHA256 签名
  nonce?: string      // 随机字符串防重放
}
```

**使用示例**：

```javascript
// 前端
const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    secretKey: 'your-secret-key',  // 与后端共享
    timestampTolerance: 60000
  },
  onSuccess: () => {
    const data = captcha.getData()
    // data.signature 可发送到后端验证
    submitToBackend(data)
  }
})

// 后端验证 (Node.js 示例)
function verifyCaptcha(data) {
  const expectedSign = hmacSha256(
    `${data.type}|${JSON.stringify(data.target)}|${data.timestamp}|${data.nonce}`,
    SECRET_KEY
  )
  return expectedSign === data.signature
}
```

---

#### 1.1.2 时间戳验证

**方案**：验证数据包含时间戳，防止历史数据重放

```typescript
// 内置时间戳校验
private validateTimestamp(timestamp: number): boolean {
  const now = Date.now()
  const tolerance = this.options.security?.timestampTolerance || 60000
  return Math.abs(now - timestamp) <= tolerance
}
```

---

### 1.2 新增验证码类型

#### 1.2.1 序列点选验证码

**方案**：按顺序点击数字/字母序列

```typescript
interface SequenceCaptchaOptions {
  el: string | HTMLElement
  count?: number        // 序列数量
  sequence?: string     // 自定义序列，如 "1234" 或 "ABCD"
  shuffle?: boolean     // 是否打乱顺序显示
  security?: SecurityOptions
  // ... 其他配置
}
```

---

### 1.3 智能无感验证 (Invisible Captcha)

**核心思路**：根据用户行为风险等级，决定是否显示验证码

```typescript
interface InvisibleCaptchaOptions {
  el: string | HTMLElement
  trigger: 'click' | 'submit' | 'focus'
  // 风险评估配置
  riskAssessment?: {
    // 行为检测
    behaviorCheck?: {
      minInteractionTime: number   // 最小交互时间
      trackAnalysis: boolean       // 轨迹分析
    }
    // 设备指纹（可选）
    fingerprint?: boolean
    // 风险阈值（0-1，低于此值直接通过）
    threshold?: number  // 默认 0.7
  }
  // 回调
  onChallenge: () => void   // 需要挑战时回调
  onSuccess: () => void     // 直接通过或验证成功
  onFail?: () => void
}

// 使用示例
const captcha = new InvisibleCaptcha({
  el: '#submit-btn',
  trigger: 'click',
  riskAssessment: {
    behaviorCheck: {
      minInteractionTime: 1000,
      trackAnalysis: true
    },
    threshold: 0.7
  },
  onChallenge: () => {
    // 显示验证码弹窗
    showCaptchaModal()
  },
  onSuccess: () => {
    // 直接提交表单
    form.submit()
  }
})
```

**无感验证流程**：

```
用户触发操作
    ↓
行为数据采集
    ↓
风险评估（前端）
    ↓
┌─────────────────┐
│ 风险分数 < 阈值？ │
└─────────────────┘
    ↓           ↓
   是          否
    ↓           ↓
直接通过    显示验证码
```

---

### 1.4 数据统计 API

```typescript
interface CaptchaStatistics {
  // 验证次数统计
  totalAttempts: number
  successCount: number
  failCount: number
  successRate: number

  // 时间统计
  avgVerifyTime: number    // 平均验证耗时(ms)
  avgDragDistance: number  // 平均滑动距离(px)

  // 行为数据（用于风控分析）
  avgDragTime: number      // 平均拖动时间
  avgClickCount: number    // 平均点击次数

  // 重置统计
  reset(): void
}

// 扩展 Captcha 实例
interface CaptchaInstance {
  // 获取统计数据
  getStatistics(): CaptchaStatistics
  // 获取详细验证数据（含签名）
  getData(): CaptchaData
}

// 使用
const captcha = new SliderCaptcha({ el: '#captcha' })
const stats = captcha.getStatistics()
console.log(`成功率: ${stats.successRate}%`)
console.log(`平均耗时: ${stats.avgVerifyTime}ms`)
```

---

### 1.5 后端验证模式

**方案**：支持纯后端验证，前端不进行验证判断

```typescript
interface SliderCaptchaOptions {
  el: string | HTMLElement
  // ... 其他配置

  // 验证模式
  verifyMode?: 'frontend' | 'backend'  // 默认 'frontend'

  // 后端验证配置
  backendVerify?: {
    // 获取验证码接口
    getCaptcha?: string | ((params: any) => Promise<any>)
    // 验证接口
    verify?: string | ((data: CaptchaData) => Promise<{ success: boolean }>)
    // 请求配置
    headers?: Record<string, string>
    timeout?: number
  }
}

// 使用示例 - 后端验证模式
const captcha = new SliderCaptcha({
  el: '#captcha',
  verifyMode: 'backend',
  backendVerify: {
    getCaptcha: '/api/captcha/get',
    verify: '/api/captcha/verify',
    headers: {
      'X-Request-Id': 'xxx'
    }
  },
  onSuccess: () => {
    // 后端验证通过
    submitForm()
  }
})
```

**后端 API 规范**：

```typescript
// GET /api/captcha/get
// Response:
{
  "captchaId": "xxx",      // 验证码ID
  "bgImage": "base64...",  // 背景图片
  "sliderImage": "base64...", // 滑块图片（可选）
  "timestamp": 1234567890
}

// POST /api/captcha/verify
// Request:
{
  "captchaId": "xxx",
  "target": [100, 50],     // 用户操作数据
  "timestamp": 1234567890,
  "signature": "xxx",
  "nonce": "xxx"
}
// Response:
{
  "success": true,
  "message": "验证成功"
}
```

### 1.6 后端验证 SDK

提供可选的后端验证组件，保持前后端分离的设计理念。

> **当前状态**: ✅ 已完成 - 后端示例代码已提供在 `server/node`、`server/java`、`server/go` 目录中，可直接复制使用。

**支持的 backend 实现：**

| Backend | 框架 | 文件位置 |
|---------|------|----------|
| Node.js | Express 5 | `server/node/src/crypto.ts` |
| Java | Spring Boot 3 | `server/java/src/main/java/com/captcha/pro/crypto/` |
| Go | Gin | `server/go/internal/crypto/aes.go` |

**使用示例：**

```typescript
// 从 server/node/src/crypto.ts 复制到您的项目
import { decryptCaptchaData, validateTimestamp } from './crypto'

async function verifyCaptcha(encryptedData: string, secretKey: string) {
  const data = await decryptCaptchaData(encryptedData, secretKey)

  if (!validateTimestamp(data.timestamp, 60000)) {
    return { valid: false, error: '时间戳已过期' }
  }

  return { valid: true, data }
}
```

---

## 二、v2.0 扩展功能

### 2.1 Serverless 适配

```typescript
// Vercel / Netlify Functions 示例
// api/verify.ts
// 从 server/node/src/crypto.ts 复制加密模块
import { decryptCaptchaData, validateTimestamp } from './crypto'

export default async function handler(req, res) {
  const { signature } = req.body
  const data = await decryptCaptchaData(signature, process.env.CAPTCHA_SECRET)

  if (!validateTimestamp(data.timestamp, 60000)) {
    return res.json({ valid: false, error: 'Timestamp expired' })
  }

  res.json({ valid: true, data })
}
```

---

### 2.3 智能风控增强

```typescript
interface SecurityOptions {
  // 基础限流
  rateLimit?: {
    maxAttempts: number      // 最大尝试次数
    windowMs: number         // 时间窗口
    blockDuration?: number   // 封禁时长
  }

  // 行为检测
  behaviorCheck?: {
    minDragTime: number      // 最小拖动时间（防机器人）
    maxDragTime: number      // 最大拖动时间
    trackAnalysis: boolean   // 轨迹分析
  }
}

// 使用
const captcha = new SliderCaptcha({
  el: '#captcha',
  security: {
    rateLimit: {
      maxAttempts: 5,
      windowMs: 60000,
      blockDuration: 300000
    },
    behaviorCheck: {
      minDragTime: 500,
      maxDragTime: 30000,
      trackAnalysis: true
    }
  }
})
```

---

## 三、v3.0 高级功能

### 3.1 高级验证码类型

| 类型 | 说明 | 复杂度 |
|------|------|--------|
| 图标点选 | 点击指定图标 | 中 |
| 空间推理 | 按逻辑选择答案 | 高 |
| 图形组合 | 拼图组合验证 | 高 |
| 语义理解 | 阅读理解验证 | 很高 |

---

### 3.2 AI 风控系统

```typescript
interface AIModel {
  // 行为评分
  scoreBehavior(tracks: SliderTrack[]): number

  // 设备指纹验证
  verifyFingerprint(fingerprint: string): boolean

  // 综合风险评估
  assessRisk(context: CaptchaContext): RiskLevel
}

// 使用
const captcha = new SliderCaptcha({
  el: '#captcha',
  aiModel: new CaptchaAIModel({
    enableBehaviorAnalysis: true,
    enableFingerprint: true,
    riskThreshold: 0.7
  })
})
```

---

### 3.3 插件系统

```typescript
// 插件接口
interface CaptchaPlugin {
  name: string
  install(captcha: CaptchaInstance, options?: any): void
  uninstall(): void
}

// 官方插件
import { AnalyticsPlugin } from '@captcha-pro/plugin-analytics'
import { RedisPlugin } from '@captcha-pro/plugin-redis'
import { BehaviorPlugin } from '@captcha-pro/plugin-behavior'

const captcha = new SliderCaptcha({
  el: '#captcha',
  plugins: [
    new AnalyticsPlugin({ trackPageViews: true }),
    new BehaviorPlugin({ sensitivity: 'high' })
  ]
})
```

---

## 四、版本规划与优先级

### v1.0 功能清单 (当前) - ✅ 已完成

| 功能 | 优先级 | 工作量 | 价值 | 状态 |
|------|--------|--------|------|------|
| 验证数据签名 | 🔴 高 | 2天 | 安全性大幅提升 | ✅ 已完成 |
| 时间戳验证 | 🔴 高 | 1天 | 防重放攻击 | ✅ 已完成 |
| 点选文字验证码 | 🔴 高 | 3天 | 功能丰富度提升 | ✅ 已完成 |
| 智能无感验证 | 🔴 高 | 5天 | 用户体验提升 | ✅ 已完成 |
| 数据统计 API | 🔴 高 | 2天 | 开发体验提升 | ✅ 已完成 |
| 后端验证模式 | 🔴 高 | 3天 | 安全性完善 | ✅ 已完成 |
| 后端验证 SDK | 🔴 高 | 3天 | 企业级支持 | ✅ 已完成 |
| 弹窗验证码 | 🔴 高 | 2天 | 用户体验提升 | ✅ 已完成 |
| 多语言支持 (i18n) | 🟡 中 | 2天 | 国际化支持 | ✅ 已完成 |

**预计总工作量**：约 23 天

---

### v2.0 功能清单

| 功能 | 优先级 | 工作量 | 价值 |
|------|--------|--------|------|
| Serverless 适配 | 🟡 中 | 2天 | 部署灵活性 |
| 智能风控增强 | 🟡 中 | 5天 | 防护能力提升 |

**预计总工作量**：约 7 天

---

### v3.0 功能清单

| 功能 | 优先级 | 工作量 | 价值 |
|------|--------|--------|------|
| 高级验证码类型 | 🟢 低 | 10天 | 功能丰富度 |
| AI 风控系统 | 🟢 低 | 14天+ | 竞争力提升 |
| 插件系统 | 🟢 低 | 7天 | 扩展性提升 |

**预计总工作量**：约 31 天

---

## 五、差异化定位建议

### 5.1 保持核心优势

在升级过程中，应保持以下核心优势：

1. **轻量级** - 核心包体积控制在 25KB 以内
2. **零依赖** - 不引入大型第三方库
3. **框架无关** - 继续支持所有前端框架
4. **渐进增强** - 基础功能简单，高级功能可选

---

### 5.2 目标用户画像

| 用户类型 | 需求 | v1.0 | v2.0 | v3.0 |
|---------|------|------|------|------|
| 个人开发者 | 简单易用、免费 | ✅ | ✅ | ✅ |
| 小型团队 | 快速集成、低维护 | ✅ | ✅ | ✅ |
| 中型企业 | 安全性、可控性 | ⚠️ | ✅ | ✅ |
| 大型企业 | AI风控、私有化 | ⚠️ | ⚠️ | ✅ |

---

### 5.3 与竞品差异化

| 维度 | Captcha-Pro v1.0 | AJ-Captcha | 腾讯验证码 |
|------|------------------|------------|-----------|
| 核心定位 | 轻量级前端库 + 可选后端 | 后端验证方案 | 云服务 |
| 验证模式 | 前端 + 后端可选 | 仅后端 | 云端 |
| 无感验证 | ✅ 支持 | ❌ 不支持 | ✅ 支持 |
| 数据签名 | ✅ AES-GCM | ✅ 支持 | ✅ 支持 |
| 后端 SDK | ✅ Node/Java/Go 示例 | ✅ Spring Boot | ❌ 云端托管 |
| 数据统计 | ✅ 前端统计 | ❌ | ✅ 云端看板 |
| 优势 | 灵活、轻量、免费 | 安全、功能全 | 安全、智能 |
| 差异化 | **简单即强大，灵活可选** | 企业级方案 | 云原生 |

---

## 六、v1.0 实施计划

### 第一阶段：安全性 (第1-3天)

1. ✅ 实现验证数据签名
2. ✅ 实现时间戳验证
3. ✅ 添加 nonce 防重放

### 第二阶段：新验证码类型 (第4-6天)

1. ✅ 实现文字旋转验证码
2. ✅ 完善验证码类型接口

### 第三阶段：无感验证 (第7-11天)

1. ✅ 实现行为数据采集
2. ✅ 实现风险评估算法
3. ✅ 实现无感验证流程
4. ✅ 集成现有验证码类型

### 第四阶段：数据统计 (第12-13天)

1. ✅ 实现统计数据收集
2. ✅ 实现 getStatistics API

### 第五阶段：后端验证模式 (第14-16天)

1. ✅ 实现后端验证配置
2. ✅ 实现请求封装
3. ✅ 编写使用文档

### 第六阶段：后端验证 SDK (第17-19天)

1. ✅ 实现 Node.js 后端示例 (Express 5)
2. ✅ 实现 Java 后端示例 (Spring Boot 3)
3. ✅ 实现 Go 后端示例 (Gin)
4. ✅ 编写各后端 README 文档

---

## 七、API 设计总览

### 7.1 基础配置

```typescript
interface BaseCaptchaOptions {
  el: string | HTMLElement
  width?: number
  height?: number
  showRefresh?: boolean
  className?: string

  // 验证模式
  verifyMode?: 'frontend' | 'backend'
  backendVerify?: BackendVerifyOptions

  // 安全配置
  security?: SecurityOptions

  // 回调
  onSuccess?: () => void
  onFail?: () => void
  onRefresh?: () => void
}
```

### 7.2 安全配置

```typescript
interface SecurityOptions {
  // 签名配置
  secretKey?: string
  enableSign?: boolean
  timestampTolerance?: number

  // 限流配置 (v2.0)
  rateLimit?: RateLimitOptions

  // 行为检测 (v2.0)
  behaviorCheck?: BehaviorCheckOptions
}
```

### 7.3 实例方法

```typescript
interface CaptchaInstance {
  // 刷新验证码
  refresh(): void

  // 获取验证数据
  getData(): CaptchaData

  // 获取统计数据
  getStatistics(): CaptchaStatistics

  // 重置统计
  resetStatistics(): void

  // 销毁实例
  destroy(): void
}
```

---

## 附录：安全性说明模板

建议在 README 中添加以下说明：

> ### ⚠️ 安全性声明
>
> Captcha-Pro 支持两种验证模式：
>
> **前端验证模式（默认）**：
> - 验证逻辑在前端执行，可被技术手段绕过
> - 适用于低安全要求场景
> - 建议启用签名验证增强安全性
>
> **后端验证模式**：
> - 验证逻辑在后端执行，安全性高
> - 适用于安全敏感场景
> - 推荐用于生产环境
>
> **适用场景：**
> - 防止普通用户的误操作
> - 降低自动化脚本的效率
> - 作为多层安全防护的一部分
>
> **不适用场景：**
> - 金融交易验证（建议使用专业风控服务）
> - 高价值资源保护
> - 需要严格安全审计的系统
>
> **增强安全建议：**
> 1. 使用后端验证模式
> 2. 启用签名验证功能
> 3. 结合其他安全措施（IP 限制、频率控制等）
