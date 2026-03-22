<script>
// Chinese vocabulary library (common idioms and words)
const CHINESE_WORDS = [
  '一帆风顺', '二龙腾飞', '三阳开泰', '四季平安', '五福临门',
  '七星高照', '八方来财', '万事如意', '心想事成', '步步高升',
  '财源广进', '恭喜发财', '龙马精神', '马到成功', '金玉满堂',
  '花开富贵', '锦绣前程', '吉祥如意', '瑞气盈门', '紫气东来',
  '风调雨顺', '国泰民安', '繁荣昌盛', '万象更新', '春回大地',
  '阳光明媚', '奋发图强', '自强不息', '勇往直前', '坚持不懈',
  '厚德载物', '海纳百川', '宁静致远', '淡泊明志', '天道酬勤',
  '实事求是', '与时俱进', '开拓创新', '继往开来', '励精图治',
  '安居乐业', '幸福美满', '和谐共处', '德才兼备', '品学兼优',
  '诚实守信', '勤劳致富', '艰苦奋斗', '团结友爱', '尊老爱幼',
  '学无止境', '勤奋好学', '刻苦钻研', '博览群书', '学以致用',
  '融会贯通', '举一反三', '触类旁通', '温故知新', '循序渐进',
  '厚积薄发', '持之以恒', '孜孜不倦', '废寝忘食', '夜以继日',
  '春暖花开', '秋高气爽', '山清水秀', '鸟语花香', '绿树成荫',
  '风和日丽', '云淡风轻', '晴空万里', '皓月当空', '繁星闪烁',
  '科技创新', '人工智能', '云计算', '大数据', '物联网',
  '智慧城市', '数字经济', '智能制造', '绿色发展', '生态环保',
]

