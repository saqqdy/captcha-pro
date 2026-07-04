/**
 * WeChat Mini-program Captcha — Backend-only mode
 *
 * All components fetch images from backend API; no client-side Canvas rendering.
 * `backend` config is required for every component.
 */

// Request utils
export { fetchCaptcha as wxFetchCaptcha, verifyCaptcha as wxVerifyCaptcha } from './request'

// Type exports
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
} from './types'

// Note: WeChat components (.js/.wxml/.wxss/.json) are consumed by copying the
// `components/` directory into your miniprogram project — they are not imported
// through the npm entry. Components: slider-captcha, click-captcha, popup-captcha.
