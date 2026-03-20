import ClickCaptcha from './components/ClickCaptcha.vue'
// Components
import SliderCaptcha from './components/SliderCaptcha.vue'

// Re-export core
export * from '@captcha/core'

// Export components
export { SliderCaptcha, ClickCaptcha }

// Install function for Vue.use()
export const CaptchaPro = {
  install(Vue) {
    Vue.component('SliderCaptcha', SliderCaptcha)
    Vue.component('ClickCaptcha', ClickCaptcha)
  },
}

// Version
export const version = '1.0.0'

// Default export
export default CaptchaPro
