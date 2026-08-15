# Taro React Captcha Demo

Taro + React example project demonstrating @captcha-pro/taro-react components (backend-only mode).

**[简体中文](./README_CN.md)**

## Important: Backend-Only Mode

Taro captcha components only support backend verification. All captcha images are provided by backend API.

## Quick Start

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

Open the `dist/` directory in WeChat DevTools for mini-program preview.

## Backend Configuration

Configure your backend API in the page:

```tsx
import { SliderCaptcha } from '@captcha-pro/taro-react'

function CaptchaPage() {
  const backendConfig = {
    getCaptcha: 'https://your-api.com/captcha/get',
    verify: 'https://your-api.com/captcha/verify',
    timeout: 10000,
  }

  return (
    <SliderCaptcha
      backend={backendConfig}
      width={300}
      height={170}
      onSuccess={() => console.log('Passed!')}
    />
  )
}
```

## Project Structure

```
src/
├── app.config.ts        # App configuration
├── app.tsx              # App entry
├── app.scss             # Global styles
├── pages/
│   ├── index/           # Home page
│   ├── slider/          # Slider captcha demo
│   └── click/           # Click captcha demo
└── components/          # Shared components
```

## Components Demonstrated

### SliderCaptcha

```tsx
<SliderCaptcha
  backend={backendConfig}
  width={300}
  height={170}
  sliderWidth={42}
  sliderHeight={42}
  showRefresh={true}
  onSuccess={handleSuccess}
  onFail={handleFail}
/>
```

### ClickCaptcha

```tsx
<ClickCaptcha
  backend={backendConfig}
  width={300}
  height={170}
  showRefresh={true}
  onSuccess={handleSuccess}
/>
```

### PopupCaptcha

```tsx
import { useRef } from 'react'
import { PopupCaptcha } from '@captcha-pro/taro-react'

function Page() {
  const popupRef = useRef(null)

  return (
    <View>
      <Button onClick={() => popupRef.current?.show()}>Verify</Button>
      <PopupCaptcha
        ref={popupRef}
        type="slider"
        backend={backendConfig}
        onSuccess={handleSuccess}
      />
    </View>
  )
}
```

## Backend Server

Start the demo backend server:

```bash
# From project root
cd server/node
pnpm install
pnpm dev
```

Update `backendConfig` to point to `http://localhost:3001/api/captcha`

## Build

```bash
# Build for WeChat mini-program
pnpm build:weapp

# Build for H5
pnpm build:h5
```

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
cd /your/path/captcha-pro/examples/taro-react
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

Select the **`examples/taro-react/dist`** folder (the compiled output from Step 2).

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