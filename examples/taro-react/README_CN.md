# Taro React 验证码示例

Taro + React 示例项目，演示 @captcha-pro/taro-react 组件（仅后端模式）。

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

## 项目结构

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

## 演示的组件

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
