# Captcha Pro 多平台兼容规划方案

## 一、平台技术栈分析

| 平台 | 技术栈 | 与当前代码兼容性 | 渲染引擎 | 事件系统 |
|------|--------|------------------|----------|----------|
| H5/纯 JS | JavaScript/TypeScript | ✅ 完全兼容 | Canvas 2D | DOM Events |
| Vue 2 | JavaScript + Vue 2 Options API | ✅ 高度兼容 | Canvas 2D | Vue 2 Events |
| Vue 3 | TypeScript + Vue 3 Composition API | ✅ 高度兼容 | Canvas 2D | Vue 3 Events |
| React 17/18 | TypeScript + React Hooks | ✅ 高度兼容 | Canvas 2D | React Synthetic Events |
| 微信小程序 | WXML/WXSS/JS + 小程序 API | ⚠️ 需适配 | wx.createCanvasContext | bindtap |
| uni-app | Vue + uni-app API | ⚠️ 需适配 | uni.createCanvasContext | @tap |
| Taro 3 | React/Vue + Taro API | ⚠️ 需适配 | Taro.createCanvasContext | onClick |
| Flutter | Dart | ❌ 完全重写 | CustomPainter | GestureDetector |
| Android | Kotlin/Java | ❌ 完全重写 | Canvas/Compose | View Events |
| iOS | Swift/Objective-C | ❌ 完全重写 | CoreGraphics/UIKit | UIKit Events |

> **注意**：Vue 2 和 Vue 3 采用独立的包发布（`captcha-pro-vue2` 和 `captcha-pro-vue3`），以支持不同的 API 风格和 TypeScript 支持。

## 二、推荐架构方案：5 套核心代码

### 整体目录结构

```
captcha-pro/
├── packages/
│   ├── core/                        # 核心 JS/TS 代码（当前）
│   │   ├── src/
│   │   │   ├── core/               # 核心逻辑（框架无关）
│   │   │   │   ├── generator.ts    # 验证码生成器
│   │   │   │   ├── validator.ts    # 验证器
│   │   │   │   ├── types.ts        # 类型定义
│   │   │   │   └── utils.ts        # 工具函数
│   │   │   ├── web/                # Web 平台适配
│   │   │   │   ├── renderer/       # Canvas 渲染器
│   │   │   │   ├── events/         # DOM 事件处理
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   └── package.json            # captcha-pro
│   │
│   ├── vue2/                       # Vue 2 组件封装
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── SliderCaptcha.vue
│   │   │   │   ├── ClickCaptcha.vue
│   │   │   │   └── PopupCaptcha.vue
│   │   │   ├── mixins/
│   │   │   │   ├── sliderCaptcha.js
│   │   │   │   └── clickCaptcha.js
│   │   │   └── index.js
│   │   ├── test/
│   │   └── package.json            # captcha-pro-vue2
│   │
│   ├── vue3/                       # Vue 3 组件封装
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── SliderCaptcha.vue
│   │   │   │   ├── ClickCaptcha.vue
│   │   │   │   └── PopupCaptcha.vue
│   │   │   ├── composables/
│   │   │   │   ├── useSliderCaptcha.ts
│   │   │   │   └── useClickCaptcha.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   └── package.json            # captcha-pro-vue3
│   │
│   ├── react/                      # React 组件封装
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── SliderCaptcha.tsx
│   │   │   │   ├── ClickCaptcha.tsx
│   │   │   │   └── PopupCaptcha.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSliderCaptcha.ts
│   │   │   │   └── useClickCaptcha.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   └── package.json            # captcha-pro-react
│   │
│   ├── mp/                         # 小程序版本
│   │   ├── src/
│   │   │   ├── core/               # 共享核心逻辑
│   │   │   │   ├── generator.ts
│   │   │   │   ├── renderer.ts     # 抽象渲染接口
│   │   │   │   └── utils.ts
│   │   │   ├── weixin/             # 微信小程序适配
│   │   │   │   ├── components/
│   │   │   │   │   ├── slider-captcha.wxml
│   │   │   │   │   ├── slider-captcha.wxss
│   │   │   │   │   ├── slider-captcha.js
│   │   │   │   │   └── slider-captcha.json
│   │   │   │   ├── renderer.ts     # 微信 Canvas 渲染
│   │   │   │   └── index.ts
│   │   │   ├── uniapp/             # uni-app 适配
│   │   │   │   ├── components/
│   │   │   │   │   └── captcha/
│   │   │   │   │       ├── slider-captcha.vue
│   │   │   │   │       └── click-captcha.vue
│   │   │   │   ├── renderer.ts     # uni-app Canvas 渲染
│   │   │   │   └── index.ts
│   │   │   ├── taro/               # Taro 适配
│   │   │   │   ├── components/
│   │   │   │   │   ├── SliderCaptcha.tsx
│   │   │   │   │   └── ClickCaptcha.tsx
│   │   │   │   ├── renderer.ts     # Taro Canvas 渲染
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── test/
│   │   └── package.json            # captcha-pro-mp
│   │
│   ├── flutter/                    # Flutter 版本
│   │   ├── lib/
│   │   │   ├── core/
│   │   │   │   ├── generator.dart
│   │   │   │   ├── validator.dart
│   │   │   │   ├── types.dart
│   │   │   │   └── utils.dart
│   │   │   ├── widgets/
│   │   │   │   ├── slider_captcha.dart
│   │   │   │   ├── click_captcha.dart
│   │   │   │   └── popup_captcha.dart
│   │   │   ├── renderers/
│   │   │   │   ├── slider_painter.dart
│   │   │   │   └── click_painter.dart
│   │   │   └── captcha_pro.dart
│   │   ├── test/
│   │   ├── example/
│   │   └── pubspec.yaml            # captcha_pro
│   │
│   ├── android/                    # Android 原生 SDK
│   │   ├── captcha-sdk/
│   │   │   ├── src/main/java/com/captcha/pro/
│   │   │   │   ├── core/
│   │   │   │   │   ├── CaptchaGenerator.kt
│   │   │   │   │   ├── CaptchaValidator.kt
│   │   │   │   │   └── Types.kt
│   │   │   │   ├── widget/
│   │   │   │   │   ├── SliderCaptchaView.kt
│   │   │   │   │   ├── ClickCaptchaView.kt
│   │   │   │   │   └── CaptchaDialog.kt
│   │   │   │   ├── renderer/
│   │   │   │   │   ├── CanvasRenderer.kt
│   │   │   │   │   └── ShapeDrawer.kt
│   │   │   │   └── CaptchaPro.kt
│   │   │   └── build.gradle.kts
│   │   ├── captcha-compose/        # Jetpack Compose 版本
│   │   │   ├── src/main/java/com/captcha/pro/compose/
│   │   │   │   ├── SliderCaptcha.kt
│   │   │   │   └── ClickCaptcha.kt
│   │   │   └── build.gradle.kts
│   │   ├── sample/
│   │   └── README.md
│   │
│   └── ios/                        # iOS 原生 SDK
│       ├── Sources/
│       │   ├── Core/
│       │   │   ├── CaptchaGenerator.swift
│       │   │   ├── CaptchaValidator.swift
│       │   │   └── Types.swift
│       │   ├── Views/
│       │   │   ├── SliderCaptchaView.swift
│       │   │   ├── ClickCaptchaView.swift
│       │   │   └── CaptchaPopup.swift
│       │   ├── Renderers/
│       │   │   ├── CanvasRenderer.swift
│       │   │   └── ShapeDrawer.swift
│       │   ├── SwiftUI/            # SwiftUI 版本
│       │   │   ├── SliderCaptcha.swift
│       │   │   └── ClickCaptcha.swift
│       │   └── CaptchaPro.swift
│       ├── Tests/
│       ├── Package.swift           # SPM
│       ├── CaptchaPro.podspec      # CocoaPods
│       └── README.md
│
├── servers/                        # 后端服务
│   ├── node/
│   ├── java/
│   └── go/
│
└── examples/
    ├── web/
    │   └── index.html
    ├── vue2/
    │   └── src/
    ├── vue3/
    │   └── src/
    ├── react/
    │   └── src/
    ├── weixin-miniprogram/
    │   └── pages/
    ├── uniapp/
    │   └── pages/
    ├── taro/
    │   └── src/
    ├── flutter/
    │   └── lib/
    ├── android/
    │   └── app/
    └── ios/
        └── Example/
```

## 三、各版本详细实现策略

### 3.1 Web 核心版（JS/TS 生态基础）

