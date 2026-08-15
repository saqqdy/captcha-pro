# captcha-pro 3.1.0 Plan A — Core 轨迹 + 评分 + 后端 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 core 与 Node/Java/Go 三后端实现行为轨迹类型、纯函数评分器、后端 riskMode 双模式与 verify 契约扩展，建立 3.1.0 反机器人基建的可测试内核。

**Architecture:** core 新增 `trajectory.ts`（Trajectory 类型 + createTrajectoryCollector + scoreTrajectory 纯函数，vitest TDD）。三后端各移植同构评分算法 + riskMode 配置 + verify 请求/响应扩展（trajectory 可选，向后兼容）。平台前端采集留 Plan B。

**Tech Stack:** TypeScript/rollup/vitest（core）；Node.js Express、Java Spring Boot、Go Gin（后端）。

## Global Constraints

- **契约**：verify 请求 `{captchaId, type, target, trajectory?, signature?, nonce?}`（trajectory 可选，无则不评分；signature/nonce 来自 3.0.0 保留的客户端签名，web 可选、native/小程序不签）；响应 `{success, message?, data?:{verifiedAt?, riskScore?, riskLevel?}}`。
- **评分纯函数签名**：`scoreTrajectory(trajectory: Trajectory, type: 'slider'|'click'): {score:number; level:'low'|'medium'|'high'; features: FeatureReport}`，score 0-100（0=人类，100=机器人）。
- **后端配置**：`riskMode: 'advisory'|'enforce'`（默认 advisory）；`riskThreshold: number`（默认 70，≥70 判 high）。
- **双模式**：advisory 不改 success（target 校验决定），只附加 riskScore/level；enforce 时 riskLevel==='high' → success=false、message='risk blocked'。
- **同构**：三后端评分算法与 core 一致，用同构测试用例锁定。
- **版本**：3.1.0 minor bump（Plan A：core + 11 JS 包 + root；native 三端留 Plan B 随采集代码一并 bump）。默认 advisory，零破坏。
- **node**：JS 构建用 node 18（`fnm use 18`）。
- **基准**：不改 taro-vue。

---

### Task 1: core Trajectory 类型 + scoreTrajectory 纯函数（TDD）

**Files:**
- Create: `packages/core/src/trajectory.ts`
- Test: `packages/core/test/trajectory.test.ts`

**Interfaces:**
- Produces: `TrajectoryPoint`、`Trajectory`、`FeatureReport`、`RiskResult` 类型；`scoreTrajectory(trajectory, type)` 函数。

- [ ] **Step 1: 写失败测试 — 类型与纯函数**

`packages/core/test/trajectory.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { scoreTrajectory, type Trajectory } from '../src/trajectory';

// 构造轨迹工具：等速直线（机器人特征）
function linearTrajectory(ms: number, steps: number): Trajectory {
  const pts = Array.from({ length: steps }, (_, i) => ({
    x: i * 10, y: 0, t: Math.round((i / steps) * ms),
  }));
  return { points: pts, startTime: 0, endTime: ms };
}

// 构造轨迹工具：变速 + 停顿 + 弯曲（人类特征）
function humanTrajectory(ms: number, steps: number): Trajectory {
  const pts = Array.from({ length: steps }, (_, i) => ({
    x: i * 9 + Math.sin(i) * 5, y: Math.cos(i) * 4, t: Math.round((i / steps) * ms) + (i === 3 ? 120 : 0),
  }));
  return { points: pts, startTime: 0, endTime: ms };
}

describe('scoreTrajectory', () => {
  it('returns score 0-100 and level low/medium/high', () => {
    const r = scoreTrajectory(humanTrajectory(1500, 20), 'slider');
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(['low', 'medium', 'high']).toContain(r.level);
  });

  it('flags bot-like linear fast trajectory as high risk', () => {
    const r = scoreTrajectory(linearTrajectory(600, 10), 'slider');
    expect(r.score).toBeGreaterThanOrEqual(70);
    expect(r.level).toBe('high');
  });

  it('rates human-like varied trajectory as low risk', () => {
    const r = scoreTrajectory(humanTrajectory(1500, 20), 'slider');
    expect(r.score).toBeLessThan(40);
    expect(r.level).toBe('low');
  });

  it('empty trajectory scores high (no behavior signal)', () => {
    const r = scoreTrajectory({ points: [], startTime: 0, endTime: 0 }, 'slider');
    expect(r.level).toBe('high');
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run:
```bash
cd packages/core && pnpm vitest run test/trajectory.test.ts
```
Expected: FAIL（`scoreTrajectory` 未定义 / 模块不存在）。

- [ ] **Step 3: 实现类型 + scoreTrajectory**

`packages/core/src/trajectory.ts`:
```ts
export interface TrajectoryPoint { x: number; y: number; t: number }
export interface Trajectory {
  points: TrajectoryPoint[];
  startTime: number;
  endTime: number;
}
export interface FeatureReport {
  duration: number;
  pointCount: number;
  velocityVariance: number;
  pauseCount: number;
  straightness: number;
  accelVariance: number;
}
export interface RiskResult {
  score: number;
  level: 'low' | 'medium' | 'high';
  features: FeatureReport;
}

