# Taro Vue 2 验证码示例

Taro + Vue 2 示例项目，演示 @captcha-pro/taro-vue2 组件（仅后端模式）。

## 重要：仅后端模式

Taro 验证码组件仅支持后端验证。所有验证码图片由后端 API 提供。

## 快速开始

```bash
# Install dependencies
pnpm install

# Development - WeChat mini-program
pnpm dev:weapp

# Development - H5
pnpm dev:h5

# Development - Alipay mini-program
pnpm dev:alipay
```

在微信开发者工具中打开 `dist/` 目录以预览小程序。

## 后端配置

在页面中配置后端 API：

```vue
<template>
  <SliderCaptcha
    :backend="backendConfig"
    :width="300"
    :height="170"
    @success="onSuccess"
  />
</template>

<script>
import { SliderCaptcha } from '@captcha-pro/taro-vue2'

export default {
  components: { SliderCaptcha },
  data() {
    return {
      backendConfig: {
        getCaptcha: 'https://your-api.com/captcha/get',
        verify: 'https://your-api.com/captcha/verify',
        timeout: 10000,
      },
    }
  },
  methods: {
    onSuccess() {
      console.log('Passed!')
    },
  },
}
</script>
```

## 项目结构

```
src/
├── app.config.ts        # App configuration
├── app.vue              # App entry
├── app.scss             # Global styles
├── pages/
│   ├── index/           # Home page
│   ├── slider/          # Slider captcha demo
│   └── click/           # Click captcha demo
└── components/          # Shared components
```

## 演示的组件

### SliderCaptcha

```vue
<SliderCaptcha
  :backend="backendConfig"
  :width="300"
  :height="170"
  :slider-width="42"
  :slider-height="42"
  :show-refresh="true"
  @success="handleSuccess"
  @fail="handleFail"
/>
```

### ClickCaptcha

```vue
<ClickCaptcha
  :backend="backendConfig"
  :width="300"
  :height="170"
  :show-refresh="true"
  @success="handleSuccess"
/>
```

### PopupCaptcha

```vue
<template>
  <view>
    <button @click="showPopup">Verify</button>
    <PopupCaptcha
      ref="popupRef"
      type="slider"
      :backend="backendConfig"
      @success="handleSuccess"
    />
  </view>
</template>

<script>
export default {
  methods: {
    showPopup() {
      this.$refs.popupRef.show()
    },
  },
}
</script>
```

## 后端服务器

启动演示后端服务器：

```bash
# From project root
cd server/node
pnpm install
pnpm dev
```

将 `backendConfig` 指向 `http://localhost:3001/api/captcha`

## 构建

```bash
# Build for WeChat mini-program
pnpm build:weapp

# Build for H5
pnpm build:h5
```

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
cd /你的路径/captcha-pro/examples/taro-vue2
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

选 **`examples/taro-vue2/dist`** 文件夹（这是第 2 步编译出来的产物目录）。

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
