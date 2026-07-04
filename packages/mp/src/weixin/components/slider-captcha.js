/**
 * WeChat Mini-program Slider Captcha Component — Backend-only mode
 *
 * Usage:
 * 1. Copy component files to your miniprogram components directory
 * 2. Add to page JSON:
 *    { "usingComponents": { "slider-captcha": "/components/slider-captcha/slider-captcha" } }
 * 3. Use in WXML:
 *    <slider-captcha backend="{{backendConfig}}" bind:success="onSuccess" bind:fail="onFail" />
 */

Component({
  properties: {
    width: { type: Number, value: 300 },
    height: { type: Number, value: 170 },
    sliderWidth: { type: Number, value: 42 },
    sliderHeight: { type: Number, value: 42 },
    showRefresh: { type: Boolean, value: true },
    backend: { type: Object, value: null },
  },

  data: {
    bgImage: '',
    sliderImage: '',
    sliderY: 0,
    sliderX: 0,
    captchaId: '',
    status: '',
    loading: true,
    errorMsg: '',
    startX: 0,
    isDragging: false,
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
      this.setData({ loading: true, errorMsg: '', status: '', sliderX: 0 })

      try {
        const res = await this._fetch('getCaptcha', {
          type: 'slider',
          width: this.data.width,
          height: this.data.height,
          sliderWidth: this.data.sliderWidth,
          sliderHeight: this.data.sliderHeight,
        })

        if (!res.success || !res.data) throw new Error(res.message || 'Failed to get captcha')

        this.setData({
          captchaId: res.data.captchaId,
          bgImage: res.data.bgImage,
          sliderImage: res.data.sliderImage || '',
          sliderY: res.data.sliderY || 0,
        })
      } catch (err) {
        this.setData({ errorMsg: err.message || 'Network error' })
        this.triggerEvent('error', err)
      } finally {
        this.setData({ loading: false })
      }
    },

    onTouchStart(e) {
      if (this.data.status || this.data.loading) return
      this.setData({ isDragging: true, startX: e.touches[0].clientX - this.data.sliderX })
    },

    onTouchMove(e) {
      if (!this.data.isDragging) return
      const maxX = this.data.width - this.data.sliderWidth
      this.setData({ sliderX: Math.max(0, Math.min(e.touches[0].clientX - this.data.startX, maxX)) })
    },

    async onTouchEnd() {
      if (!this.data.isDragging) return
      this.setData({ isDragging: false })
      await this.verify()
    },

    async verify() {
      if (this.data.status || this.data.loading || !this.data.captchaId) return
      this.setData({ loading: true })

      try {
        const res = await this._fetch('verify', {
          captchaId: this.data.captchaId,
          type: 'slider',
          target: [this.data.sliderX],
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
