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

## 运行与验证指南（零基础也能跟着做）

这份指南面向完全不会编程的朋友。只要跟着步骤一步步做，就能在电脑上把验证码示例跑起来看到效果。

### 1. 需要装什么软件

一共要装三样东西，装好一次以后就不用再装了。

#### 1.1 Node.js 18 LTS

Node.js 是运行和编译代码的基础工具。

1. 打开 Node.js 官网：https://nodejs.org
2. 页面上有两个大按钮，选左边写着 **LTS（长期支持版）** 的那个，不要选 Current。
3. 下载后双击安装包，一路点「下一步」就行，不用改任何选项。
4. 验证安装：打开「终端」（Mac 在「启动台」搜 Terminal，Windows 在开始菜单搜 cmd），输入 `node -v` 回车，如果显示 `v18.x.x` 说明装好了。

#### 1.2 pnpm（包管理器）

pnpm 用来下载项目需要的依赖包。

1. 打开终端
2. 输入下面的命令并回车：

   ```bash
   npm install -g pnpm
   ```

3. 等几秒钟装完，输入 `pnpm -v`，显示版本号就成功了。

#### 1.3 微信开发者工具（核心，必装）

这是打开和预览微信小程序的官方工具，所有示例最终都要用它来看效果。

1. 打开下载页：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 按你的电脑系统选「稳定版 Stable Build」：
   - **macOS**：下载 .dmg，打开后把「微信开发者工具」图标拖进 Applications 文件夹
   - **Windows**：下载 .exe，双击安装，一路下一步
3. 装完打开，首次会弹出登录窗口，用手机微信扫二维码登录。
4. 登录后会看到项目列表页面（空的就是正常的）。

### 2. 怎么编译小程序代码

Taro 写的代码不能直接被微信开发者工具读取，需要先编译成微信小程序格式。

#### 2.1 进入项目目录

打开终端，输入（把路径换成你电脑上 captcha-pro 的实际位置）：

```bash
cd /你的路径/captcha-pro/examples/taro-vue
```

#### 2.2 安装依赖

```bash
pnpm install
```

等待安装完成（可能要一两分钟）。

#### 2.3 编译成微信小程序

```bash
pnpm dev:weapp
```

> `dev:weapp` 是 package.json 里定义好的命令，`weapp` 就是微信小程序的意思。

跑完后终端会显示编译成功，代码已经编译好放在 `dist/` 文件夹里了。**这个终端窗口不要关**，它会持续监听代码变化、自动重新编译。

### 3. 怎么用微信开发者工具打开/预览

#### 3.1 导入项目

1. 打开「微信开发者工具」
2. 点左上角的「+」号（或「导入项目」）
3. 在弹窗里填写：
   - **目录**：点「选择」按钮，选下面第 3.2 步说的那个文件夹
   - **AppID**：如果你有微信小程序 AppID 就填；没有就点下拉选「测试号」
   - **项目名称**：随便填，比如「验证码示例」
4. 点「确定」或「导入」

#### 3.2 选哪个目录？

选 **`examples/taro-vue/dist`** 文件夹（这是第 2 步编译出来的产物目录）。

#### 3.3 看到界面

导入后开发者工具会自动编译，左边「模拟器」区域会出现小程序界面。如果你看到验证码组件（滑块或文字点击），说明已经跑起来了！

#### 3.4 真机预览（可选）

想在手机上看？点开发者工具上方的「预览」按钮，会生成一个二维码，用手机微信扫码就能在手机上打开小程序。

### 4. 怎么验证成功

导入完成后，看左边模拟器：

- 能看到验证码图片、滑块或文字 → **成功了！**
- 能拖动滑块、点击文字完成验证 → **完全正常！**

如果模拟器是白屏或报错，看下面「常见报错」。

### 5. 常见报错

| 报错 / 现象 | 原因 | 解决办法 |
|------------|------|---------|
| `pnpm: command not found` | 没装 pnpm | 回到第 1.2 步装 pnpm |
| 导入后提示「找不到 app.json」 | 目录选错了 | 按第 3.2 步重选正确的目录 |
| 模拟器白屏，Console 有红色错误 | 代码有问题 | 看开发者工具底部「Console」面板的错误信息 |
| `dist` 文件夹不存在 | 第 2 步没跑或跑失败了 | 回到第 2 步重新执行编译命令 |
| 编译失败 / 端口被占用 | 可能有另一个终端在跑 | 关掉其他终端窗口，重新跑编译命令 |