import type {
	ClickCaptchaInstance,
	ClickCaptchaOptions,
	PopupCaptchaInstance,
	PopupCaptchaOptions,
	SliderCaptchaInstance,
	SliderCaptchaOptions,
} from './types'
import ClickCaptcha from './click'
import SliderCaptcha from './slider'
import {
	addClass,
	createElement,
	getElement,
	injectStyles,
	off,
	on,
	removeClass,
	setStyle,
} from './utils'

const defaultModalOptions = {
	maskClosable: true,
	escClosable: true,
	showClose: true,
	title: '',
}

const defaultOptions: Partial<PopupCaptchaOptions> = {
	type: 'slider',
	autoClose: true,
	closeDelay: 500,
	modal: defaultModalOptions,
}

// Inject popup styles
function injectPopupStyles(): void {
	injectStyles(
		'captcha-popup-styles',
		`
.captcha-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.captcha-popup-overlay.visible {
  opacity: 1;
  visibility: visible;
}
.captcha-popup-container {
  background: #fff;
  position: relative;
  transform: scale(0.9);
  transition: transform 0.3s ease;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
}
.captcha-popup-overlay.visible .captcha-popup-container {
  transform: scale(1);
}
.captcha-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.captcha-popup-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}
.captcha-popup-close {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s ease;
  padding: 0;
}
.captcha-popup-close:hover {
  background: #f5f5f5;
}
.captcha-popup-close svg {
  width: 16px;
  height: 16px;
  fill: #999;
}
.captcha-popup-body {
  padding: 0;
}
.captcha-popup-body .captcha-slider,
.captcha-popup-body .captcha-click {
  box-shadow: none;
  border-radius: 0;
}
`,
	)
}

/**
 * Popup Captcha - Modal wrapper for Slider/Click captcha
 */
export class PopupCaptcha implements PopupCaptchaInstance {
	private options: PopupCaptchaOptions
	private overlay: HTMLElement | null = null
	private container: HTMLElement | null = null
	private captchaContainer: HTMLElement | null = null
	private captcha: SliderCaptchaInstance | ClickCaptchaInstance | null = null
	private triggerEl: HTMLElement | null = null
	private _visible: boolean = false

	constructor(options: PopupCaptchaOptions) {
		this.options = { ...defaultOptions, ...options }
		this.init()
	}

	/**
	 * Initialize popup
	 */
	private init(): void {
		// Inject styles
		injectPopupStyles()

		// Setup trigger
		if (this.options.trigger) {
			const el = getElement(this.options.trigger)
			if (el) {
				this.triggerEl = el
				on(this.triggerEl, 'click', this.handleTriggerClick)
			}
		}

		// Create popup structure
		this.createPopup()

		// Bind ESC key
		if (this.options.modal?.escClosable !== false) {
			on(document, 'keydown', this.handleEscKey as (e: Event) => void)
		}
	}

	/**
	 * Create popup structure
	 */
	private createPopup(): void {
		const modalOptions = { ...defaultModalOptions, ...this.options.modal }

		// Get captcha dimensions for popup sizing
		// Popup width adapts to captcha width
		const captchaWidth = this.options.captchaOptions?.width || 300

		// Create overlay
		this.overlay = createElement('div', { class: 'captcha-popup-overlay' }, {
			position: 'fixed',
			top: '0',
			left: '0',
			right: '0',
			bottom: '0',
		})

		// Create container - size adapts to captcha dimensions
		this.container = createElement('div', { class: 'captcha-popup-container' }, {
			width: `${captchaWidth}px`,
		})

		// Create header if title or close button
		if (modalOptions.title || modalOptions.showClose) {
			const header = createElement('div', { class: 'captcha-popup-header' })

			if (modalOptions.title) {
				const title = createElement('h3', { class: 'captcha-popup-title' })
				title.textContent = modalOptions.title
				header.appendChild(title)
			} else {
				// Empty spacer
				const spacer = createElement('div')
				header.appendChild(spacer)
			}

			if (modalOptions.showClose) {
				const closeBtn = createElement('button', { class: 'captcha-popup-close' })
				closeBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>'
				on(closeBtn, 'click', () => this.hide())
				header.appendChild(closeBtn)
			}

			this.container.appendChild(header)
		}

		// Create captcha container
		this.captchaContainer = createElement('div', { class: 'captcha-popup-body' })
		this.container.appendChild(this.captchaContainer)

		this.overlay.appendChild(this.container)

		// Click mask to close
		if (modalOptions.maskClosable) {
			on(this.overlay, 'click', (e) => {
				if (e.target === this.overlay) {
					this.hide()
				}
			})
		}

		// Prevent click propagation from container
		on(this.container, 'click', (e) => {
			e.stopPropagation()
		})
	}

