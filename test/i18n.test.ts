import { afterEach, describe, expect, it } from 'vitest'
import { detectBrowserLocale, getLocale, getMessages, setLocale, t } from '../src/locales'

describe('i18n Locale Module', () => {
	const originalNavigator = globalThis.navigator

	afterEach(() => {
		// Reset navigator
		Object.defineProperty(globalThis, 'navigator', {
			value: originalNavigator,
			writable: true,
			configurable: true,
		})
		// Reset to default locale
		setLocale('zh-CN')
	})

	describe('setLocale and getLocale', () => {
		it('should set and get locale correctly', () => {
			setLocale('en-US')
			expect(getLocale()).toBe('en-US')

			setLocale('zh-CN')
			expect(getLocale()).toBe('zh-CN')
		})

		it('should return default locale when not set', () => {
			// Default should be zh-CN (set during module initialization)
			const locale = getLocale()
			expect(['zh-CN', 'en-US']).toContain(locale)
		})
	})

	describe('t (translate)', () => {
		it('should translate slider.success in zh-CN', () => {
			setLocale('zh-CN')
			expect(t('slider.success')).toBe('验证成功')
		})

		it('should translate slider.success in en-US', () => {
			setLocale('en-US')
			expect(t('slider.success')).toBe('Verification passed')
		})

		it('should translate slider.fail in zh-CN', () => {
			setLocale('zh-CN')
			expect(t('slider.fail')).toBe('验证失败')
		})

		it('should translate slider.fail in en-US', () => {
			setLocale('en-US')
			expect(t('slider.fail')).toBe('Verification failed')
		})

		it('should translate slider.slide in zh-CN', () => {
			setLocale('zh-CN')
			expect(t('slider.slide')).toBe('向右滑动完成验证')
		})

		it('should translate slider.slide in en-US', () => {
			setLocale('en-US')
			expect(t('slider.slide')).toBe('Slide to verify')
		})

		it('should translate click.prompt in zh-CN', () => {
			setLocale('zh-CN')
			expect(t('click.prompt')).toBe('请依次点击')
		})

		it('should translate click.prompt in en-US', () => {
			setLocale('en-US')
			expect(t('click.prompt')).toBe('Click in order')
		})

		it('should translate popup.title in zh-CN', () => {
			setLocale('zh-CN')
			expect(t('popup.title')).toBe('安全验证')
		})

		it('should translate popup.title in en-US', () => {
			setLocale('en-US')
			expect(t('popup.title')).toBe('Security Verification')
		})

		it('should translate errors.network in zh-CN', () => {
			setLocale('zh-CN')
			expect(t('errors.network')).toBe('网络错误')
		})

		it('should translate errors.network in en-US', () => {
			setLocale('en-US')
			expect(t('errors.network')).toBe('Network error')
		})

		it('should translate errors.fetchFailed in zh-CN', () => {
			setLocale('zh-CN')
			expect(t('errors.fetchFailed')).toBe('获取验证码失败')
		})

		it('should translate errors.fetchFailed in en-US', () => {
			setLocale('en-US')
			expect(t('errors.fetchFailed')).toBe('Failed to fetch captcha')
		})

		it('should return key for unknown translation key', () => {
			expect(t('unknown.key')).toBe('unknown.key')
		})

		it('should support locale override parameter', () => {
			setLocale('zh-CN')
			expect(t('slider.success', 'en-US')).toBe('Verification passed')
		})
	})

	describe('getMessages', () => {
		it('should return zh-CN messages', () => {
			setLocale('zh-CN')
			const messages = getMessages()
			expect(messages.slider.success).toBe('验证成功')
			expect(messages.click.prompt).toBe('请依次点击')
		})

		it('should return en-US messages', () => {
			setLocale('en-US')
			const messages = getMessages()
			expect(messages.slider.success).toBe('Verification passed')
			expect(messages.click.prompt).toBe('Click in order')
		})

		it('should support locale override parameter', () => {
			setLocale('zh-CN')
			const messages = getMessages('en-US')
			expect(messages.slider.success).toBe('Verification passed')
		})
	})

	describe('detectBrowserLocale', () => {
		it('should return zh-CN for Chinese browser', () => {
			Object.defineProperty(globalThis, 'navigator', {
				value: { language: 'zh-CN' },
				writable: true,
				configurable: true,
			})
			expect(detectBrowserLocale()).toBe('zh-CN')
		})

		it('should return zh-CN for zh-TW browser', () => {
			Object.defineProperty(globalThis, 'navigator', {
				value: { language: 'zh-TW' },
				writable: true,
				configurable: true,
			})
			expect(detectBrowserLocale()).toBe('zh-CN')
		})

		it('should return en-US for English browser', () => {
			Object.defineProperty(globalThis, 'navigator', {
				value: { language: 'en-US' },
				writable: true,
				configurable: true,
			})
			expect(detectBrowserLocale()).toBe('en-US')
		})

		it('should return en-US for other browser languages', () => {
			Object.defineProperty(globalThis, 'navigator', {
				value: { language: 'ja-JP' },
				writable: true,
				configurable: true,
			})
			expect(detectBrowserLocale()).toBe('en-US')
		})

		it('should return zh-CN when navigator is undefined (SSR)', () => {
			Object.defineProperty(globalThis, 'navigator', {
				value: undefined,
				writable: true,
				configurable: true,
			})
			expect(detectBrowserLocale()).toBe('zh-CN')
		})

		it('should handle userLanguage for IE compatibility', () => {
			Object.defineProperty(globalThis, 'navigator', {
				value: { userLanguage: 'en-US' },
				writable: true,
				configurable: true,
			})
			expect(detectBrowserLocale()).toBe('en-US')
		})
	})
})
