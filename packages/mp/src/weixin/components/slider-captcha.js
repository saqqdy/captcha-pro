/**
 * WeChat Mini-program Slider Captcha Component
 *
 * Usage:
 * 1. Copy this file to your miniprogram components directory
 * 2. Add to page JSON:
 *    {
 *      "usingComponents": {
 *        "slider-captcha": "/components/slider-captcha/slider-captcha"
 *      }
 *    }
 * 3. Use in WXML:
 *    <slider-captcha
 *      width="{{300}}"
 *      height="{{170}}"
 *      bind:success="onSuccess"
 *      bind:fail="onFail"
 *    />
 */

Component({
  properties: {
    width: { type: Number, value: 300 },
    height: { type: Number, value: 170 },
    bgImage: { type: String, value: '' },
    sliderImage: { type: String, value: '' },
    precision: { type: Number, value: 5 },
    showRefresh: { type: Boolean, value: true },
  },

  data: {
    sliderX: 0,
    sliderY: 0,
    targetX: 0,
    status: '',
    startX: 0,
    isDragging: false,
    sliderWidth: 42,
    sliderHeight: 42,
  },

  lifetimes: {
    attached() {
      this.initCanvas()
    },
  },

  methods: {
    initCanvas() {
      const query = this.createSelectorQuery()
      query
        .select('#bgCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            const canvas = res[0].node
            this.bgCtx = canvas.getContext('2d')
            this.bgCanvas = canvas
            this.refresh()
          }
        })

      query
        .select('#sliderCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            const canvas = res[0].node
            this.sliderCtx = canvas.getContext('2d')
            this.sliderCanvas = canvas
          }
        })
    },

    refresh() {
      // Generate random target position
      const targetX = Math.floor(
        Math.random() * (this.data.width - this.data.sliderWidth - 40) + this.data.sliderWidth + 20
      )
      const sliderY = Math.floor(Math.random() * (this.data.height - this.data.sliderHeight - 20) + 10)

      this.setData({
        sliderX: 0,
        sliderY,
        targetX,
        status: '',
      })

      // Draw background
      this.drawBackground()

      this.triggerEvent('refresh')
    },

    drawBackground() {
      const { width, height } = this.data
      const ctx = this.bgCtx

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw target area (shadow)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(this.data.targetX, this.data.sliderY, this.data.sliderWidth, this.data.sliderHeight)
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

    handleRefresh() {
      this.refresh()
    },
  },
})
