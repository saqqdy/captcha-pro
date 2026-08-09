# 从 v1 升级到 v2

v2.0.0 是一次**多平台发布**。Web 框架的组件公开 API（props、事件、方法）保持不变——v2 本质上是一次**包结构重组**：所有包迁移到 `@captcha-pro/*` npm scope，单一的小程序包拆分为按平台独立的专用包，框架无关的核心逻辑抽取到 `@captcha-pro/core`。原生 SDK（Android / iOS / Flutter）对齐到统一的后端契约。

本指南带你从 v1.x 升级到 v2.0.0。

## 破坏性变更概览

| 领域 | v1 | v2 |
| --- | --- | --- |
| npm scope | `captcha-pro-*`（无 scope） | `@captcha-pro/*`（scoped） |
| 原生 Web | `captcha-pro` | `@captcha-pro/core` |
| 小程序 | 单一 `captcha-pro-mp` | 6 个专用包（见下表） |
| 核心逻辑 | 各包内自带 | 抽取到 `@captcha-pro/core` |
| CDN | `unpkg.com/captcha-pro/dist/...` | `unpkg.com/@captcha-pro/core/dist/...` |
| 原生 verify 请求 | 含 `timestamp` | 移除 `timestamp` |
| 原生 `precision` 选项 | 存在 | 移除（死参数） |
| 原生超时默认值 | 30000 ms | 10000 ms |
| Flutter | 客户端生成 + 验证 | 后端模式 |

## 第 1 步 — 改包名

把 v1 包名替换为 v2 对应名，并升到 `^2.0.0`。

| 平台 | v1 包名 | v2 包名 |
| --- | --- | --- |
| Web（原生 JS） | `captcha-pro` | `@captcha-pro/core` |
| Vue 3 | `captcha-pro-vue` | `@captcha-pro/vue` |
| Vue 2 | `captcha-pro-vue2` | `@captcha-pro/vue2` |
| React | `captcha-pro-react` | `@captcha-pro/react` |

```bash
# 示例：Vue 3
pnpm remove captcha-pro-vue
pnpm add @captcha-pro/vue@^2.0.0
```

## 第 2 步 — 更新 import

把所有 `import` / `require` 路径改成新的 scoped 名。命名导出保持不变。

```diff
- import { SliderCaptcha, ClickCaptcha } from 'captcha-pro'
+ import { SliderCaptcha, ClickCaptcha } from '@captcha-pro/core'
- import 'captcha-pro/dist/style.css'
+ import '@captcha-pro/core/dist/style.css'
```

```diff
- import { SliderCaptcha } from 'captcha-pro-vue'
+ import { SliderCaptcha } from '@captcha-pro/vue'
```

Vue 2 的 mixin 随包迁移：

```diff
- import sliderCaptchaMixin from 'captcha-pro-vue2/mixins/sliderCaptcha'
+ import sliderCaptchaMixin from '@captcha-pro/vue2/mixins/sliderCaptcha'
```

## 第 3 步 — 小程序：选择专用包

原来的单一 `captcha-pro-mp` 包已移除。请安装**你目标平台**对应的包：

| 平台 | v2 包名 |
| --- | --- |
| 微信小程序 | `@captcha-pro/weixin` |
| uni-app（Vue 3） | `@captcha-pro/uniapp-vue` |
| uni-app（Vue 2） | `@captcha-pro/uniapp-vue2` |
| Taro（React） | `@captcha-pro/taro-react` |
| Taro（Vue 3） | `@captcha-pro/taro-vue` |
| Taro（Vue 2） | `@captcha-pro/taro-vue2` |

```bash
# 示例：微信小程序
pnpm remove captcha-pro-mp
pnpm add @captcha-pro/weixin@^2.0.0
```

小程序组件现已支持**后端验证模式**——`backend` 配置契约详见[小程序平台指南](/zh/platforms/mini-programs)。

## 第 4 步 — 更新 CDN 地址（原生 JS）

如果你通过 CDN 加载 captcha-pro，更新主机路径：

```diff
- <script src="https://unpkg.com/captcha-pro/dist/index.umd.js"></script>
+ <script src="https://unpkg.com/@captcha-pro/core/dist/index.umd.js"></script>
```

npm badge / 包主页地址同样迁移到 `@captcha-pro/core`。

> 生产环境建议为 `<script>` 标签加上 `integrity="sha384-..."` 和 `crossorigin="anonymous"`（子资源完整性 SRI），防止 CDN 被入侵后注入篡改代码。

## 第 5 步 — 原生 SDK（Android / iOS / Flutter）

原生 SDK 已对齐到统一的后端契约。如果你集成了原生 SDK，请审查触及你集成的变更：

- **三端通用**
  - `verify` 请求体**不再发送 `timestamp`**——服务端如有依赖请移除。
  - `precision` 选项**已移除**（本来就是死参数）——从配置中删除。
  - 超时默认值从 `30000 ms` 降到 `10000 ms`。如需沿用旧值，覆盖 `backendVerify.timeout`。
  - 新增两个 i18n 键：`loading` 与 `slider_hint`。loading 态现在在渐变背景上显示 `loading` 文案；滑块条显示 `slider_hint` 文案。
- **Flutter** —— 从客户端生成/验证切换为**后端模式**。`CaptchaGenerator` 与 `lib/src/renderers/*` 已移除。新增 `BackendConfig { getCaptcha, verify, headers?, timeout? }`，组件通过你的后端取图并验证。Popup 成功后自动关闭（500 ms），失败后自动刷新（800 ms）；新增 `onError` 回调。
- **Android** —— `CaptchaDialog` 新增 `title` prop（自定义弹窗标题；为空时回退到 `popup_title` 本地化键）。
- **iOS** —— 除三端通用项外无额外 API 变更。

原生包名不变（Flutter `captcha_pro`、Android `captcha-sdk` / `captcha-compose`、iOS `CaptchaPro`）——仅版本号升至 `2.0.0`。详见[原生平台指南](/zh/platforms/native)。

## 未变更的内容

- **组件 props、事件、方法**：Web 框架的 `SliderCaptcha`、`ClickCaptcha`、`PopupCaptcha`、`InvisibleCaptcha` 公开接口与 v1 兼容。
- **验证模式**：前端模式与后端模式行为与之前一致。
- **安全模型**：AES-256-GCM 加密、nonce 防重放、时间戳校验、限流、IP 黑名单、暴力破解防护均不变。

## 升级清单

- [ ] 在 `package.json` 中改包名（并 `pnpm` / `npm` / `yarn` install）
- [ ] 更新所有 `import` / `require` 路径到 `@captcha-pro/*`
- [ ] 小程序：用按平台专用包替换 `captcha-pro-mp`
- [ ] 更新 CDN `<script src>` 与 badge 地址
- [ ] 原生：移除 `timestamp` / `precision` 用法；复核超时；Flutter 切到后端模式
- [ ] 构建通过、测试通过

遇到问题？在 [GitHub](https://github.com/saqqdy/captcha-pro/issues) 提 issue。
