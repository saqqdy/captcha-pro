# 微信小程序验证码示例

微信原生小程序验证码示例项目，使用 `@captcha-pro/mp/weixin` 组件。

> **重要：** 微信小程序端仅支持后端服务模式（Backend-only），所有验证码图片均由后端 API 提供，`backend` 为必填配置。

## 使用方法

### 1. 安装依赖

```bash
# 在项目根目录安装
pnpm install
```

### 2. 构建 NPM

在微信开发者工具中：
1. 打开 `examples/weixin` 目录
2. 点击 **工具** → **构建 npm**

### 3. 预览

在微信开发者工具中点击 **预览** 或 **真机调试**。

## 后端配置（必填）

所有组件都需要通过 `backend` 属性配置后端 API 地址：

```xml
<slider-captcha
  backend="{{backend}}"
  bind:success="onSuccess"
  bind:fail="onFail"
/>
```

```javascript
Page({
  data: {
    backend: {
      getCaptcha: 'https://your-api.com/captcha/get',
      verify: 'https://your-api.com/captcha/verify',
      timeout: 10000,
    },
  },
})
```

### Backend 配置项

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| getCaptcha | `string \| function` | 是 | 获取验证码的 URL 或自定义函数 |
| verify | `string \| function` | 是 | 验证验证码的 URL 或自定义函数 |
| headers | `Record<string, string>` | 否 | 请求头 |
| timeout | `number` | 否 | 超时时间（ms），默认 10000 |

也可以使用自定义函数实现更灵活的请求逻辑：

```javascript
backend: {
  getCaptcha(params) {
    return myRequest('/api/captcha/get', params)
  },
  verify(data) {
    return myRequest('/api/captcha/verify', data)
  },
}
```

## 组件使用

### slider-captcha 滑块验证码

#### 页面配置 (page.json)

```json
{
  "usingComponents": {
    "slider-captcha": "@captcha-pro/mp/weixin/components/slider-captcha"
  }
}
```

#### 模板 (wxml)

```xml
<slider-captcha
  width="{{300}}"
  height="{{170}}"
  slider-width="{{42}}"
  slider-height="{{42}}"
  show-refresh="{{true}}"
  backend="{{backend}}"
  bind:success="onSuccess"
  bind:fail="onFail"
  bind:refresh="onRefresh"
  bind:error="onError"
/>
```

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | Number | 300 | 验证码宽度（px） |
| height | Number | 170 | 验证码高度（px） |
| sliderWidth | Number | 42 | 滑块宽度（px） |
| sliderHeight | Number | 42 | 滑块高度（px） |
| showRefresh | Boolean | true | 显示刷新按钮 |
| backend | Object | - | **必填**，后端 API 配置 |

### click-captcha 点击验证码

#### 页面配置 (page.json)

```json
{
  "usingComponents": {
    "click-captcha": "@captcha-pro/mp/weixin/components/click-captcha"
  }
}
```

#### 模板 (wxml)

```xml
<click-captcha
  width="{{300}}"
  height="{{170}}"
  show-refresh="{{true}}"
  backend="{{backend}}"
  bind:success="onSuccess"
  bind:fail="onFail"
  bind:refresh="onRefresh"
  bind:error="onError"
/>
```

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| width | Number | 300 | 验证码宽度（px） |
| height | Number | 170 | 验证码高度（px） |
| showRefresh | Boolean | true | 显示刷新按钮 |
| backend | Object | - | **必填**，后端 API 配置 |

### popup-captcha 弹出验证码

#### 页面配置 (page.json)

```json
{
  "usingComponents": {
    "popup-captcha": "@captcha-pro/mp/weixin/components/popup-captcha"
  }
}
```

#### 模板 (wxml)

```xml
<popup-captcha
  id="popupCaptcha"
  type="slider"
  title="请完成安全验证"
  mask-closable="{{true}}"
  show-close="{{true}}"
  auto-close="{{true}}"
  close-delay="{{500}}"
  backend="{{backend}}"
  bind:success="onSuccess"
  bind:fail="onFail"
  bind:open="onOpen"
  bind:close="onClose"
/>
```

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | String | 'slider' | 验证码类型（slider / click） |
| title | String | '请完成安全验证' | 弹窗标题 |
| maskClosable | Boolean | true | 点击遮罩关闭 |
| showClose | Boolean | true | 显示关闭按钮 |
| autoClose | Boolean | true | 验证成功自动关闭 |
| closeDelay | Number | 500 | 自动关闭延迟（ms） |
| sliderOptions | Object | {} | 滑块验证码额外配置 |
| clickOptions | Object | {} | 点击验证码额外配置 |
| backend | Object | - | **必填**，后端 API 配置 |

#### 方法（通过 selectComponent 调用）

```javascript
// 显示弹窗
this.selectComponent('#popupCaptcha').show()

// 隐藏弹窗
this.selectComponent('#popupCaptcha').hide()

// 获取可见状态
this.selectComponent('#popupCaptcha').isVisible()
```

## 事件

