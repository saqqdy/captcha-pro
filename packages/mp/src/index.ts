/**
 * captcha-pro-mp — Mini-program captcha components (backend-only)
 *
 * All platforms (weixin / uniapp / taro) operate in backend-only mode:
 * - No client-side Canvas rendering — all images from backend API
 * - Verification is done by backend
 * - `backend` config is required
 */

// ============================================================
// Taro exports
// ============================================================
export type {
	BackendConfig as TaroBackendConfig,
	BackendCaptchaParams as TaroBackendCaptchaParams,
	BackendCaptchaResponse as TaroBackendCaptchaResponse,
	BackendVerifyRequest as TaroBackendVerifyRequest,
	BackendVerifyResponse as TaroBackendVerifyResponse,
	SliderCaptchaProps as TaroSliderCaptchaProps,
	SliderCaptchaRef as TaroSliderCaptchaRef,
	ClickCaptchaProps as TaroClickCaptchaProps,
	ClickCaptchaRef as TaroClickCaptchaRef,
	PopupCaptchaProps as TaroPopupCaptchaProps,
	PopupCaptchaRef as TaroPopupCaptchaRef,
} from './taro/types'
export { default as UniClickCaptcha } from './uniapp/components/click-captcha.vue'
export { default as UniPopupCaptcha } from './uniapp/components/popup-captcha.vue'

// ============================================================
// uni-app exports
// ============================================================
export { default as UniSliderCaptcha } from './uniapp/components/slider-captcha.vue'

export { fetchCaptcha as uniFetchCaptcha, verifyCaptcha as uniVerifyCaptcha } from './uniapp/request'

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
} from './uniapp/types'

export { fetchCaptcha as wxFetchCaptcha, verifyCaptcha as wxVerifyCaptcha } from './weixin/request'

// ============================================================
// WeChat Mini-program exports
// ============================================================
export type {
	BackendConfig as WxBackendConfig,
	BackendCaptchaParams as WxBackendCaptchaParams,
	BackendCaptchaResponse as WxBackendCaptchaResponse,
	BackendVerifyRequest as WxBackendVerifyRequest,
	BackendVerifyResponse as WxBackendVerifyResponse,
	SliderCaptchaProps as WxSliderCaptchaProps,
	SliderCaptchaRef as WxSliderCaptchaRef,
	ClickCaptchaProps as WxClickCaptchaProps,
	ClickCaptchaRef as WxClickCaptchaRef,
	PopupCaptchaProps as WxPopupCaptchaProps,
	PopupCaptchaRef as WxPopupCaptchaRef,
} from './weixin/types'

// Version
export const version = '1.0.0'
