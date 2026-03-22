<script>
export default {
  name: 'SliderCaptcha',

  props: {
    width: { type: Number, default: 300 },
    height: { type: Number, default: 170 },
    bgImage: { type: String, default: '' },
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
      sliderWidth: 42,
      sliderHeight: 42,
    }
  },

  mounted() {
    this.initCanvas()
  },

  methods: {
    initCanvas() {
      this.bgCtx = uni.createCanvasContext('bgCanvas', this)
      this.sliderCtx = uni.createCanvasContext('sliderCanvas', this)
      this.refresh()
    },

    refresh() {
      const targetX = Math.floor(
        Math.random() * (this.width - this.sliderWidth - 40) + this.sliderWidth + 20
      )
      const sliderY = Math.floor(Math.random() * (this.height - this.sliderHeight - 20) + 10)

      this.sliderX = 0
      this.sliderY = sliderY
      this.targetX = targetX
      this.status = ''

      this.drawBackground()
      this.$emit('refresh')
    },

    drawBackground() {
      const { width, height } = this
      const ctx = this.bgCtx

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw target area (shadow)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(this.targetX, this.sliderY, this.sliderWidth, this.sliderHeight)

      ctx.draw()
    },

    onTouchStart(e) {
      if (this.status) return
      this.isDragging = true
      this.startX = e.touches[0].clientX - this.sliderX
    },

    onTouchMove(e) {
      if (!this.isDragging) return

      const newX = e.touches[0].clientX - this.startX
      const maxX = this.width - this.sliderWidth

      this.sliderX = Math.max(0, Math.min(newX, maxX))
    },

    onTouchEnd() {
      if (!this.isDragging) return

      this.isDragging = false
      this.verify()
    },

    verify() {
      const diff = Math.abs(this.sliderX - this.targetX)

      if (diff <= this.precision) {
        this.status = 'success'
        this.$emit('success')
      } else {
        this.status = 'fail'
        this.$emit('fail')
        setTimeout(() => this.refresh(), 500)
      }
    },
  },
}
</script>

<template>
  <view class="captcha-container" :style="{ width: `${width  }px`, height: `${height + 60  }px` }">
    <!-- Captcha area -->
    <view class="captcha-area" :style="{ width: `${width  }px`, height: `${height  }px` }">
      <!-- Background canvas -->
      <canvas
        canvas-id="bgCanvas"
        id="bgCanvas"
        class="bg-canvas"
        :style="{ width: `${width  }px`, height: `${height  }px` }"
      />

      <!-- Slider canvas -->
      <canvas
        canvas-id="sliderCanvas"
        id="sliderCanvas"
        class="slider-canvas"
        :style="{
          width: `${sliderWidth  }px`,
          height: `${sliderHeight  }px`,
          top: `${sliderY  }px`,
          left: `${sliderX  }px`
        }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      />

      <!-- Refresh button -->
      <view v-if="showRefresh" class="refresh-btn" @tap="refresh">
        <text class="refresh-icon">⟳</text>
      </view>

      <!-- Status overlay -->
      <view v-if="status" class="status-overlay" :class="status">
        <text>{{ status === 'success' ? '验证成功' : '验证失败' }}</text>
      </view>
    </view>

    <!-- Slider bar -->
    <view class="slider-bar" :style="{ width: `${width  }px` }">
      <view
        class="slider-thumb"
        :style="{ left: `${sliderX  }px` }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <text class="slider-arrow">→</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.captcha-container {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.captcha-area {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.bg-canvas {
  position: absolute;
  top: 0;
  left: 0;
}

.slider-canvas {
  position: absolute;
  z-index: 10;
}

.refresh-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  z-index: 20;
}

.refresh-icon {
  font-size: 16px;
  color: #666;
}

.status-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  z-index: 30;
}

.status-overlay.success {
  background: rgba(82, 196, 26, 0.9);
}

.status-overlay.fail {
  background: rgba(245, 34, 45, 0.9);
}

.slider-bar {
  height: 40px;
  margin-top: 10px;
  background: #f7f9fa;
  border-radius: 4px;
  position: relative;
}

.slider-thumb {
  position: absolute;
  top: 2px;
  width: 36px;
  height: 36px;
  background: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider-arrow {
  color: #1890ff;
  font-size: 16px;
}
</style>
