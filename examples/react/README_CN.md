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
