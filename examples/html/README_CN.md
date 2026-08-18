# HTML 验证码示例

Vanilla JavaScript 示例，演示 captcha-pro 核心库的用法。

## 快速开始

### 本地开发

1. 在本地启动文件服务：

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

2. 在浏览器中打开 `http://localhost:8080`

### 在线演示

- [StackBlitz](https://stackblitz.com/github/saqqdy/captcha-pro?file=examples/html/index.html)
- [CodeSandbox](https://codesandbox.io/p/github/saqqdy/captcha-pro/master?file=examples/html/index.html)

## 演示的特性

- **SliderCaptcha** - 拖动滑块验证
- **ClickCaptcha** - 点选文字验证
- **PopupCaptcha** - 弹窗封装组件
- **InvisibleCaptcha** - 基于风控的无感验证
- **后端验证** - 服务端验证
- **自定义图片** - 使用自定义图片
- **IE11 支持** - 通过 polyfill 支持旧版浏览器
- **暗色模式** - 自动跟随系统主题（v2.3.0+）

## 使用

### 基础配置

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/captcha-pro/dist/index.global.min.js"></script>
</head>
<body>
  <div id="captcha"></div>
  <script>
    const captcha = new CaptchaPro.SliderCaptcha({
      el: '#captcha',
      width: 300,
      height: 170,
      onSuccess: () => alert('Passed!')
    })
  </script>
</body>
</html>
```

### 点选文字验证码

```html
<div id="click-captcha"></div>
<script>
  const clickCaptcha = new CaptchaPro.ClickCaptcha({
    el: '#click-captcha',
    width: 300,
    height: 170,
    count: 3,
    onSuccess: () => alert('Passed!')
  })
</script>
```

### 弹窗验证码

```html
<button id="submit-btn">Submit</button>
<script>
  const popup = new CaptchaPro.PopupCaptcha({
    trigger: '#submit-btn',
    type: 'slider',
    captchaOptions: {
      width: 300,
      height: 170
    },
    onSuccess: () => alert('Passed!')
  })
</script>
```

### 后端验证

```html
<script>
  const captcha = new CaptchaPro.SliderCaptcha({
    el: '#captcha',
    verifyMode: 'backend',
    backendVerify: {
      getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
      verify: 'http://localhost:3001/api/captcha/verify'
    },
    onSuccess: () => alert('Backend verified!')
  })
</script>
```

### IE11 支持

```html
<!--[if IE]>
<script src="https://cdn.jsdelivr.net/npm/core-js-bundle/minified.js"></script>
<![endif]-->
<script src="https://unpkg.com/captcha-pro/dist/index.global.min.js"></script>
```

## API 方法

```javascript
// Get captcha data
const data = captcha.getData()
console.log('Target position:', data.target)

// Get statistics
const stats = captcha.getStatistics()
console.log('Success rate:', stats.successRate + '%')

// Reset or refresh
captcha.reset()
captcha.refresh()

// Destroy
captcha.destroy()
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

## 许可证

MIT

## 运行与验证指南（零基础也能跟着做）

这份指南面向完全不会编程的朋友。HTML 示例是最简单的一种——不需要安装任何东西就能直接看。

### 1. 需要装什么软件

**最简单的方式**：只需要一个浏览器（Chrome、Edge、Safari 均可），不需要安装任何额外软件。

如果你想用本地服务器的方式运行（可选），则需要安装 Node.js：

1. 打开 Node.js 官网：https://nodejs.org
2. 下载 **LTS** 版。网站会自动识别你的系统，下载对应安装包：
   - **Windows**：下载 `.msi` 文件，双击安装，一路下一步。
   - **macOS**：下载 `.pkg` 文件，双击安装。
3. 安装完后验证：打开终端，输入 `node -v`，显示版本号就说明装好了。

> 如果你想用 Python 启动本地服务器，需要安装 Python 3（官网 https://python.org）。下载后双击安装即可。

### 2. 怎么打开项目

用 Finder（macOS）或资源管理器（Windows）找到 captcha-pro 项目里的 `examples/html` 文件夹。这个文件夹里有一个 `index.html` 文件，那就是演示页面。

### 3. 怎么运行

HTML 示例有三种运行方式，任选一种即可：

#### 方式一：直接打开（最简单，推荐新手）

双击 `index.html` 文件，它会用你的默认浏览器打开。页面加载完成后就能看到验证码组件了。

> 这种方式最简单，但部分功能（如后端验证）可能无法正常工作。要测后端验证请用方式二或方式三。

#### 方式二：用 Node.js 启动本地服务器（推荐）

1. 打开终端，进入项目目录：
   ```bash
   # macOS
   cd ~/Downloads/captcha-pro/examples/html

   # Windows
   cd %USERPROFILE%\Downloads\captcha-pro\examples\html
   ```
   > 把路径换成你实际存放的位置。macOS 可以直接把 `html` 文件夹拖进终端自动填路径。
2. 运行：
   ```bash
   npx serve .
   ```
3. 终端会显示一个本地地址（如 `http://localhost:3000`），把它复制到浏览器打开即可。

#### 方式三：用 Python 启动本地服务器

1. 打开终端，进入项目目录（同方式二第 1 步）。
2. 运行：
   ```bash
   python -m http.server 8080
   ```
3. 在浏览器里打开 `http://localhost:8080`。

### 4. 怎么打开看效果

用浏览器打开后，页面上会出现各种验证码组件：滑动拼图、点选文字、弹窗验证码等。试着操作一下，能看到交互响应就说明成功了。

### 5. 怎么构建产物

HTML 示例不需要构建。`index.html` 本身就是最终产物，可以直接部署到任何静态服务器或网站空间上。

### 6. 怎么验证成功 / 常见报错

| 现象 | 说明 | 怎么解决 |
|------|------|----------|
| 浏览器里看到验证码组件 | 成功 | 可以开始操作了 |
| 页面空白或样式错乱 | 可能文件没正确加载 | 改用本地服务器方式（方式二或三） |
| `command not found: npx` | 没装 Node.js | 按第 1 步安装 Node.js，或直接用方式一双击打开 |
| `command not found: python` | 没装 Python | 改用方式一或方式二 |
| 浏览器提示「无法访问」 | 本地服务器没启动 | 检查终端里服务是否在运行 |

### 7. 后端验证演示

页面里的后端验证功能需要后端服务配合。要测试后端验证：

1. 打开终端，进入后端服务目录：
   ```bash
   # 从 examples/html 目录出发
   cd ../../server/node
   pnpm install
   pnpm dev
   ```
   > 需要先装好 Node.js 和 pnpm（终端里输入 `npm install -g pnpm` 回车）。
2. 后端服务会运行在 `http://localhost:3001`。
3. 然后用本地服务器方式打开 HTML 示例（方式二或方式三），在页面里找到后端验证部分即可体验。
4. 详细说明见 `server/node/README_CN.md`。
