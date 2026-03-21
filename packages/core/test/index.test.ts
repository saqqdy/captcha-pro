import { describe, expect, it } from 'vitest'
import * as CaptchaPro from '../src'
import {
	ClickCaptcha,
	createClickCaptcha,
	createInvisibleCaptcha,
	createPopupCaptcha,
	createSliderCaptcha,
	getLocale,
	InvisibleCaptcha,
	PopupCaptcha,
	setLocale,
	SliderCaptcha,
	t,
} from '../src'

describe('Index Exports', () => {
	describe('Class exports', () => {
		it('should export SliderCaptcha class', () => {
			expect(SliderCaptcha).toBeDefined()
			expect(typeof SliderCaptcha).toBe('function')
		})

		it('should export ClickCaptcha class', () => {
			expect(ClickCaptcha).toBeDefined()
			expect(typeof ClickCaptcha).toBe('function')
		})

		it('should export PopupCaptcha class', () => {
			expect(PopupCaptcha).toBeDefined()
			expect(typeof PopupCaptcha).toBe('function')
		})

		it('should export InvisibleCaptcha class', () => {
			expect(InvisibleCaptcha).toBeDefined()
			expect(typeof InvisibleCaptcha).toBe('function')
		})
	})

	describe('Factory function exports', () => {
		it('should export createSliderCaptcha function', () => {
			expect(createSliderCaptcha).toBeDefined()
			expect(typeof createSliderCaptcha).toBe('function')
		})

		it('should export createClickCaptcha function', () => {
			expect(createClickCaptcha).toBeDefined()
			expect(typeof createClickCaptcha).toBe('function')
		})

		it('should export createPopupCaptcha function', () => {
			expect(createPopupCaptcha).toBeDefined()
			expect(typeof createPopupCaptcha).toBe('function')
		})

		it('should export createInvisibleCaptcha function', () => {
			expect(createInvisibleCaptcha).toBeDefined()
			expect(typeof createInvisibleCaptcha).toBe('function')
		})
	})

	describe('i18n exports', () => {
		it('should export setLocale function', () => {
			expect(setLocale).toBeDefined()
			expect(typeof setLocale).toBe('function')
		})

		it('should export getLocale function', () => {
			expect(getLocale).toBeDefined()
			expect(typeof getLocale).toBe('function')
		})

		it('should export t function', () => {
			expect(t).toBeDefined()
			expect(typeof t).toBe('function')
		})
	})

	describe('Namespace export', () => {
		it('should export all members as namespace', () => {
			expect(CaptchaPro.SliderCaptcha).toBe(SliderCaptcha)
			expect(CaptchaPro.ClickCaptcha).toBe(ClickCaptcha)
			expect(CaptchaPro.PopupCaptcha).toBe(PopupCaptcha)
			expect(CaptchaPro.InvisibleCaptcha).toBe(InvisibleCaptcha)
			expect(CaptchaPro.createSliderCaptcha).toBe(createSliderCaptcha)
			expect(CaptchaPro.createClickCaptcha).toBe(createClickCaptcha)
			expect(CaptchaPro.createPopupCaptcha).toBe(createPopupCaptcha)
			expect(CaptchaPro.createInvisibleCaptcha).toBe(createInvisibleCaptcha)
		})
	})
})

describe('Factory Functions', () => {
	describe('createSliderCaptcha', () => {
		it('should create SliderCaptcha instance', () => {
			const container = document.createElement('div')
			const captcha = createSliderCaptcha({ el: container })
			expect(captcha).toBeInstanceOf(SliderCaptcha)
			captcha.destroy()
		})
	})

	describe('createClickCaptcha', () => {
		it('should create ClickCaptcha instance', () => {
			const container = document.createElement('div')
			const captcha = createClickCaptcha({ el: container })
			expect(captcha).toBeInstanceOf(ClickCaptcha)
			captcha.destroy()
		})
	})

	describe('createPopupCaptcha', () => {
		it('should create PopupCaptcha instance', () => {
			const popup = createPopupCaptcha({})
			expect(popup).toBeInstanceOf(PopupCaptcha)
			popup.destroy()
		})
	})

	describe('createInvisibleCaptcha', () => {
		it('should create InvisibleCaptcha instance', () => {
			const container = document.createElement('button')
			const captcha = createInvisibleCaptcha({ el: container })
			expect(captcha).toBeInstanceOf(InvisibleCaptcha)
			captcha.destroy()
		})
	})
})
