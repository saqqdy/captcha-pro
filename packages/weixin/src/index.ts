/**
 * @captcha-pro/weixin — WeChat Mini-program Captcha (backend-only)
 *
 * Components are consumed by copying `components/` into your miniprogram project.
 * This entry exports request utils and types for programmatic use.
 */
export { fetchCaptcha as wxFetchCaptcha, verifyCaptcha as wxVerifyCaptcha } from './request'

export type {
	BackendCaptchaParams as WxBackendCaptchaParams,
	BackendCaptchaResponse as WxBackendCaptchaResponse,
	BackendConfig as WxBackendConfig,
	BackendVerifyRequest as WxBackendVerifyRequest,
	BackendVerifyResponse as WxBackendVerifyResponse,
	ClickCaptchaProps as WxClickCaptchaProps,
	ClickCaptchaRef as WxClickCaptchaRef,
	PopupCaptchaProps as WxPopupCaptchaProps,
	PopupCaptchaRef as WxPopupCaptchaRef,
	SliderCaptchaProps as WxSliderCaptchaProps,
	SliderCaptchaRef as WxSliderCaptchaRef,
} from './types'
