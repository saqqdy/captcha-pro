# Taro Vue 2 验证码示例

Taro + Vue 2 示例项目，演示 @captcha-pro/taro-vue2 组件（仅后端模式）。

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

```vue
<template>
  <SliderCaptcha
    :backend="backendConfig"
    :width="300"
    :height="170"
    @success="onSuccess"
  />
</template>

<script>
import { SliderCaptcha } from '@captcha-pro/taro-vue2'

export default {
  components: { SliderCaptcha },
  data() {
    return {
      backendConfig: {
        getCaptcha: 'https://your-api.com/captcha/get',
        verify: 'https://your-api.com/captcha/verify',
        timeout: 10000,
      },
    }
  },
  methods: {
    onSuccess() {
      console.log('Passed!')
    },
  },
}
</script>
```

## 项目结构

```
src/
├── app.config.ts        # App configuration
├── app.vue              # App entry
├── app.scss             # Global styles
├── pages/
│   ├── index/           # Home page
│   ├── slider/          # Slider captcha demo
│   └── click/           # Click captcha demo
└── components/          # Shared components
```

## 演示的组件

### SliderCaptcha

```vue
<SliderCaptcha
  :backend="backendConfig"
  :width="300"
  :height="170"
  :slider-width="42"
  :slider-height="42"
  :show-refresh="true"
  @success="handleSuccess"
  @fail="handleFail"
/>
```

### ClickCaptcha

```vue
<ClickCaptcha
  :backend="backendConfig"
  :width="300"
  :height="170"
  :show-refresh="true"
  @success="handleSuccess"
/>
```

### PopupCaptcha

```vue
<template>
  <view>
    <button @click="showPopup">Verify</button>
    <PopupCaptcha
      ref="popupRef"
      type="slider"
      :backend="backendConfig"
      @success="handleSuccess"
    />
  </view>
</template>

<script>
export default {
  methods: {
    showPopup() {
      this.$refs.popupRef.show()
    },
  },
}
</script>
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
