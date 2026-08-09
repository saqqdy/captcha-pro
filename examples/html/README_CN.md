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