#### 核心层设计 - 框架无关

```typescript
// packages/core/src/core/generator.ts
export interface CaptchaGenerateOptions {
  type: 'slider' | 'click'
  width: number
  height: number
  // ...
}

export interface CaptchaGenerateResult {
  bgImageData: ImageData
  sliderImageData?: ImageData
  target: number[]
  // ...
}

export class CaptchaGenerator {
  generate(options: CaptchaGenerateOptions): CaptchaGenerateResult {
    // 纯计算逻辑，无 DOM 依赖
    const bgCanvas = this.createOffscreenCanvas(options.width, options.height)
    const ctx = bgCanvas.getContext('2d')!

    // 生成背景
    this.generateBackground(ctx, options)
    // 生成滑块/点击区域
    // ...

    return {
      bgImageData: ctx.getImageData(0, 0, options.width, options.height),
      // ...
    }
  }

  private createOffscreenCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
    // 兼容 Node.js 和浏览器
    if (typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(width, height)
    }
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    return canvas
  }
}
```

#### Web 平台适配层

```typescript
// packages/core/src/web/slider.ts
import { CaptchaGenerator } from '../core/generator'

export class SliderCaptcha {
  private generator: CaptchaGenerator
  private bgCanvas: HTMLCanvasElement
  private sliderCanvas: HTMLCanvasElement

  constructor(options: SliderCaptchaOptions) {
    this.generator = new CaptchaGenerator()
    this.initDOM(options.container)
    this.bindEvents()
  }

  private initDOM(container: HTMLElement) {
    // 创建 Canvas 元素
    this.bgCanvas = document.createElement('canvas')
    this.sliderCanvas = document.createElement('canvas')
    container.appendChild(this.bgCanvas)
    container.appendChild(this.sliderCanvas)
  }

  private bindEvents() {
    // DOM 事件绑定
    this.sliderCanvas.addEventListener('mousedown', this.onDragStart)
    document.addEventListener('mousemove', this.onDragMove)
    document.addEventListener('mouseup', this.onDragEnd)
  }

  refresh() {
    const result = this.generator.generate({ type: 'slider', ...this.options })
    this.render(result)
  }
}
```

### 3.2 Vue 版封装

#### Vue 2 Options API

```vue
<!-- packages/vue2/src/components/SliderCaptcha.vue -->
<template>
  <div class="captcha-container">
    <canvas ref="bgCanvas" :width="width" :height="height" />
    <canvas
      ref="sliderCanvas"
      :width="sliderWidth"
      :height="sliderHeight"
      :style="{ top: sliderY + 'px', left: sliderX + 'px' }"
    />
    <button v-if="showRefresh" class="refresh-btn" @click="handleRefresh">
      ⟳
    </button>
    <div v-if="status" class="status-overlay" :class="status">
      {{ statusText }}
    </div>
  </div>
</template>

<script>
import { sliderCaptchaMixin } from '../mixins/sliderCaptcha'

export default {
  name: 'SliderCaptcha',
  mixins: [sliderCaptchaMixin],
  props: {
    width: { type: Number, default: 300 },
    height: { type: Number, default: 170 },
    precision: { type: Number, default: 5 },
    showRefresh: { type: Boolean, default: true },
  },
  methods: {
    handleRefresh() {
      this.refresh()
      this.$emit('refresh')
    },
  },
}
</script>
```

#### Vue 2 Mixin 实现

```javascript
// packages/vue2/src/mixins/sliderCaptcha.js
import { CaptchaGenerator } from 'captcha-pro/core'
import { WebRenderer } from 'captcha-pro/web'

export const sliderCaptchaMixin = {
  data() {
    return {
      sliderX: 0,
      sliderY: 0,
      targetX: 0,
      verified: false,
      status: '',
      generator: null,
      renderer: null,
    }
  },

  computed: {
    statusText() {
      if (this.status === 'success') return '验证成功'
      if (this.status === 'fail') return '验证失败'
      return ''
    },
    sliderWidth() {
      return 42
    },
    sliderHeight() {
      return 42
    },
  },

  mounted() {
    this.generator = new CaptchaGenerator()
    this.init()
  },

  beforeDestroy() {
    this.destroy()
  },

  methods: {
    init() {
      this.renderer = new WebRenderer({
        bgCanvas: this.$refs.bgCanvas,
        sliderCanvas: this.$refs.sliderCanvas,
      })
      this.refresh()
    },

    refresh() {
      const result = this.generator.generate({
        type: 'slider',
        width: this.width,
        height: this.height,
        sliderWidth: this.sliderWidth,
        sliderHeight: this.sliderHeight,
      })

      this.targetX = result.target[0]
      this.sliderY = result.sliderY
      this.sliderX = 0
      this.verified = false
      this.status = ''

      this.renderer.render(result)
    },

    // ... 其他方法
  },
}
```

#### Vue 3 Composition API

```vue
<!-- packages/vue3/src/components/SliderCaptcha.vue -->
<template>
  <div ref="containerRef" class="captcha-container">
    <canvas ref="bgCanvasRef" :width="width" :height="height" />
    <canvas
      ref="sliderCanvasRef"
      :width="sliderWidth"
      :height="sliderHeight"
      :style="{ top: sliderY + 'px', left: sliderX + 'px' }"
    />
    <button v-if="showRefresh" class="refresh-btn" @click="handleRefresh">
      <RefreshIcon />
    </button>
    <div v-if="status" class="status-overlay" :class="status">
      {{ statusText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSliderCaptcha } from '../composables/useSliderCaptcha'
import type { SliderCaptchaProps, SliderCaptchaEmits } from '../types'

const props = withDefaults(defineProps<SliderCaptchaProps>(), {
  width: 300,
  height: 170,
  precision: 5,
  showRefresh: true,
})

const emit = defineEmits<SliderCaptchaEmits>()

const containerRef = ref<HTMLElement>()
const bgCanvasRef = ref<HTMLCanvasElement>()
const sliderCanvasRef = ref<HTMLCanvasElement>()

const {
  sliderX,
  sliderY,
  status,
  statusText,
  init,
  refresh,
  destroy,
} = useSliderCaptcha(props, emit, {
  bgCanvas: bgCanvasRef,
  sliderCanvas: sliderCanvasRef,
})

onMounted(() => init())
onUnmounted(() => destroy())

const handleRefresh = () => {
  refresh()
  emit('refresh')
}

defineExpose({ refresh, getData, reset })
</script>
```

#### Vue 3 Composable 实现

```typescript
// packages/vue3/src/composables/useSliderCaptcha.ts
import { ref, reactive, computed } from 'vue'
import { CaptchaGenerator } from 'captcha-pro/core'
import { WebRenderer } from 'captcha-pro/web'
import type { SliderCaptchaProps, SliderCaptchaEmits } from '../types'

export function useSliderCaptcha(
  props: SliderCaptchaProps,
  emit: SliderCaptchaEmits,
  refs: { bgCanvas: Ref<HTMLCanvasElement | undefined>; sliderCanvas: Ref<HTMLCanvasElement | undefined> }
) {
  const generator = new CaptchaGenerator()
  const renderer = ref<WebRenderer>()

  const state = reactive({
    sliderX: 0,
    sliderY: 0,
    targetX: 0,
    verified: false,
    status: '' as 'success' | 'fail' | '',
  })

  const statusText = computed(() => {
    if (state.status === 'success') return '验证成功'
    if (state.status === 'fail') return '验证失败'
    return ''
  })

  const init = () => {
    if (!refs.bgCanvas.value || !refs.sliderCanvas.value) return

    renderer.value = new WebRenderer({
      bgCanvas: refs.bgCanvas.value,
      sliderCanvas: refs.sliderCanvas.value,
    })

    refresh()
  }

  const refresh = () => {
    const result = generator.generate({
      type: 'slider',
      width: props.width,
      height: props.height,
      sliderWidth: props.sliderWidth,
      sliderHeight: props.sliderHeight,
    })

    state.targetX = result.target[0]
    state.sliderY = result.sliderY
    state.sliderX = 0
    state.verified = false
    state.status = ''

    renderer.value?.render(result)
  }

  // ... 其他方法

  return {
    sliderX: computed(() => state.sliderX),
    sliderY: computed(() => state.sliderY),
    status: computed(() => state.status),
    statusText,
    init,
    refresh,
    destroy,
  }
}
```

### 3.3 React 版封装

