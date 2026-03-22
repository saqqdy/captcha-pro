# Monorepo 开发指南

本项目采用 monorepo 架构，使用 **pnpm + Turborepo + Changesets** 进行管理。

## 技术栈

| 工具 | 用途 |
|------|------|
| [pnpm](https://pnpm.io/) | 包管理器，支持 workspace |
| [Turborepo](https://turbo.build/) | 构建系统，支持缓存和并行构建 |
| [Changesets](https://github.com/changesets/changesets) | 版本管理和发布工具 |
| [Rolldown](https://rolldown.rs/) | 打包工具（Rollup 下一代） |
| [Vitest](https://vitest.dev/) | 单元测试框架 |

## 项目结构

```
captcha-pro/
├── packages/
│   ├── core/          # @captcha/core - 核心库（框架无关）
│   ├── vue3/          # @captcha/vue3 - Vue 3 组件
│   ├── vue2/          # @captcha/vue2 - Vue 2 组件
│   ├── react/         # @captcha/react - React 组件
│   └── mp/            # @captcha/mp - 小程序组件
├── pnpm-workspace.yaml    # pnpm workspace 配置
├── turbo.json             # Turborepo 任务配置
├── package.json           # 根 package.json
└── .changeset/            # Changesets 配置
```

## 环境要求

- Node.js >= 18
- pnpm >= 9.0.0

## 安装依赖

```bash
# 安装所有依赖
pnpm install

# 强制安装（解决依赖问题）
pnpm install --force
```

---

## 开发服务

### 启动 Core 包监听模式

```bash
# 在根目录执行
pnpm dev

# 等同于
pnpm --filter @captcha/core watch
```

### 单独开发某个包

```bash
# 开发 Vue 3 包
pnpm --filter @captcha/vue3 watch

# 开发 React 包
pnpm --filter @captcha/react watch

# 开发 Vue 2 包
pnpm --filter @captcha/vue2 watch

# 开发小程序包
pnpm --filter @captcha/mp watch
```

### 开发流程

1. 首先启动 core 包的监听模式（其他包依赖它）
2. 在另一个终端启动目标框架包的监听模式
3. 修改代码，自动重新构建

---

## 构建

### 构建工具

| 包 | 构建工具 | 说明 |
|---|---------|------|
| @captcha/core | Rolldown | 框架无关核心库，输出 ESM/CJS/IIFE |
| @captcha/vue3 | Vite 8 + vue-tsc | Vue 3 组件，支持 SFC |
| @captcha/vue2 | Vite 4 + vite-plugin-vue2 | Vue 2 组件，支持 SFC |
| @captcha/react | Vite 8 + tsc | React 组件，支持 TSX |
| @captcha/mp | Vite 8 | 小程序组件，支持 Vue/React/原生 |

### 构建所有包

```bash
pnpm build
```

Turborepo 会自动：
- 分析包之间的依赖关系
- 按正确顺序并行构建
- 缓存构建结果（下次构建更快）

### 构建单个包

```bash
# 构建 core
pnpm build:core

# 构建 vue3
pnpm build:vue3

# 构建 vue2
pnpm build:vue2

# 构建 react
pnpm build:react

# 构建小程序
pnpm build:mp
```

### 使用 filter 过滤

```bash
# 构建指定包及其依赖
pnpm --filter @captcha/vue3 build

# 只构建指定包（不含依赖）
pnpm --filter @captcha/vue3... build

# 构建所有包（跳过缓存）
pnpm build --force
```

### 清理构建产物

```bash
# 清理所有构建产物
pnpm clean
```

---

## 测试

### 运行所有测试

```bash
pnpm test
```

### 运行单个包测试

```bash
# Core 包测试
pnpm --filter @captcha/core test

# 监听模式
pnpm --filter @captcha/core test:watch

# 覆盖率报告
pnpm --filter @captcha/core test:coverage
```

---

## 发版流程

本项目使用 **Changesets** 管理版本和发布。

### 1. 添加变更记录

当你完成一个功能或修复后，执行：

```bash
pnpm changeset
```

然后按提示操作：
1. 选择受影响的包（空格选择，回车确认）
2. 选择变更类型（major/minor/patch）
3. 输入变更描述

这会在 `.changeset/` 目录下生成一个变更文件。

### 2. 消费变更记录

当准备发布时，执行：

```bash
pnpm version
```

这会：
- 更新相关包的 `package.json` 版本号
- 更新 `CHANGELOG.md`
- 删除已消费的 changeset 文件

### 3. 发布到 npm

```bash
pnpm pub
```

这会将所有有版本变更的包发布到 npm。

### 完整发版示例

```bash
# 1. 添加变更记录
pnpm changeset
# 选择: @captcha/core, @captcha/vue3
# 类型: minor (1.0.0 -> 1.1.0)
# 描述: 新增滑块验证码功能

# 2. 提交代码
git add .
git commit -m "feat: add slider captcha"

# 3. 消费变更，更新版本
pnpm version

# 4. 发布到 npm
pnpm pub

# 5. 推送代码和标签
git push --follow-tags
```

### 版本号规则

| 类型 | 说明 | 示例 |
|------|------|------|
| `major` | 不兼容的 API 变更 | 1.0.0 → 2.0.0 |
| `minor` | 向后兼容的新功能 | 1.0.0 → 1.1.0 |
| `patch` | 向后兼容的问题修复 | 1.0.0 → 1.0.1 |

---

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 启动 core 开发监听 |
| `pnpm build` | 构建所有包 |
| `pnpm test` | 运行所有测试 |
| `pnpm lint` | 代码检查和修复 |
| `pnpm prettier` | 代码格式化 |
| `pnpm clean` | 清理构建产物 |
| `pnpm changeset` | 添加变更记录 |
| `pnpm version` | 消费变更，更新版本 |
| `pnpm pub` | 发布到 npm |

---

## 包依赖关系

```
@captcha/core      (基础核心，无依赖其他包)
    ↑
    ├── @captcha/vue3
    ├── @captcha/vue2
    ├── @captcha/react
    └── @captcha/mp
```

所有框架包都依赖 `@captcha/core`，构建时会自动先构建 core。

---

## @captcha/core 核心库

`@captcha/core` 是框架无关的核心库，包含所有验证码的核心逻辑。

### 源码结构

```
packages/core/src/
├── index.ts           # 入口文件，导出所有 API
├── slider.ts          # 滑块验证码（SliderCaptcha）
├── click.ts           # 点击验证码（ClickCaptcha）
├── invisible.ts       # 隐形验证码（InvisibleCaptcha）
├── popup.ts           # 弹窗验证码（PopupCaptcha）
├── types.ts           # TypeScript 类型定义
├── utils.ts           # 工具函数
└── locales/           # 国际化（支持中英文）
    ├── index.ts
    ├── zh-CN.ts
    └── en-US.ts
```

### 导出的类

| 类名 | 说明 |
|------|------|
| `SliderCaptcha` | 滑块拼图验证码 |
| `ClickCaptcha` | 文字点击验证码 |
| `InvisibleCaptcha` | 隐形验证码（智能风控） |
| `PopupCaptcha` | 弹窗验证码封装 |

### 导出的函数

| 函数 | 说明 |
|------|------|
| `createSliderCaptcha(options)` | 创建滑块验证码实例 |
| `createClickCaptcha(options)` | 创建点击验证码实例 |
| `createInvisibleCaptcha(options)` | 创建隐形验证码实例 |
| `createPopupCaptcha(options)` | 创建弹窗验证码实例 |
| `setLocale(locale)` | 设置语言（'zh-CN' | 'en-US'） |
| `getLocale()` | 获取当前语言 |
| `t(key)` | 获取翻译文本 |

### 导出的类型

```typescript
// 验证码类型
type CaptchaType = 'slider' | 'click' | 'invisible'

// 验证模式
type VerifyMode = 'frontend' | 'backend'

// 语言
type Locale = 'zh-CN' | 'en-US'

// 坐标点
interface Point { x: number; y: number }

// 主要选项接口
interface SliderCaptchaOptions extends BaseCaptchaOptions { ... }
interface ClickCaptchaOptions extends BaseCaptchaOptions { ... }
interface InvisibleCaptchaOptions { ... }
interface PopupCaptchaOptions { ... }

// 实例接口
interface SliderCaptchaInstance extends CaptchaInstance { ... }
interface ClickCaptchaInstance extends CaptchaInstance { ... }
interface InvisibleCaptchaInstance { ... }
interface PopupCaptchaInstance { ... }
```

---

## 其他项目如何使用

### 安装

```bash
# npm
npm install @captcha/core

# pnpm
pnpm add @captcha/core

# yarn
yarn add @captcha/core
```

### 基础用法 - 滑块验证码

```typescript
import { createSliderCaptcha } from '@captcha/core'

const captcha = createSliderCaptcha({
  el: '#captcha-container',
  width: 300,
  height: 170,
  precision: 5,           // 验证精度（像素）
  showRefresh: true,      // 显示刷新按钮
  onSuccess: () => {
    console.log('验证成功！')
    // 获取验证数据发送给后端
    const data = captcha.getSignedData()
    console.log(data)
  },
  onFail: () => {
    console.log('验证失败！')
  }
})

// 手动重置
captcha.reset()

// 获取统计数据
const stats = captcha.getStatistics()
console.log(stats.successRate)
```

### 基础用法 - 点击验证码

```typescript
import { createClickCaptcha } from '@captcha/core'

const captcha = createClickCaptcha({
  el: '#captcha-container',
  width: 300,
  height: 170,
  count: 3,               // 点击次数
  showRefresh: true,
  onSuccess: () => {
    const points = captcha.getClickPoints()
    console.log('点击坐标：', points)
  },
  onFail: () => {
    console.log('验证失败！')
  }
})
```

### 基础用法 - 弹窗验证码

```typescript
import { createPopupCaptcha } from '@captcha/core'

const popup = createPopupCaptcha({
  trigger: '#verify-btn',   // 触发按钮
  type: 'slider',           // 'slider' | 'click'
  modal: {
    title: '安全验证',
    maskClosable: true,
    showClose: true
  },
  autoClose: true,          // 成功后自动关闭
  closeDelay: 500,          // 关闭延迟
  onSuccess: () => {
    console.log('验证成功')
  }
})

// 手动显示/隐藏
popup.show()
popup.hide()
```

### 后端验证模式

```typescript
import { createSliderCaptcha } from '@captcha/core'

const captcha = createSliderCaptcha({
  el: '#captcha-container',
  verifyMode: 'backend',    // 后端验证模式
  backendVerify: {
    // 获取验证码的接口
    getCaptcha: '/api/captcha/get',
    // 验证接口
    verify: '/api/captcha/verify',
    headers: {
      'Authorization': 'Bearer xxx'
    },
    timeout: 10000
  },
  onSuccess: () => {
    // 后端验证成功
    console.log('验证通过')
  }
})
```

### 安全签名

```typescript
import { createSliderCaptcha } from '@captcha/core'

const captcha = createSliderCaptcha({
  el: '#captcha-container',
  security: {
    secretKey: 'your-secret-key',    // 与后端共享的密钥
    enableSign: true,                 // 启用签名
    timestampTolerance: 60000         // 时间戳容忍度（毫秒）
  }
})

// 获取带签名的数据
const signedData = await captcha.getSignedData()
// { type, captchaId, target, timestamp, signature, nonce }
```

### 国际化

```typescript
import { setLocale, getLocale, t } from '@captcha/core'

// 设置语言
setLocale('en-US')

// 获取当前语言
const locale = getLocale()  // 'en-US'

// 获取翻译文本
const text = t('slider.success')  // 'Verification successful!'
```

### 使用框架组件

除了直接使用 `@captcha/core`，也可以使用各框架的封装组件：

```bash
# Vue 3
pnpm add @captcha/vue3

# Vue 2
pnpm add @captcha/vue2

# React
pnpm add @captcha/react

# 小程序
pnpm add @captcha/mp
```

#### Vue 3 使用示例

```vue
<template>
  <SliderCaptcha
    :width="300"
    :height="170"
    @success="onSuccess"
    @fail="onFail"
  />
</template>

<script setup lang="ts">
import { SliderCaptcha } from '@captcha/vue3'
import '@captcha/vue3/style.css'

const onSuccess = (data: any) => {
  console.log('验证成功', data)
}

const onFail = () => {
  console.log('验证失败')
}
</script>
```

#### React 使用示例

```tsx
import { SliderCaptcha } from '@captcha/react'
import '@captcha/react/style.css'

function App() {
  const handleSuccess = (data: any) => {
    console.log('验证成功', data)
  }

  return (
    <SliderCaptcha
      width={300}
      height={170}
      onSuccess={handleSuccess}
    />
  )
}
```

### CDN 引入

```html
<script src="https://unpkg.com/@captcha/core/dist/index.global.min.js"></script>
<script>
  const captcha = CaptchaCore.createSliderCaptcha({
    el: '#captcha-container',
    onSuccess: () => {
      console.log('验证成功')
    }
  })
</script>
```

---

## 注意事项

1. **发布前先构建**：确保 `pnpm build` 成功
2. **测试通过**：确保 `pnpm test` 通过
3. **登录 npm**：发布前执行 `npm login`
4. **版本同步**：使用 changesets 管理版本，不要手动修改 `package.json` 中的版本号
5. **依赖更新**：修改 core 后，需要重新构建依赖它的包

---

## 故障排查

### 依赖安装失败

```bash
# 清除缓存并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 构建缓存问题

```bash
# 清理并重新构建
pnpm clean && pnpm build --force
```

### Turborepo 缓存问题

```bash
# 清除 turbo 缓存
rm -rf .turbo node_modules/.cache
pnpm build
```

### 发布权限问题

```bash
# 确保已登录 npm
npm whoami

# 如未登录
npm login
```