| 事件 | 说明 | 回调参数 |
|------|------|----------|
| bind:success | 验证成功 | `e.detail = { verifiedAt }` |
| bind:fail | 验证失败 | - |
| bind:refresh | 点击刷新 | - |
| bind:error | 加载错误 | `e.detail = Error` |
| bind:open | 弹窗打开（popup-captcha） | - |
| bind:close | 弹窗关闭（popup-captcha） | - |

## 工具函数

`@captcha-pro/mp/weixin` 还导出了请求工具函数，可在自定义逻辑中使用：

```javascript
const { wxFetchCaptcha, wxVerifyCaptcha } = require('@captcha-pro/mp/weixin')

// 获取验证码
const res = await wxFetchCaptcha(backendConfig, {
  type: 'slider',
  width: 300,
  height: 170,
})

// 验证
const result = await wxVerifyCaptcha(backendConfig, {
  captchaId: 'xxx',
  type: 'slider',
  target: [123],
})
```

## Run & Verify Guide (No Coding Experience Needed)

This guide is for anyone with zero coding experience. Just follow the steps one by one and you'll have the captcha demo running on your computer.

### 1. Software You Need to Install

You'll install three things, once. After that you won't need to reinstall them.

#### 1.1 Node.js 18 LTS

Node.js is the runtime needed to compile the code.

1. Go to https://nodejs.org
2. On the page you'll see two big buttons. Click the one labeled **LTS** (Long Term Support), not Current.
3. Download and run the installer — click "Next" through every step, no need to change any options.
4. Verify: open Terminal (Mac: search "Terminal" in Launchpad; Windows: search "cmd" in Start menu), type `node -v` and press Enter. If it shows `v18.x.x`, you're good.

#### 1.2 pnpm (Package Manager)

pnpm downloads the project's dependencies.

1. Open Terminal
2. Type the following and press Enter:

   ```bash
   npm install -g pnpm
   ```

3. Wait a few seconds, then type `pnpm -v`. If it shows a version number, you're done.

#### 1.3 WeChat Developer Tools (Required)

This is the official tool to open and preview WeChat Mini-Programs. All examples use it to see the result.

1. Go to https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. Choose "Stable Build" for your OS:
   - **macOS**: download the .dmg, open it, and drag "WeChat Developer Tools" into the Applications folder
   - **Windows**: download the .exe, double-click to install, click Next through every step
3. Open it. The first time it will ask you to log in — scan the QR code with WeChat on your phone.
4. After logging in you'll see the project list page (empty is normal).

### 2. How to Compile the Code

This project is a native WeChat Mini-Program — the code is already in the format WeChat tools can read (wxml/wxss/js), so **no terminal compilation is needed**. You only need to install dependencies:

1. Open Terminal and type (replace the path with the actual location of captcha-pro on your computer):

   ```bash
   cd /your/path/captcha-pro
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

   Wait for it to finish (may take a minute or two).
3. Once done, proceed to Step 3 to import the project into WeChat Developer Tools.

> Note: after importing, you'll also need to click "Tools → Build npm" in the Developer Tools — see Step 3.

### 3. How to Open / Preview in WeChat Developer Tools

#### 3.1 Import the project

1. Open "WeChat Developer Tools"
2. Click the "+" button in the top-left corner (or "Import Project")
3. In the popup, fill in:
   - **Directory**: click "Choose" and select the folder from Step 3.2 below
   - **AppID**: if you have a WeChat Mini-Program AppID, enter it; otherwise select "Test Account" from the dropdown
   - **Project Name**: anything, e.g. "Captcha Demo"
4. Click "OK" or "Import"

#### 3.2 Which directory to select?

Select the **`examples/weixin`** folder itself (the examples/weixin directory inside captcha-pro — not the miniprogram subfolder inside it).

#### 3.3 Build npm (required after importing)

Because the project uses npm packages, WeChat Mini-Programs require a one-time "Build npm":

1. Click "Tools → Build npm" in the top menu
2. Wait for it to finish — it will say "Build succeeded"
3. This step lets the WeChat Mini-Program recognize the npm packages used by the project

#### 3.4 See the interface

After importing and building npm, the Developer Tools will compile automatically and the "Simulator" panel on the left will show the mini-program interface. If you see the captcha component (slider or text-click), it's working!

#### 3.5 Real-device preview (optional)

Want to see it on your phone? Click the "Preview" button at the top of the Developer Tools — it generates a QR code. Scan it with WeChat on your phone to open the mini-program.

### 4. How to Verify Success

After importing, look at the simulator on the left:

- If you see the captcha image, slider, or text → **Success!**
- If you can drag the slider or click the text to complete verification → **Everything works!**

If the simulator shows a blank white screen or errors, check "Common Errors" below.

### 5. Common Errors

| Error / Symptom | Cause | Solution |
|----------------|-------|----------|
| `pnpm: command not found` | pnpm not installed | Go back to Step 1.2 and install pnpm |
| "app.json not found" after import | Wrong directory selected | Re-select the correct directory per Step 3.2 |
| Blank simulator, red errors in Console | Code issue | Check the "Console" panel at the bottom of Developer Tools |
| Components not showing after import | "Build npm" not done | Menu "Tools → Build npm" |
| Build failed / port in use | Another terminal may be running | Close other terminal windows and retry |