```tsx
// packages/react/src/components/SliderCaptcha.tsx
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useSliderCaptcha } from '../hooks/useSliderCaptcha'
import type { SliderCaptchaProps, SliderCaptchaRef } from '../types'

export const SliderCaptcha = forwardRef<SliderCaptchaRef, SliderCaptchaProps>(
  (props, ref) => {
    const {
      width = 300,
      height = 170,
      precision = 5,
      showRefresh = true,
      onSuccess,
      onFail,
      onRefresh,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const bgCanvasRef = useRef<HTMLCanvasElement>(null)
    const sliderCanvasRef = useRef<HTMLCanvasElement>(null)

    const {
      sliderX,
      sliderY,
      status,
      init,
      refresh,
      destroy,
      getData,
      reset,
    } = useSliderCaptcha({
      width,
      height,
      precision,
      bgCanvas: bgCanvasRef,
      sliderCanvas: sliderCanvasRef,
      onSuccess,
      onFail,
    })

    useEffect(() => {
      init()
      return () => destroy()
    }, [])

    useImperativeHandle(ref, () => ({
      refresh,
      getData,
      reset,
    }))

    const handleRefresh = () => {
      refresh()
      onRefresh?.()
    }

    return (
      <div ref={containerRef} className="captcha-container">
        <canvas
          ref={bgCanvasRef}
          width={width}
          height={height}
        />
        <canvas
          ref={sliderCanvasRef}
          width={props.sliderWidth || 42}
          height={props.sliderHeight || 42}
          style={{
            position: 'absolute',
            top: sliderY,
            left: sliderX,
          }}
        />
        {showRefresh && (
          <button className="refresh-btn" onClick={handleRefresh}>
            ⟳
          </button>
        )}
        {status && (
          <div className={`status-overlay ${status}`}>
            {status === 'success' ? '验证成功' : '验证失败'}
          </div>
        )}
      </div>
    )
  }
)
```

### 3.4 小程序版（微信/uni-app/Taro）

#### 抽象渲染接口

```typescript
// packages/mp/src/core/renderer.ts
export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface CaptchaRenderer {
  // 基础绘制
  clear(): void
  drawImage(image: string | ImageData, x: number, y: number, width?: number, height?: number): void
  drawText(text: string, x: number, y: number, options?: DrawTextOptions): void
  drawShape(type: ShapeType, x: number, y: number, width: number, height: number, options?: DrawShapeOptions): void

  // 样式设置
  setFillStyle(color: string): void
  setStrokeStyle(color: string): void
  setLineWidth(width: number): void
  setFont(font: string): void

  // 变换
  translate(x: number, y: number): void
  rotate(angle: number): void
  save(): void
  restore(): void

  // 裁剪
  clip(): void

  // 获取图像数据
  getImageData(x: number, y: number, width: number, height: number): Promise<ImageData>
}

export interface DrawTextOptions {
  color?: string
  fontSize?: number
  fontFamily?: string
  align?: 'left' | 'center' | 'right'
  baseline?: 'top' | 'middle' | 'bottom'
}

export interface DrawShapeOptions {
  fill?: boolean
  stroke?: boolean
  borderRadius?: number
}
```

#### 微信小程序实现

```typescript
// packages/mp/src/weixin/renderer.ts
import type { CaptchaRenderer, DrawTextOptions, DrawShapeOptions } from '../core/renderer'

export class WxRenderer implements CaptchaRenderer {
  private ctx: WechatMiniprogram.CanvasContext

  constructor(canvas: WechatMiniprogram.Canvas, width: number, height: number) {
    this.ctx = canvas.getContext('2d')
  }

  clear(): void {
    const { width, height } = this.ctx.canvas
    this.ctx.clearRect(0, 0, width, height)
  }

  drawImage(image: string, x: number, y: number, width?: number, height?: number): void {
    this.ctx.drawImage(image, x, y, width || 0, height || 0)
  }

  drawText(text: string, x: number, y: number, options?: DrawTextOptions): void {
    if (options?.color) {
      this.ctx.setFillStyle(options.color)
    }
    if (options?.fontSize || options?.fontFamily) {
      this.ctx.setFontSize(options?.fontSize || 14)
    }
    this.ctx.fillText(text, x, y)
  }

  drawShape(type: string, x: number, y: number, width: number, height: number, options?: DrawShapeOptions): void {
    this.ctx.beginPath()

    switch (type) {
      case 'roundedRect':
        const r = options?.borderRadius || 0
        this.ctx.moveTo(x + r, y)
        this.ctx.lineTo(x + width - r, y)
        this.ctx.arcTo(x + width, y, x + width, y + r, r)
        this.ctx.lineTo(x + width, y + height - r)
        this.ctx.arcTo(x + width, y + height, x + width - r, y + height, r)
        this.ctx.lineTo(x + r, y + height)
        this.ctx.arcTo(x, y + height, x, y + height - r, r)
        this.ctx.lineTo(x, y + r)
        this.ctx.arcTo(x, y, x + r, y, r)
        break
      case 'triangle':
        this.ctx.moveTo(x + width / 2, y)
        this.ctx.lineTo(x + width, y + height)
        this.ctx.lineTo(x, y + height)
        break
      // ... 其他形状
    }

    this.ctx.closePath()

    if (options?.fill !== false) {
      this.ctx.fill()
    }
    if (options?.stroke) {
      this.ctx.stroke()
    }
  }

  async getImageData(x: number, y: number, width: number, height: number): Promise<ImageData> {
    // 微信小程序 Canvas 2D API
    return this.ctx.getImageData(x, y, width, height)
  }

  // ... 其他方法实现
}
```

#### 微信小程序组件

```javascript
// packages/mp/src/weixin/components/slider-captcha/slider-captcha.js
import { CaptchaGenerator } from '../../core/generator'
import { WxRenderer } from '../renderer'

Component({
  properties: {
    width: { type: Number, value: 300 },
    height: { type: Number, value: 170 },
    precision: { type: Number, value: 5 },
    showRefresh: { type: Boolean, value: true },
    verifyMode: { type: String, value: 'frontend' },
    backendUrl: { type: String, value: '' },
  },

  data: {
    sliderX: 0,
    sliderY: 0,
    status: '',
    startX: 0,
    currentX: 0,
    isDragging: false,
  },

  lifetimes: {
    attached() {
      this.generator = new CaptchaGenerator()
      this.initCanvas()
    },
  },

  methods: {
    initCanvas() {
      const query = this.createSelectorQuery()
      query.select('#bgCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          const canvas = res[0].node
          this.renderer = new WxRenderer(canvas, this.data.width, this.data.height)
          this.refresh()
        })
    },

    refresh() {
      const result = this.generator.generate({
        type: 'slider',
        width: this.data.width,
        height: this.data.height,
      })

      this.setData({
        sliderY: result.sliderY,
        targetX: result.target[0],
        sliderX: 0,
        status: '',
      })

      this.renderer.render(result)
      this.triggerEvent('refresh')
    },

    onTouchStart(e) {
      if (this.data.status) return
      this.setData({
        isDragging: true,
        startX: e.touches[0].clientX - this.data.sliderX,
      })
    },

    onTouchMove(e) {
      if (!this.data.isDragging) return

      const newX = e.touches[0].clientX - this.data.startX
      const maxX = this.data.width - this.data.sliderWidth

      this.setData({
        sliderX: Math.max(0, Math.min(newX, maxX)),
      })
    },

    onTouchEnd() {
      if (!this.data.isDragging) return

      this.setData({ isDragging: false })
      this.verify()
    },

    verify() {
      const diff = Math.abs(this.data.sliderX - this.data.targetX)

      if (diff <= this.data.precision) {
        this.setData({ status: 'success' })
        this.triggerEvent('success')
      } else {
        this.setData({ status: 'fail' })
        this.triggerEvent('fail')
        setTimeout(() => this.refresh(), 500)
      }
    },
  },
})
```

#### uni-app 组件

