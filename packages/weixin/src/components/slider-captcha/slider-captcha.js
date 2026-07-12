/* global Component, wx */
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
    width: { type: Number, value: 650 },
    height: { type: Number, value: 380 },
    sliderWidth: { type: Number, value: 80 },
    sliderHeight: { type: Number, value: 80 },
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
    rpxRatio: 1,
  },

  lifetimes: {
    attached() {
      const sysInfo = wx.getSystemInfoSync()
      this.setData({ rpxRatio: sysInfo.windowWidth / 750 })
      this.loadCaptcha()
    },
  },

  methods: {
    pxToRpx(px) { return px / this.data.rpxRatio },
    rpxToPx(rpx) { return rpx * this.data.rpxRatio },

    async loadCaptcha() {
      if (!this.data.backend) {
        this.setData({ errorMsg: 'backend config is required', loading: false })
        return
      }
      this.setData({ loading: true, errorMsg: '', status: '', sliderX: 0 })

      try {
        const res = await this._fetch('getCaptcha', {
          type: 'slider',
          width: this.rpxToPx(this.data.width),
          height: this.rpxToPx(this.data.height),
          sliderWidth: this.rpxToPx(this.data.sliderWidth),
          sliderHeight: this.rpxToPx(this.data.sliderHeight),
        })

        if (!res.success || !res.data) throw new Error(res.message || 'Failed to get captcha')

        this.setData({
          captchaId: res.data.captchaId,
          bgImage: res.data.bgImage,
          sliderImage: res.data.sliderImage || '',
          sliderY: this.pxToRpx(res.data.sliderY || 0),
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
      this.setData({ isDragging: true, startX: e.touches[0].clientX - this.rpxToPx(this.data.sliderX) })
    },

    onTouchMove(e) {
      if (!this.data.isDragging) return
      const maxX = this.data.width - this.data.sliderWidth
      this.setData({ sliderX: Math.max(0, Math.min(this.pxToRpx(e.touches[0].clientX - this.data.startX), maxX)) })
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
          target: [this.rpxToPx(this.data.sliderX)],
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
      const qs = isGet ? `?${Object.entries(data).filter(([, v]) => v != null).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}` : ''
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