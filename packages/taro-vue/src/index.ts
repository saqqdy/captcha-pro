/**
 * @captcha-pro/taro-vue — Taro + Vue 3 Captcha Components (backend-only)
 */
export { default as ClickCaptcha } from './components/click-captcha.vue'
export { default as PopupCaptcha } from './components/popup-captcha.vue'
export { default as SliderCaptcha } from './components/slider-captcha.vue'

export { useClickCaptcha, type UseClickCaptchaOptions } from './composables/useClickCaptcha'
export { usePopupCaptcha, type UsePopupCaptchaOptions } from './composables/usePopupCaptcha'
export { useSliderCaptcha, type UseSliderCaptchaOptions } from './composables/useSliderCaptcha'

export { fetchCaptcha, verifyCaptcha } from './request'

export type {
	BackendCaptchaParams,
	BackendCaptchaResponse,
	BackendConfig,
	BackendVerifyRequest,
	BackendVerifyResponse,
	ClickCaptchaProps,
	ClickCaptchaRef,
	PopupCaptchaProps,
	PopupCaptchaRef,
	SliderCaptchaProps,
	SliderCaptchaRef,
} from './types'