```vue
<!-- packages/mp/src/uniapp/components/slider-captcha.vue -->
<template>
  <view class="captcha-container">
    <canvas
      canvas-id="bgCanvas"
      id="bgCanvas"
      :style="{ width: width + 'px', height: height + 'px' }"
    />
    <canvas
      canvas-id="sliderCanvas"
      id="sliderCanvas"
      :style="{
        width: sliderWidth + 'px',
        height: sliderHeight + 'px',
        position: 'absolute',
        top: sliderY + 'px',
        left: sliderX + 'px'
      }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    />
    <view v-if="showRefresh" class="refresh-btn" @tap="refresh">
      <text>⟳</text>
    </view>
    <view v-if="status" class="status-overlay" :class="status">
      {{ status === 'success' ? '验证成功' : '验证失败' }}
    </view>
  </view>
</template>

<script>
import { CaptchaGenerator } from '../../core/generator'
import { UniRenderer } from '../renderer'

export default {
  name: 'SliderCaptcha',
  props: {
    width: { type: Number, default: 300 },
    height: { type: Number, default: 170 },
    precision: { type: Number, default: 5 },
    showRefresh: { type: Boolean, default: true },
  },
  data() {
    return {
      sliderX: 0,
      sliderY: 0,
      targetX: 0,
      status: '',
      isDragging: false,
      startX: 0,
    }
  },
  computed: {
    sliderWidth() {
      return 42
    },
    sliderHeight() {
      return 42
    },
  },
  mounted() {
    this.generator = new CaptchaGenerator()
    this.initCanvas()
  },
  methods: {
    initCanvas() {
      this.bgCtx = uni.createCanvasContext('bgCanvas', this)
      this.sliderCtx = uni.createCanvasContext('sliderCanvas', this)
      this.renderer = new UniRenderer(this.bgCtx, this.sliderCtx)
      this.refresh()
    },
    refresh() {
      const result = this.generator.generate({
        type: 'slider',
        width: this.width,
        height: this.height,
      })

      this.sliderY = result.sliderY
      this.targetX = result.target[0]
      this.sliderX = 0
      this.status = ''

      this.renderer.render(result)
      this.$emit('refresh')
    },
    // ... 触摸事件处理
  },
}
</script>

<style scoped>
.captcha-container {
  position: relative;
  overflow: hidden;
}
/* ... */
</style>
```

#### Taro 组件

```tsx
// packages/mp/src/taro/components/SliderCaptcha.tsx
import { View, Canvas } from '@tarojs/components'
import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { CaptchaGenerator } from '../../core/generator'
import { TaroRenderer } from '../renderer'
import type { SliderCaptchaProps } from '../types'

export default function SliderCaptcha(props: SliderCaptchaProps) {
  const {
    width = 300,
    height = 170,
    precision = 5,
    showRefresh = true,
    onSuccess,
    onFail,
    onRefresh,
  } = props

  const generatorRef = useRef<CaptchaGenerator>()
  const rendererRef = useRef<TaroRenderer>()

  const [sliderX, setSliderX] = useState(0)
  const [sliderY, setSliderY] = useState(0)
  const [status, setStatus] = useState('')
  const [targetX, setTargetX] = useState(0)

  useEffect(() => {
    generatorRef.current = new CaptchaGenerator()
    initCanvas()
  }, [])

  const initCanvas = async () => {
    // Taro Canvas 初始化
    const bgCtx = Taro.createCanvasContext('bgCanvas')
    const sliderCtx = Taro.createCanvasContext('sliderCanvas')

    rendererRef.current = new TaroRenderer(bgCtx, sliderCtx)
    refresh()
  }

  const refresh = () => {
    const result = generatorRef.current!.generate({
      type: 'slider',
      width,
      height,
    })

    setSliderY(result.sliderY)
    setTargetX(result.target[0])
    setSliderX(0)
    setStatus('')

    rendererRef.current?.render(result)
    onRefresh?.()
  }

  const handleTouchStart = (e) => {
    // 触摸开始处理
  }

  const handleTouchMove = (e) => {
    // 触摸移动处理
  }

  const handleTouchEnd = () => {
    // 触摸结束处理
    verify()
  }

  const verify = () => {
    const diff = Math.abs(sliderX - targetX)
    if (diff <= precision) {
      setStatus('success')
      onSuccess?.()
    } else {
      setStatus('fail')
      onFail?.()
      setTimeout(refresh, 500)
    }
  }

  return (
    <View className="captcha-container">
      <Canvas
        canvasId="bgCanvas"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
      <Canvas
        canvasId="sliderCanvas"
        style={{
          width: '42px',
          height: '42px',
          position: 'absolute',
          top: `${sliderY}px`,
          left: `${sliderX}px`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      {showRefresh && (
        <View className="refresh-btn" onClick={refresh}>
          ⟳
        </View>
      )}
      {status && (
        <View className={`status-overlay ${status}`}>
          {status === 'success' ? '验证成功' : '验证失败'}
        </View>
      )}
    </View>
  )
}
```

### 3.5 Flutter 版本

#### 核心生成器

```dart
// packages/flutter/lib/src/core/generator.dart
import 'dart:math';
import 'dart:typed_data';
import 'dart:ui' as ui;

class CaptchaGenerateOptions {
  final String type;
  final int width;
  final int height;
  final int? sliderWidth;
  final int? sliderHeight;
  final int? precision;

  CaptchaGenerateOptions({
    required this.type,
    required this.width,
    required this.height,
    this.sliderWidth,
    this.sliderHeight,
    this.precision,
  });
}

class CaptchaGenerateResult {
  final ui.Image bgImage;
  final ui.Image? sliderImage;
  final List<int> target;
  final int? sliderY;

  CaptchaGenerateResult({
    required this.bgImage,
    this.sliderImage,
    required this.target,
    this.sliderY,
  });
}

class CaptchaGenerator {
  final Random _random = Random();

  Future<CaptchaGenerateResult> generate(CaptchaGenerateOptions options) async {
    // 创建背景图片
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);

    // 生成背景
    _generateBackground(canvas, options.width, options.height);

    // 生成滑块区域
    final result = await _generateSlider(canvas, options);

    final picture = recorder.endRecording();
    final bgImage = await picture.toImage(options.width, options.height);

    return CaptchaGenerateResult(
      bgImage: bgImage,
      sliderImage: result['sliderImage'],
      target: result['target'],
      sliderY: result['sliderY'],
    );
  }

  void _generateBackground(Canvas canvas, int width, int height) {
    // 渐变背景
    final paint = Paint()
      ..shader = ui.Gradient.linear(
        Offset(0, 0),
        Offset(width.toDouble(), height.toDouble()),
        [
          Color.fromRGBO(100, 126, 234, 1),
          Color.fromRGBO(118, 75, 162, 1),
        ],
      );
    canvas.drawRect(Rect.fromLTWH(0, 0, width.toDouble(), height.toDouble()), paint);

    // 装饰图形
    for (int i = 0; i < 8; i++) {
      final shapePaint = Paint()
        ..color = Color.fromRGBO(255, 255, 255, 0.15);
      canvas.drawOval(
        Rect.fromLTWH(
          _randomInt(-20, width - 20).toDouble(),
          _randomInt(-20, height - 20).toDouble(),
          _randomInt(40, 80).toDouble(),
          _randomInt(40, 80).toDouble(),
        ),
        shapePaint,
      );
    }
  }

  Future<Map<String, dynamic>> _generateSlider(
    Canvas canvas,
    CaptchaGenerateOptions options,
  ) async {
    final sliderWidth = options.sliderWidth ?? 42;
    final sliderHeight = options.sliderHeight ?? 42;
    final targetX = _randomInt(sliderWidth + 20, options.width - sliderWidth - 20);
    final targetY = _randomInt(10, options.height - sliderHeight - 10);

    // 创建滑块图片
    final sliderRecorder = ui.PictureRecorder();
    final sliderCanvas = Canvas(sliderRecorder);

    // 绘制滑块形状
    final path = _createShapePath(
      0, 0,
      sliderWidth.toDouble(),
      sliderHeight.toDouble(),
      8,
    );

    // ... 继续实现

    return {
      'target': [targetX],
      'sliderY': targetY,
      'sliderImage': null, // TODO
    };
  }

  Path _createShapePath(double x, double y, double w, double h, double r) {
    return Path()
      ..moveTo(x + r, y)
      ..lineTo(x + w - r, y)
      ..arcToPoint(Offset(x + w, y + r), radius: Radius.circular(r))
      ..lineTo(x + w, y + h - r)
      ..arcToPoint(Offset(x + w - r, y + h), radius: Radius.circular(r))
      ..lineTo(x + r, y + h)
      ..arcToPoint(Offset(x, y + h - r), radius: Radius.circular(r))
      ..lineTo(x, y + r)
      ..arcToPoint(Offset(x + r, y), radius: Radius.circular(r))
      ..close();
  }

  int _randomInt(int min, int max) {
    return min + _random.nextInt(max - min + 1);
  }
}
```

#### Widget 组件

