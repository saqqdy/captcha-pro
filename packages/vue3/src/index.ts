// Components
export { default as ClickCaptcha } from './components/ClickCaptcha.vue'
export { default as PopupCaptcha } from './components/PopupCaptcha.vue'
export { default as SliderCaptcha } from './components/SliderCaptcha.vue'

export { useClickCaptcha, type UseClickCaptchaOptions } from './composables/useClickCaptcha'
// Composables
export { useSliderCaptcha, type UseSliderCaptchaOptions } from './composables/useSliderCaptcha'

// Re-export types and core
export * from '@captcha/core'

// Version
export const version = '1.0.0'
