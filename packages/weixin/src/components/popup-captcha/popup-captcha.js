/* global Component */
/**
 * WeChat Mini-program Popup Captcha Component — Backend-only mode
 *
 * Wraps slider-captcha / click-captcha inside a modal overlay.
 */

Component({
  properties: {
    type: { type: String, value: 'slider' },
    title: { type: String, value: '请完成安全验证' },
    maskClosable: { type: Boolean, value: true },
    showClose: { type: Boolean, value: true },
    autoClose: { type: Boolean, value: true },
    closeDelay: { type: Number, value: 500 },
    sliderOptions: {
      type: Object,
      value: { width: 620, height: 360, sliderWidth: 80, sliderHeight: 80, showRefresh: true },
    },
    clickOptions: {
      type: Object,
      value: { width: 620, height: 360, showRefresh: true },
    },
    backend: { type: Object, value: null },
  },

  data: {
    visible: false,
  },

  methods: {
    show() {
      this.setData({ visible: true })
      this.triggerEvent('open')
    },

    hide() {
      this.setData({ visible: false })
      this.triggerEvent('close')
    },

    isVisible() {
      return this.data.visible
    },

    onMaskTap() {
      if (this.data.maskClosable) this.hide()
    },

    onSuccess(e) {
      this.triggerEvent('success', e.detail)
      if (this.data.autoClose) {
        setTimeout(() => this.hide(), this.data.closeDelay)
      }
    },

    onFail() {
      this.triggerEvent('fail')
    },

    onRefresh() {
      this.triggerEvent('refresh')
    },
  },
})