```dart
// packages/flutter/lib/src/widgets/slider_captcha.dart
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../core/generator.dart';

class SliderCaptcha extends StatefulWidget {
  final double width;
  final double height;
  final double sliderWidth;
  final double sliderHeight;
  final int precision;
  final bool showRefresh;
  final VoidCallback? onSuccess;
  final VoidCallback? onFail;
  final VoidCallback? onRefresh;

  const SliderCaptcha({
    Key? key,
    this.width = 300,
    this.height = 170,
    this.sliderWidth = 42,
    this.sliderHeight = 42,
    this.precision = 5,
    this.showRefresh = true,
    this.onSuccess,
    this.onFail,
    this.onRefresh,
  }) : super(key: key);

  @override
  State<SliderCaptcha> createState() => _SliderCaptchaState();
}

class _SliderCaptchaState extends State<SliderCaptcha> {
  final CaptchaGenerator _generator = CaptchaGenerator();

  ui.Image? _bgImage;
  ui.Image? _sliderImage;
  double _sliderX = 0;
  double _sliderY = 0;
  double _targetX = 0;
  bool _isDragging = false;
  String? _status;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  Future<void> _refresh() async {
    final result = await _generator.generate(CaptchaGenerateOptions(
      type: 'slider',
      width: widget.width.toInt(),
      height: widget.height.toInt(),
      sliderWidth: widget.sliderWidth.toInt(),
      sliderHeight: widget.sliderHeight.toInt(),
    ));

    setState(() {
      _bgImage = result.bgImage;
      _sliderImage = result.sliderImage;
      _sliderY = result.sliderY?.toDouble() ?? 0;
      _targetX = result.target.first.toDouble();
      _sliderX = 0;
      _status = null;
    });

    widget.onRefresh?.call();
  }

  void _onHorizontalDragStart(DragStartDetails details) {
    if (_status != null) return;
    setState(() => _isDragging = true);
  }

  void _onHorizontalDragUpdate(DragUpdateDetails details) {
    if (!_isDragging) return;

    final maxX = widget.width - widget.sliderWidth;
    setState(() {
      _sliderX = (_sliderX + details.delta.dx).clamp(0.0, maxX);
    });
  }

  void _onHorizontalDragEnd(DragEndDetails details) {
    if (!_isDragging) return;

    setState(() => _isDragging = false);
    _verify();
  }

  void _verify() {
    final diff = (_sliderX - _targetX).abs();

    if (diff <= widget.precision) {
      setState(() => _status = 'success');
      widget.onSuccess?.call();
    } else {
      setState(() => _status = 'fail');
      widget.onFail?.call();
      Future.delayed(const Duration(milliseconds: 500), _refresh);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.width + 20,
      height: widget.height + 60,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        children: [
          // 验证码区域
          Expanded(
            child: Stack(
              children: [
                // 背景图
                if (_bgImage != null)
                  CustomPaint(
                    size: Size(widget.width, widget.height),
                    painter: ImagePainter(_bgImage!),
                  ),
                // 滑块
                if (_sliderImage != null)
                  Positioned(
                    left: _sliderX,
                    top: _sliderY,
                    child: CustomPaint(
                      size: Size(widget.sliderWidth, widget.sliderHeight),
                      painter: ImagePainter(_sliderImage!),
                    ),
                  ),
                // 刷新按钮
                if (widget.showRefresh)
                  Positioned(
                    top: 10,
                    right: 10,
                    child: GestureDetector(
                      onTap: _refresh,
                      child: Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Icon(Icons.refresh, size: 16),
                      ),
                    ),
                  ),
                // 状态提示
                if (_status != null)
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      height: 28,
                      color: _status == 'success'
                          ? Colors.green.withOpacity(0.9)
                          : Colors.red.withOpacity(0.9),
                      child: Center(
                        child: Text(
                          _status == 'success' ? '验证成功' : '验证失败',
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          // 滑动条
          GestureDetector(
            onHorizontalDragStart: _onHorizontalDragStart,
            onHorizontalDragUpdate: _onHorizontalDragUpdate,
            onHorizontalDragEnd: _onHorizontalDragEnd,
            child: Container(
              height: 40,
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(4),
              ),
              child: Stack(
                children: [
                  AnimatedPositioned(
                    duration: _isDragging ? Duration.zero : const Duration(milliseconds: 100),
                    left: _sliderX,
                    child: Container(
                      width: 36,
                      height: 36,
                      margin: const EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border.all(color: Colors.grey[300]!),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Icon(
                        Icons.arrow_forward_ios,
                        color: Theme.of(context).primaryColor,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ImagePainter extends CustomPainter {
  final ui.Image image;

  ImagePainter(this.image);

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawImage(image, Offset.zero, Paint());
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
```

### 3.6 Android 原生 SDK

#### 核心生成器

```kotlin
// packages/android/captcha-sdk/src/main/java/com/captcha/pro/core/CaptchaGenerator.kt
package com.captcha.pro.core

import android.graphics.*
import kotlin.random.Random

data class CaptchaGenerateOptions(
    val type: String = "slider",
    val width: Int = 300,
    val height: Int = 170,
    val sliderWidth: Int = 42,
    val sliderHeight: Int = 42,
    val precision: Int = 5
)

data class CaptchaGenerateResult(
    val bgBitmap: Bitmap,
    val sliderBitmap: Bitmap?,
    val targetX: Int,
    val sliderY: Int
)

class CaptchaGenerator {
    private val random = Random.Default

    fun generate(options: CaptchaGenerateOptions): CaptchaGenerateResult {
        // 创建背景 Bitmap
        val bgBitmap = Bitmap.createBitmap(options.width, options.height, Bitmap.Config.ARGB_8888)
        val bgCanvas = Canvas(bgBitmap)

        // 生成背景
        generateBackground(bgCanvas, options.width, options.height)

        // 随机目标位置
        val targetX = random.nextInt(options.sliderWidth + 20, options.width - options.sliderWidth - 20)
        val targetY = random.nextInt(10, options.height - options.sliderHeight - 10)

        // 创建滑块 Bitmap
        val sliderBitmap = Bitmap.createBitmap(options.sliderWidth, options.sliderHeight, Bitmap.Config.ARGB_8888)
        val sliderCanvas = Canvas(sliderBitmap)

        // 复制背景区域到滑块
        val pixels = IntArray(options.sliderWidth * options.sliderHeight)
        bgBitmap.getPixels(pixels, 0, options.sliderWidth, targetX, targetY, options.sliderWidth, options.sliderHeight)
        sliderBitmap.setPixels(pixels, 0, options.sliderWidth, 0, 0, options.sliderWidth, options.sliderHeight)

        // 在背景上绘制目标区域
        val paint = Paint().apply {
            color = Color.parseColor("#4D000000") // 30% 黑色
        }
        bgCanvas.drawRect(
            targetX.toFloat(), targetY.toFloat(),
            (targetX + options.sliderWidth).toFloat(), (targetY + options.sliderHeight).toFloat(),
            paint
        )

        return CaptchaGenerateResult(bgBitmap, sliderBitmap, targetX, targetY)
    }

    private fun generateBackground(canvas: Canvas, width: Int, height: Int) {
        // 渐变背景
        val gradient = LinearGradient(
            0f, 0f, width.toFloat(), height.toFloat(),
            intArrayOf(
                Color.parseColor("#667eea"),
                Color.parseColor("#764ba2")
            ),
            null,
            Shader.TileMode.CLAMP
        )

        val paint = Paint().apply { shader = gradient }
        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)

        // 装饰图形
        for (i in 0 until 8) {
            paint.shader = null
            paint.color = Color.argb(38, 255, 255, 255) // 15% 白色
            val left = random.nextInt(-20, width - 20).toFloat()
            val top = random.nextInt(-20, height - 20).toFloat()
            val size = random.nextInt(40, 80).toFloat()
            canvas.drawOval(left, top, left + size, top + size, paint)
        }
    }
}
```

#### View 组件

