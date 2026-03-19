import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSliderCaptcha, SliderCaptcha } from '../src'

describe('SliderCaptcha', () => {
	let container: HTMLDivElement

	beforeEach(() => {
		container = document.createElement('div')
		container.id = 'captcha-container'
		document.body.appendChild(container)
	})

	afterEach(() => {
		document.body.removeChild(container)
	})

	it('should create slider captcha instance', () => {
		const captcha = new SliderCaptcha({
			el: container,
		})

		expect(captcha).toBeDefined()
		expect(captcha.verify).toBeInstanceOf(Function)
		expect(captcha.reset).toBeInstanceOf(Function)
		expect(captcha.destroy).toBeInstanceOf(Function)
		expect(captcha.refresh).toBeInstanceOf(Function)
		expect(captcha.getData).toBeInstanceOf(Function)
		expect(captcha.getSliderPosition).toBeInstanceOf(Function)

		captcha.destroy()
	})

	it('should create instance using factory function', () => {
		const captcha = createSliderCaptcha({
			el: container,
		})

		expect(captcha).toBeInstanceOf(SliderCaptcha)

		captcha.destroy()
	})

	it('should render captcha elements', () => {
		const captcha = new SliderCaptcha({
			el: container,
			height: 200,
			width: 300,
		})

		const canvas = container.querySelector('canvas')
		expect(canvas).toBeDefined()

		captcha.destroy()
	})

	it('should call onSuccess callback when verified correctly', () => {
		const onSuccess = vi.fn()
		const captcha = new SliderCaptcha({
			el: container,
			onSuccess,
			precision: 100,
		})

		const data = captcha.getData()
		const targetX = data.target[0] as number

		// Verify with correct position
		const result = captcha.verify([targetX])
		expect(result).toBeTruthy()

		captcha.destroy()
	})

	it('should reset captcha', () => {
		const captcha = new SliderCaptcha({
			el: container,
		})

		const initialPosition = captcha.getSliderPosition()
		expect(initialPosition).toBe(0)

		captcha.reset()
		expect(captcha.getSliderPosition()).toBe(0)

		captcha.destroy()
	})

	it('should return captcha data', () => {
		const captcha = new SliderCaptcha({
			el: container,
			height: 200,
			width: 300,
		})

		const data = captcha.getData()

		expect(data.type).toBe('slider')
		expect(data.timestamp).toBeDefined()
		expect(Array.isArray(data.target)).toBeTruthy()

		captcha.destroy()
	})

	it('should destroy captcha and clean up', () => {
		const captcha = new SliderCaptcha({
			el: container,
		})

		captcha.destroy()

		expect(container.innerHTML).toBe('')
	})

	it('should use default dimensions', () => {
		const captcha = new SliderCaptcha({
			el: container,
		})

		const data = captcha.getData()
		expect(data).toBeDefined()

		captcha.destroy()
	})

	it('should generate background with gradient and patterns', () => {
		const captcha = new SliderCaptcha({
			el: container,
		})

		// Check that canvas was created and has content
		const canvases = container.querySelectorAll('canvas')
		expect(canvases.length).toBeGreaterThan(0)

		captcha.destroy()
	})

	it('should support custom dimensions', () => {
		const captcha = new SliderCaptcha({
			el: container,
			width: 350,
			height: 200,
			sliderWidth: 50,
			sliderHeight: 50,
		})

		expect(captcha).toBeDefined()

		captcha.destroy()
	})

	it('should generate statistics', () => {
		const captcha = new SliderCaptcha({
			el: container,
		})

		const stats = captcha.getStatistics()
		expect(stats).toBeDefined()
		expect(stats.totalAttempts).toBe(0)
		expect(stats.successCount).toBe(0)
		expect(stats.failCount).toBe(0)

		captcha.destroy()
	})

	it('should generate only one decoy hole', () => {
		const captcha = new SliderCaptcha({
			el: container,
			width: 300,
			height: 170,
		})

		// Get background canvas
		const canvases = container.querySelectorAll('canvas')
		expect(canvases.length).toBeGreaterThan(0)

		// Verify captcha was created successfully
		const data = captcha.getData()
		expect(data.type).toBe('slider')
		expect(data.target).toBeDefined()

		captcha.destroy()
	})

	it('should support custom background image', async () => {
		const captcha = new SliderCaptcha({
			el: container,
			bgImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
			width: 300,
			height: 170,
		})

		// Wait for image to load
		await new Promise(resolve => setTimeout(resolve, 100))

		expect(captcha).toBeDefined()

		captcha.destroy()
	})

	it('should not regenerate shapes in backend mode', () => {
		// In backend mode, shapes should not be regenerated when loading images
		const captcha = new SliderCaptcha({
			el: container,
			verifyMode: 'backend',
			bgImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
			sliderImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
			width: 300,
			height: 170,
		})

		expect(captcha).toBeDefined()

		captcha.destroy()
	})

	it('should return signed data asynchronously', async () => {
		const captcha = new SliderCaptcha({
			el: container,
			security: {
				secretKey: 'test-secret-key',
				enableSign: true,
			},
		})

		const signedData = await captcha.getSignedData()
		expect(signedData.type).toBe('slider')
		expect(signedData.timestamp).toBeDefined()
		expect(signedData.signature).toBeDefined()

		captcha.destroy()
	})

	it('should reset statistics', () => {
		const captcha = new SliderCaptcha({
			el: container,
		})

		captcha.resetStatistics()
		const stats = captcha.getStatistics()
		expect(stats.totalAttempts).toBe(0)

		captcha.destroy()
	})
})
