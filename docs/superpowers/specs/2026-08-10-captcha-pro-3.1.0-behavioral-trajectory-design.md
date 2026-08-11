# captcha-pro 3.1.0 — 行为轨迹 + 反机器人 设计规格

- **日期**：2026-08-10
- **状态**：已批准，待写实施计划
- **前置**：3.0.0（全平台仅后端）落地后开展

## 1. 背景与目标

库定位是 "behavioral captcha"（行为验证码），但目前仅采集最终位置（target），不采集行为轨迹，反机器人能力薄弱。3.1.0 引入拖拽/点击轨迹采集 + 后端风险评分，建立反机器人基建。

**目标**：全平台 14 端采集行为轨迹 → 随 verify 请求发后端 → Node/Java/Go 评分模块计算风险分 → 响应返回 riskScore/riskLevel；默认咨询式（不拦截），业务方可 opt-in 强制拦截高风险。

**非目标**：不替换现有 target 校验；不引入机器学习模型（3.1.0 是规则评分，ML 留后续版本）；不强制启用拦截（默认 advisory 零破坏）。

## 2. 决策

| 维度 | 决策 |
|---|---|
| 主题 | 行为轨迹采集 + 反机器人 |
| 评分架构 | 后端评分（前端采集 → 随 verify 发后端 → Node/Java/Go 评分 → 返回决策） |
| 平台范围 | 全平台 14 端采集 |
| 评分方案 | 方案 C 双模式：advisory（默认，返回分数不拦截）+ enforce（opt-in，高风险直接 fail） |
| 版本 | 3.1.0 minor bump 全端（默认 advisory，零破坏向后兼容） |

## 3. 数据模型与契约扩展

### 轨迹数据模型（前端采集，全平台统一）
```ts
type TrajectoryPoint = { x: number; y: number; t: number };  // t = 相对拖拽开始的毫秒时间戳
type Trajectory = {
  points: TrajectoryPoint[];   // 采样轨迹点（slider=拖拽路径；click=各次点击点+时序）
  startTime: number;            // 交互开始时间
  endTime: number;               // 交互结束时间
};
```

### verify 请求扩展（向后兼容，trajectory 可选）
```
POST {captchaId, type, target, trajectory?, signature?, nonce?}
```
- 无 trajectory 字段时，后端按原逻辑验证、不评分——老客户端零破坏。

### verify 响应扩展
```
{success, message?, data?:{verifiedAt?, riskScore?, riskLevel?}}
```
- `riskScore: 0-100`（0=人类，100=机器人）
- `riskLevel: 'low' | 'medium' | 'high'`

### 后端配置
```ts
{
  riskMode: 'advisory' | 'enforce';  // 默认 advisory
  riskThreshold: number;              // 默认 70（≥70 判 high）
}
```

## 4. 后端评分模块（Node/Java/Go 三端，纯函数）

### 特征集
| 特征 | 含义 | 机器人特征 |
|---|---|---|
| 总时长 | 拖拽耗时 | 过短或过于稳定 |
| 速度方差 | 速度波动 | 恒速 |
| 停顿次数 | 短暂停顿 | 无停顿 |
| 路径直线度 | 实际路径长 / 起止直线距离 | 路径过直 |
| 加速度方差 | 加速度波动 | 平滑无变化 |

### 评分纯函数
```ts
function scoreTrajectory(
  trajectory: Trajectory,
  type: 'slider' | 'click'
): { score: number; level: 'low'|'medium'|'high'; features: FeatureReport }
```
- 纯函数，**可单测，TDD 适用**
- Node/Java/Go 各实现一份（与现有后端一致架构）；特征算法同构

### 双模式行为
- `advisory`：success 由 target 校验决定（不变），响应附加 riskScore/riskLevel
- `enforce`：riskLevel==='high' 时 success=false、message='risk blocked'

## 5. 前端采集（全平台 14 端）

### 共享逻辑
- `@captcha-pro/core`：`createTrajectoryCollector()` 工具——事件采样、点序列构建、降采样（控制 payload 体积，约 50-100 点）；`Trajectory` 类型定义
- `@captcha-pro/mp-shared`：小程序复用 core 逻辑

### 各平台事件适配
| 端 | 事件源 |
|---|---|
| vue / vue2 / react | MouseEvent + TouchEvent |
| 6 小程序 | TouchEvent（经 @captcha-pro/mp-shared） |
| android | MotionEvent（Compose + View） |
| ios | UITouch / UIEvent（UIKit + SwiftUI） |
| flutter | GestureDetector |

### 前端配置
- `collectTrajectory: true`（默认开）
- 采样率节流（约 16ms/点）控制 payload 体积

### 架构边界
```
core: createTrajectoryCollector() + Trajectory types + scoreTrajectory(纯函数, 供 TDD/三端同构/本地调试, 不作客户端决策)
  ├─ web: vue/vue2/react 注入采集到 slider/click 组件
  ├─ mp-shared: 小程序采集适配
  ├─ android: MotionEvent 采集 + 装入 verify
  ├─ ios: UITouch 采集 + 装入 verify
  └─ flutter: GestureDetector 采集 + 装入 verify
backend: Node/Java/Go 各加 scoring module + riskMode 配置 + verify 响应扩展
```
- 各平台只做事件适配，不重写采集/评分逻辑
- 后端三端各实现评分（与现有 Node/Java/Go 后端一致架构）
- **最终评分以后端为准**；前端 core 的 scoreTrajectory 仅用于本地预览/调试

## 6. 验证与版本

### 验证
- **core**：`vitest` 测 `scoreTrajectory` 纯函数（造人类/机器人轨迹样本，断言分数区间）+ `createTrajectoryCollector` 测采样逻辑
- **后端**：各端单测评分模块（同构测试用例，三端断言一致）
- **native**：无单测，build + 集成（实际拖拽发 verify，看响应含 riskScore）
- **契约校验**：grep 确认 verify 请求含可选 trajectory、响应含 riskScore/riskLevel

### 版本
3.1.0 minor bump 全端（14 包 + root）。默认 advisory，零破坏向后兼容。

## 7. 风险与判断点

- **评分算法调参**：初版阈值 70 可能误杀。advisory 默认下不影响决策，可线上观察调优后再开 enforce。
- **payload 体积**：降采样到约 100 点控制；可配置采样率。
- **native 事件差异**：各平台时间戳基准需统一为"相对 startTime 的毫秒"。
- **机器人对抗是军备竞赛**：3.1.0 建立采集+评分基建；后续版本迭代算法、引入 ML。
- **三端后端同构**：评分算法需在 Node/Java/Go 三端保持一致，建议用同构测试用例锁定行为。
