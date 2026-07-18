<script>
import { SliderCaptcha } from '@captcha-pro/core'

export default {
  name: 'SliderCaptcha',

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
    backendVerify: { type: Object, default: undefined },
  },

  data() {
    return {
      captchaInstance: null,
    }
  },

  mounted() {
    this.initCaptcha()
  },

  beforeDestroy() {
    this.destroy()
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
        backendVerify: this.backendVerify,
        onSuccess: () => {
          this.$emit('success')
        },
        onFail: () => {
          this.$emit('fail')
        },
        onRefresh: () => {
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

    getInstance() {
      return this.captchaInstance
    },

    destroy() {
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
</script>

<template>
  <div class="captcha-vue2-wrapper">
    <div ref="containerRef" class="captcha-container" />
  </div>
</template>

<style scoped>
.captcha-vue2-wrapper {
  position: relative;
  display: inline-block;
}

.captcha-container {
  position: relative;
}
</style>
