/**
 * @captcha-pro/taro-vue2 — Taro + Vue 2 Captcha Components (backend-only)
 */
export { default as ClickCaptcha } from './components/click-captcha.vue'
export { default as PopupCaptcha } from './components/popup-captcha.vue'
export { default as SliderCaptcha } from './components/slider-captcha.vue'

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
