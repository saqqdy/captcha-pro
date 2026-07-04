/**
 * uni-app Captcha — Backend-only mode
 *
 * All components fetch images from backend API; no client-side Canvas rendering.
 * `backend` prop is required for every component.
 */

export { default as ClickCaptcha } from './components/click-captcha.vue'
export { default as PopupCaptcha } from './components/popup-captcha.vue'
// Components
export { default as SliderCaptcha } from './components/slider-captcha.vue'

// Request utils
export { fetchCaptcha as uniFetchCaptcha, verifyCaptcha as uniVerifyCaptcha } from './request'

// Type exports
export type {
	BackendConfig as UniBackendConfig,
	BackendCaptchaParams as UniBackendCaptchaParams,
	BackendCaptchaResponse as UniBackendCaptchaResponse,
	BackendVerifyRequest as UniBackendVerifyRequest,
	BackendVerifyResponse as UniBackendVerifyResponse,
	SliderCaptchaProps as UniSliderCaptchaProps,
	SliderCaptchaRef as UniSliderCaptchaRef,
	ClickCaptchaProps as UniClickCaptchaProps,
	ClickCaptchaRef as UniClickCaptchaRef,
	PopupCaptchaProps as UniPopupCaptchaProps,
	PopupCaptchaRef as UniPopupCaptchaRef,
} from './types'