const dist = (a: TrajectoryPoint, b: TrajectoryPoint) =>
  Math.hypot(a.x - b.x, a.y - b.y);

function variance(nums: number[]): number {
  if (nums.length === 0) return 0;
  const mean = nums.reduce((s, n) => s + n, 0) / nums.length;
  return nums.reduce((s, n) => s + (n - mean) ** 2, 0) / nums.length;
}

export function scoreTrajectory(trajectory: Trajectory, _type: 'slider' | 'click'): RiskResult {
  const pts = trajectory.points;
  const duration = trajectory.endTime - trajectory.startTime;

  if (pts.length < 2) {
    return { score: 100, level: 'high', features: { duration, pointCount: pts.length, velocityVariance: 0, pauseCount: 0, straightness: 0, accelVariance: 0 } };
  }

  const dts: number[] = [];
  const vels: number[] = [];
  for (let i = 1; i < pts.length; i++) {
    const dt = Math.max(pts[i].t - pts[i - 1].t, 1);
    dts.push(dt);
    vels.push(dist(pts[i], pts[i - 1]) / dt);
  }
  const velocityVariance = variance(vels);
  const pauseCount = dts.filter((dt) => dt > 100).length;

  const pathLength = pts.slice(1).reduce((s, p, i) => s + dist(p, pts[i]), 0);
  const endpoint = dist(pts[pts.length - 1], pts[0]);
  const straightness = endpoint > 0 ? pathLength / endpoint : 1;

  const accels: number[] = [];
  for (let i = 1; i < vels.length; i++) accels.push(Math.abs(vels[i] - vels[i - 1]));
  const accelVariance = variance(accels);

  let score = 0;
  if (duration < 800) score += 20;
  else if (duration > 5000) score += 10;
  if (velocityVariance < 100) score += 25;
  if (pauseCount === 0) score += 20;
  if (straightness > 0.98 && pathLength > 50) score += 20;
  if (accelVariance < 50) score += 5;
  score = Math.max(0, Math.min(100, score));

  const level: RiskResult['level'] = score < 40 ? 'low' : score < 70 ? 'medium' : 'high';
  return { score, level, features: { duration, pointCount: pts.length, velocityVariance, pauseCount, straightness, accelVariance } };
}
```

- [ ] **Step 4: 跑测试确认通过**

Run:
```bash
cd packages/core && pnpm vitest run test/trajectory.test.ts
```
Expected: PASS（4 个 case 全绿）。若 `humanTrajectory` 未达 low，微调测试样本或阈值——但阈值改动需同步本文件注释。

- [ ] **Step 5: 提交**

```bash
git add packages/core/src/trajectory.ts packages/core/test/trajectory.test.ts
git commit -m "feat(core): add Trajectory types + scoreTrajectory pure function"
```

---

### Task 2: core createTrajectoryCollector（TDD）

**Files:**
- Modify: `packages/core/src/trajectory.ts`（追加 collector）
- Test: `packages/core/test/trajectory.test.ts`（追加 case）

**Interfaces:**
- Produces: `createTrajectoryCollector(opts?: { sampleIntervalMs?: number })` → `{ add(x,y,t): void; build(): Trajectory; reset(): void }`

- [ ] **Step 1: 写失败测试 — 采样与降采样**

追加到 `packages/core/test/trajectory.test.ts`:
```ts
import { createTrajectoryCollector } from '../src/trajectory';

