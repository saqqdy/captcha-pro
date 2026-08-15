# Taro + Vue 3 Captcha Example

Taro + Vue 3 captcha example project using `@captcha-pro/taro-vue` components.

> **Important:** This example only supports backend verification mode. All captcha images are provided by backend API, `backend` configuration is required.

## Quick Start

### 1. Install Dependencies

```bash
# Install in project root
pnpm install
```

### 2. Build Package

```bash
# Build @captcha-pro/taro-vue package first
pnpm build:taro-vue
```

### 3. Run Development

```bash
# WeChat Mini-Program
pnpm dev:weapp

# H5
pnpm dev:h5

# Alipay Mini-Program
pnpm dev:alipay

# Other platforms: swan, tt, qq, jd
```

### 4. Preview

- **WeChat Mini-Program**: Open project in WeChat Developer Tools
- **H5**: Open browser at `http://localhost:10086`
- **Other platforms**: Follow platform-specific instructions

## Backend Configuration (Required)

All components require `backend` configuration:

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

### Backend Config Options

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| getCaptcha | `string \| function` | Yes | URL or custom function to get captcha |
| verify | `string \| function` | Yes | URL or custom function to verify captcha |
| headers | `Record<string, string>` | No | Request headers |
| timeout | `number` | No | Timeout (ms), default: 10000 |

## Example Pages

This example includes multiple pages demonstrating different captcha types:

### ClickCaptcha Demo (`/pages/click`)

Click verification captcha example.

### SliderCaptcha Demo (`/pages/slider`)

Slider puzzle captcha example.

### PopupCaptcha Demo (`/pages/popup`)

Popup captcha example with both slider and click modes.

## Directory Structure

```
examples/taro-vue/
├── src/
│   ├── app.config.ts    # App configuration
│   ├── app.scss         # Global styles
│   ├── app.ts           # App entry
│   └── pages/
│       ├── click/       # ClickCaptcha demo
│       ├── slider/      # SliderCaptcha demo
│       └── popup/       # PopupCaptcha demo
├── config/              # Taro build config
├── package.json
└── project.config.json  # WeChat Mini-Program config
```

## Platform Support

| Platform | Command | Notes |
|----------|---------|-------|
| WeChat | `pnpm dev:weapp` | Recommended |
| H5 | `pnpm dev:h5` | Browser |
| Alipay | `pnpm dev:alipay` | Alipay Mini-Program |
| ByteDance | `pnpm dev:tt` | Douyin/Toutiao |
| Baidu | `pnpm dev:swan` | Baidu Mini-Program |
| QQ | `pnpm dev:qq` | QQ Mini-Program |
| JD | `pnpm dev:jd` | JD Mini-Program |

## Reference

- [Taro Documentation](https://taro-docs.jd.com/)
- [@captcha-pro/taro-vue Package](../../packages/taro-vue/README.md)
- [Backend API Documentation](../../server/node/README.md)

## License

MIT

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

Taro code can't be read directly by WeChat Developer Tools — it needs to be compiled into WeChat Mini-Program format first.

#### 2.1 Enter the project directory

Open Terminal and type (replace the path with the actual location on your computer):

```bash
cd /your/path/captcha-pro/examples/taro-vue
```

#### 2.2 Install dependencies

```bash
pnpm install
```

Wait for it to finish (may take a minute or two).

#### 2.3 Compile to WeChat Mini-Program

```bash
pnpm dev:weapp
```

> `dev:weapp` is a command defined in package.json. `weapp` means WeChat Mini-Program.

When it's done, the terminal will show a success message and the compiled code will be in the `dist/` folder. **Don't close this terminal window** — it will watch for code changes and recompile automatically.

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

Select the **`examples/taro-vue/dist`** folder (the compiled output from Step 2).

#### 3.3 See the interface

After importing, the Developer Tools will compile automatically and the "Simulator" panel on the left will show the mini-program interface. If you see the captcha component (slider or text-click), it's working!

#### 3.4 Real-device preview (optional)

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
| `dist` folder doesn't exist | Step 2 wasn't run or failed | Go back to Step 2 and run the compile command again |
| Build failed / port in use | Another terminal may be running the same command | Close other terminal windows and rerun the compile command |