	/**
	 * Create captcha instance
	 */
	private createCaptcha(): void {
		if (!this.captchaContainer) return

		// Clear previous captcha
		this.captchaContainer.innerHTML = ''
		if (this.captcha) {
			this.captcha.destroy()
		}

		// Create captcha container element
		const captchaEl = createElement('div', { id: 'captcha-popup-inner' })
		this.captchaContainer.appendChild(captchaEl)

		// Prepare captcha options
		const captchaOptions = {
			...this.options.captchaOptions,
			el: captchaEl,
			onSuccess: () => {
				this.options.onSuccess?.()
				if (this.options.autoClose !== false) {
					setTimeout(() => {
						this.hide()
					}, this.options.closeDelay || 500)
				}
			},
			onFail: () => {
				this.options.onFail?.()
			},
		}

		// Create captcha instance
		if (this.options.type === 'click') {
			this.captcha = new ClickCaptcha(captchaOptions as ClickCaptchaOptions) as ClickCaptchaInstance
		} else {
			this.captcha = new SliderCaptcha(captchaOptions as SliderCaptchaOptions) as SliderCaptchaInstance
		}
	}

	/**
	 * Handle trigger click
	 */
	private handleTriggerClick = (e: Event): void => {
		e.preventDefault()
		this.show()
	}

	/**
	 * Handle ESC key
	 */
	private handleEscKey = (e: KeyboardEvent): void => {
		if (e.key === 'Escape' && this._visible) {
			this.hide()
		}
	}

	/**
	 * Show popup
	 */
	show(): void {
		if (!this.overlay) return

		// Create captcha before showing
		this.createCaptcha()

		// Append to body
		if (!document.body.contains(this.overlay)) {
			document.body.appendChild(this.overlay)
		}

		// Prevent body scroll
		setStyle(document.body, { overflow: 'hidden' })

		// Show overlay
		this._visible = true
		addClass(this.overlay, 'visible')

		// Callback
		this.options.onOpen?.()
	}

	/**
	 * Hide popup
	 */
	hide(): void {
		if (!this.overlay) return

		this._visible = false
		removeClass(this.overlay, 'visible')

		// Restore body scroll
		setStyle(document.body, { overflow: '' })

		// Callback
		this.options.onClose?.()
	}

	/**
	 * Get visibility state
	 */
	isVisible(): boolean {
		return this._visible
	}

	/**
	 * Get inner captcha instance
	 */
	getCaptcha(): SliderCaptchaInstance | ClickCaptchaInstance | null {
		return this.captcha
	}

	/**
	 * Destroy instance
	 */
	destroy(): void {
		// Remove event listeners
		if (this.triggerEl) {
			off(this.triggerEl, 'click', this.handleTriggerClick)
		}
		off(document, 'keydown', this.handleEscKey as (e: Event) => void)

		// Destroy captcha
		if (this.captcha) {
			this.captcha.destroy()
			this.captcha = null
		}

		// Remove overlay from DOM
		if (this.overlay && this.overlay.parentNode) {
			this.overlay.parentNode.removeChild(this.overlay)
		}

		this.overlay = null
		this.container = null
		this.captchaContainer = null
		this.triggerEl = null
		this._visible = false
	}
}

/**
 * Create popup captcha instance
 */
export function createPopupCaptcha(options: PopupCaptchaOptions): PopupCaptchaInstance {
	return new PopupCaptcha(options)
}

export default PopupCaptcha
