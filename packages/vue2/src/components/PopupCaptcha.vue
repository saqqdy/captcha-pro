<script>
import { PopupCaptcha } from '@captcha/core'

export default {
  name: 'PopupCaptcha',

  props: {
    type: { type: String, default: 'slider' },
    trigger: { type: String, default: undefined },
    modal: { type: Object, default: undefined },
    autoClose: { type: Boolean, default: true },
    closeDelay: { type: Number, default: 500 },
    captchaOptions: { type: Object, default: undefined },
  },

  data() {
    return {
      popupInstance: null,
    }
  },

  mounted() {
    this.initPopup()
  },

  beforeDestroy() {
    this.destroy()
  },

  methods: {
    initPopup() {
      const options = {
        type: this.type,
        trigger: this.trigger,
        modal: this.modal,
        autoClose: this.autoClose,
        closeDelay: this.closeDelay,
        captchaOptions: this.captchaOptions,
        onOpen: () => this.$emit('open'),
        onClose: () => this.$emit('close'),
        onSuccess: () => this.$emit('success'),
        onFail: () => this.$emit('fail'),
      }

      this.popupInstance = new PopupCaptcha(options)
      this.$emit('ready', this.popupInstance)
    },

    show() {
      this.popupInstance?.show()
    },

    hide() {
      this.popupInstance?.hide()
    },

    isVisible() {
      return this.popupInstance?.isVisible() ?? false
    },

    getInstance() {
      return this.popupInstance
    },

    destroy() {
      this.popupInstance?.destroy()
      this.popupInstance = null
    },
  },
}
</script>

<template>
  <div class="captcha-popup-wrapper">
    <slot />
  </div>
</template>

<style scoped>
.captcha-popup-wrapper {
  display: inline-block;
}
</style>
