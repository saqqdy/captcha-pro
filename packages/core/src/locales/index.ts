/**
 * i18n (Internationalization) Module
 *
 * Provides lightweight internationalization support for captcha-pro.
 * Currently supports zh-CN (Chinese Simplified) and en-US (English).
 */

import type { Locale, LocaleMessages } from '../types'
import enUS from './en-US'
import zhCN from './zh-CN'

// Re-export types for convenience
export type { Locale, LocaleMessages }

/**
 * Built-in locale messages
 */
const messages: Record<Locale, LocaleMessages> = {
	'zh-CN': zhCN,
	'en-US': enUS,
}

/**
 * Current locale (default: zh-CN)
 */
let currentLocale: Locale = 'zh-CN'

/**
 * Set the current locale
 * @param locale - The locale to set ('zh-CN' or 'en-US')
 */
export function setLocale(locale: Locale): void {
	currentLocale = locale
}

/**
 * Get the current locale
 * @returns The current locale
 */
export function getLocale(): Locale {
	return currentLocale
}

/**
 * Get translated text by key
 * @param key - The translation key (e.g., 'slider.success')
 * @param locale - Optional locale override
 * @returns The translated text
 */
export function t(key: string, locale?: Locale): string {
	const targetLocale = locale || currentLocale
	const keys = key.split('.')

	let result: unknown = messages[targetLocale]
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
 * @param locale - Optional locale override
 * @returns The locale messages
 */
export function getMessages(locale?: Locale): LocaleMessages {
	return messages[locale || currentLocale]
}

/**
 * Detect browser locale and map to supported locale
 * @returns The detected locale
 */
export function detectBrowserLocale(): Locale {
	if (typeof navigator === 'undefined') {
		return 'zh-CN'
	}

	const lang = navigator.language || (navigator as any).userLanguage

	if (!lang) {
		return 'zh-CN'
	}

	// Map browser language to supported locale
	if (lang.startsWith('zh')) {
		return 'zh-CN'
	}

	return 'en-US'
}

// Auto-detect browser locale on initialization (browser environment only)
if (typeof window !== 'undefined') {
	currentLocale = detectBrowserLocale()
}

/**
 * i18n instance with all methods
 */
export const i18n = {
	setLocale,
	getLocale,
	t,
	getMessages,
	detectBrowserLocale,
}

export default i18n
