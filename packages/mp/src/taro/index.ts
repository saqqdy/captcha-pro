/**
 * Taro Captcha Components
 * Taro 小程序端仅支持后端服务模式，backend 为必填配置
 */

export { default as ClickCaptcha } from './components/ClickCaptcha'

export { default as PopupCaptcha } from './components/PopupCaptcha'

// Components
export { default as SliderCaptcha } from './components/SliderCaptcha'
// Request utils
export { fetchCaptcha, verifyCaptcha } from './request'
// Type exports
export type {
	BackendConfig,
	BackendCaptchaParams,
	BackendCaptchaResponse,
	BackendVerifyRequest,
	BackendVerifyResponse,
	SliderCaptchaProps,
	SliderCaptchaRef,
	ClickCaptchaProps,
	ClickCaptchaRef,
	PopupCaptchaProps,
	PopupCaptchaRef,
} from './types'
