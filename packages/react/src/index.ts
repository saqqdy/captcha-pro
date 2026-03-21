// Components
export { ClickCaptcha, type ClickCaptchaProps, type ClickCaptchaRef } from './components/ClickCaptcha'
export { PopupCaptcha, type PopupCaptchaProps, type PopupCaptchaRef } from './components/PopupCaptcha'
export { SliderCaptcha, type SliderCaptchaProps, type SliderCaptchaRef } from './components/SliderCaptcha'

// Hooks
export { useClickCaptcha, type UseClickCaptchaOptions, type UseClickCaptchaReturn } from './hooks/useClickCaptcha'
export { useSliderCaptcha, type UseSliderCaptchaOptions, type UseSliderCaptchaReturn } from './hooks/useSliderCaptcha'

// Re-export types and core
export * from '@captcha/core'

// Version
export const version = '1.0.0'
