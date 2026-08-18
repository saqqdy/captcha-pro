# React 验证码示例

React 示例项目，演示 @captcha-pro/react 组件。

## 快速开始

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

应用运行在 `http://localhost:5173`

## 演示的特性

- **SliderCaptcha** - 拖动滑块完成验证
- **ClickCaptcha** - 按顺序点选文字
- **PopupCaptcha** - 验证码弹窗封装
- **InvisibleCaptcha** - 基于风控的无感验证
- **后端验证** - 服务端验证演示
- **自定义图片** - 使用自定义背景/滑块图片
- **暗色模式** - 自动跟随系统主题（v2.3.0+）

## 项目结构

```
src/
├── App.tsx              # Main app with tab navigation
├── main.tsx             # Entry point
├── pages/
│   ├── ClickDemo.tsx    # Click captcha demo
│   ├── SliderDemo.tsx   # Slider captcha demo
│   ├── PopupDemo.tsx    # Popup captcha demo
│   ├── InvisibleDemo.tsx # Invisible captcha demo
│   ├── BackendDemo.tsx  # Backend verification demo
│   └── CustomImageDemo.tsx # Custom image demo
├── components/
│   ├── Header.tsx       # App header
│   ├── Footer.tsx       # App footer
│   ├── Features.tsx     # Feature list
│   └── TabNav.tsx       # Tab navigation
└── hooks/
    └── useLocale.tsx    # i18n hook
```

## 使用示例

### 基础滑动拼图验证码

```tsx
import { SliderCaptcha } from '@captcha-pro/react'

function Demo() {
  return (
    <SliderCaptcha
      width={300}
      height={170}
      onSuccess={() => console.log('Passed!')}
      onFail={() => console.log('Failed')}
    />
  )
}
```

### 点选文字验证码

```tsx
import { ClickCaptcha } from '@captcha-pro/react'

function Demo() {
  return (
    <ClickCaptcha
      width={300}
      height={170}
      count={3}
      onSuccess={() => console.log('Passed!')}
    />
  )
}
```

### 弹窗验证码

```tsx
import { PopupCaptcha } from '@captcha-pro/react'

function Demo() {
  return (
    <PopupCaptcha
      trigger="#submit-btn"
      type="slider"
      onSuccess={() => console.log('Passed!')}
    >
      <button id="submit-btn">Submit</button>
    </PopupCaptcha>
  )
}
```

### 后端验证

```tsx
import { SliderCaptcha } from '@captcha-pro/react'

function Demo() {
  return (
    <SliderCaptcha
      verifyMode="backend"
      backendVerify={{
        getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
        verify: 'http://localhost:3001/api/captcha/verify',
      }}
      onSuccess={() => console.log('Backend verified!')}
    />
  )
}
```

## 后端服务器

要测试后端验证，请启动演示服务器：

```bash
# From project root
cd server/node
pnpm install
pnpm dev
```

服务器运行在 `http://localhost:3001`

## 构建

```bash
pnpm build
```

## 许可证

MIT

## 运行与验证指南（零基础也能跟着做）

这份指南面向完全不会编程的朋友，一步一步教你把验证码示例跑起来。

### 1. 需要装什么软件

#### 1.1 安装 Node.js 18 LTS

Node.js 是运行 JavaScript 代码的基础环境，必须先装它。

1. 用浏览器打开 Node.js 官网：https://nodejs.org
2. 在首页找到 **LTS**（长期支持版）按钮，点击下载。网站会自动识别你的系统，直接下对应的安装包就行。
   - **Windows**：下载 `.msi` 文件，双击运行，一路点「下一步」直到安装完成。
   - **macOS**：下载 `.pkg` 文件，双击运行，按提示安装。
3. 装完后需要验证一下——看下一步。

#### 1.2 安装 pnpm

pnpm 是一个包管理工具，用来下载项目需要的代码库。

1. 先打开终端（Terminal）：
   - **Windows**：按键盘上的 `Win` 键，输入 `PowerShell`，回车打开。
   - **macOS**：打开「启动台」→「其他」→「终端」，或在聚焦搜索里输入 `Terminal` 回车。
2. 在终端里输入下面这行命令，然后按回车：
   ```bash
   npm install -g pnpm
   ```
   等几秒钟就装好了。终端会显示一些文字，没有红色的报错信息就行。
