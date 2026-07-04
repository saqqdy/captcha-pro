/**
 * WeChat Mini-program Click Captcha Component — Backend-only mode
 *
 * Usage:
 * 1. Copy component files to your miniprogram components directory
 * 2. Add to page JSON:
 *    { "usingComponents": { "click-captcha": "/components/click-captcha/click-captcha" } }
 * 3. Use in WXML:
 *    <click-captcha backend="{{backendConfig}}" bind:success="onSuccess" bind:fail="onFail" />
 */

Component({
  properties: {
    width: { type: Number, value: 300 },
    height: { type: Number, value: 170 },
    showRefresh: { type: Boolean, value: true },
    backend: { type: Object, value: null },
  },

  data: {
    bgImage: '',
    captchaId: '',
    clickTexts: [],
    clickCharImages: [],
    clickMarkers: [],
    status: '',
    loading: true,
    errorMsg: '',
  },

  lifetimes: {
    attached() {
      this.loadCaptcha()
    },
  },

  methods: {
    async loadCaptcha() {
      if (!this.data.backend) {
        this.setData({ errorMsg: 'backend config is required', loading: false })
        return
      }
      this.setData({ loading: true, errorMsg: '', status: '', clickMarkers: [], clickTexts: [], clickCharImages: [] })

      try {
        const res = await this._fetch('getCaptcha', {
          type: 'click',
          width: this.data.width,
          height: this.data.height,
        })

        if (!res.success || !res.data) throw new Error(res.message || 'Failed to get captcha')

        this.setData({
          captchaId: res.data.captchaId,
          bgImage: res.data.bgImage,
          clickTexts: res.data.clickTexts || [],
          clickCharImages: res.data.clickCharImages || [],
        })
      } catch (err) {
        this.setData({ errorMsg: err.message || 'Network error' })
        this.triggerEvent('error', err)
      } finally {
        this.setData({ loading: false })
      }
    },

    onAreaTap(e) {
      if (this.data.status || this.data.loading) return
      if (this.data.clickMarkers.length >= this.data.clickTexts.length) return

      const query = this.createSelectorQuery()
      query.select('.captcha-area').boundingClientRect((rect) => {
        if (!rect) return
        const touch = e.changedTouches?.[0] || e.detail
        const clientX = touch.clientX ?? touch.x ?? 0
        const clientY = touch.clientY ?? touch.y ?? 0
        const x = clientX - rect.left
        const y = clientY - rect.top

        const newMarkers = [...this.data.clickMarkers, { x, y, index: this.data.clickMarkers.length + 1 }]
        this.setData({ clickMarkers: newMarkers })

        if (newMarkers.length >= this.data.clickTexts.length) {
          setTimeout(() => this.verify(), 200)
        }
      }).exec()
    },

    async verify() {
      if (this.data.status || this.data.loading || !this.data.captchaId) return
      this.setData({ loading: true })

      try {
        const pts = this.data.clickMarkers.map(m => ({ x: m.x, y: m.y }))
        const res = await this._fetch('verify', {
          captchaId: this.data.captchaId,
          type: 'click',
          target: pts,
        })

        if (res.success) {
          this.setData({ status: 'success' })
          this.triggerEvent('success', res.data)
        } else {
          this.setData({ status: 'fail' })
          this.triggerEvent('fail')
          setTimeout(() => this.loadCaptcha(), 800)
        }
      } catch (err) {
        this.triggerEvent('error', err)
        this.setData({ status: 'fail' })
        setTimeout(() => this.loadCaptcha(), 800)
      } finally {
        this.setData({ loading: false })
      }
    },

    handleRefresh() {
      this.loadCaptcha()
      this.triggerEvent('refresh')
    },

    _fetch(apiKey, data) {
      const config = this.data.backend
      const fn = config[apiKey]
      if (typeof fn === 'function') return Promise.resolve(fn(data))
      const isGet = apiKey === 'getCaptcha'
      const qs = isGet ? `?${  Object.entries(data).filter(([, v]) => v != null).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}` : ''
      return new Promise((resolve, reject) => {
        wx.request({
          url: `${fn}${qs}`,
          method: isGet ? 'GET' : 'POST',
          data: isGet ? undefined : data,
          header: { 'Content-Type': 'application/json', ...(config.headers || {}) },
          timeout: config.timeout || 10000,
          success: (r) => resolve(r.data),
          fail: reject,
        })
      })
    },
  },
})
