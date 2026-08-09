# Vue 3 验证码示例

Vue 3 示例项目，演示 @captcha-pro/vue 组件。

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
- **Composables** - useSliderCaptcha、useClickCaptcha 钩子

## 项目结构

```
src/
├── App.vue              # Main app
├── main.ts              # Entry point
├── pages/
│   ├── ClickDemo.vue    # Click captcha demo
│   ├── SliderDemo.vue   # Slider captcha demo
│   ├── PopupDemo.vue    # Popup captcha demo
│   ├── InvisibleDemo.vue # Invisible captcha demo
│   ├── BackendDemo.vue  # Backend verification demo
│   └── CustomImageDemo.vue # Custom image demo
└── hooks/
    └── useLocale.ts     # i18n hook
```

## 使用示例

### 基础滑动拼图验证码

```vue
<template>
  <SliderCaptcha
    :width="300"
    :height="170"
    @success="onSuccess"
    @fail="onFail"
  />
</template>

<script setup lang="ts">
import { SliderCaptcha } from '@captcha-pro/vue'

const onSuccess = () => console.log('Passed!')
</script>
```

### 点选文字验证码

```vue
<template>
  <ClickCaptcha
    :width="300"
    :height="170"
    :count="3"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
import { ClickCaptcha } from '@captcha-pro/vue'
</script>
```

### 弹窗验证码

```vue
<template>
  <PopupCaptcha
    trigger="#submit-btn"
    type="slider"
    @success="onSuccess"
  >
    <button id="submit-btn">Submit</button>
  </PopupCaptcha>
</template>
```

### 后端验证

```vue
<template>
  <SliderCaptcha
    verify-mode="backend"
    :backend-verify="backendConfig"
    @success="onSuccess"
  />
</template>

<script setup lang="ts">
const backendConfig = {
  getCaptcha: 'http://localhost:3001/api/captcha?type=slider',
  verify: 'http://localhost:3001/api/captcha/verify',
}
</script>
```

### 使用 Composables

```vue
<template>
  <div ref="containerRef" class="captcha-container" />
  <div v-if="status === 'success'">{{ statusText }}</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSliderCaptcha } from '@captcha-pro/vue/composables'

const containerRef = ref()

const { status, statusText, init, destroy } = useSliderCaptcha({
  width: 300,
  height: 170,
  onSuccess: () => console.log('Passed!'),
}, containerRef)

onMounted(() => init())
onUnmounted(() => destroy())
</script>
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
