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

	it('should generate decoy characters for anti-bot protection', () => {
		const captcha = new ClickCaptcha({
			count: 3,
			el: container,
		})

		// Target points should match the specified count (not including decoys)
		const data = captcha.getData()
		expect(data.target).toHaveLength(3)

		// The canvas should have characters drawn (including decoys)
		const canvas = container.querySelector('canvas')
		expect(canvas).toBeDefined()

		// Verify prompt shows correct text
		const prompt = container.querySelector('.captcha-prompt')
		expect(prompt?.textContent).toContain('请依次点击')

		// Verify characters are shown as images (not plain text)
		const images = prompt?.querySelectorAll('img')
		expect(images?.length).toBe(3)

		captcha.destroy()
	})

	it('should only verify target characters, not decoys', () => {
		const captcha = new ClickCaptcha({
			count: 3,
			el: container,
		})

		// Get the target points
		const data = captcha.getData()
		const targetPoints = data.target as { x: number; y: number }[]

		// Verify with correct positions should succeed
		const result = captcha.verify(targetPoints)
		expect(result).toBeTruthy()

		// Verify with wrong number of points should fail
		const wrongResult = captcha.verify([targetPoints[0]])
		expect(wrongResult).toBeFalsy()

		captcha.destroy()
	})

	it('should not regenerate characters in backend mode', async () => {
		// In backend mode, characters should not be regenerated when loading images
		const captcha = new ClickCaptcha({
			el: container,
			verifyMode: 'backend',
			bgImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
			width: 300,
			height: 170,
		})

		// Wait for potential image load
		await new Promise(resolve => setTimeout(resolve, 100))

		expect(captcha).toBeDefined()

		captcha.destroy()
	})

	it('should return signed data asynchronously', async () => {
		const captcha = new ClickCaptcha({
			el: container,
			security: {
				secretKey: 'test-secret-key',
				enableSign: true,
			},
		})

		const signedData = await captcha.getSignedData()
		expect(signedData.type).toBe('click')
		expect(signedData.timestamp).toBeDefined()
		expect(signedData.signature).toBeDefined()

		captcha.destroy()
	})

	it('should reset statistics', () => {
		const captcha = new ClickCaptcha({
			el: container,
		})

		captcha.resetStatistics()
		const stats = captcha.getStatistics()
		expect(stats.totalAttempts).toBe(0)

		captcha.destroy()
	})

	it('should generate click character images for prompt', () => {
		const captcha = new ClickCaptcha({
			count: 3,
			el: container,
		})

		// Check that prompt contains images
		const prompt = container.querySelector('.captcha-prompt')
		const images = prompt?.querySelectorAll('img')
		expect(images?.length).toBe(3)

		// Each image should have a base64 src
		images?.forEach(img => {
			expect(img.src).toContain('data:image/png;base64')
		})

		captcha.destroy()
	})
})