```kotlin
// packages/android/captcha-sdk/src/main/java/com/captcha/pro/widget/SliderCaptchaView.kt
package com.captcha.pro.widget

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import android.widget.FrameLayout
import com.captcha.pro.core.CaptchaGenerator
import com.captcha.pro.core.CaptchaGenerateOptions

class SliderCaptchaView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val generator = CaptchaGenerator()

    private var bgBitmap: Bitmap? = null
    private var sliderBitmap: Bitmap? = null
    private var targetX: Int = 0
    private var sliderY: Int = 0
    private var currentX: Float = 0f

    private val bgView: CaptchaImageView
    private val sliderView: CaptchaImageView
    private val sliderBar: SliderBar

    private var isDragging = false
    private var startX = 0f

    var on Success: (() -> Unit)? = null
    var onFail: (() -> Unit)? = null
    var onRefresh: (() -> Unit)? = null

    init {
        bgView = CaptchaImageView(context)
        sliderView = CaptchaImageView(context)
        sliderBar = SliderBar(context)

        addView(bgView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        addView(sliderView, LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT))
        addView(sliderBar, LayoutParams(LayoutParams.MATCH_PARENT, 40))

        sliderBar.onDragListener = { delta ->
            currentX = (currentX + delta).coerceIn(0f, (width - sliderWidth).toFloat())
            sliderView.translationX = currentX
            sliderView.translationY = sliderY.toFloat()
        }

        sliderBar.onDragEndListener = {
            verify()
        }
    }

    var width: Int = 300
        set(value) {
            field = value
            refresh()
        }

    var height: Int = 170
        set(value) {
            field = value
            refresh()
        }

    var sliderWidth: Int = 42
    var sliderHeight: Int = 42
    var precision: Int = 5

    fun refresh() {
        val result = generator.generate(CaptchaGenerateOptions(
            width = width,
            height = height,
            sliderWidth = sliderWidth,
            sliderHeight = sliderHeight
        ))

        bgBitmap = result.bgBitmap
        sliderBitmap = result.sliderBitmap
        targetX = result.targetX
        sliderY = result.sliderY
        currentX = 0f

        bgView.setImageBitmap(bgBitmap)
        sliderView.setImageBitmap(sliderBitmap)
        sliderView.translationX = 0f
        sliderView.translationY = sliderY.toFloat()

        onRefresh?.invoke()
    }

    private fun verify() {
        val diff = Math.abs(currentX - targetX)
        if (diff <= precision) {
            onSuccess?.invoke()
        } else {
            onFail?.invoke()
            postDelayed({ refresh() }, 500)
        }
    }
}
```

#### Jetpack Compose 版本

```kotlin
// packages/android/captcha-compose/src/main/java/com/captcha/pro/compose/SliderCaptcha.kt
package com.captcha.pro.compose

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import com.captcha.pro.core.CaptchaGenerator
import com.captcha.pro.core.CaptchaGenerateOptions

@Composable
fun SliderCaptcha(
    modifier: Modifier = Modifier,
    width: Int = 300,
    height: Int = 170,
    sliderWidth: Int = 42,
    sliderHeight: Int = 42,
    precision: Int = 5,
    showRefresh: Boolean = true,
    onSuccess: () -> Unit = {},
    onFail: () -> Unit = {},
    onRefresh: () -> Unit = {},
) {
    val generator = remember { CaptchaGenerator() }

    var bgBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var sliderBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var targetX by remember { mutableStateOf(0f) }
    var sliderY by remember { mutableStateOf(0f) }
    var currentX by remember { mutableStateOf(0f) }
    var status by remember { mutableStateOf<String?>(null) }

    fun refresh() {
        val result = generator.generate(CaptchaGenerateOptions(
            width = width,
            height = height,
            sliderWidth = sliderWidth,
            sliderHeight = sliderHeight
        ))
        bgBitmap = result.bgBitmap
        sliderBitmap = result.sliderBitmap
        targetX = result.targetX.toFloat()
        sliderY = result.sliderY.toFloat()
        currentX = 0f
        status = null
        onRefresh()
    }

    fun verify() {
        if (kotlin.math.abs(currentX - targetX) <= precision) {
            status = "success"
            onSuccess()
        } else {
            status = "fail"
            onFail()
            kotlinx.coroutines.GlobalScope.launch {
                kotlinx.coroutines.delay(500)
                refresh()
            }
        }
    }

    LaunchedEffect(Unit) {
        refresh()
    }

    Column(modifier = modifier.padding(10.dp)) {
        // 验证码区域
        Box(
            modifier = Modifier
                .width(width.dp)
                .height(height.dp)
        ) {
            // 背景图
            bgBitmap?.let { bitmap ->
                Canvas(modifier = Modifier.matchParentSize()) {
                    drawIntoCanvas { canvas ->
                        canvas.nativeCanvas.drawBitmap(
                            bitmap,
                            null,
                            android.graphics.Rect(0, 0, size.width.toInt(), size.height.toInt()),
                            null
                        )
                    }
                }
            }

            // 滑块
            sliderBitmap?.let { bitmap ->
                Canvas(
                    modifier = Modifier
                        .offset(x = currentX.dp, y = sliderY.dp)
                        .width(sliderWidth.dp)
                        .height(sliderHeight.dp)
                ) {
                    drawIntoCanvas { canvas ->
                        canvas.nativeCanvas.drawBitmap(bitmap, 0f, 0f, null)
                    }
                }
            }

            // 刷新按钮
            if (showRefresh) {
                IconButton(
                    onClick = { refresh() },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                }
            }

            // 状态提示
            status?.let { s ->
                Surface(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .height(28.dp),
                    color = if (s == "success") Color(0xFF52C41A) else Color(0xFFF5222D)
                ) {
                    Text(
                        text = if (s == "success") "验证成功" else "验证失败",
                        color = Color.White,
                        modifier = Modifier.wrapContentSize(Alignment.Center)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // 滑动条
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(40.dp)
                .background(Color(0xFFF7F9FA), RoundedCornerShape(4.dp))
                .pointerInput(Unit) {
                    detectHorizontalDragGestures(
                        onDragStart = { status == null },
                        onDragEnd = { verify() }
                    ) { change, dragAmount ->
                        if (status == null) {
                            currentX = (currentX + dragAmount).coerceIn(0f, (width - sliderWidth).toFloat())
                        }
                    }
                }
        ) {
            Surface(
                modifier = Modifier
                    .offset(x = currentX.dp)
                    .width(36.dp)
                    .height(36.dp)
                    .padding(2.dp),
                color = Color.White,
                shape = RoundedCornerShape(4.dp),
                border = BorderStroke(1.dp, Color(0xFFE1E4E8))
            ) {
                Icon(
                    Icons.Default.ArrowForward,
                    contentDescription = null,
                    tint = MaterialTheme.colors.primary,
                    modifier = Modifier.padding(8.dp)
                )
            }
        }
    }
}
```

### 3.7 iOS 原生 SDK

#### 核心生成器

```swift
// packages/ios/Sources/Core/CaptchaGenerator.swift
import CoreGraphics
import UIKit

public struct CaptchaGenerateOptions {
    public var type: String = "slider"
    public var width: Int = 300
    public var height: Int = 170
    public var sliderWidth: Int = 42
    public var sliderHeight: Int = 42
    public var precision: Int = 5

    public init() {}
}

public struct CaptchaGenerateResult {
    public let bgImage: UIImage
    public let sliderImage: UIImage?
    public let targetX: Int
    public let sliderY: Int
}

public class CaptchaGenerator {
    public init() {}

    public func generate(options: CaptchaGenerateOptions) -> CaptchaGenerateResult {
        // 创建背景图
        let bgSize = CGSize(width: options.width, height: options.height)
        UIGraphicsBeginImageContextWithOptions(bgSize, false, UIScreen.main.scale)
        guard let bgContext = UIGraphicsGetCurrentContext() else {
            fatalError("Failed to create graphics context")
        }

        // 生成渐变背景
        let colors = [
            UIColor(red: 0.4, green: 0.49, blue: 0.92, alpha: 1).cgColor,
            UIColor(red: 0.46, green: 0.29, blue: 0.64, alpha: 1).cgColor
        ]
        let gradient = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: colors as CFArray, locations: [0, 1])!
        bgContext.drawLinearGradient(gradient, start: .zero, end: CGPoint(x: options.width, y: options.height), options: [])

        // 添加装饰图形
        for _ in 0..<8 {
            let x = CGFloat(Int.random(in: -20...(options.width - 20)))
            let y = CGFloat(Int.random(in: -20...(options.height - 20)))
            let size = CGFloat(Int.random(in: 40...80))
            UIColor.white.withAlphaComponent(0.15).setFill()
            UIRectFrame(CGRect(x: x, y: y, width: size, height: size))
        }

        // 随机目标位置
        let targetX = Int.random(in: (options.sliderWidth + 20)...(options.width - options.sliderWidth - 20))
        let targetY = Int.random(in: 10...(options.height - options.sliderHeight - 10))

        // 创建滑块图
        let sliderRect = CGRect(x: 0, y: 0, width: options.sliderWidth, height: options.sliderHeight)
        UIGraphicsBeginImageContextWithOptions(sliderRect.size, false, UIScreen.main.scale)
        guard let sliderContext = UIGraphicsGetCurrentContext() else {
            fatalError("Failed to create slider graphics context")
        }

        // 从背景复制滑块区域
        guard let bgImage = UIGraphicsGetImageFromCurrentImageContext() else {
            fatalError("Failed to get background image")
        }
        bgImage.draw(in: CGRect(origin: .zero, size: bgSize))
        sliderContext.clip(to: sliderRect)
        let sliderImage = UIGraphicsGetImageFromCurrentImageContext()

        UIGraphicsEndImageContext()

        // 在背景上绘制目标区域
        UIColor.black.withAlphaComponent(0.3).setFill()
        bgContext.fill(CGRect(x: targetX, y: targetY, width: options.sliderWidth, height: options.sliderHeight))

        guard let finalBgImage = UIGraphicsGetImageFromCurrentImageContext() else {
            fatalError("Failed to get final background image")
        }
        UIGraphicsEndImageContext()

        return CaptchaGenerateResult(
            bgImage: finalBgImage,
            sliderImage: sliderImage,
            targetX: targetX,
            sliderY: targetY
        )
    }
}
```

