/**
 * @captcha-pro/uniapp-vue2 — uni-app + Vue 2 Captcha Components (backend-only)
 *
 * Vue components are NOT pre-compiled and must be imported from source .vue files
 * for uni-app compatibility. Import them directly:
 *
 * ```ts
 * import ClickCaptcha from '@captcha-pro/uniapp-vue2/click-captcha.vue'
 * import PopupCaptcha from '@captcha-pro/uniapp-vue2/popup-captcha.vue'
 * import SliderCaptcha from '@captcha-pro/uniapp-vue2/slider-captcha.vue'
 * ```
 *
 * This is required because uni-app's compiler needs raw .vue files,
 * not pre-compiled JavaScript with Vue runtime helpers.
 */

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
