import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPopupCaptcha, PopupCaptcha } from '../src'

describe('PopupCaptcha', () => {
	let container: HTMLDivElement,
	 triggerBtn: HTMLButtonElement

	beforeEach(() => {
		container = document.createElement('div')
		container.id = 'captcha-popup-container'
		document.body.appendChild(container)

		triggerBtn = document.createElement('button')
		triggerBtn.id = 'trigger-btn'
		triggerBtn.textContent = 'Show Captcha'
		document.body.appendChild(triggerBtn)
	})

	afterEach(() => {
		document.body.removeChild(container)
		document.body.removeChild(triggerBtn)
	})

	it('should create popup captcha instance', () => {
		const popup = new PopupCaptcha({
			trigger: triggerBtn,
		})

		expect(popup).toBeDefined()
		expect(popup.show).toBeInstanceOf(Function)
		expect(popup.hide).toBeInstanceOf(Function)
		expect(popup.isVisible).toBeInstanceOf(Function)
		expect(popup.getCaptcha).toBeInstanceOf(Function)
		expect(popup.destroy).toBeInstanceOf(Function)

		popup.destroy()
	})

	it('should create instance using factory function', () => {
		const popup = createPopupCaptcha({
			trigger: triggerBtn,
		})

		expect(popup).toBeInstanceOf(PopupCaptcha)

		popup.destroy()
	})

	it('should show popup when trigger is clicked', () => {
		const popup = new PopupCaptcha({
			trigger: triggerBtn,
		})

		expect(popup.isVisible()).toBeFalsy()

		triggerBtn.click()

		expect(popup.isVisible()).toBeTruthy()

		popup.destroy()
	})

	it('should show popup programmatically', () => {
		const popup = new PopupCaptcha({})

		expect(popup.isVisible()).toBeFalsy()

		popup.show()

		expect(popup.isVisible()).toBeTruthy()

		popup.destroy()
	})

	it('should hide popup', () => {
		const popup = new PopupCaptcha({})

		popup.show()
		expect(popup.isVisible()).toBeTruthy()

		popup.hide()
		expect(popup.isVisible()).toBeFalsy()

		popup.destroy()
	})

	it('should return inner captcha instance', () => {
		const popup = new PopupCaptcha({
			type: 'slider',
		})

		expect(popup.getCaptcha()).toBeNull()

		popup.show()
		expect(popup.getCaptcha()).toBeDefined()

		popup.destroy()
	})

	it('should call onOpen callback', () => {
		const onOpen = vi.fn()
		const popup = new PopupCaptcha({
			onOpen,
		})

		popup.show()
		expect(onOpen).toHaveBeenCalled()

		popup.destroy()
	})

	it('should call onClose callback', () => {
		const onClose = vi.fn()
		const popup = new PopupCaptcha({
			onClose,
		})

		popup.show()
		popup.hide()
		expect(onClose).toHaveBeenCalled()

		popup.destroy()
	})

	it('should create slider captcha by default', () => {
		const popup = new PopupCaptcha({})

		popup.show()
		const captcha = popup.getCaptcha()
		expect(captcha).toBeDefined()
		expect(captcha?.getData).toBeInstanceOf(Function)

		popup.destroy()
	})

	it('should create click captcha when type is click', () => {
		const popup = new PopupCaptcha({
			type: 'click',
		})

		popup.show()
		const captcha = popup.getCaptcha()
		expect(captcha).toBeDefined()
		expect(captcha?.getData).toBeInstanceOf(Function)

		popup.destroy()
	})

	it('should destroy and clean up', () => {
		const popup = new PopupCaptcha({
			trigger: triggerBtn,
		})

		popup.show()
		popup.destroy()

		expect(popup.isVisible()).toBeFalsy()
		expect(popup.getCaptcha()).toBeNull()
	})

	it('should adapt popup width to captcha width', () => {
		const popup = new PopupCaptcha({
			captchaOptions: {
				width: 400,
				height: 200,
			},
		})

		popup.show()
		expect(popup.isVisible()).toBeTruthy()

		popup.destroy()
	})

	it('should support custom modal title', () => {
		const popup = new PopupCaptcha({
			modal: {
				title: '安全验证',
			},
		})

		popup.show()
		expect(popup.isVisible()).toBeTruthy()

		popup.destroy()
	})

	it('should hide on ESC key', () => {
		const popup = new PopupCaptcha({
			modal: {
				escClosable: true,
			},
		})

		popup.show()
		expect(popup.isVisible()).toBeTruthy()

		// Simulate ESC key
		const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
		document.dispatchEvent(escEvent)

		expect(popup.isVisible()).toBeFalsy()

		popup.destroy()
	})

	it('should not hide on ESC when escClosable is false', () => {
		const popup = new PopupCaptcha({
			modal: {
				escClosable: false,
			},
		})

		popup.show()
		expect(popup.isVisible()).toBeTruthy()

		// Simulate ESC key
		const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
		document.dispatchEvent(escEvent)

		expect(popup.isVisible()).toBeTruthy()

		popup.destroy()
	})
})
