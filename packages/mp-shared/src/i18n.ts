/**
 * Mini-program Captcha i18n
 *
 * 键集与 Android `LocaleMessages` / iOS `LocaleMessages` 完全一致，
 * 三平台共享同一套文案键名。
 */

export type CaptchaLocale = 'zh-CN' | 'en-US'

export const DEFAULT_LOCALE: CaptchaLocale = 'zh-CN'

export const LOCALE_MESSAGES: Record<CaptchaLocale, Record<string, string>> = {
	'zh-CN': {
		loading: '加载中...',
		slider_slide: '请拖动滑块完成验证',
		slider_hint: '→ 按住滑块，拖动完成验证',
		slider_success: '验证成功',
		slider_fail: '验证失败',
		click_prompt: '请依次点击：',
		click_success: '验证成功',
		click_fail: '验证失败',
		popup_title: '请完成安全验证',
		popup_close: '关闭',
		error_network: '网络错误',
		error_expired: '验证码已过期',
		error_invalid: '验证失败',
		error_not_found: '验证码不存在',
	},
	'en-US': {
		loading: 'Loading...',
		slider_slide: 'Please slide to verify',
		slider_hint: '→ Hold and drag the slider to verify',
		slider_success: 'Verification successful',
		slider_fail: 'Verification failed',
		click_prompt: 'Please click in order: ',
		click_success: 'Verification successful',
		click_fail: 'Verification failed',
		popup_title: 'Please complete security verification',
		popup_close: 'Close',
		error_network: 'Network error',
		error_expired: 'Captcha expired',
		error_invalid: 'Verification failed',
		error_not_found: 'Captcha not found',
	},
}

export function getLocaleMessage(locale: CaptchaLocale, key: string): string {
	return LOCALE_MESSAGES[locale]?.[key] ?? LOCALE_MESSAGES[DEFAULT_LOCALE]?.[key] ?? key
}