export default {
  name: 'ClickCaptcha',

  props: {
    width: { type: Number, default: 300 },
    height: { type: Number, default: 170 },
    bgImage: { type: String, default: '' },
    count: { type: Number, default: 3 },
    showRefresh: { type: Boolean, default: true },
    precision: { type: Number, default: 25 },
  },

  data() {
    return {
      status: '',
      targetPoints: [],
      clickPoints: [],
      clickTexts: [],
      clickCharImages: [],
      decoyTexts: [],
      decoyPoints: [],
    }
  },

  mounted() {
    this.initCanvas()
  },

  methods: {
    initCanvas() {
      this.bgCtx = uni.createCanvasContext('bgCanvas', this)
      this.clickCtx = uni.createCanvasContext('clickCanvas', this)
      this.refresh()
    },

    refresh() {
      this.clickPoints = []
      this.targetPoints = []
      this.clickTexts = []
      this.clickCharImages = []
      this.decoyTexts = []
      this.decoyPoints = []
      this.status = ''

      if (this.bgImage) {
        this.loadBackgroundImage()
      } else {
        this.generateCaptcha()
      }

      this.$emit('refresh')
    },

    loadBackgroundImage() {
      // In real app, load image and draw
      this.generateCaptcha()
    },

    generateCaptcha() {
      const { width, height, count } = this

      // Generate random text
      const randomWord = CHINESE_WORDS[Math.floor(Math.random() * CHINESE_WORDS.length)]
      let chars = ''
      if (randomWord.length >= count) {
        chars = randomWord.slice(0, count)
      } else {
        chars = randomWord
        while (chars.length < count) {
          const extraWord = CHINESE_WORDS[Math.floor(Math.random() * CHINESE_WORDS.length)]
          chars += extraWord.slice(0, count - chars.length)
        }
      }

      this.clickTexts = chars.split('').slice(0, count)
      this.generateClickPoints()
    },

    generateClickPoints() {
      const { width, height } = this
      const ctx = this.bgCtx
      const fontSize = 20
      const padding = fontSize + 10

      // Draw gradient background
      const hue1 = Math.floor(Math.random() * 360)
      const hue2 = (hue1 + Math.floor(Math.random() * 60)) % 360

      // Create gradient (uni-app doesn't support createLinearGradient well, use solid color)
      ctx.setFillStyle(`hsl(${hue1}, 70%, 85%)`)
      ctx.fillRect(0, 0, width, height)

      // Draw decorative shapes
      for (let i = 0; i < 8; i++) {
        const shapeHue = (hue1 + Math.floor(Math.random() * 120)) % 360
        ctx.setFillStyle(`hsla(${shapeHue}, 60%, 60%, 0.15)`)
        const x = Math.floor(Math.random() * (width - 40))
        const y = Math.floor(Math.random() * (height - 40))
        const size = Math.floor(Math.random() * 40) + 40
        ctx.beginPath()
        ctx.arc(x, y, size / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Generate decoy characters
      const decoyCount = Math.floor(Math.random() * 2) + 1
      const usedChars = new Set(this.clickTexts)

      for (let i = 0; i < decoyCount; i++) {
        let decoyChar = '', attempts = 0
        while (!decoyChar && attempts < 50) {
          const randomWord = CHINESE_WORDS[Math.floor(Math.random() * CHINESE_WORDS.length)]
          for (const char of randomWord) {
            if (!usedChars.has(char)) {
              decoyChar = char
              usedChars.add(char)
              break
            }
          }
          attempts++
        }
        if (decoyChar) {
          this.decoyTexts.push(decoyChar)
        }
      }

      // Generate target positions
      for (let i = 0; i < this.clickTexts.length; i++) {
        let x, y, attempts = 0
        do {
          x = Math.floor(Math.random() * (width - padding * 2)) + padding
          y = Math.floor(Math.random() * (height - padding * 2)) + padding
          attempts++
        } while (this.isOverlapping(x, y, fontSize) && attempts < 100)

        this.targetPoints.push({ x, y })

        // Draw character
        ctx.save()
        ctx.setFontSize(fontSize)
        ctx.setFillStyle('#333')
        ctx.setTextAlign('center')
        ctx.setTextBaseline('middle')

        // Random rotation
        const rotation = (Math.floor(Math.random() * 40) - 20) * Math.PI / 180
        ctx.translate(x, y)
        ctx.rotate(rotation)
        ctx.fillText(this.clickTexts[i], 0, 0)
        ctx.restore()
      }

      // Draw decoy characters
      for (let i = 0; i < this.decoyTexts.length; i++) {
        let x, y, attempts = 0
        do {
          x = Math.floor(Math.random() * (width - padding * 2)) + padding
          y = Math.floor(Math.random() * (height - padding * 2)) + padding
          attempts++
        } while (this.isOverlapping(x, y, fontSize, true) && attempts < 100)

        this.decoyPoints.push({ x, y })

        ctx.save()
        ctx.setFontSize(fontSize)
        ctx.setFillStyle('#555')
        ctx.setTextAlign('center')
        ctx.setTextBaseline('middle')

        const rotation = (Math.floor(Math.random() * 50) - 25) * Math.PI / 180
        ctx.translate(x, y)
        ctx.rotate(rotation)
        ctx.fillText(this.decoyTexts[i], 0, 0)
        ctx.restore()
      }

      ctx.draw()

      // Generate character images for prompt
      this.generateCharImages()
    },

    isOverlapping(x, y, size, checkDecoys = false) {
      for (const point of this.targetPoints) {
        const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)
        if (distance < size * 1.5) return true
      }
      if (checkDecoys) {
        for (const point of this.decoyPoints) {
          const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)
          if (distance < size * 1.5) return true
        }
      }
      return false
    },

    generateCharImages() {
      // In uni-app, we'll use text instead of images for simplicity
      // Real implementation could use canvas to generate images
      this.clickCharImages = this.clickTexts.map(char => {
        // Return a data URL placeholder or use a different approach
        // For uni-app, we'll display text directly
        return char
      })
    },

    onTap(e) {
      if (this.status) return
      if (this.clickPoints.length >= this.clickTexts.length) return

      const touch = e.touches[0] || e.detail
      const x = touch.x
      const y = touch.y

      this.clickPoints.push({ x, y })
      this.drawClickMarker(x, y, this.clickPoints.length)

      if (this.clickPoints.length >= this.clickTexts.length) {
        this.verify()
      }
    },

    drawClickMarker(x, y, index) {
      const ctx = this.clickCtx

      // Draw circle
      ctx.beginPath()
      ctx.arc(x, y, 14, 0, Math.PI * 2)
      ctx.setFillStyle('#1991fa')
      ctx.fill()

      // Draw border
      ctx.setStrokeStyle('#fff')
      ctx.setLineWidth(2)
      ctx.stroke()

      // Draw number
      ctx.setFontSize(12)
      ctx.setFillStyle('#fff')
      ctx.setTextAlign('center')
      ctx.setTextBaseline('middle')
      ctx.fillText(String(index), x, y)

      ctx.draw(true)
    },

    verify() {
      const { precision, targetPoints, clickPoints } = this

      if (clickPoints.length !== targetPoints.length) {
        this.status = 'fail'
        this.$emit('fail')
        this.autoRefresh()
        return
      }

      // Check each click point
      for (let i = 0; i < targetPoints.length; i++) {
        const target = targetPoints[i]
        const clicked = clickPoints[i]
        const distance = Math.sqrt((clicked.x - target.x) ** 2 + (clicked.y - target.y) ** 2)

        if (distance > precision) {
          this.status = 'fail'
          this.$emit('fail')
          this.autoRefresh()
          return
        }
      }

      this.status = 'success'
      this.$emit('success')
    },

    autoRefresh() {
      setTimeout(() => this.refresh(), 500)
    },

    getData() {
      return {
        type: 'click',
        target: this.targetPoints,
        clickPoints: this.clickPoints,
        clickTexts: this.clickTexts,
      }
    },

    reset() {
      this.clickPoints = []
      this.status = ''

      if (this.clickCtx) {
        this.clickCtx.clearRect(0, 0, this.width, this.height)
        this.clickCtx.draw()
      }
    },
  },
}
</script>

<template>
  <view class="captcha-container" :style="{ width: `${width  }px` }">
    <!-- Captcha area -->
    <view class="captcha-area" :style="{ width: `${width  }px`, height: `${height  }px` }">
      <!-- Background canvas -->
      <canvas
        canvas-id="bgCanvas"
        id="bgCanvas"
        class="bg-canvas"
        :style="{ width: `${width  }px`, height: `${height  }px` }"
      />

      <!-- Click canvas (overlay for click markers) -->
      <canvas
        canvas-id="clickCanvas"
        id="clickCanvas"
        class="click-canvas"
        :style="{ width: `${width  }px`, height: `${height  }px` }"
        @tap="onTap"
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

    <!-- Prompt bar -->
    <view class="prompt-bar" :style="{ width: `${width  }px` }">
      <text class="prompt-text">请依次点击：</text>
      <view class="prompt-chars">
        <image
          v-for="(img, index) in clickCharImages"
          :key="index"
          :src="img"
          class="char-image"
          mode="aspectFit"
        />
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

.click-canvas {
  position: absolute;
  top: 0;
  left: 0;
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

.prompt-bar {
  height: 40px;
  margin-top: 5px;
  background: #f7f9fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prompt-text {
  font-size: 14px;
  color: #333;
}

.prompt-chars {
  display: flex;
  flex-direction: row;
  margin-left: 4px;
}

.char-image {
  width: 24px;
  height: 24px;
  margin: 0 2px;
}
</style>
