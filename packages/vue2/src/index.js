// Components
import ClickCaptcha from './components/ClickCaptcha.vue'
import PopupCaptcha from './components/PopupCaptcha.vue'
import SliderCaptcha from './components/SliderCaptcha.vue'

// Mixins (for advanced usage)
import { clickCaptchaMixin } from './mixins/clickCaptcha'
import { sliderCaptchaMixin } from './mixins/sliderCaptcha'

// Re-export components
export { ClickCaptcha, PopupCaptcha, SliderCaptcha }

// Re-export mixins
export { clickCaptchaMixin, sliderCaptchaMixin }

// Re-export types and core
export * from '@captcha/core'

// Version
export const version = '__VERSION__'

// Install function for Vue.use()
export const CaptchaPro = {
  install(Vue) {
    Vue.component('SliderCaptcha', SliderCaptcha)
    Vue.component('ClickCaptcha', ClickCaptcha)
    Vue.component('PopupCaptcha', PopupCaptcha)
  },
}

export default CaptchaPro
