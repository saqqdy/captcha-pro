# 图标统一迁移方案

## 背景

当前各包图标渲染方式不统一，导致跨平台视觉不一致：

| 包 | 图标方式 | 问题 |
|---|---------|------|
| core | `innerHTML` 注入 Material Design SVG 字符串（18 处） | SVG 字符串硬编码在 JS 中，颜色通过 `fill` 属性控制 |
| mp/taro | Unicode 符号 `⟳` `→` `×`（4 处） | 不同平台/字体渲染落差大（微信圆体 vs 安卓方体） |
| mp/uniapp | Unicode 符号 `⟳` `→`（3 处） | 同上 |

**目标**：统一图标方案，彻底消除 Unicode 符号和内联 SVG，所有平台视觉一致。

---

## 方案选型：为什么不选 UnoCSS

### UnoCSS mask-image 模式的小程序兼容性问题

| 问题 | 来源 |
|------|------|
| iOS 真机 `mask-image` 无效 | [微信社区反馈](https://developers.weixin.qq.com/community/develop/doc/00020a479303b834c20c7682151c00) |
| Skyline 渲染器下 `mask-image` + SVG data URI 颜色异常 | [2025年3月仍存在](https://developers.weixin.qq.com/community/develop/doc/000e8cab0104208551139eb566200) |
| Taro 通过 `:style` 动态赋值 `-webkit-mask-image` 被框架过滤 | [Taro #9198](https://github.com/NervJS/taro/issues/9198) |
| uni-app CSS `background-image` 引用 SVG 不自动转 base64 | [uni-app #5089](https://github.com/dcloudio/uni-app/issues/5089) |

**主流小程序 UI 库的选择：**

| 库 | 图标方案 |
|----|---------|
| Vant Weapp | iconfont 字体图标 |
| NutUI | iconfont 字体图标（"小程序下图标只能采用 iconfont 方案"） |
| Taro UI | iconfont 字体图标 |

**结论：小程序端图标行业标准是 iconfont 字体图标，不是 CSS mask-image。应按平台分治。**

---

## 最终方案：按平台分治

| 平台 | 图标方案 | 理由 |
|------|---------|------|
| **core (web)** | 共享 SVG 常量 + `innerHTML` | 零新增依赖，仅重构提取常量消除重复 |
| **mp/taro + mp/uniapp** | **iconfont 自定义字体** | 全平台兼容，`color` / `font-size` 控制，行业标准 |

---

## 图标映射表（5 个图标）

| 用途 | iconfont 字体类名 | Unicode 码位 | SVG path 头 |
|------|-------------------|-------------|------------|
| 刷新 | `ci-refresh` | `\e001` | `M17.65 6.35...` |
| 播放/箭头 | `ci-play` | `\e002` | `M8 5v14l11-7z` |
| 成功 | `ci-check` | `\e003` | `M9 16.17...` |
| 关闭/失败 | `ci-close` | `\e004` | `M19 6.41...` |
| 信息/错误 | `ci-info` | `\e005` | `M12 2C6.48...` |

---

## Step 1: 新建共享图标常量

**新建** `packages/core/src/icons.ts`

```ts
/**
 * Shared icon data — single source of truth for all packages.
 *
 * - ICON_PATHS: used by core (web) to render inline SVG via innerHTML
 * - ICON_NAMES: used by mp (mini-program) as iconfont class suffix
 */

/** SVG path data (Material Design) */
export const ICON_PATHS = {
	refresh: 'M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z',
	play:    'M8 5v14l11-7z',
	check:   'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z',
	close:   'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z',
	info:    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
} as const

export type IconName = keyof typeof ICON_PATHS

/** Build an inline SVG string for web (core) */
export function iconSVG(name: IconName, fill: string, size = 20): string {
	return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path fill="${fill}" d="${ICON_PATHS[name]}"/></svg>`
}

/** Iconfont class names for mini-program (mp) */
export const ICON_CLASSES = {
	refresh: 'ci-refresh',
	play:    'ci-play',
	check:   'ci-check',
	close:   'ci-close',
	info:    'ci-info',
} as const
```

---

## Step 2: core 包 — 重构 SVG 常量提取

### 2.1 无需新增依赖

core 包当前方案（inline SVG）在 web 端表现完美，只需将硬编码的 SVG 字符串提取为常量引用，消除重复。

### 2.2 重构 slider.ts（10 处 innerHTML）

**添加 import：**

```ts
import { iconSVG, ICON_PATHS } from './icons'
```

**替换模式：**

```ts
// Before:
refreshBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="#666" d="M17.65 6.35..."/></svg>'

// After:
refreshBtn.innerHTML = iconSVG('refresh', '#666', 16)
```

```ts
// Before:
this.sliderBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style="pointer-events: none;"><path fill="#1991fa" d="M8 5v14l11-7z"/></svg>'

// After:
this.sliderBtn.innerHTML = iconSVG('play', '#1991fa', 20)
```

**所有状态切换同理：**

| 场景 | 替换 |
|------|------|
| 拖拽开始 | `iconSVG('play', '#fff', 20)` |
| 验证成功 | `iconSVG('check', '#fff', 20)` |
| 验证失败 | `iconSVG('close', '#fff', 20)` |
| 重置 | `iconSVG('play', '#1991fa', 20)` |
| 状态覆盖层-成功 | `iconSVG('check', '#fff', 14)` |
| 状态覆盖层-信息 | `iconSVG('info', '#fff', 14)` |
| 状态覆盖层-失败 | `iconSVG('close', '#fff', 14)` |

### 2.3 重构 click.ts（6 处 innerHTML）

同 slider.ts 模式：

| 行号 | 用途 | 替换 |
|-----|------|------|
| ~309 | 刷新按钮 | `iconSVG('refresh', '#666', 16)` |
| ~705 | 成功覆盖层 | `iconSVG('check', '#fff', 14)` |
| ~719 | 信息覆盖层 | `iconSVG('info', '#fff', 14)` |
| ~733 | 失败覆盖层 | `iconSVG('close', '#fff', 14)` |

### 2.4 重构 popup.ts（2 处 innerHTML）

```ts
// Before:
closeBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41..."/></svg>'

// After:
closeBtn.innerHTML = iconSVG('close', '#999', 16)
```

---

## Step 3: mp 包 — iconfont 字体图标

### 3.1 生成自定义字体文件

只需 5 个图标，生成一个极小的字体文件（~2KB）。推荐两种方式：

**方式 A：iconfont.cn（手动，简单可靠）**

1. 登录 [iconfont.cn](https://www.iconfont.cn/)
2. 搜索并添加 5 个图标：`refresh` `play` `check` `close` `info`
3. 创建项目，设置 fontClass 前缀为 `ci-`
4. 下载字体包，取其中的 `iconfont.ttf` 和 `iconfont.css`

**方式 B：自动化脚本（推荐，可重复）**

使用 [svg2font](https://github.com/nicedoc/svg2font) 或 [fantasticon](https://github.com/tancredi/fantasticon) 从 SVG 自动生成：

```bash
# 使用 fantasticon
pnpm add -D fantasticon
npx fantasticon -c fantasticonrc.json
```

`fantasticonrc.json`:

```json
{
  "inputDir": "./packages/mp/src/assets/icons",
  "outputDir": "./packages/mp/src/assets/iconfont",
  "name": "captcha-icons",
  "prefix": "ci",
  "fonts": ["ttf", "woff2"],
  "formatOptions": { "ttf": {} },
  "assets": { "css": true }
}
```

准备 5 个 SVG 文件放入 `packages/mp/src/assets/icons/`：

```
refresh.svg  play.svg  check.svg  close.svg  info.svg
```

SVG 内容即 `icons.ts` 中的 path 加上标准 SVG 外壳：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M17.65 6.35..."/>
</svg>
```

### 3.2 新建 `packages/mp/src/assets/iconfont/captcha-icons.css`

```css
@font-face {
  font-family: 'captcha-icons';
  src: url('captcha-icons.woff2') format('woff2'),
       url('captcha-icons.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* 基类 */
.ci {
  font-family: 'captcha-icons' !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
}

/* 各图标 — Unicode 码位由 fantasticon 自动分配，以下为示例 */
.ci-refresh::before { content: '\e001'; }
.ci-play::before    { content: '\e002'; }
.ci-check::before   { content: '\e003'; }
.ci-close::before   { content: '\e004'; }
.ci-info::before    { content: '\e005'; }
```

> **重要**：小程序不支持本地字体文件路径引用，必须将字体文件转为 **base64 内嵌** 或使用 **远程 CDN URL**。推荐 base64 内嵌（约 2KB），无网络依赖。
>
> fantasticon 可通过 `cssSelector: 'class'` 和 `baseSelector: '.ci'` 自动生成此 CSS 文件。

### 3.3 在组件中引入字体 CSS

**mp/taro 组件：在 `captcha.scss` 顶部添加**

```scss
@import '../../assets/iconfont/captcha-icons.css';
```

**mp/uniapp 组件：在每个组件 `<style>` 中添加**

```vue
<style scoped>
@import '../../assets/iconfont/captcha-icons.css';
/* 组件原有样式 */
</style>
```

### 3.4 修改 Taro 组件

**SliderCaptcha.tsx：**

```tsx
// 刷新按钮（~line 193）
// Before: <Text className="refresh-icon">⟳</Text>
// After:  <Text className="ci ci-refresh refresh-icon" />

// 提示文本箭头（~line 212）
// Before: <Text>→ 按住滑块，拖动完成验证</Text>
// After:  <Text className="ci ci-play slider-hint-icon" /> <Text>按住滑块，拖动完成验证</Text>

// 滑块箭头（~line 227）
// Before: <Text className="slider-arrow">→</Text>
// After:  <Text className="ci ci-play slider-arrow" />
```

**ClickCaptcha.tsx：**

```tsx
// 刷新按钮（~line 199）
// Before: <Text className="refresh-icon">⟳</Text>
// After:  <Text className="ci ci-refresh refresh-icon" />

// 状态图标（~line 206）— 替换文字为图标
// Before: <Text className="status-text">{status === 'success' ? '验证成功' : '验证失败'}</Text>
// After:  <Text className={`ci ${status === 'success' ? 'ci-check' : 'ci-close'} status-icon`} />
//        <Text className="status-text">{status === 'success' ? '验证成功' : '验证失败'}</Text>
```

**PopupCaptcha.tsx：**

```tsx
// 关闭按钮（~line 84）
// Before: <Text style={{ fontSize: '40rpx', color: '#999', lineHeight: 1 }}>×</Text>
// After:  <Text className="ci ci-close popup-close-icon" />
```

### 3.5 修改 UniApp 组件

**slider-captcha.vue：**

```vue
<!-- Before: <text class="refresh-icon">⟳</text> -->
<!-- After:  <text class="ci ci-refresh refresh-icon" /> -->

<!-- Before: <text class="slider-arrow">→</text> -->
<!-- After:  <text class="ci ci-play slider-arrow" /> -->
```

**click-captcha.vue：**

```vue
<!-- Before: <text class="refresh-icon">⟳</text> -->
<!-- After:  <text class="ci ci-refresh refresh-icon" /> -->
```

### 3.6 修改样式 `captcha.scss`

```scss
/* 删除 font-weight: bold（字体图标不需要） */
.refresh-icon {
  color: #666;
  font-size: 28rpx;
  /* 删除: font-weight: bold; */
}

.slider-arrow {
  font-size: 36rpx;
  color: #fff;
  /* 删除: font-weight: bold; */
}

/* 新增 */
.slider-hint-icon {
  font-size: 24rpx;
  color: #999;
  margin-right: 8rpx;
}

.popup-close-icon {
  font-size: 32rpx;
  color: #999;
}

.status-icon {
  font-size: 36rpx;
  color: #fff;
  margin-right: 12rpx;
}

.status-overlay.success .status-icon {
  color: #52c41a;
}

.status-overlay.fail .status-icon {
  color: #ff4d4f;
}
```

---

## Step 4: React / Vue3 / Vue2 包

这三个包将 DOM 渲染完全委托给 core，自身不做图标渲染。

**无需代码改动。**

确认点：
- core 的 `dist/style.css` 包含图标 SVG（Step 2 保证）
- React 包的 `copyCoreCss` Vite 插件会自动复制最新 CSS
- turbo 的 `^build` 依赖保证了 core 先于 wrapper 构建

---

## 文件变更汇总

### 新建文件（3 个）

| 文件 | 用途 |
|------|------|
| `packages/core/src/icons.ts` | 共享图标常量（SVG path + iconfont class 名） |
| `packages/mp/src/assets/icons/*.svg` | 5 个 SVG 源文件（供 fantasticon 生成字体） |
| `packages/mp/src/assets/iconfont/*` | 生成的字体文件 + CSS（captcha-icons.css, .ttf, .woff2） |

### 依赖变更（1 个 package.json）

| 包 | 新增 devDependencies |
|---|---------------------|
| `packages/mp` | `fantasticon`（仅构建时使用，不进入产物） |

构建命令新增：

```jsonc
// packages/mp/package.json scripts
{
  "build:iconfont": "fantasticon -c fantasticonrc.json"
}
```

### 源码变更（9 个文件）

| 文件 | 变更数 | 说明 |
|------|--------|------|
| `packages/core/src/slider.ts` | 10 处 | 硬编码 SVG → `iconSVG()` 函数调用 |
| `packages/core/src/click.ts` | 4 处 | 同上 |
| `packages/core/src/popup.ts` | 1 处 | 同上 |
| `packages/mp/src/taro/components/SliderCaptcha.tsx` | 3 处 | Unicode → iconfont class |
| `packages/mp/src/taro/components/ClickCaptcha.tsx` | 2 处 | 同上 |
| `packages/mp/src/taro/components/PopupCaptcha.tsx` | 1 处 | 同上 |
| `packages/mp/src/taro/styles/captcha.scss` | ~15 行 | 删除 font-weight，新增 iconfont 引用和图标样式 |
| `packages/mp/src/uniapp/components/slider-captcha.vue` | 2 处 | Unicode → iconfont class |
| `packages/mp/src/uniapp/components/click-captcha.vue` | 1 处 | 同上 |

### 无需改动（3 个包）

- `packages/react` — 委托 core 渲染，自动复制 CSS
- `packages/vue3` — 委托 core 渲染，自动复制 CSS
- `packages/vue2` — 委托 core 渲染，自动复制 CSS

---

## 字体文件 base64 内嵌（小程序必需）

小程序不支持 CSS 中 `url('./xxx.ttf')` 本地字体路径引用。字体文件必须内嵌为 base64：

```css
@font-face {
  font-family: 'captcha-icons';
  src: url('data:font/truetype;base64,AAEAAAALAIAAA...') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

fantasticon 生成后，用以下脚本将 ttf 转 base64：

```bash
# 在 packages/mp 目录下运行
base64 -i src/assets/iconfont/captcha-icons.ttf -o /dev/stdout | tr -d '\n' > src/assets/iconfont/captcha-icons.base64.txt
```

然后替换 CSS 中的 `url('captcha-icons.ttf')` 为 `url('data:font/truetype;base64,<base64内容>')`。

也可通过 fantasticon 的 `templates` 选项直接生成 base64 版 CSS。

---

## 验证步骤

### 1. core 构建

```bash
pnpm build:core
# 确认构建成功，无报错
```

### 2. core 测试

```bash
pnpm --filter @captcha-pro/core test
# 如有断言检查 innerHTML 中的完整 SVG 字符串，需更新为检查 iconSVG() 输出
```

### 3. mp 字体生成

```bash
cd packages/mp && pnpm build:iconfont
# 确认 src/assets/iconfont/ 下生成了 captcha-icons.css, .ttf, .woff2
# 确认 CSS 中字体路径为 base64 内嵌
```

### 4. mp 构建

```bash
pnpm build:mp
# 确认构建成功
```

### 5. E2E（Taro 示例）

```bash
cd examples/taro
pnpm dev:weapp    # 微信开发者工具：刷新图标、滑块箭头、关闭按钮、成功/失败图标
pnpm dev:h5       # 浏览器：所有图标渲染一致
```

### 6. 颜色继承核对

| 图标 | 场景 | 期望颜色 |
|------|------|---------|
| `ci-refresh` | 刷新按钮 | `#666` |
| `ci-play` | 滑块默认 | `#1991fa` |
| `ci-play` | 滑块拖拽中 | `#fff` |
| `ci-check` | 验证成功 | `#52c41a` |
| `ci-close` | 验证失败 | `#ff4d4f` |
| `ci-close` | 弹窗关闭 | `#999` |
| `ci-info` | 信息/错误 | `#faad14` |

---

## 风险与注意事项

1. **字体文件 base64 大小**：5 个图标的 ttf 约 2KB，base64 编码后约 2.7KB 嵌入 CSS，体积可忽略
2. **fantasticon 版本**：建议使用 `fantasticon@2` 稳定版，`@3` 仍是 beta
3. **uniapp 样式隔离**：uniapp 组件的 `<style scoped>` 可能影响 `@font-face` 加载，需确认在目标平台测试
4. **新增构建步骤**：`build:iconfont` 仅在图标变化时需手动执行，不需要纳入每次构建流程
5. **core 包零新增依赖**：方案对 core 仅做代码重构，不引入任何新依赖，保持零副作用

---

## 与 UnoCSS 方案对比

| 维度 | UnoCSS mask 方案 | **iconfont 分治方案** |
|------|-----------------|---------------------|
| 小程序兼容性 | ❌ iOS/Skyline 有 bug | ✅ 100% 兼容 |
| 颜色控制 | 理论上 `color` 控制 | ✅ `color` 控制 |
| 新增依赖 | unocss + @iconify-json/mdi (~2MB) | ✅ fantasticon (~200KB, 仅 dev) |
| core 改动量 | 大（sliderIcon 子元素重构） | ✅ 小（仅提取常量） |
| 构建复杂度 | 增加 UnoCSS CLI/Vite 插件 | ✅ 一次生成字体文件，直接引用 |
| 行业验证 | 无主流小程序库采用 | ✅ Vant/NutUI/Taro UI 均采用 |
