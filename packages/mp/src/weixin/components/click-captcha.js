/**
 * WeChat Mini-program Click Captcha Component
 *
 * Usage:
 * 1. Copy this file to your miniprogram components directory
 * 2. Add to page JSON:
 *    {
 *      "usingComponents": {
 *        "click-captcha": "/components/click-captcha/click-captcha"
 *      }
 *    }
 * 3. Use in WXML:
 *    <click-captcha
 *      width="{{300}}"
 *      height="{{170}}"
 *      count="{{3}}"
 *      bind:success="onSuccess"
 *      bind:fail="onFail"
 *    />
 */

Component({
  properties: {
    width: { type: Number, value: 300 },
    height: { type: Number, value: 170 },
    bgImage: { type: String, value: '' },
    count: { type: Number, value: 3 },
    precision: { type: Number, value: 20 },
    showRefresh: { type: Boolean, value: true },
  },

  data: {
    targetPoints: [],
    clickPoints: [],
    status: '',
    tipText: '',
    bgCtx: null,
    bgCanvas: null,
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
    },

    refresh() {
      // Generate random target points
      const points = []
      const tipChars = []
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

      for (let i = 0; i < this.data.count; i++) {
        const x = Math.floor(Math.random() * (this.data.width - 60) + 30)
        const y = Math.floor(Math.random() * (this.data.height - 60) + 30)
        points.push({ x, y, char: chars[Math.floor(Math.random() * chars.length)] })
        tipChars.push(chars.charAt(Math.floor(Math.random() * chars.length)))
      }

      // Assign random chars from tipChars
      points.forEach((p, i) => {
        p.char = tipChars[i]
      })

      this.setData({
        targetPoints: points,
        clickPoints: [],
        status: '',
        tipText: tipChars.join(' '),
      })

      // Draw background
      this.drawBackground(points)

      this.triggerEvent('refresh')
    },

    drawBackground(points) {
      const { width, height } = this.data
      const ctx = this.bgCtx

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw target points with characters
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      points.forEach((p, i) => {
        // Draw circle background
        ctx.beginPath()
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fill()

        // Draw character
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.fillText(p.char, p.x, p.y)
      })
    },

    onCanvasTap(e) {
      if (this.data.status) return

      const { offsetX, offsetY } = e.detail
      const { targetPoints, clickPoints, count } = this.data

      // Find closest target point
      const currentTargetIndex = clickPoints.length
      if (currentTargetIndex >= count) return

      const target = targetPoints[currentTargetIndex]
      const distance = Math.sqrt((offsetX - target.x)**2 + (offsetY - target.y)**2)

      if (distance <= this.data.precision) {
        // Correct click
        const newClickPoints = [...clickPoints, { x: offsetX, y: offsetY }]
        this.setData({ clickPoints: newClickPoints })

        if (newClickPoints.length === count) {
          // All points clicked correctly
          this.setData({ status: 'success' })
          this.triggerEvent('success')
        }
      } else {
        // Wrong click
        this.setData({ status: 'fail' })
        this.triggerEvent('fail')
        setTimeout(() => this.refresh(), 1000)
      }
    },

    handleRefresh() {
      this.refresh()
    },
  },
})