describe('createTrajectoryCollector', () => {
  it('collects points and builds a Trajectory', () => {
    const c = createTrajectoryCollector();
    c.add(0, 0, 0); c.add(10, 0, 16); c.add(20, 0, 32);
    const t = c.build();
    expect(t.points.length).toBe(3);
    expect(t.endTime).toBe(32);
    expect(t.startTime).toBe(0);
  });

  it('downsamples when sampleIntervalMs set', () => {
    const c = createTrajectoryCollector({ sampleIntervalMs: 16 });
    for (let i = 0; i < 100; i++) c.add(i, 0, i * 2); // 2ms 间隔 → 节流后少于 100
    const t = c.build();
    expect(t.points.length).toBeLessThan(100);
    expect(t.points.length).toBeGreaterThan(0);
  });

  it('reset clears points', () => {
    const c = createTrajectoryCollector();
    c.add(0, 0, 0); c.reset();
    expect(c.build().points.length).toBe(0);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run:
```bash
cd packages/core && pnpm vitest run test/trajectory.test.ts
```
Expected: FAIL（`createTrajectoryCollector` 未导出）。

- [ ] **Step 3: 实现 collector**

追加到 `packages/core/src/trajectory.ts`:
```ts
export interface TrajectoryCollector {
  add(x: number, y: number, t: number): void;
  build(): Trajectory;
  reset(): void;
}

export function createTrajectoryCollector(opts?: { sampleIntervalMs?: number }): TrajectoryCollector {
  const interval = opts?.sampleIntervalMs ?? 16;
  let points: TrajectoryPoint[] = [];
  let lastT = -Infinity;
  let startTime: number | null = null;
  let endTime = 0;
  return {
    add(x, y, t) {
      if (startTime === null) startTime = t;
      endTime = t;
      if (t - lastT < interval && points.length > 0) return; // 节流
      lastT = t;
      points.push({ x, y, t });
    },
    build() {
      return { points: [...points], startTime: startTime ?? 0, endTime };
    },
    reset() { points = []; lastT = -Infinity; startTime = null; endTime = 0; },
  };
}
```

- [ ] **Step 4: 跑测试确认通过**

Run:
```bash
cd packages/core && pnpm vitest run test/trajectory.test.ts
```
Expected: PASS（全部 7 case）。

- [ ] **Step 5: 导出**

在 `packages/core/src/index.ts`（或 index.default.ts 按现有导出模式）追加：
```ts
export { scoreTrajectory, createTrajectoryCollector } from './trajectory';
export type { Trajectory, TrajectoryPoint, FeatureReport, RiskResult, TrajectoryCollector } from './trajectory';
```

- [ ] **Step 6: 构建类型 + 跑全量测试**

Run:
```bash
cd packages/core && pnpm build:types && pnpm vitest run
```
Expected: 类型生成成功；全量 vitest 绿（含既有 case）。

- [ ] **Step 7: 提交**

```bash
git add packages/core/src/trajectory.ts packages/core/src/index.ts packages/core/test/trajectory.test.ts
git commit -m "feat(core): add createTrajectoryCollector with sampling + export"
```

---

### Task 3: 后端 Node — 评分模块 + riskMode + verify 扩展

**Files:**
- Create: `server/node/src/risk.ts`（评分模块，移植 core 算法）
- Modify: `server/node/src/**`（verify 端点：解析 trajectory、调用评分、按 riskMode 写响应、配置项）

**Interfaces:**
- Consumes: core 的 `Trajectory` 类型与 scoreTrajectory 算法（移植，非 import——后端独立部署）
- Produces: verify 响应 `data` 含 `riskScore?`/`riskLevel?`；enforce 时 high → success=false

- [ ] **Step 1: 定位 verify 端点与配置**

Run:
```bash
grep -rln "verify" server/node/src 2>/dev/null; ls server/node/src 2>/dev/null
```
记录 verify 路由文件与现有响应构造点。

- [ ] **Step 2: 创建 risk.ts（评分纯函数 + 配置）**

`server/node/src/risk.ts`：将 Task 1 的 `scoreTrajectory` 逻辑原样移植为 `.ts`；追加：
```ts
export interface RiskConfig { riskMode: 'advisory' | 'enforce'; riskThreshold: number; }
export const defaultRiskConfig: RiskConfig = { riskMode: 'advisory', riskThreshold: 70 };

/** 应用风险策略到 verify 响应。返回 { success, message?, riskScore?, riskLevel? }。 */
export function applyRisk(
  targetVerified: boolean,
  risk: RiskResult,
  cfg: RiskConfig,
): { success: boolean; message?: string; riskScore: number; riskLevel: string } {
  const base = { riskScore: risk.score, riskLevel: risk.level };
  if (cfg.riskMode === 'enforce' && risk.level === 'high') {
    return { success: false, message: 'risk blocked', ...base };
  }
  return { success: targetVerified, ...base };
}
```

- [ ] **Step 3: verify 端点解析 trajectory 并调用评分**

在 verify 路由中：从请求体取可选 `trajectory`；若存在则 `scoreTrajectory(trajectory, type)`；用 `applyRisk` 合成响应 `data`。无 trajectory 时按原逻辑、不附加 risk 字段。

- [ ] **Step 4: 加配置项**

在 server 启动配置读取 `RISK_MODE` / `RISK_THRESHOLD` 环境变量（或 config 文件），默认 advisory/70。

- [ ] **Step 5: 单测（同构用例）**

`server/node/test/risk.test.ts`：断言 advisory 不改 success、enforce+high→false、无 trajectory 不评分。

- [ ] **Step 6: 提交**

```bash
git add server/node
git commit -m "feat(server-node): trajectory scoring + riskMode dual-mode + verify response extension"
```

---

### Task 4: 后端 Java — 评分模块 + riskMode + verify 扩展

**Files:**
- Create: `server/java/src/main/java/com/captcha/pro/risk/RiskScorer.java`
- Modify: verify controller + 配置

**Interfaces:** 同 Task 3（Java 移植）。

- [ ] **Step 1: 定位 verify controller**

Run:
```bash
grep -rln "verify" server/java/src 2>/dev/null
```

- [ ] **Step 2: 移植 RiskScorer.java**

将 Task 1 评分算法移植为 Java（`scoreTrajectory(Trajectory, CaptchaType): RiskResult`），特征同构。

- [ ] **Step 3: verify 控制器接入**

请求 DTO 增 `trajectory` 可选字段；响应 DTO 增 `riskScore`/`riskLevel` 可选；按 `riskMode` 配置（`application.properties` `captcha.risk.mode`/`captcha.risk.threshold`）应用 enforce 拦截。

- [ ] **Step 4: 单测**

`server/java/src/test/.../RiskScorerTest.java`：同构用例（advisory/enforce/empty）。

- [ ] **Step 5: 提交**

```bash
git add server/java
git commit -m "feat(server-java): trajectory scoring + riskMode dual-mode + verify extension"
```

---

### Task 5: 后端 Go — 评分模块 + riskMode + verify 扩展

**Files:**
- Create: `server/go/pkg/risk/scorer.go`
- Modify: `server/go/pkg/captcha/server.go`（verify handler）+ 配置

**Interfaces:** 同 Task 3（Go 移植）。

- [ ] **Step 1: 定位 verify handler**

Run:
```bash
grep -n "verify" server/go/pkg/captcha/server.go
```

- [ ] **Step 2: 移植 scorer.go**

```go
package risk

type RiskMode string
const ( Advisory RiskMode = "advisory"; Enforce RiskMode = "enforce" )
type Config struct { Mode RiskMode; Threshold int }
type Result struct { Score int; Level string; Features FeatureReport }
```
`ScoreTrajectory(traj Trajectory, ctype string) Result` 移植 Task 1 算法。

- [ ] **Step 3: verify handler 接入**

请求 struct 增 `Trajectory *Trajectory json:"trajectory,omitempty"`；响应 data 增 `RiskScore *int`/`RiskLevel *string`；按 `Config.Mode` enforce 拦截。

- [ ] **Step 4: 单测**

`server/go/pkg/risk/scorer_test.go`：同构用例。

- [ ] **Step 5: 提交**

```bash
git add server/go
git commit -m "feat(server-go): trajectory scoring + riskMode dual-mode + verify extension"
```

---

### Task 6: 三后端同构测试对齐 + 契约校验

**Files:** 无新增（校验既有测试）。

- [ ] **Step 1: 同构用例对齐**

确认 Node/Java/Go 三端的 `linearTrajectory(600,10)→high` 与 `humanTrajectory(1500,20)→low` 断言一致（与 core Task 1 同样本）。若某端偏离 → 校对该端算法移植。

- [ ] **Step 2: 契约 grep 校验**

Run:
```bash
grep -rn "trajectory" server/node/src server/java/src server/go | grep -iE "json|field|optional" | head
grep -rn "riskScore\|riskLevel" server/node/src server/java/src server/go | head
```
Expected: 三端 verify 请求/响应均含 trajectory/riskScore/riskLevel。

- [ ] **Step 3: 提交（若有修正）**

```bash
git add -A
git commit -m "test: align cross-backend scoring contract"
```

---

### Task 7: 版本号 → 3.1.0 + CHANGELOG

**Files:**
- Create: `.changeset/captcha-pro-3.1.0.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: changeset**

`.changeset/captcha-pro-3.1.0.md`:
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

Add behavioral trajectory collection + backend risk scoring (advisory default, enforce opt-in).
```

- [ ] **Step 2: 应用 + root 升 3.1.0**

```bash
pnpm changeset version
```
然后 `package.json` version → `3.1.0`。

- [ ] **Step 3: CHANGELOG 追加 3.1.0 条目**

在 `CHANGELOG.md` 顶部插入（含：轨迹采集、后端评分、双模式、零破坏向后兼容、平台采集见 Plan B 后续）。

- [ ] **Step 4: 构建验证**

Run:
```bash
fnm use 18 && pnpm turbo build && pnpm turbo test
```
Expected: 全绿。

- [ ] **Step 5: 提交**

```bash
git add .changeset CHANGELOG.md package.json packages/*/package.json
git commit -m "chore: bump all packages to 3.1.0 + changelog"
```

---

## Plan B — 平台前端采集（后续计划）

全平台 14 端事件采集 + 装入 verify，依赖 Plan A 的 `Trajectory`/`createTrajectoryCollector` 导出与 verify 契约稳定后开展：
- web（vue/vue2/react）：MouseEvent + TouchEvent
- 小程序（6 端，经 @captcha-pro/mp-shared）
- native（android MotionEvent / ios UITouch / flutter GestureDetector）

native 三端版本号 → 3.1.0 一并在 Plan B 落地（随采集代码 bump，Plan A 不动 native 版本）。

Plan A 落地后另起 `docs/superpowers/plans/2026-08-xx-captcha-pro-3.1.0-planB-platform-collection.md`。

## 风险

- **评分阈值**：初版 70 可能误杀；advisory 默认下可观察调优。改动阈值需同步三后端 + core。
- **三后端同构**：算法移植易跑偏，Task 6 同构用例锁定。
- **Plan B 依赖**：平台采集未落地前，3.1.0 的 trajectory 字段无前端填充——但契约与后端已就绪，Plan B 增量补前端即可，无需改后端。
