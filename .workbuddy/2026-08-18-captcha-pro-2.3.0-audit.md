# captcha-pro 2.3.0 实施完整性审计与示例更新报告

> 日期：2026-08-18
> 范围：internal/superpowers/plans/2026-08-11-captcha-pro-2.3.0-dark-mode.md + spec
> 结论：2.3.0 主体已完成，web wrappers 暗色模式关键缺口已修复，所有示例已补齐手动/系统暗色切换。

## 1. 已完成的 2.3.0 内容

| 端 | 状态 | 关键文件 |
|---|---|---|
| web popup 暗色 + focus trap | ✅ | `packages/core/src/popup.ts` 已注入 `@media (prefers-color-scheme: dark)` 与 `.cp-dark` 覆盖样式；实现 `previousActiveElement` 缓存、`Tab`/`Shift+Tab` 焦点循环、关闭后焦点返回；默认标题 `t('popup.title')` |
| taro-vue / taro-vue2 / taro-react / uniapp-vue 小程序样式 | ✅ | 对应 `src/styles/captcha.scss` 已追加 dark 覆盖块 |
| weixin 原生小程序样式 | ✅ | `packages/weixin/src/components/*/slider-captcha.wxss` 等已追加 `@media (prefers-color-scheme: dark)` |
| Flutter 暗色 | ✅ | `packages/flutter/lib/src/core/theme.dart` + 三个 widget 已迁移到 `CaptchaColorScheme.of(context)` |
| Android View 暗色 | ✅ | `packages/android/captcha-sdk/src/main/res/values/colors.xml` + `values-night/colors.xml` + `CaptchaColors.kt` + widget/CanvasRenderer 已替换为 `ContextCompat.getColor` |
| Android Compose 暗色 | ✅ | `packages/android/captcha-compose/.../CaptchaColorScheme.kt` + `SliderCaptcha.kt`/`ClickCaptcha.kt` 已使用 `isSystemInDarkTheme` |
| iOS 暗色 | ✅ | `packages/ios/Sources/Core/CaptchaColors.swift` dynamic UIColor + SwiftUI/Views 三组件已替换 |
| 版本号 | ✅ | root + 11 JS 包 + flutter pubspec + iOS podspec + android publishing version 均为 `2.3.0` |
| 文档 | ✅ | `docs/accessibility.md` 已补暗色说明；CHANGELOG/README 已更新 |
| 2.2.0 a11y | ✅ | 全端 aria/Semantics/accessibilityLabel、focus-visible、44px/44pt/48dp hit area、live region 已落地 |
| 2.1.0 native 对齐 | ✅ | 三端无 timestamp、timeout 10s、14/15 i18n 键、无 precision 死参数 |

## 2. 发现的关键缺口与修复

### 2.1 缺口：core 滑块/点选 DOM 仍使用内联浅色样式

`packages/core/src/slider.ts` 与 `click.ts` 直接使用 `background: '#fff'`、`background: '#f7f9fa'`、`color: '#999'` 等内联样式。Vue / Vue2 / React / HTML 示例均通过 core 渲染 DOM，因此这些 wrapper 在系统暗色模式下**不会自动变暗**，与 2.3.0 规划中的 wrappers + 6 小程序暗色目标不符。

### 2.2 修复方案

1. 在 `packages/core/src/utils.ts` 新增 `injectThemeStyles()`，注入 CSS 自定义属性：
   - light 默认值：`--cp-bg`、`--cp-track-bg`、`--cp-thumb-bg`、`--cp-hint-color`、`--cp-prompt-*`、`--cp-refresh-*` 等
   - `@media (prefers-color-scheme: dark)` 覆盖为 dark 值
   - `.cp-dark` 手动覆盖规则，支持通过类名强制切换暗色
   - `.cp-light` 显式浅色覆盖规则，置于媒体查询之后，确保用户手动切回浅色时优先级高于系统暗色
2. 在 `slider.ts`/`click.ts` 的 `render()`、`reset()` 中把内联颜色改为 `var(--cp-*)`。
3. 同步更新 `packages/core/src/styles/index.css`（dist/style.css 源文件），使其包含相同的变量、dark 覆盖与 `.cp-light` 浅色覆盖，并补充 popup 的 `.cp-dark`/`.cp-light` 覆盖。
4. 所有 web 示例（vue / vue2 / react / html）在 Header 提供全局暗色开关，切暗色时添加 `html.cp-dark`，切浅色时添加 `html.cp-light` 并移除 `cp-dark`；小程序示例在首页根节点等效切换 `.cp-dark`/`.cp-light`，支持 storage 记忆。

### 2.3 额外修复