#### UIView 组件

```swift
// packages/ios/Sources/Views/SliderCaptchaView.swift
import UIKit

public protocol SliderCaptchaViewDelegate: AnyObject {
    func sliderCaptchaDidSucceed(_ view: SliderCaptchaView)
    func sliderCaptchaDidFail(_ view: SliderCaptchaView)
    func sliderCaptchaDidRefresh(_ view: SliderCaptchaView)
}

public class SliderCaptchaView: UIView {
    // MARK: - Properties
    private let generator = CaptchaGenerator()

    private var bgImageView = UIImageView()
    private var sliderImageView = UIImageView()
    private var sliderBarView = UIView()
    private var sliderThumbView = UIView()
    private var statusView = UIView()
    private var statusLabel = UILabel()
    private var refreshButton = UIButton()

    private var targetX: CGFloat = 0
    private var sliderY: CGFloat = 0
    private var currentX: CGFloat = 0
    private var isDragging = false

    public weak var delegate: SliderCaptchaViewDelegate?

    public var captchaWidth: Int = 300 {
        didSet { refresh() }
    }
    public var captchaHeight: Int = 170 {
        didSet { refresh() }
    }
    public var sliderWidth: Int = 42
    public var sliderHeight: Int = 42
    public var precision: Int = 5
    public var showRefresh: Bool = true {
        didSet { refreshButton.isHidden = !showRefresh }
    }

    // MARK: - Initialization
    public override init(frame: CGRect) {
        super.init(frame: frame)
        setupViews()
    }

    public required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupViews()
    }

    private func setupViews() {
        // 背景图
        addSubview(bgImageView)
        bgImageView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            bgImageView.topAnchor.constraint(equalTo: topAnchor),
            bgImageView.leadingAnchor.constraint(equalTo: leadingAnchor),
            bgImageView.trailingAnchor.constraint(equalTo: trailingAnchor),
            bgImageView.heightAnchor.constraint(equalToConstant: CGFloat(captchaHeight))
        ])

        // 滑块图
        addSubview(sliderImageView)
        sliderImageView.translatesAutoresizingMaskIntoConstraints = false
        sliderImageView.widthAnchor.constraint(equalToConstant: CGFloat(sliderWidth)).isActive = true
        sliderImageView.heightAnchor.constraint(equalToConstant: CGFloat(sliderHeight)).isActive = true

        // 刷新按钮
        addSubview(refreshButton)
        refreshButton.translatesAutoresizingMaskIntoConstraints = false
        refreshButton.topAnchor.constraint(equalTo: bgImageView.topAnchor, constant: 10).isActive = true
        refreshButton.trailingAnchor.constraint(equalTo: bgImageView.trailingAnchor, constant: -10).isActive = true
        refreshButton.widthAnchor.constraint(equalToConstant: 28).isActive = true
        refreshButton.heightAnchor.constraint(equalToConstant: 28).isActive = true
        refreshButton.setImage(UIImage(systemName: "arrow.clockwise"), for: .normal)
        refreshButton.addTarget(self, action: #selector(refresh), for: .touchUpInside)

        // 状态提示
        addSubview(statusView)
        statusView.translatesAutoresizingMaskIntoConstraints = false
        statusView.bottomAnchor.constraint(equalTo: bgImageView.bottomAnchor).isActive = true
        statusView.leadingAnchor.constraint(equalTo: bgImageView.leadingAnchor).isActive = true
        statusView.trailingAnchor.constraint(equalTo: bgImageView.trailingAnchor).isActive = true
        statusView.heightAnchor.constraint(equalToConstant: 28).isActive = true
        statusView.isHidden = true

        statusLabel.textAlignment = .center
        statusLabel.textColor = .white
        statusView.addSubview(statusLabel)
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        statusLabel.centerXAnchor.constraint(equalTo: statusView.centerXAnchor).isActive = true
        statusLabel.centerYAnchor.constraint(equalTo: statusView.centerYAnchor).isActive = true

        // 滑动条
        addSubview(sliderBarView)
        sliderBarView.translatesAutoresizingMaskIntoConstraints = false
        sliderBarView.topAnchor.constraint(equalTo: bgImageView.bottomAnchor, constant: 10).isActive = true
        sliderBarView.leadingAnchor.constraint(equalTo: leadingAnchor).isActive = true
        sliderBarView.trailingAnchor.constraint(equalTo: trailingAnchor).isActive = true
        sliderBarView.heightAnchor.constraint(equalToConstant: 40).isActive = true
        sliderBarView.backgroundColor = UIColor(white: 0.97, alpha: 1)
        sliderBarView.layer.cornerRadius = 4

        // 滑块按钮
        sliderBarView.addSubview(sliderThumbView)
        sliderThumbView.frame = CGRect(x: 2, y: 2, width: 36, height: 36)
        sliderThumbView.backgroundColor = .white
        sliderThumbView.layer.cornerRadius = 4
        sliderThumbView.layer.borderWidth = 1
        sliderThumbView.layer.borderColor = UIColor(white: 0.9, alpha: 1).cgColor

        // 添加拖拽手势
        let panGesture = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
        sliderThumbView.addGestureRecognizer(panGesture)

        refresh()
    }

    // MARK: - Public Methods
    @objc public func refresh() {
        let result = generator.generate(options: CaptchaGenerateOptions(
            width: captchaWidth,
            height: captchaHeight,
            sliderWidth: sliderWidth,
            sliderHeight: sliderHeight
        ))

        bgImageView.image = result.bgImage
        sliderImageView.image = result.sliderImage
        targetX = CGFloat(result.targetX)
        sliderY = CGFloat(result.sliderY)
        currentX = 0
        statusView.isHidden = true

        sliderImageView.frame = CGRect(x: 0, y: Int(sliderY), width: sliderWidth, height: sliderHeight)
        sliderThumbView.frame = CGRect(x: 2, y: 2, width: 36, height: 36)

        delegate?.sliderCaptchaDidRefresh(self)
    }

    // MARK: - Private Methods
    @objc private func handlePan(_ gesture: UIPanGestureRecognizer) {
        let translation = gesture.translation(in: sliderBarView)

        switch gesture.state {
        case .changed:
            let maxX = CGFloat(captchaWidth - sliderWidth)
            currentX = max(0, min(currentX + translation.x, maxX))
            sliderThumbView.frame.origin.x = currentX + 2
            sliderImageView.frame.origin.x = currentX
            gesture.setTranslation(.zero, in: sliderBarView)

        case .ended:
            verify()

        default:
            break
        }
    }

    private func verify() {
        let diff = abs(currentX - targetX)

        if diff <= CGFloat(precision) {
            statusView.backgroundColor = UIColor(red: 0.32, green: 0.77, blue: 0.1, alpha: 0.9)
            statusLabel.text = "验证成功"
            statusView.isHidden = false
            delegate?.sliderCaptchaDidSucceed(self)
        } else {
            statusView.backgroundColor = UIColor(red: 0.96, green: 0.13, blue: 0.18, alpha: 0.9)
            statusLabel.text = "验证失败"
            statusView.isHidden = false
            delegate?.sliderCaptchaDidFail(self)

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                self?.refresh()
            }
        }
    }
}
```

#### SwiftUI 版本