3. 验证是否装好：依次输入下面两条命令：
   ```bash
   node -v
   pnpm -v
   ```
   如果分别显示类似 `v18.19.0` 和 `9.x.x` 的版本号，说明两个都装好了。如果提示 `command not found`，说明没装成功，回上面重做一遍。

### 2. 怎么打开项目

终端里有个「当前在哪个文件夹」的概念，就像资源管理器里你正打开着某个文件夹。我们需要让终端进入项目目录，才能在里面运行命令。

假设你把 captcha-pro 项目下载到了「下载」文件夹：

**macOS**：
```bash
cd ~/Downloads/captcha-pro/examples/react
```

**Windows**（路径用反斜杠）：
```cmd
cd %USERPROFILE%\Downloads\captcha-pro\examples\react
```

> 把路径换成你实际存放的位置。如果不确定路径：
> - **macOS**：打开 Finder 找到 `examples/react` 文件夹，直接把它拖进终端窗口，终端会自动填上路径，在路径最前面手动加上 `cd ` 再回车就行。
> - **Windows**：在文件夹地址栏点一下，复制完整路径，粘贴到 `cd ` 后面。

### 3. 怎么起服务（运行）

#### 3.1 安装依赖（第一次运行才需要）

在终端里输入：
```bash
pnpm install
```

这条命令会自动下载项目需要的所有代码库。第一次运行会比较慢，可能要几分钟，终端里会跑一堆文字和进度条。等它跑完、出现新的命令行提示符（可以输入新命令的状态）就行。

> 如果中途网络不好导致报错，删掉 `node_modules` 文件夹后重新 `pnpm install` 即可。

#### 3.2 启动开发服务

在终端里输入：
```bash
pnpm dev
```

终端会输出一些信息，其中会包含一个本地网址，类似：
```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
```

看到 `http://localhost:5173/`（端口号以你终端里实际显示的为准）就说明服务启动成功了。

> **注意**：不要关闭这个终端窗口！关了服务就停了。要停止服务，在终端里按 `Ctrl + C`。

### 4. 怎么打开看效果

1. 打开浏览器（Chrome、Edge、Safari 都行）。
2. 把终端里显示的网址（比如 `http://localhost:5173/`）复制到浏览器地址栏，按回车。
3. 页面打开后，能看到验证码组件出现在页面上——滑动拼图、点选文字等，可以试着操作一下，说明一切正常！

### 5. 怎么构建产物

如果你需要把项目部署到服务器上，需要先构建生产产物：

```bash
pnpm build
```

构建完成后，项目目录下会多出一个 `dist/` 文件夹。里面就是可以直接部署的网页文件（`index.html` 加上打包好的 `js`、`css` 等）。

**查看构建效果**有两种方式：

- **方式一**：直接双击 `dist/index.html` 用浏览器打开（注意：部分功能可能受限）。
- **方式二**（推荐）：用预览命令：
  ```bash
  pnpm preview
  ```
  终端会显示一个预览地址（如 `http://localhost:4173/`），用浏览器打开即可完整查看。

### 6. 怎么验证成功 / 常见报错

| 现象 | 说明 | 怎么解决 |
|------|------|----------|
| 终端显示 `http://localhost:5173/` | 服务启动成功 | 把这个地址复制到浏览器打开 |
| 浏览器里看到验证码组件 | 大功告成！ | 可以开始操作验证码了 |
| `command not found: pnpm` | 没装好 pnpm | 回到第 1 步重装 pnpm |
| `command not found: node` | 没装好 Node.js | 回到第 1 步装 Node.js |
| `EADDRINUSE` 或 `address already in use` | 端口被占用了 | 可能有别的程序在用这个端口。关掉其他开发服务，或者换端口 |
| `pnpm install` 报错 `ERR_` 开头 | 依赖安装失败 | 检查网络是否正常，删除 `node_modules` 后重试 |
| 浏览器打开是空白页 | 服务可能没启动成功 | 回到终端看看有没有报错信息 |

### 7. 后端验证演示

本项目包含后端验证演示页面（BackendDemo），可以体验完整的前后端验证流程。要测试这个功能：

1. **新开一个终端窗口**（不要关掉正在运行的前端服务）。
2. 进入后端服务目录并启动：
   ```bash
   # 从 examples/react 目录出发
   cd ../../server/node
   pnpm install
   pnpm dev
   ```
3. 后端服务启动后会运行在 `http://localhost:3001`。
4. 回到浏览器，在演示页面里切换到「后端验证」标签，即可体验。
5. 更多说明详见 `server/node/README_CN.md`。