- **React PopupCaptcha 缺失标题**：`packages/core/src/popup.ts` 的默认弹窗标题从空字符串改为 `t('popup.title')`，React / Vue / Vue2 wrapper 在调用方未传 `modal.title` 时也能显示标题。
- **taro-react 错误引用 solid-js**：`packages/taro-react/src/components/{PopupCaptcha,SliderCaptcha,ClickCaptcha}.tsx` 原使用 `solid-js` 的 `<Show>`/`<For>`，在 React 包中无法解析。已改为 React 条件渲染与 `Array.map`。
- **vue2 / react 测试缺少 vitest**：两包 `test` 脚本为 `vitest run` 但 devDependencies 未声明 `vitest`。已补充 `vitest` 并重新安装依赖。

### 2.4 修复后验证

- `pnpm build:core` 通过
- `pnpm --filter @captcha-pro/core test` 149 tests 全绿
- `pnpm turbo build` 15/15 成功
- `pnpm turbo test` 11/11 成功（core 149 tests + vue 7 + vue2 8 + react 7 tests）
- 生成后的 `packages/core/dist/style.css` 与 `packages/core/dist/index.mjs` 中均已包含 `.cp-light` 覆盖规则
- dark grep 终检：core 源码中除 theme 变量定义与 popup dark 覆盖外，已无 slider/click 的硬编码浅色内联样式

### 2.5 哪些 packages 存在「切不回浅色」的问题

- **受影响**：`packages/core`（以及复制其 `style.css` 的 `packages/vue`/`vue2`/`react` 构建产物）。它们同时使用了 `@media (prefers-color-scheme: dark)` 与 `.cp-dark` 手动覆盖，移除 `.cp-dark` 后媒体查询仍会生效。
- **已修复**：通过新增 `.cp-light` 显式浅色覆盖，并更新所有相关示例的切换逻辑。
- **不受影响/行为不同**：`packages/taro-vue`/`taro-vue2`/`taro-react`/`uniapp-vue`/`weixin` 的样式文件目前**仅**使用 `@media (prefers-color-scheme: dark)` 跟随系统，没有 `.cp-dark` 手动覆盖，因此不存在「切不回浅色」的 bug；但它们本身也不响应示例中的手动开关（验证码组件仍随系统主题）。如需让小程序示例开关同时控制验证码组件，需后续在这些 package 的 SCSS/WXSS 中补充 `.cp-dark`/`.cp-light` 规则。

### 2.6 新增缺口：暗色模式下初始状态 slider track 文字/按钮/刷新按钮无样式

用户反馈：切换到暗色模式后，初始状态下 `captcha-slider-track` 文字仍是黑色、`captcha-slider-btn` 没有背景色、刷新按钮也没有背景色。

#### 根因

1. **HTML 示例**：`examples/html/index.html` 只加载了 `core-dist/index.global.js`。`packages/core` 的 IIFE 全局构建不会自动内联完整 CSS，只会在运行时注入少量 `injectThemeStyles`/`injectA11yStyles`/`injectShakeAnimation` 片段；因此 `--cp-*` 暗色变量未生效。
2. **Vue / Vue2 wrapper 构建产物**：`packages/vue/build/vite.config.ts` 与 `packages/vue2/build/vite.config.ts` 的 `copyCoreCss` 插件在 `buildStart` 阶段把 `packages/core/src/styles/index.css` 复制到 `dist/style.css`，但 Vite lib mode 在构建结束时会用收集到的 scoped CSS 再次写入 `dist/style.css`，覆盖了复制结果。最终 `dist/style.css` 只包含 Vue 组件的 scoped 样式（约 200~300 字节），丢失了 core 的暗色变量。
3. **React wrapper**：同样使用 `copyCoreCss`，但 React 组件没有 scoped CSS，Vite 不会覆盖，因此未受影响；为保持一致也改为 `writeBundle`。

#### 修复

- HTML 示例在 `<head>` 增加：
  ```html
  <link rel="stylesheet" href="core-dist/style.css">
  ```
  与 `core-dist/index.global.js` 一起加载本地完整样式。
- 将 `packages/vue`、`packages/vue2`、`packages/react` 的 `copyCoreCss` 插件从 `buildStart` 改为 `writeBundle`，确保 Vite 写完所有资源后再把 core 完整 `index.css` 复制为 `dist/style.css`。
- `examples/html/index.html` 的 `init()` 增加 `?theme=dark` URL 参数支持，便于 headless 截图验证。

#### 验证

