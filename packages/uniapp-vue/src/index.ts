/**
 * @captcha-pro/uniapp-vue — uni-app + Vue 3 Captcha Components (backend-only)
 *
 * Vue components are NOT pre-compiled and must be imported from source .vue files
 * for uni-app compatibility. Import them directly:
 *
 * ```ts
 * import ClickCaptcha from '@captcha-pro/uniapp-vue/click-captcha.vue'
 * import PopupCaptcha from '@captcha-pro/uniapp-vue/popup-captcha.vue'
 * import SliderCaptcha from '@captcha-pro/uniapp-vue/slider-captcha.vue'
 * ```
 *
 * This is required because uni-app's compiler needs raw .vue files,
 * not pre-compiled JavaScript with Vue runtime helpers.
 */

// Composable exports
export { useClickCaptcha, type UseClickCaptchaOptions } from './composables/useClickCaptcha'
export { usePopupCaptcha, type UsePopupCaptchaOptions } from './composables/usePopupCaptcha'
export { useSliderCaptcha, type UseSliderCaptchaOptions } from './composables/useSliderCaptcha'

// Request utilities
export { fetchCaptcha, verifyCaptcha } from './request'

// Type re-exports (all from @captcha-pro/mp-shared)
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
