import ClickCaptcha from './click'
import InvisibleCaptcha from './invisible'
import { detectBrowserLocale, getLocale, getMessages, i18n, setLocale, t } from './locales'
import PopupCaptcha from './popup'
import SliderCaptcha from './slider'

export type {
	BackendCaptchaResponse,
	BackendVerifyOptions,
	BackendVerifyResponse,
	BaseCaptchaOptions,
	CaptchaData,
	CaptchaInstance,
	CaptchaStatistics,
	CaptchaType,
	ClickCaptchaInstance,
	ClickCaptchaOptions,
	InvisibleCaptchaInstance,
	InvisibleCaptchaOptions,
	Locale,
	LocaleMessages,
	Point,
	PopupCaptchaInstance,
	PopupCaptchaOptions,
	PopupModalOptions,
	RiskAssessmentOptions,
	SecurityOptions,
	SliderCaptchaInstance,
	SliderCaptchaOptions,
	SliderTrack,
	StatisticsData,
	VerifyMode,
} from './types'

export { ClickCaptcha, InvisibleCaptcha, PopupCaptcha, SliderCaptcha }

// i18n exports
export { detectBrowserLocale, getLocale, getMessages, i18n, setLocale, t }

export const version = '__VERSION__' as string

/**
 * Create slider captcha instance
 */
export function createSliderCaptcha(options: import('./types').SliderCaptchaOptions): SliderCaptcha {
	return new SliderCaptcha(options)
}

/**
 * Create click captcha instance
 */
export function createClickCaptcha(options: import('./types').ClickCaptchaOptions): ClickCaptcha {
	return new ClickCaptcha(options)
}

/**
 * Create invisible captcha instance
 */
export function createInvisibleCaptcha(options: import('./types').InvisibleCaptchaOptions): InvisibleCaptcha {
	return new InvisibleCaptcha(options)
}

/**
 * Create popup captcha instance
 */
export function createPopupCaptcha(options: import('./types').PopupCaptchaOptions): PopupCaptcha {
	return new PopupCaptcha(options)
}

export default {
	ClickCaptcha,
	InvisibleCaptcha,
	PopupCaptcha,
	SliderCaptcha,
	createClickCaptcha,
	createInvisibleCaptcha,
	createPopupCaptcha,
	createSliderCaptcha,
	detectBrowserLocale,
	getLocale,
	getMessages,
	i18n,
	setLocale,
	t,
	version: '__VERSION__',
}