```swift
// packages/ios/Sources/SwiftUI/SliderCaptcha.swift
import SwiftUI

public struct SliderCaptcha: View {
    @StateObject private var viewModel: SliderCaptchaViewModel

    public init(
        width: Int = 300,
        height: Int = 170,
        sliderWidth: Int = 42,
        sliderHeight: Int = 42,
        precision: Int = 5,
        showRefresh: Bool = true,
        onSuccess: @escaping () -> Void = {},
        onFail: @escaping () -> Void = {},
        onRefresh: @escaping () -> Void = {}
    ) {
        _viewModel = StateObject(wrappedValue: SliderCaptchaViewModel(
            width: width,
            height: height,
            sliderWidth: sliderWidth,
            sliderHeight: sliderHeight,
            precision: precision,
            showRefresh: showRefresh,
            onSuccess: onSuccess,
            onFail: onFail,
            onRefresh: onRefresh
        ))
    }

    public var body: some View {
        VStack(spacing: 10) {
            // 验证码区域
            ZStack(alignment: .topTrailing) {
                // 背景图
                if let bgImage = viewModel.bgImage {
                    Image(uiImage: bgImage)
                        .resizable()
                        .frame(width: CGFloat(viewModel.width), height: CGFloat(viewModel.height))
                }

                // 滑块
                if let sliderImage = viewModel.sliderImage {
                    Image(uiImage: sliderImage)
                        .resizable()
                        .frame(width: CGFloat(viewModel.sliderWidth), height: CGFloat(viewModel.sliderHeight))
                        .offset(x: viewModel.currentX, y: viewModel.sliderY)
                }

                // 刷新按钮
                if viewModel.showRefresh {
                    Button(action: { viewModel.refresh() }) {
                        Image(systemName: "arrow.clockwise")
                            .foregroundColor(.gray)
                            .frame(width: 28, height: 28)
                            .background(Color.white.opacity(0.9))
                            .cornerRadius(4)
                    }
                    .padding(10)
                }

                // 状态提示
                if let status = viewModel.status {
                    HStack {
                        Image(systemName: status == .success ? "checkmark" : "xmark")
                        Text(status == .success ? "验证成功" : "验证失败")
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 28)
                    .background(status == .success ? Color.green.opacity(0.9) : Color.red.opacity(0.9))
                    .frame(maxHeight: .infinity, alignment: .bottom)
                }
            }
            .frame(width: CGFloat(viewModel.width), height: CGFloat(viewModel.height))
            .cornerRadius(4)

            // 滑动条
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Color(white: 0.97)
                        .cornerRadius(4)

                    RoundedRectangle(cornerRadius: 4)
                        .fill(viewModel.currentX > 0 ? Color.blue.opacity(0.08) : Color.clear)
                        .frame(width: viewModel.currentX + 40)

                    RoundedRectangle(cornerRadius: 4)
                        .stroke(viewModel.currentX > 0 ? Color.blue : Color.clear, lineWidth: 1)
                        .frame(width: viewModel.currentX + 40)

                    Capsule()
                        .fill(Color.white)
                        .frame(width: 36, height: 36)
                        .overlay(
                            Image(systemName: "chevron.right")
                                .foregroundColor(.blue)
                        )
                        .shadow(radius: 1)
                        .offset(x: viewModel.currentX + 2)
                        .gesture(
                            DragGesture()
                                .onChanged { value in
                                    let maxX = CGFloat(viewModel.width - viewModel.sliderWidth)
                                    viewModel.currentX = max(0, min(viewModel.currentX + value.translation.width, maxX))
                                }
                                .onEnded { _ in
                                    viewModel.verify()
                                }
                        )
                }
            }
            .frame(height: 40)
        }
        .padding(10)
        .background(Color.white)
        .cornerRadius(8)
        .shadow(radius: 2)
        .onAppear { viewModel.refresh() }
    }
}

class SliderCaptchaViewModel: ObservableObject {
    @Published var bgImage: UIImage?
    @Published var sliderImage: UIImage?
    @Published var currentX: CGFloat = 0
    @Published var sliderY: CGFloat = 0
    @Published var status: Status?

    private let generator = CaptchaGenerator()
    private var targetX: CGFloat = 0

    let width: Int
    let height: Int
    let sliderWidth: Int
    let sliderHeight: Int
    let precision: Int
    let showRefresh: Bool
    let onSuccess: () -> Void
    let onFail: () -> Void
    let onRefresh: () -> Void

    enum Status {
        case success, fail
    }

    init(
        width: Int,
        height: Int,
        sliderWidth: Int,
        sliderHeight: Int,
        precision: Int,
        showRefresh: Bool,
        onSuccess: @escaping () -> Void,
        onFail: @escaping () -> Void,
        onRefresh: @escaping () -> Void
    ) {
        self.width = width
        self.height = height
        self.sliderWidth = sliderWidth
        self.sliderHeight = sliderHeight
        self.precision = precision
        self.showRefresh = showRefresh
        self.onSuccess = onSuccess
        self.onFail = onFail
        self.onRefresh = onRefresh
    }

    func refresh() {
        let result = generator.generate(options: CaptchaGenerateOptions(
            width: width,
            height: height,
            sliderWidth: sliderWidth,
            sliderHeight: sliderHeight
        ))

        bgImage = result.bgImage
        sliderImage = result.sliderImage
        targetX = CGFloat(result.targetX)
        sliderY = CGFloat(result.sliderY)
        currentX = 0
        status = nil

        onRefresh()
    }

    func verify() {
        let diff = abs(currentX - targetX)

        if diff <= CGFloat(precision) {
            status = .success
            onSuccess()
        } else {
            status = .fail
            onFail()
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) { [weak self] in
                self?.refresh()
            }
        }
    }
}
```

## 四、包管理与发布

### NPM 包（JS/TS 生态）

| 包名 | 说明 | 入口文件 |
|------|------|----------|
| `captcha-pro` | 核心包 + Web 版 | `packages/core` |
| `captcha-pro-vue2` | Vue 2 组件 | `packages/vue2` |
| `captcha-pro-vue3` | Vue 3 组件 | `packages/vue3` |
| `captcha-pro-react` | React 组件 | `packages/react` |
| `captcha-pro-mp` | 小程序版（微信/uni-app/Taro） | `packages/mp` |

### Flutter 包

| 包名 | 平台 | 注册表 |
|------|------|--------|
| `captcha_pro` | Flutter | pub.dev |

### 原生 SDK

| 平台 | 包名 | 注册表 |
|------|------|--------|
| Android | `com.captcha.pro:captcha-sdk` | Maven Central |
| Android Compose | `com.captcha.pro:captcha-compose` | Maven Central |
| iOS | `CaptchaPro` | CocoaPods / Swift Package Manager |

## 五、版本同步策略

### 统一版本号规范

```
MAJOR.MINOR.PATCH

MAJOR: 不兼容的 API 变更
MINOR: 向后兼容的功能新增
PATCH: 向后兼容的问题修复
```

### 发布检查清单

- [x] 所有平台版本号一致
- [x] 核心逻辑同步更新
- [x] 文档更新
- [ ] CHANGELOG 更新
- [ ] 示例代码测试

## 六、实施计划

### 第一阶段（已完成）

- [x] 核心 JS/TS 代码
- [x] 后端服务（Node.js / Java / Go）
- [x] 纯 Web 版本

### 第二阶段（已完成）

- [x] **Vue 2 组件封装** - Options API + Mixins
- [x] **Vue 3 组件封装** - Composition API + Composables
- [x] **React 组件封装** - 国际主流
- [x] **微信小程序版** - 国内小程序生态
- [x] **uni-app 版** - 跨端框架
- [x] **Taro 版** - 跨端框架

### 第三阶段（已完成）

- [x] **Flutter 版** - 跨平台移动开发
- [x] **Android SDK** - 原生 Android（含 Jetpack Compose）
- [x] **iOS SDK** - 原生 iOS（含 SwiftUI）

### 第四阶段（进行中）

- [ ] 性能优化
- [ ] 安全加固
- [ ] 单元测试覆盖
- [ ] 文档完善

## 七、技术难点与解决方案

| 难点 | 解决方案 |
|------|----------|
| 小程序 Canvas API 差异 | 抽象 Renderer 接口，各平台实现适配器 |
| 跨框架状态管理 | 使用各自框架的响应式系统（Vue reactive / React hooks） |
| 原生平台图形绘制 | Android Canvas / iOS CoreGraphics 对齐实现 |
| 跨平台一致性测试 | 建立统一的测试用例，各平台实现对比测试 |

---

*文档更新时间: 2026-03-20*
