# Taro + Vue 3 验证码示例

Taro + Vue 3 验证码示例项目，使用 `@captcha-pro/taro-vue` 组件。

> **重要说明：** 本示例仅支持后端验证模式。所有验证码图片均由后端 API 提供，`backend` 配置为必填项。

## 快速开始

### 1. 安装依赖

```bash
# 在项目根目录安装
pnpm install
```

### 2. 构建组件包

```bash
# 先构建 @captcha-pro/taro-vue 组件包
pnpm build:taro-vue
```

### 3. 运行开发环境

```bash
# 微信小程序
pnpm dev:weapp

# H5
pnpm dev:h5

# 支付宝小程序
pnpm dev:alipay

# 其他平台: swan, tt, qq, jd
```

### 4. 预览

- **微信小程序**：在微信开发者工具中打开项目
- **H5**：浏览器访问 `http://localhost:10086`
- **其他平台**：按照各平台说明操作

## 后端配置（必填）

所有组件都需要配置 `backend` 属性：

```vue
<script setup>
const backendConfig = {
  getCaptcha: 'https://your-api.com/captcha/get',
  verify: 'https://your-api.com/captcha/verify',
  timeout: 10000,
}
</script>

<template>
  <SliderCaptcha
    :backend="backendConfig"
    @success="onSuccess"
  />
</template>
```

### 后端配置项

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| getCaptcha | `string \| function` | 是 | 获取验证码的 URL 或自定义函数 |
| verify | `string \| function` | 是 | 验证验证码的 URL 或自定义函数 |
| headers | `Record<string, string>` | 否 | 请求头 |
| timeout | `number` | 否 | 超时时间（ms），默认 10000 |

## 示例页面

本示例包含多个页面，展示不同类型的验证码：

### 点击验证码演示（`/pages/click`）

点击验证码示例。

### 滑块验证码演示（`/pages/slider`）

滑块拼图验证码示例。

### 弹出验证码演示（`/pages/popup`）

弹出验证码示例，支持滑块和点击两种模式。

## 目录结构

```
examples/taro-vue/
├── src/
│   ├── app.config.ts    # 应用配置
│   ├── app.scss         # 全局样式
│   ├── app.ts           # 应用入口
│   └── pages/
│       ├── click/       # 点击验证码演示
│       ├── slider/      # 滑块验证码演示
│       └── popup/       # 弹出验证码演示
├── config/              # Taro 构建配置
├── package.json
└── project.config.json  # 微信小程序配置
```

## 平台支持

| 平台 | 命令 | 说明 |
|------|------|------|
| 微信 | `pnpm dev:weapp` | 推荐 |
| H5 | `pnpm dev:h5` | 浏览器 |
| 支付宝 | `pnpm dev:alipay` | 支付宝小程序 |
| 字节跳动 | `pnpm dev:tt` | 抖音/今日头条 |
| 百度 | `pnpm dev:swan` | 百度小程序 |
| QQ | `pnpm dev:qq` | QQ 小程序 |
| 京东 | `pnpm dev:jd` | 京东小程序 |

## 参考资料

- [Taro 文档](https://taro-docs.jd.com/)
- [@captcha-pro/taro-vue 组件包](../../packages/taro-vue/README_CN.md)
- [后端 API 文档](../../server/node/README_CN.md)

## 许可证

MIT