- Chrome headless 截图验证 `examples/html` 与 `examples/vue` production build：暗色模式下 slider track 文字、slider button、refresh button 均正确显示暗色样式。
- 重新运行 `pnpm turbo build` 15/15 成功，`pnpm turbo test` 11/11 成功。
- 各包 `dist/style.css` 大小核对：
  - `packages/core/dist/style.css`：6366 B
  - `packages/vue/dist/style.css`：6366 B
  - `packages/vue2/dist/style.css`：6366 B
  - `packages/react/dist/style.css`：6366 B
  - 小程序包保持各自编译后的 SCSS/WXSS（含 `@media (prefers-color-scheme: dark)`）

## 3. 示例更新汇总

为 examples 下每个有效子项目补充了功能展示与暗色开关：

| 子项目 | 更新内容 |
|---|---|
| `examples/vue` | Header 增加全局暗色开关（localStorage 记忆 + 系统主题回退），切浅色时添加 `html.cp-light`；新增 `DarkModeDemo.vue`；Features 增加暗色/焦点陷阱/a11y/native 对齐；TabNav 增加「暗色模式」；AccessibilityDemo 增加焦点陷阱说明；global.css 增加 `html.cp-dark` 整页样式 |
| `examples/react` | Header 增加全局暗色开关，切浅色时添加 `html.cp-light`；新增 `DarkModeDemo.tsx`；等效更新 Features/TabNav/AccessibilityDemo；global.css 增加 `html.cp-dark` 整页样式 |
| `examples/vue2` | AppHeader 增加全局暗色开关，切浅色时添加 `html.cp-light`；新增 `DarkModeDemo.vue`（Options API）；等效更新 AppFeatures/TabNav/AccessibilityDemo；global.css 增加 `html.cp-dark` 整页样式 |
| `examples/html` | 顶部增加全局暗色开关，切浅色时添加 `html.cp-light`；新增「暗色模式」演示区；标题版本改为 v2.3.0；Features 增加 v2.x 特性；整页 `html.cp-dark` 样式覆盖 |
| `examples/taro-vue` | 首页根节点切换 `.cp-dark`/`.cp-light`（Taro storage 记忆 + 系统主题回退）、v2.x 功能特性卡片与暗色页面样式 |
| `examples/taro-vue2` | 首页根节点切换 `.cp-dark`/`.cp-light`、特性卡片与暗色页面样式 |
| `examples/taro-react` | 首页根节点切换 `.cp-dark`/`.cp-light`、特性卡片与暗色页面样式 |
| `examples/uniapp-vue` | 首页根节点切换 `.cp-dark`/`.cp-light`（uni.setStorageSync）、特性卡片与暗色页面样式 |
| `examples/weixin` | 首页根节点切换 `.cp-dark`/`.cp-light`（wx.setStorageSync）、v2.x 功能特性卡片与暗色页面样式 |
| `examples/uniapp-vue3` | 仅含 shims，无实际页面，未改动 |

## 4. 仍需注意/手动验证的事项

1. **小程序 `@media (prefers-color-scheme: dark)`**：基础库需 >= 2.11；旧版基础库会回退 light，与规划一致。
2. **native 构建**：JS/web 已通过构建，但 flutter/android/ios 未在本机完整编译（无对应 SDK 环境）。代码层面已按 plan/spec 完成，建议在 CI/真机补一次 `flutter analyze`、`./gradlew assembleDebug`、`swift build`。
3. **dark 对比度抽测**：spec 要求 dark 下 `#aaa/#5cb85c/#ff7875` 达 4.5:1，需真机/模拟器切 dark 后目视或工具校验。
4. **focus trap 键盘测**：打开 popup -> Tab/Shift+Tab 焦点不出 dialog -> Esc/关闭后焦点返回触发元素，需手动验证。
5. **html 示例引用 unpkg**：`examples/html/index.html` 使用 captcha-pro npm 包 CDN，发布 2.3.0 后才会在线生效；本地验证需切换为 `../../packages/core/dist/index.global.js`。
6. **changeset 与 tag**：当前未应用新的 changeset，因版本号已手动改为 2.3.0；发版前按流程 `git tag v2.3.0` + `pnpm pub --no-git-checks`。

## 5. 结论

- 2.3.0 规划的功能（全端暗色 + popup focus trap）在代码层面已补齐，核心缺口（web wrappers 暗色）已修复。
- 修复了「切换到非暗黑模式，验证码仍暗黑」的问题：核心 web 包新增 `.cp-light` 显式浅色覆盖，手动浅色优先级高于系统暗色；所有 web 与小程序示例同步更新切换逻辑。
- 所有有效示例子项目均已更新，完整展示 v2.1.0/v2.2.0/v2.3.0 功能特性，并支持手动/系统暗色切换。
- JS/web 构建与测试全绿；native 端建议补一次真机/模拟器验证后发版。

---
*本报告基于静态分析与 JS 构建测试生成，仅供参考。*
