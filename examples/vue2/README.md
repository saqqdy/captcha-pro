# Vue 2 Example

This example demonstrates how to use captcha-pro Vue 2 components.

**[简体中文](./README_CN.md)**

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## Components

### SliderCaptcha

Slider puzzle captcha component.

### ClickCaptcha

Click-to-verify captcha component.

### PopupCaptcha

Popup wrapper for captcha components.

## License

MIT

## Run & Verify Guide (No Coding Experience Needed)

This guide is for complete beginners. Follow each step and you'll have the captcha demo running in your browser.

### 1. Software You Need to Install

#### 1.1 Install Node.js 18 LTS

Node.js is the runtime required to run JavaScript projects.

1. Open https://nodejs.org in your browser.
2. On the homepage, click the **LTS** (Long Term Support) download button. The site auto-detects your OS and gives you the right installer.
   - **Windows**: Download the `.msi` file, double-click it, and click "Next" through the wizard until it finishes.
   - **macOS**: Download the `.pkg` file, double-click it, and follow the installer prompts.
3. After installation, verify it in the next step.

#### 1.2 Install pnpm

pnpm is a package manager that downloads the libraries the project depends on.

1. Open a terminal:
   - **Windows**: Press the `Win` key, type `PowerShell`, and press Enter.
   - **macOS**: Open Launchpad → Other → Terminal (or search "Terminal" in Spotlight).
2. Type the following command and press Enter:
   ```bash
   npm install -g pnpm
   ```
   It installs in a few seconds. You'll see some text output — no red error messages means it worked.
3. Verify both tools are installed by running these two commands:
   ```bash
   node -v
   pnpm -v
   ```
   If you see version numbers like `v18.19.0` and `9.x.x`, you're all set. If you see `command not found`, something went wrong — go back and redo the steps above.

### 2. How to Open the Project

The terminal has a concept of "current folder" — like which folder you're viewing in File Explorer. You need to navigate the terminal into the project directory before running commands.

Assuming you downloaded captcha-pro to your Downloads folder:

**macOS**:
```bash
cd ~/Downloads/captcha-pro/examples/vue2
```

**Windows** (use backslashes):
```cmd
cd %USERPROFILE%\Downloads\captcha-pro\examples\vue2
```

> Replace the path with wherever you actually saved the project. If you're not sure of the path:
> - **macOS**: Open Finder, find the `examples/vue2` folder, and drag it into the terminal window — it auto-fills the path. Add `cd ` in front and press Enter.
> - **Windows**: Click the folder's address bar, copy the full path, and paste it after `cd `.

### 3. How to Start the Dev Server

#### 3.1 Install Dependencies (first time only)

In the terminal, type:
```bash
pnpm install
```

This downloads all the libraries the project needs. The first run takes a few minutes — you'll see text and progress bars scrolling by. Wait until it finishes and you see a new command prompt.

> If it fails due to network issues, delete the `node_modules` folder and run `pnpm install` again.

#### 3.2 Start the Development Server

In the terminal, type:
```bash
pnpm dev
```

The terminal will print some output, including a local URL like:
```
  VITE v4.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
```

Seeing `http://localhost:5173/` (the port may differ — use whatever the terminal shows) means the server started successfully.

> **Don't close this terminal window!** Closing it stops the server. To stop the server manually, press `Ctrl + C` in the terminal.

### 4. How to View the Result

1. Open a browser (Chrome, Edge, or Safari all work).
2. Copy the URL from the terminal (e.g. `http://localhost:5173/`) into the address bar and press Enter.
3. The page loads and you'll see captcha components — slider puzzles, click-to-verify text, etc. Try interacting with them. If they respond to your actions, everything is working!

### 5. How to Build for Production

If you need to deploy the project to a server, build the production bundle first:

```bash
pnpm build
```

After it finishes, a `dist/` folder appears in the project directory. It contains deployable web files (`index.html` plus bundled `js` and `css`).

**Preview the build** in two ways:

- **Option 1**: Double-click `dist/index.html` to open it in a browser (some features may be limited).
- **Option 2** (recommended): Use the preview command:
  ```bash
  pnpm preview
  ```
  The terminal shows a preview URL (e.g. `http://localhost:4173/`). Open it in your browser.

### 6. How to Verify Success / Common Errors

| Symptom | Meaning | Solution |
|---------|---------|----------|
| Terminal shows `http://localhost:5173/` | Server started successfully | Copy this URL into your browser |
| Browser shows captcha components | You're done! | Start interacting with the captcha |
| `command not found: pnpm` | pnpm not installed | Go back to step 1 and install pnpm |
| `command not found: node` | Node.js not installed | Go back to step 1 and install Node.js |
| `EADDRINUSE` or `address already in use` | Port is occupied | Another program is using the port. Close other dev servers or change the port |
| `pnpm install` shows `ERR_` errors | Dependency install failed | Check your network, delete `node_modules`, and retry |
| Browser shows a blank page | Server may not have started | Check the terminal for error messages |

### 7. Backend Verification

If you want to test backend verification, start the backend server:

1. **Open a new terminal window** (don't close the running frontend server).
2. Navigate to the backend server directory and start it:
   ```bash
   # From examples/vue2
   cd ../../server/node
   pnpm install
   pnpm dev
   ```
3. The backend server runs at `http://localhost:3001`.
4. See `server/node/README_CN.md` for more details.