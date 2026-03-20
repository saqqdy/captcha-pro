/**
 * i18n (Internationalization) Module for Node.js Backend
 *
 * Provides internationalization support for captcha-pro server.
 * Currently supports zh-CN (Chinese Simplified) and en-US (English).
 */

import enUS from './en-US'
import zhCN from './zh-CN'

/**
 * Supported locale types
 */
export type Locale = 'zh-CN' | 'en-US'

/**
 * Locale messages interface
 */
export interface LocaleMessages {
	common: {
		success: string
		fail: string
	}
	captcha: {
		verifySuccess: string
		verifyFailed: string
		expired: string
		notFound: string
		invalid: string
		typeInvalid: string
	}
	error: {
		network: string
		paramMissing: string
		paramInvalid: string
		ipBlocked: string
		rateLimited: string
	}
}

/**
 * Built-in locale messages
 */
const messages: Record<Locale, LocaleMessages> = {
	'zh-CN': zhCN,
	'en-US': enUS,
}

/**
 * Parse locale from Accept-Language header
 * @param acceptLanguage - The Accept-Language header value
 * @returns The parsed locale
 */
export function parseLocale(acceptLanguage?: string): Locale {
	if (!acceptLanguage) {
		return 'zh-CN'
	}

	// Parse Accept-Language: zh-CN, en-US;q=0.9
	const lang = acceptLanguage.split(',')[0].trim().split('-')[0]

	return lang === 'zh' ? 'zh-CN' : 'en-US'
}

/**
 * Get translated text by key
 * @param key - The translation key (e.g., 'captcha.verifySuccess')
 * @param locale - The locale to use
 * @returns The translated text
 */
export function t(key: string, locale: Locale = 'zh-CN'): string {
	const keys = key.split('.')

	let result: unknown = messages[locale]
	for (const k of keys) {
		if (result && typeof result === 'object' && k in result) {
			result = (result as Record<string, unknown>)[k]
		} else {
			return key
		}
	}

	return typeof result === 'string' ? result : key
}

/**
 * Get all messages for a locale
 * @param locale - The locale to use
 * @returns The locale messages
 */
export function getMessages(locale: Locale = 'zh-CN'): LocaleMessages {
	return messages[locale]
}

export { messages }
