# HTML Captcha Demo

Vanilla JavaScript example demonstrating captcha-pro core library usage.

**[简体中文](./README_CN.md)**

## Quick Start

### Local Development

1. Serve the file locally:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

2. Open `http://localhost:8080` in browser

### Online Demo

- [StackBlitz](https://stackblitz.com/github/saqqdy/captcha-pro?file=examples/html/index.html)
- [CodeSandbox](https://codesandbox.io/p/github/saqqdy/captcha-pro/master?file=examples/html/index.html)

## Features Demonstrated

- **SliderCaptcha** - Drag slider verification
- **ClickCaptcha** - Click character verification
- **PopupCaptcha** - Modal popup wrapper
- **InvisibleCaptcha** - Risk-based invisible verification
- **Backend Verification** - Server-side validation
- **Custom Images** - Use your own images
- **IE11 Support** - Legacy browser support with polyfill

## Usage

### Basic Setup

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

### Click Captcha
  
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

### Popup Captcha

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

### Backend Verification

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

### IE11 Support

```html
<!--[if IE]>
<script src="https://cdn.jsdelivr.net/npm/core-js-bundle/minified.js"></script>
<![endif]-->
<script src="https://unpkg.com/captcha-pro/dist/index.global.min.js"></script>
```

## API Methods

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

## Backend Server

To test backend verification, start the demo server:

```bash
# From project root
cd server/node
pnpm install
pnpm dev
```

Server runs at `http://localhost:3001`

## License

MIT

## Run & Verify Guide (No Coding Experience Needed)

This guide is for complete beginners. The HTML example is the simplest one — you don't need to install anything to see it work.

### 1. Software You Need to Install

**Simplest approach**: All you need is a browser (Chrome, Edge, or Safari). No extra software required.

If you want to run it via a local server (optional), you'll need Node.js:

1. Open https://nodejs.org in your browser.
2. Download the **LTS** version. The site auto-detects your OS and gives you the right installer:
   - **Windows**: Download the `.msi` file, double-click it, and click "Next" through the wizard.
   - **macOS**: Download the `.pkg` file, double-click it, and follow the prompts.
3. After installation, verify by opening a terminal and typing `node -v` — if a version number appears, it's installed.

> If you'd rather use Python to start a local server, install Python 3 from https://python.org. Download and double-click to install.

### 2. How to Open the Project

Use Finder (macOS) or File Explorer (Windows) to locate the `examples/html` folder inside the captcha-pro project. Inside it you'll find an `index.html` file — that's the demo page.

### 3. How to Run

There are three ways to run the HTML demo. Pick whichever you like:

#### Option 1: Just Open the File (Simplest, Recommended for Beginners)

Double-click `index.html`. It opens in your default browser. Once the page loads, you'll see the captcha components.

> This is the easiest method, but some features (like backend verification) may not work properly. For backend testing, use Option 2 or 3.

#### Option 2: Run a Local Server with Node.js (Recommended)

1. Open a terminal and navigate to the project directory:
   ```bash
   # macOS
   cd ~/Downloads/captcha-pro/examples/html

   # Windows
   cd %USERPROFILE%\Downloads\captcha-pro\examples\html
   ```
   > Replace the path with wherever you actually saved the project. On macOS, you can drag the `html` folder into the terminal to auto-fill the path.
2. Run:
   ```bash
   npx serve .
   ```
3. The terminal displays a local URL (e.g. `http://localhost:3000`). Copy it into your browser.

#### Option 3: Run a Local Server with Python

1. Open a terminal and navigate to the project directory (same as Option 2, step 1).
2. Run:
   ```bash
   python -m http.server 8080
   ```
3. Open `http://localhost:8080` in your browser.

### 4. How to View the Result

Once the page is open in your browser, you'll see various captcha components: slider puzzles, click-to-verify text, popup captcha, and more. Try interacting with them — if they respond to your actions, everything is working.

### 5. How to Build

The HTML example doesn't require a build step. `index.html` is the final product — you can deploy it directly to any static server or web hosting.

### 6. How to Verify Success / Common Errors

| Symptom | Meaning | Solution |
|---------|---------|----------|
| Browser shows captcha components | Success | Start interacting with the captcha |
| Page is blank or styles are broken | File may not have loaded correctly | Switch to a local server method (Option 2 or 3) |
| `command not found: npx` | Node.js not installed | Install Node.js per step 1, or just use Option 1 (double-click) |
| `command not found: python` | Python not installed | Use Option 1 or Option 2 instead |
| Browser says "cannot connect" | Local server isn't running | Check that the server is still running in the terminal |

### 7. Backend Verification Demo

The backend verification feature on the page requires a backend server. To test it:

1. Open a terminal and navigate to the backend server directory:
   ```bash
   # From examples/html
   cd ../../server/node
   pnpm install
   pnpm dev
   ```
   > You'll need Node.js and pnpm installed (run `npm install -g pnpm` in the terminal).
2. The backend server runs at `http://localhost:3001`.
3. Then open the HTML demo via a local server (Option 2 or 3 above), find the backend verification section on the page, and try it out.
4. See `server/node/README_CN.md` for more details.
