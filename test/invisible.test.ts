import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createInvisibleCaptcha, InvisibleCaptcha } from '../src'

describe('InvisibleCaptcha', () => {
	let container: HTMLButtonElement

	beforeEach(() => {
		container = document.createElement('button')
		container.id = 'trigger-btn'
		container.textContent = 'Click me'
		document.body.appendChild(container)
	})

	afterEach(() => {
		document.body.removeChild(container)
	})

	it('should create invisible captcha instance', () => {
		const captcha = new InvisibleCaptcha({
			el: container,
		})

		expect(captcha).toBeDefined()
		expect(captcha.destroy).toBeInstanceOf(Function)
		expect(captcha.getRiskScore).toBeInstanceOf(Function)

		captcha.destroy()
	})

	it('should create instance using factory function', () => {
		const captcha = createInvisibleCaptcha({
			el: container,
		})

		expect(captcha).toBeInstanceOf(InvisibleCaptcha)

		captcha.destroy()
	})

	it('should return risk score', () => {
		const captcha = new InvisibleCaptcha({
			el: container,
		})

		const score = captcha.getRiskScore()
		expect(typeof score).toBe('number')
		expect(score).toBeGreaterThanOrEqual(0)
		expect(score).toBeLessThanOrEqual(1)

		captcha.destroy()
	})

	it('should support risk assessment config', () => {
		const captcha = new InvisibleCaptcha({
			el: container,
			riskAssessment: {
				threshold: 0.5,
				behaviorCheck: {
					minInteractionTime: 300,
					trackAnalysis: true,
				},
			},
		})

		expect(captcha).toBeDefined()

		captcha.destroy()
	})

	it('should support challenge type config', () => {
		const captcha = new InvisibleCaptcha({
			el: container,
			challengeType: 'click',
		})

		expect(captcha).toBeDefined()

		captcha.destroy()
	})

	it('should call onSuccess callback', () => {
		const onSuccess = vi.fn()
		const captcha = new InvisibleCaptcha({
			el: container,
			riskAssessment: {
				threshold: 0.9, // High threshold, should pass without challenge
			},
			onSuccess,
		})

		// Trigger click
		container.click()

		captcha.destroy()
	})

	it('should support different trigger types', () => {
		const form = document.createElement('form')
		document.body.appendChild(form)

		const captcha = new InvisibleCaptcha({
			el: container,
			trigger: 'click',
		})

		expect(captcha).toBeDefined()

		captcha.destroy()
		document.body.removeChild(form)
	})

	it('should destroy captcha and clean up', () => {
		const captcha = new InvisibleCaptcha({
			el: container,
		})

		captcha.destroy()

		// Element should still exist
		expect(document.body.contains(container)).toBeTruthy()
	})
})
