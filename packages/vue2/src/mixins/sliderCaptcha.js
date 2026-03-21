/**
 * Slider Captcha Mixin for Vue 2
 *
 * Usage:
 * import { sliderCaptchaMixin } from 'captcha-pro-vue2/mixins'
 *
 * export default {
 *   mixins: [sliderCaptchaMixin],
 *   // ...
 * }
 */
import { SliderCaptcha } from '@captcha/core'

export const sliderCaptchaMixin = {
  props: {
    width: { type: Number, default: 300 },
    height: { type: Number, default: 170 },
    bgImage: { type: String, default: undefined },
    sliderImage: { type: String, default: undefined },
    sliderWidth: { type: Number, default: 42 },
    sliderHeight: { type: Number, default: 42 },
    precision: { type: Number, default: 5 },
    showRefresh: { type: Boolean, default: true },
    verifyMode: { type: String, default: 'frontend' },
    locale: { type: String, default: 'zh-CN' },
    secretKey: { type: String, default: undefined },
  },

  data() {
    return {
      captchaInstance: null,
      status: '',
    }
  },

  computed: {
    statusText() {
      if (this.status === 'success') return this.locale === 'zh-CN' ? '验证成功' : 'Success'
      if (this.status === 'fail') return this.locale === 'zh-CN' ? '验证失败' : 'Failed'
      return ''
    },
  },

  mounted() {
    this.initCaptcha()
  },

  beforeDestroy() {
    this.destroyCaptcha()
  },

  methods: {
    initCaptcha() {
      if (!this.$refs.containerRef) return

      const options = {
        el: this.$refs.containerRef,
        width: this.width,
        height: this.height,
        bgImage: this.bgImage,
        sliderImage: this.sliderImage,
        sliderWidth: this.sliderWidth,
        sliderHeight: this.sliderHeight,
        precision: this.precision,
        showRefresh: this.showRefresh,
        verifyMode: this.verifyMode,
        locale: this.locale,
        security: this.secretKey ? { secretKey: this.secretKey } : undefined,
        onSuccess: () => {
          this.status = 'success'
          this.$emit('success')
        },
        onFail: () => {
          this.status = 'fail'
          this.$emit('fail')
        },
        onRefresh: () => {
          this.status = ''
          this.$emit('refresh')
        },
      }

      this.captchaInstance = new SliderCaptcha(options)
      this.$emit('ready', this.captchaInstance)
    },

    refresh() {
      this.captchaInstance?.refresh()
    },

    getData() {
      return this.captchaInstance?.getData()
    },

    getStatistics() {
      return this.captchaInstance?.getStatistics()
    },

    destroyCaptcha() {
      this.captchaInstance?.destroy()
      this.captchaInstance = null
    },
  },

  watch: {
    bgImage() {
      this.refresh()
    },
    sliderImage() {
      this.refresh()
    },
  },
}

export default sliderCaptchaMixin
