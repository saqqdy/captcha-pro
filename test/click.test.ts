import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ClickCaptcha, createClickCaptcha } from '../src'

describe('ClickCaptcha', () => {
	let container: HTMLDivElement

	beforeEach(() => {
		container = document.createElement('div')
		container.id = 'captcha-container'
		document.body.appendChild(container)
	})

	afterEach(() => {
		document.body.removeChild(container)
	})

	it('should create click captcha instance', () => {
		const captcha = new ClickCaptcha({
			el: container,
		})

		expect(captcha).toBeDefined()
		expect(captcha.verify).toBeInstanceOf(Function)
		expect(captcha.reset).toBeInstanceOf(Function)
		expect(captcha.destroy).toBeInstanceOf(Function)
		expect(captcha.refresh).toBeInstanceOf(Function)
		expect(captcha.getData).toBeInstanceOf(Function)
		expect(captcha.getClickPoints).toBeInstanceOf(Function)

		captcha.destroy()
	})

	it('should create instance using factory function', () => {
		const captcha = createClickCaptcha({
			el: container,
		})

		expect(captcha).toBeInstanceOf(ClickCaptcha)

		captcha.destroy()
	})

	it('should render captcha elements', () => {
		const captcha = new ClickCaptcha({
			el: container,
			height: 200,
			width: 300,
		})

		const canvases = container.querySelectorAll('canvas')
		expect(canvases.length).toBeGreaterThan(0)

		captcha.destroy()
	})

	it('should generate specified number of click points', () => {
		const captcha = new ClickCaptcha({
			count: 4,
			el: container,
		})

		const data = captcha.getData()
		expect(data.target).toHaveLength(4)

		captcha.destroy()
	})

	it('should use custom text when provided', () => {
		const customText = 'ABCD'
		const captcha = new ClickCaptcha({
			count: 4,
			el: container,
			text: customText,
		})

		const prompt = container.querySelector('.captcha-prompt')
		expect(prompt?.textContent).toContain('A')
		expect(prompt?.textContent).toContain('B')
		expect(prompt?.textContent).toContain('C')
		expect(prompt?.textContent).toContain('D')

		captcha.destroy()
	})

	it('should verify click points correctly', () => {
		const captcha = new ClickCaptcha({
			count: 3,
			el: container,
		})

		const data = captcha.getData()
		const targetPoints = data.target as { x: number; y: number }[]

		// Verify with correct positions
		const result = captcha.verify(targetPoints)
		expect(result).toBeTruthy()

		captcha.destroy()
	})

	it('should reset captcha', () => {
		const captcha = new ClickCaptcha({
			el: container,
		})

		captcha.reset()
		const clickPoints = captcha.getClickPoints()
		expect(clickPoints).toHaveLength(0)

		captcha.destroy()
	})

	it('should return captcha data', () => {
		const captcha = new ClickCaptcha({
			el: container,
			height: 200,
			width: 300,
		})

		const data = captcha.getData()

		expect(data.type).toBe('click')
		expect(data.timestamp).toBeDefined()
		expect(Array.isArray(data.target)).toBeTruthy()

		captcha.destroy()
	})

	it('should destroy captcha and clean up', () => {
		const captcha = new ClickCaptcha({
			el: container,
		})

		captcha.destroy()

		expect(container.innerHTML).toBe('')
	})

	it('should generate Chinese text by default', () => {
		const captcha = new ClickCaptcha({
			count: 3,
			el: container,
		})

		const prompt = container.querySelector('.captcha-prompt')
		expect(prompt?.textContent).toBeDefined()

		captcha.destroy()
	})

	it('should use default dimensions', () => {
		const captcha = new ClickCaptcha({
			el: container,
		})

		const data = captcha.getData()
		expect(data).toBeDefined()

		captcha.destroy()
	})

	it('should generate statistics', () => {
		const captcha = new ClickCaptcha({
			el: container,
		})

		const stats = captcha.getStatistics()
		expect(stats).toBeDefined()
		expect(stats.totalAttempts).toBe(0)

		captcha.destroy()
	})
})
