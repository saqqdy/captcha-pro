import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ClickCaptcha, SliderCaptcha } from '../src'
import { injectA11yStyles } from '../src/utils'

describe('Accessibility (WCAG 2.2)', () => {
	let container: HTMLDivElement

	beforeEach(() => {
		container = document.createElement('div')
		container.id = 'captcha-container'
		document.body.appendChild(container)
	})

	afterEach(() => {
		document.body.removeChild(container)
		document.head.replaceChildren()
	})

	describe('ClickCaptcha a11y contract', () => {
		it('exposes a container role + label', () => {
			const captcha = new ClickCaptcha({ el: container })
			expect(container.getAttribute('role')).toBe('application')
			expect(container.getAttribute('aria-label')).toBeTruthy()
			captcha.destroy()
		})

		it('labels the refresh button with the refresh i18n key', () => {
			const captcha = new ClickCaptcha({ el: container, showRefresh: true })
			const refreshBtn = container.querySelector('.captcha-refresh-btn') as HTMLButtonElement
			expect(refreshBtn).toBeTruthy()
			expect(refreshBtn.getAttribute('aria-label')).toBe('Refresh') // default EN
			expect(refreshBtn.getAttribute('title')).toBe('Refresh')
			expect(refreshBtn.type).toBe('button')
			captcha.destroy()
		})

		it('exposes the click canvas as a keyboard-focusable button', () => {
			const captcha = new ClickCaptcha({ el: container })
			const canvas = container.querySelector('canvas[role="button"]') as HTMLElement
			expect(canvas).toBeTruthy()
			expect(canvas.getAttribute('tabindex')).toBe('0')
			captcha.destroy()
		})

		it('hides the background canvas from screen readers', () => {
			const captcha = new ClickCaptcha({ el: container })
			expect(container.querySelector('canvas[aria-hidden="true"]')).toBeTruthy()
			captcha.destroy()
		})

		it('announces status + prompt via live regions', () => {
			const captcha = new ClickCaptcha({ el: container })
			expect(container.querySelectorAll('[aria-live="polite"]').length).toBeGreaterThanOrEqual(2)
			const status = container.querySelector('.captcha-status-overlay')
			expect(status?.getAttribute('role')).toBe('status')
			expect(status?.getAttribute('aria-atomic')).toBe('true')
			captcha.destroy()
		})

		it('provides visually-hidden instructions', () => {
			const captcha = new ClickCaptcha({ el: container })
			const instructions = container.querySelector('#captcha-click-instructions')
			expect(instructions).toBeTruthy()
			expect(instructions?.classList.contains('captcha-sr-only')).toBe(true)
			captcha.destroy()
		})
	})

	describe('SliderCaptcha a11y contract', () => {
		it('exposes the slider track with role=slider + value range + instructions link', () => {
			const captcha = new SliderCaptcha({ el: container })
			const track = container.querySelector('.captcha-slider-track') as HTMLElement
			expect(track).toBeTruthy()
			expect(track.getAttribute('role')).toBe('slider')
			expect(track.getAttribute('aria-valuemin')).toBe('0')
			expect(track.getAttribute('aria-valuemax')).toBeTruthy()
			expect(track.getAttribute('aria-valuenow')).toBe('0')
			expect(track.getAttribute('aria-describedby')).toBe('captcha-instructions')
			expect(track.getAttribute('tabindex')).toBe('0')
			expect(track.getAttribute('aria-label')).toBeTruthy()
			captcha.destroy()
		})

		it('links aria-describedby to a real instructions element', () => {
			const captcha = new SliderCaptcha({ el: container })
			expect(container.querySelector('#captcha-instructions')).toBeTruthy()
			captcha.destroy()
		})

		it('labels the refresh button', () => {
			const captcha = new SliderCaptcha({ el: container, showRefresh: true })
			const refreshBtn = container.querySelector('.captcha-refresh-btn') as HTMLButtonElement
			expect(refreshBtn).toBeTruthy()
			expect(refreshBtn.getAttribute('aria-label')).toBe('Refresh')
			captcha.destroy()
		})

		it('announces status via a live region', () => {
			const captcha = new SliderCaptcha({ el: container })
			expect(container.querySelector('[aria-live]')).toBeTruthy()
			captcha.destroy()
		})
	})

	describe('injectA11yStyles', () => {
		it('injects focus-visible outline + 44px refresh hit-area CSS', () => {
			injectA11yStyles()
			const style = document.head.querySelector('#captcha-a11y-styles') as HTMLStyleElement
			expect(style).toBeTruthy()
			const css = style.textContent || ''
			expect(css).toContain('.captcha-refresh-btn:focus-visible')
			expect(css).toContain('.captcha-refresh-btn::before')
			expect(css).toContain('outline')
			expect(css).toContain('inset')
		})
	})
})
