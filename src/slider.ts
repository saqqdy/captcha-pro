import type {
	BackendCaptchaResponse,
	BackendVerifyResponse,
	CaptchaData,
	CaptchaStatistics,
	SliderCaptchaInstance,
	SliderCaptchaOptions,
	SliderTrack,
	StatisticsData,
} from './types'
import {
	addClass,
	createElement,
	generateNonce,
	generateSignature,
	getElement,
	getEventPosition,
	injectShakeAnimation,
	loadImage,
	off,
	on,
	random,
	removeClass,
	request,
	setStyle,
} from './utils'

const defaultOptions: Partial<SliderCaptchaOptions> = {
	width: 300,
	height: 170,
	sliderWidth: 42,
	sliderHeight: 42,
	precision: 5,
	showRefresh: true,
	className: 'captcha-slider',
	verifyMode: 'frontend',
}

/**
 * Slider Captcha (Puzzle Captcha)
 */
export class SliderCaptcha implements SliderCaptchaInstance {
	private options: SliderCaptchaOptions
	private container: HTMLElement | null = null
	private bgCanvas: HTMLCanvasElement | null = null
	private sliderCanvas: HTMLCanvasElement | null = null
	private sliderBtn: HTMLElement | null = null
	private sliderProgress: HTMLElement | null = null
	private statusOverlay: HTMLElement | null = null
	private hintText: HTMLElement | null = null
	private targetX: number = 0
	private currentX: number = 0
	private tracks: SliderTrack[] = []
	private isDragging: boolean = false
	private startX: number = 0
	private dragStartTime: number = 0
	private _verified: boolean = false
	private captchaId: string = ''
	// @ts-expect-error - stored for potential future use
	private _backendData: BackendCaptchaResponse | null = null
	private statistics: StatisticsData = {
		totalAttempts: 0,
		successCount: 0,
		failCount: 0,
		totalVerifyTime: 0,
		totalDragDistance: 0,
		totalDragTime: 0,
		totalClickCount: 0,
	}

	constructor(options: SliderCaptchaOptions) {
		this.options = { ...defaultOptions, ...options }
		this.init()
	}

	/**
	 * Initialize captcha
	 */
	private async init(): Promise<void> {
		const el = getElement(this.options.el)
		if (!el) {
			console.error('Captcha container not found')
			return
		}

		this.container = el
		this.render()
		this.bindEvents()

		if (this.options.verifyMode === 'backend' && this.options.backendVerify?.getCaptcha) {
			await this.fetchBackendCaptcha()
		} else if (this.options.bgImage) {
			this.loadImages()
		} else {
			this.generateCaptcha()
		}
	}

	/**
	 * Fetch captcha from backend
	 */
	private async fetchBackendCaptcha(): Promise<void> {
		const { backendVerify } = this.options
		if (!backendVerify?.getCaptcha) return

		try {
			let response: BackendCaptchaResponse

			if (typeof backendVerify.getCaptcha === 'function') {
				response = await backendVerify.getCaptcha({})
			} else {
				response = await request<BackendCaptchaResponse>(backendVerify.getCaptcha, {
					method: 'GET',
					headers: backendVerify.headers,
					timeout: backendVerify.timeout,
				})
			}

			this._backendData = response
			this.captchaId = response.data.captchaId
			this.options.bgImage = response.data.bgImage
			if (response.data.sliderImage) {
				this.options.sliderImage = response.data.sliderImage
			}
			await this.loadImages()
		} catch (error) {
			console.error('Failed to fetch captcha from backend', error)
		}
	}

	/**
	 * Render captcha UI
	 */
	private render(): void {
		if (!this.container) return

		// Container width = canvas width + padding (10px on each side)
		const containerWidth = this.options.width! + 20

		addClass(this.container, this.options.className!)
		setStyle(this.container, {
			width: containerWidth,
			position: 'relative',
			overflow: 'hidden',
			borderRadius: '8px',
			background: '#fff',
			boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
			padding: '10px',
		})

		// Accessibility: Set container role and label
		this.container.setAttribute('role', 'application')
		this.container.setAttribute('aria-label', 'Slider Captcha Verification')

		// Screen reader instructions (visually hidden)
		const instructions = createElement('div', {
			id: 'captcha-instructions',
			class: 'captcha-sr-only',
		}, {
			position: 'absolute',
			width: '1px',
			height: '1px',
			padding: '0',
			margin: '-1px',
			overflow: 'hidden',
			clip: 'rect(0, 0, 0, 0)',
			whiteSpace: 'nowrap',
			border: '0',
		})
		instructions.textContent = 'Drag the slider or use left/right arrow keys to complete the puzzle verification. Press Enter to submit.'
		this.container.appendChild(instructions)

		// Image container
		const imageContainer = createElement('div', { class: 'captcha-image-container' }, {
			position: 'relative',
			width: '100%',
			height: `${this.options.height!  }px`,
			overflow: 'hidden',
			borderRadius: '4px',
		})
		this.container.appendChild(imageContainer)

		// Background canvas
		this.bgCanvas = createElement('canvas', {
			role: 'img',
			'aria-label': 'Captcha background image',
		}, { width: this.options.width!, height: this.options.height! }) as HTMLCanvasElement
		this.bgCanvas.width = this.options.width!
		this.bgCanvas.height = this.options.height!
		imageContainer.appendChild(this.bgCanvas)

		// Slider canvas (puzzle piece)
		this.sliderCanvas = createElement('canvas', {
			role: 'img',
			'aria-label': 'Puzzle piece to drag',
		}, { position: 'absolute', top: 0, left: 0 }) as HTMLCanvasElement
		this.sliderCanvas.width = this.options.sliderWidth!
		this.sliderCanvas.height = this.options.sliderHeight!
		imageContainer.appendChild(this.sliderCanvas)

		// Status overlay (floating from bottom) - for screen reader announcements
		const statusOverlay = createElement('div', {
			class: 'captcha-status-overlay',
			role: 'status',
			'aria-live': 'polite',
			'aria-atomic': 'true',
		}, {
			position: 'absolute',
			bottom: 0,
			left: 0,
			right: 0,
			height: '28px',
			display: 'none',
			alignItems: 'center',
			justifyContent: 'center',
			gap: '6px',
			fontSize: '12px',
			fontWeight: '500',
			zIndex: '15',
			borderRadius: '0 0 4px 4px',
		})
		imageContainer.appendChild(statusOverlay)
		this.statusOverlay = statusOverlay

		// Refresh button (positioned inside image)
		if (this.options.showRefresh) {
			const refreshBtn = createElement('button', {
				class: 'captcha-refresh-btn',
				type: 'button',
				'aria-label': 'Refresh captcha',
				title: 'Refresh',
			}, {
				position: 'absolute',
				top: '10px',
				right: '10px',
				width: '28px',
				height: '28px',
				background: 'rgba(255,255,255,0.9)',
				borderRadius: '4px',
				cursor: 'pointer',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: '10',
				transition: 'transform 0.2s ease',
				border: 'none',
			})
			refreshBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="#666" d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>'
			on(refreshBtn, 'click', () => {
				this.refresh()
				this.options.onRefresh?.()
			})
			imageContainer.appendChild(refreshBtn)
		}

		// Slider button container
		const sliderContainer = createElement('div', {
			class: 'captcha-slider-track',
			role: 'slider',
			'aria-label': 'Verification slider',
			'aria-valuemin': '0',
			'aria-valuemax': String(this.options.width! - this.options.sliderWidth!),
			'aria-valuenow': '0',
			'aria-describedby': 'captcha-instructions',
			tabindex: '0',
		}, {
			width: '100%',
			height: '40px',
			background: '#f7f9fa',
			position: 'relative',
			display: 'flex',
			alignItems: 'center',
			userSelect: 'none',
			marginTop: '5px',
			borderRadius: '4px',
		})
		this.container.appendChild(sliderContainer)

		// Slider progress container (bordered rectangle area containing slider button)
		this.sliderProgress = createElement('div', { class: 'captcha-slider-progress' }, {
			position: 'absolute',
			left: '0',
			top: '0',
			height: '40px',
			width: '40px', // Initial width = slider width 36px + right margin 2px
			border: '1px solid #f7f9fa',
			background: '#f7f9fa',
			pointerEvents: 'none',
			zIndex: '1',
			borderRadius: '4px 4px 4px 4px',
		})
		sliderContainer.appendChild(this.sliderProgress)

		// Slider hint text
		const hintText = createElement('div', { class: 'captcha-slider-hint' }, {
			position: 'absolute',
			left: '50%',
			top: '50%',
			transform: 'translate(-50%, -50%)',
			fontSize: '14px',
			color: '#999',
			pointerEvents: 'none',
			transition: 'opacity 0.2s ease',
			zIndex: '1',
		})
		hintText.textContent = '向右滑动完成验证'
		sliderContainer.appendChild(hintText)
		this.hintText = hintText

		// Slider button (contained in progress bar rectangle, 1px margin on top, right, bottom)
		this.sliderBtn = createElement('div', { class: 'captcha-slider-btn' }, {
			width: '36px',
			height: '36px',
			background: '#fff',
			border: '1px solid #e1e4e8',
			borderRadius: '4px',
			position: 'absolute',
			left: '2px',
			top: '2px',
			cursor: 'pointer',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			transition: 'background 0.2s ease',
			zIndex: '2',
		})
		this.sliderBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#1991fa" d="M8 5v14l11-7z"/></svg>'
		sliderContainer.appendChild(this.sliderBtn)

		// Store slider container for keyboard events
		this.sliderContainer = sliderContainer
	}

	private sliderContainer: HTMLElement | null = null

	/**
	 * Load images
	 */
	private async loadImages(): Promise<void> {
		if (!this.options.bgImage) return

		try {
			const bgImg = await loadImage(this.options.bgImage)
			this.drawBackground(bgImg)

			if (this.options.sliderImage) {
				const sliderImg = await loadImage(this.options.sliderImage)
				this.drawSlider(sliderImg)
			} else {
				this.generateSliderPiece()
			}
		} catch (error) {
			console.error('Failed to load captcha images', error)
		}
	}

	/**
	 * Generate captcha automatically
	 */
	private generateCaptcha(): void {
		if (!this.bgCanvas) return

		const ctx = this.bgCanvas.getContext('2d')!
		const { width, height } = this.options

		// Generate gradient background
		const bgGradient = ctx.createLinearGradient(0, 0, width!, height!)
		const hue1 = random(0, 360)
		const hue2 = (hue1 + random(30, 60)) % 360
		bgGradient.addColorStop(0, `hsl(${hue1}, 70%, 85%)`)
		bgGradient.addColorStop(1, `hsl(${hue2}, 70%, 75%)`)
		ctx.fillStyle = bgGradient
		ctx.fillRect(0, 0, width!, height!)

		// Add decorative background shapes (larger, more transparent)
		for (let i = 0; i < 8; i++) {
			const shapeHue = (hue1 + random(0, 120)) % 360
			ctx.fillStyle = `hsla(${shapeHue}, 60%, 60%, 0.15)`
			ctx.beginPath()
			const shapeType = random(0, 2)
			const x = random(-20, width! - 20)
			const y = random(-20, height! - 20)
			const size = random(40, 80)
			if (shapeType === 0) {
				// Circle
				ctx.arc(x, y, size, 0, Math.PI * 2)
			} else if (shapeType === 1) {
				// Rectangle (use path instead of rect for test compatibility)
				ctx.moveTo(x, y)
				ctx.lineTo(x + size * 1.5, y)
				ctx.lineTo(x + size * 1.5, y + size)
				ctx.lineTo(x, y + size)
				ctx.closePath()
			} else {
				// Triangle
				ctx.moveTo(x + size / 2, y)
				ctx.lineTo(x + size, y + size)
				ctx.lineTo(x, y + size)
				ctx.closePath()
			}
			ctx.fill()
		}

		// Add small decorative dots
		for (let i = 0; i < 30; i++) {
			const dotHue = (hue1 + random(0, 180)) % 360
			ctx.fillStyle = `hsla(${dotHue}, 50%, 50%, 0.3)`
			ctx.beginPath()
			ctx.arc(random(0, width!), random(0, height!), random(2, 8), 0, Math.PI * 2)
			ctx.fill()
		}

		// Add some lines
		for (let i = 0; i < 5; i++) {
			const lineHue = (hue1 + random(0, 180)) % 360
			ctx.strokeStyle = `hsla(${lineHue}, 40%, 50%, 0.2)`
			ctx.lineWidth = random(1, 3)
			ctx.beginPath()
			ctx.moveTo(random(0, width!), random(0, height!))
			ctx.lineTo(random(0, width!), random(0, height!))
			ctx.stroke()
		}

		// Add subtle noise texture overlay
		this.addNoiseTexture(ctx, width!, height!, 0.02)

		this.generateSliderPiece()
	}

	/**
	 * Add subtle noise texture to canvas
	 */
	private addNoiseTexture(ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number): void {
		const imageData = ctx.getImageData(0, 0, width, height)
		const data = imageData.data
		for (let i = 0; i < data.length; i += 4) {
			const noise = (Math.random() - 0.5) * 255 * opacity
			data[i] = Math.max(0, Math.min(255, data[i] + noise))
			data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
			data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
		}
		ctx.putImageData(imageData, 0, 0)
	}

	/**
	 * Draw background image
	 */
	private drawBackground(img: HTMLImageElement): void {
		if (!this.bgCanvas) return

		const ctx = this.bgCanvas.getContext('2d')!
		const { width, height } = this.options

		// Draw image scaled to fit
		const scale = Math.max(width! / img.width, height! / img.height)
		const sw = width! / scale
		const sh = height! / scale
		const sx = (img.width - sw) / 2
		const sy = (img.height - sh) / 2

		ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width!, height!)

		this.generateSliderPiece()
	}

	// Current shape type
	private currentShape: 'square' | 'triangle' | 'trapezoid' | 'pentagon' = 'square'

	/**
	 * Generate slider puzzle piece
	 */
	private generateSliderPiece(): void {
		if (!this.bgCanvas || !this.sliderCanvas) return

		const { width, height, sliderWidth, sliderHeight } = this.options
		const bgCtx = this.bgCanvas.getContext('2d')!
		const sliderCtx = this.sliderCanvas.getContext('2d')!
		const borderRadius = 8

		// Random shape type
		const shapes: Array<'square' | 'triangle' | 'trapezoid' | 'pentagon'> = ['square', 'triangle', 'trapezoid', 'pentagon']
		this.currentShape = shapes[random(0, 3)]

		// Random target position (avoid edges)
		this.targetX = random(sliderWidth! + 20, width! - sliderWidth! - 20)
		const targetY = random(10, height! - sliderHeight! - 10)

		// Slider canvas dimensions
		this.sliderCanvas.width = sliderWidth!
		this.sliderCanvas.height = sliderHeight!

		// Create temporary canvas to save image data
		const tempCanvas = document.createElement('canvas')
		tempCanvas.width = sliderWidth!
		tempCanvas.height = sliderHeight!
		const tempCtx = tempCanvas.getContext('2d')!

		// Get puzzle area image data from background
		tempCtx.drawImage(
			this.bgCanvas,
			this.targetX, targetY, sliderWidth!, sliderHeight!,
			0, 0, sliderWidth!, sliderHeight!
		)

		// Clear slider canvas
		sliderCtx.clearRect(0, 0, sliderWidth!, sliderHeight!)

		// Draw shape path and clip
		sliderCtx.save()
		this.drawShape(sliderCtx, 0, 0, sliderWidth!, sliderHeight!, borderRadius)
		sliderCtx.clip()

		// Draw image within clipped area
		sliderCtx.drawImage(tempCanvas, 0, 0)
		sliderCtx.restore()

		// Draw puzzle border with shadow
		sliderCtx.save()
		this.drawShape(sliderCtx, 0, 0, sliderWidth!, sliderHeight!, borderRadius)
		// Black shadow for outline
		sliderCtx.shadowColor = 'rgba(0, 0, 0, 0.5)'
		sliderCtx.shadowBlur = 4
		sliderCtx.shadowOffsetX = 0
		sliderCtx.shadowOffsetY = 0
		// 1px white border
		sliderCtx.strokeStyle = 'rgba(255, 255, 255, 1)'
		sliderCtx.lineWidth = 1
		sliderCtx.stroke()
		sliderCtx.restore()

		// Position slider canvas
		setStyle(this.sliderCanvas, { top: `${targetY}px` })

		// Draw decoy hole (deceptive pit)
		this.drawDecoyHole(bgCtx, sliderWidth!, sliderHeight!, borderRadius)

		// Clear the puzzle area on background
		bgCtx.save()
		this.drawShape(bgCtx, this.targetX, targetY, sliderWidth!, sliderHeight!, borderRadius)
		bgCtx.globalCompositeOperation = 'destination-out'
		bgCtx.fill()
		bgCtx.restore()

		// Draw hole: white border + dark overlay
		bgCtx.save()
		this.drawShape(bgCtx, this.targetX, targetY, sliderWidth!, sliderHeight!, borderRadius)
		// Fill with 30% transparent black
		bgCtx.fillStyle = 'rgba(0, 0, 0, 0.3)'
		bgCtx.fill()
		// 1px white border
		bgCtx.strokeStyle = 'rgba(255, 255, 255, 1)'
		bgCtx.lineWidth = 1
		bgCtx.stroke()
		bgCtx.restore()
	}

	/**
	 * Draw shape based on current shape type
	 */
	private drawShape(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
		switch (this.currentShape) {
			case 'square':
				this.drawRoundedRect(ctx, x, y, w, h, r)
				break
			case 'triangle':
				this.drawTriangle(ctx, x, y, w, h)
				break
			case 'trapezoid':
				this.drawTrapezoid(ctx, x, y, w, h)
				break
			case 'pentagon':
				this.drawPentagon(ctx, x, y, w, h)
				break
		}
	}

	/**
	 * Draw triangle (equilateral)
	 */
	private drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
		ctx.beginPath()
		// Top center
		ctx.moveTo(x + w / 2, y)
		// Bottom right
		ctx.lineTo(x + w, y + h)
		// Bottom left
		ctx.lineTo(x, y + h)
		ctx.closePath()
	}

	/**
	 * Draw trapezoid
	 */
	private drawTrapezoid(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
		const topInset = w * 0.15
		ctx.beginPath()
		// Top left
		ctx.moveTo(x + topInset, y)
		// Top right
		ctx.lineTo(x + w - topInset, y)
		// Bottom right
		ctx.lineTo(x + w, y + h)
		// Bottom left
		ctx.lineTo(x, y + h)
		ctx.closePath()
	}

	/**
	 * Draw pentagon
	 */
	private drawPentagon(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
		const centerX = x + w / 2
		const centerY = y + h / 2
		const radius = Math.min(w, h) / 2

		ctx.beginPath()
		for (let i = 0; i < 5; i++) {
			const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2 // Start from top
			const px = centerX + radius * Math.cos(angle)
			const py = centerY + radius * Math.sin(angle)
			if (i === 0) {
				ctx.moveTo(px, py)
			} else {
				ctx.lineTo(px, py)
			}
		}
		ctx.closePath()
	}

	/**
	 * Draw decoy hole (deceptive pit with random rotation)
	 */
	private drawDecoyHole(ctx: CanvasRenderingContext2D, w: number, h: number, r: number): void {
		const { width, height } = this.options

		// Random decoy position (avoid overlapping with target)
		let decoyX: number, decoyY: number
		do {
			decoyX = random(w + 10, width! - w - 10)
			decoyY = random(10, height! - h - 10)
		} while (Math.abs(decoyX - this.targetX) < w + 20 && Math.abs(decoyY - 10) < h + 20)

		// Random rotation angle (5-15 degrees)
		const rotation = (random(5, 15) * Math.PI) / 180

		ctx.save()

		// Translate to decoy center and rotate
		ctx.translate(decoyX + w / 2, decoyY + h / 2)
		ctx.rotate(rotation)
		ctx.translate(-(decoyX + w / 2), -(decoyY + h / 2))

		// Draw decoy hole: white border + dark overlay
		this.drawShape(ctx, decoyX, decoyY, w, h, r)
		// Fill with 30% transparent black
		ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
		ctx.fill()
		// 1px white border
		ctx.strokeStyle = 'rgba(255, 255, 255, 1)'
		ctx.lineWidth = 1
		ctx.stroke()

		ctx.restore()
	}

	/**
	 * Draw rounded rectangle
	 */
	private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
		ctx.beginPath()
		ctx.moveTo(x + r, y)
		ctx.lineTo(x + w - r, y)
		ctx.quadraticCurveTo(x + w, y, x + w, y + r)
		ctx.lineTo(x + w, y + h - r)
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
		ctx.lineTo(x + r, y + h)
		ctx.quadraticCurveTo(x, y + h, x, y + h - r)
		ctx.lineTo(x, y + r)
		ctx.quadraticCurveTo(x, y, x + r, y)
		ctx.closePath()
	}

	/**
	 * Draw slider image
	 */
	private drawSlider(img: HTMLImageElement): void {
		if (!this.sliderCanvas) return

		const ctx = this.sliderCanvas.getContext('2d')!
		ctx.drawImage(img, 0, 0, this.options.sliderWidth!, this.options.sliderHeight!)
	}

	/**
	 * Bind events
	 */
	private bindEvents(): void {
		if (!this.sliderBtn) return

		on(this.sliderBtn, 'mousedown', this.onDragStart)
		on(this.sliderBtn, 'touchstart', this.onDragStart, { passive: false })
		on(document, 'mousemove', this.onDragMove)
		on(document, 'touchmove', this.onDragMove, { passive: false })
		on(document, 'mouseup', this.onDragEnd)
		on(document, 'touchend', this.onDragEnd)

		// Keyboard accessibility
		if (this.sliderContainer) {
			on(this.sliderContainer, 'keydown', this.onKeyDown)
			on(this.sliderContainer, 'focus', this.onFocus)
			on(this.sliderContainer, 'blur', this.onBlur)
		}
	}

	/**
	 * Keyboard navigation handler
	 */
	private onKeyDown = (e: Event): void => {
		const ke = e as KeyboardEvent
		if (this._verified) return

		const maxX = this.options.width! - this.options.sliderWidth!
		const step = 10 // pixels per key press

		switch (ke.key) {
			case 'ArrowRight':
			case 'ArrowUp':
				ke.preventDefault()
				this.currentX = Math.min(this.currentX + step, maxX)
				this.updateSliderPosition()
				this.updateAriaValue()
				break
			case 'ArrowLeft':
			case 'ArrowDown':
				ke.preventDefault()
				this.currentX = Math.max(this.currentX - step, 0)
				this.updateSliderPosition()
				this.updateAriaValue()
				break
			case 'Home':
				ke.preventDefault()
				this.currentX = 0
				this.updateSliderPosition()
				this.updateAriaValue()
				break
			case 'End':
				ke.preventDefault()
				this.currentX = maxX
				this.updateSliderPosition()
				this.updateAriaValue()
				break
			case 'Enter':
			case ' ':
				ke.preventDefault()
				this.verifyPosition()
				break
		}
	}

	/**
	 * Update slider position (for keyboard navigation)
	 */
	private updateSliderPosition(): void {
		// Hide hint text
		if (this.hintText) {
			setStyle(this.hintText, { opacity: '0' })
		}

		// Update slider position
		if (this.sliderCanvas) {
			setStyle(this.sliderCanvas, { left: `${this.currentX}px` })
		}
		if (this.sliderBtn) {
			setStyle(this.sliderBtn, {
				left: `${this.currentX + 2}px`,
				background: '#1991fa',
				borderColor: '#1991fa',
			})
		}
		if (this.sliderProgress) {
			const progressWidth = Math.max(40, this.currentX + 40)
			setStyle(this.sliderProgress, {
				width: `${progressWidth}px`,
				border: '1px solid #1991fa',
				background: 'rgba(25, 145, 250, 0.08)',
			})
		}
	}

	/**
	 * Update ARIA value for screen readers
	 */
	private updateAriaValue(): void {
		if (this.sliderContainer) {
			this.sliderContainer.setAttribute('aria-valuenow', String(Math.round(this.currentX)))
		}
	}

	/**
	 * Focus handler
	 */
	private onFocus = (): void => {
		if (this.sliderContainer) {
			setStyle(this.sliderContainer, {
				outline: '2px solid #1991fa',
				outlineOffset: '2px',
			})
		}
	}

	/**
	 * Blur handler
	 */
	private onBlur = (): void => {
		if (this.sliderContainer) {
			setStyle(this.sliderContainer, { outline: 'none' })
		}
	}

	/**
	 * Drag start handler
	 */
	private onDragStart = (e: Event): void => {
		e.preventDefault()
		this.isDragging = true
		this._verified = false
		this.tracks = []
		this.dragStartTime = Date.now()
		this.startX = getEventPosition(e as MouseEvent | TouchEvent, this.container!).x

		// Hide hint text
		if (this.hintText) {
			setStyle(this.hintText, { opacity: '0' })
		}

		// Hide status overlay
		if (this.statusOverlay) {
			setStyle(this.statusOverlay, { display: 'none' })
		}

		if (this.sliderBtn) {
			addClass(this.sliderBtn, 'dragging')
			setStyle(this.sliderBtn, {
				background: '#1991fa',
				borderColor: '#1991fa',
			})
			this.sliderBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M8 5v14l11-7z"/></svg>'
		}
	}

	/**
	 * Drag move handler
	 */
	private onDragMove = (e: Event): void => {
		if (!this.isDragging) return
		e.preventDefault()

		const currentPos = getEventPosition(e as MouseEvent | TouchEvent, this.container!)
		const moveX = currentPos.x - this.startX
		const maxX = this.options.width! - this.options.sliderWidth!

		this.currentX = Math.max(0, Math.min(moveX, maxX))

		// Record track
		this.tracks.push({
			x: this.currentX,
			y: currentPos.y,
			timestamp: Date.now(),
		})

		// Update slider position
		if (this.sliderCanvas) {
			setStyle(this.sliderCanvas, { left: `${this.currentX}px` })
		}
		if (this.sliderBtn) {
			setStyle(this.sliderBtn, { left: `${this.currentX + 2}px` })
		}
		// Update progress width (includes slider button, slider width 36px + right margin 2px)
		if (this.sliderProgress) {
			const progressWidth = Math.max(40, this.currentX + 40)
			setStyle(this.sliderProgress, {
				width: `${progressWidth}px`,
				border: '1px solid #1991fa',
				background: 'rgba(25, 145, 250, 0.08)',
			})
		}
	}

	/**
	 * Drag end handler
	 */
	private onDragEnd = (): void => {
		if (!this.isDragging) return
		this.isDragging = false

		if (this.sliderBtn) {
			removeClass(this.sliderBtn, 'dragging')
		}

		// Verify position
		this.verifyPosition()
	}

	/**
	 * Verify slider position
	 */
	private async verifyPosition(): Promise<void> {
		const verifyTime = Date.now() - this.dragStartTime
		this.statistics.totalAttempts++
		this.statistics.totalVerifyTime += verifyTime
		this.statistics.totalDragDistance += this.currentX
		this.statistics.totalDragTime += verifyTime

		if (this.options.verifyMode === 'backend') {
			await this.verifyWithBackend()
		} else {
			this.verifyFrontend()
		}
	}

	/**
	 * Verify with frontend logic
	 */
	private verifyFrontend(): void {
		const diff = Math.abs(this.currentX - this.targetX)

		if (diff <= this.options.precision!) {
			this._verified = true
			this.statistics.successCount++
			this.showSuccessStatus()
			this.options.onSuccess?.()
		} else {
			this.statistics.failCount++
			this.showFailStatus()
			this.options.onFail?.()
		}
	}

	/**
	 * Show success status
	 */
	private showSuccessStatus(): void {
		if (this.sliderBtn) {
			setStyle(this.sliderBtn, {
				background: '#52c41a',
				borderColor: '#52c41a',
			})
			this.sliderBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>'
		}
		if (this.sliderProgress) {
			const progressWidth = Math.max(40, this.currentX + 40)
			setStyle(this.sliderProgress, {
				width: `${progressWidth}px`,
				border: '1px solid #52c41a',
				background: 'rgba(82, 196, 26, 0.08)',
			})
		}
		if (this.statusOverlay) {
			this.statusOverlay.innerHTML = `
				<svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
				<span style="color: #fff;">验证成功</span>
			`
			this.statusOverlay.style.background = 'rgba(82, 196, 26, 0.9)'
			setStyle(this.statusOverlay, { display: 'flex' })
		}
	}

	/**
	 * Show fail status
	 */
	private showFailStatus(): void {
		if (this.sliderBtn) {
			setStyle(this.sliderBtn, {
				background: '#f5222d',
				borderColor: '#f5222d',
			})
			this.sliderBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>'
		}
		if (this.sliderProgress) {
			const progressWidth = Math.max(40, this.currentX + 40)
			setStyle(this.sliderProgress, {
				width: `${progressWidth}px`,
				border: '1px solid #f5222d',
				background: 'rgba(245, 34, 45, 0.08)',
			})
		}
		if (this.statusOverlay) {
			this.statusOverlay.innerHTML = `
				<svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
				<span style="color: #fff;">验证失败</span>
			`
			this.statusOverlay.style.background = 'rgba(245, 34, 45, 0.9)'
			setStyle(this.statusOverlay, { display: 'flex' })
		}
		// Shake animation and auto refresh
		this.shakeAndRefresh()
	}

	/**
	 * Shake animation and auto refresh
	 */
	private shakeAndRefresh(): void {
		if (!this.container) return

		// Inject shake animation CSS
		injectShakeAnimation()

		// Add shake animation
		addClass(this.container, 'captcha-shake')
		setStyle(this.container, {
			animation: 'captchaShake 0.5s ease-in-out',
		})

		// Remove animation class and refresh after animation ends
		setTimeout(() => {
			removeClass(this.container!, 'captcha-shake')
			setStyle(this.container!, { animation: '' })
			this.refresh()
		}, 500)
	}

	/**
	 * Verify with backend
	 */
	private async verifyWithBackend(): Promise<void> {
		const { backendVerify } = this.options
		if (!backendVerify?.verify) {
			this.verifyFrontend()
			return
		}

		try {
			const data = await this.getSignedData()
			let response: BackendVerifyResponse

			if (typeof backendVerify.verify === 'function') {
				response = await backendVerify.verify(data)
			} else {
				response = await request<BackendVerifyResponse>(backendVerify.verify, {
					method: 'POST',
					headers: backendVerify.headers,
					body: data,
					timeout: backendVerify.timeout,
				})
			}

			if (response.success) {
				this._verified = true
				this.statistics.successCount++
				this.options.onSuccess?.()
			} else {
				this.statistics.failCount++
				this.options.onFail?.()
				setTimeout(() => {
					this.reset()
				}, 500)
			}
		} catch (error) {
			console.error('Backend verification failed', error)
			this.statistics.failCount++
			this.options.onFail?.()
		}
	}

	/**
	 * Verify captcha
	 */
	verify(data: number[] | { x: number; y: number }[]): boolean {
		if (!Array.isArray(data) || data.length === 0) return false
		const firstItem = data[0]
		const x = typeof firstItem === 'number' ? firstItem : firstItem.x
		const diff = Math.abs(x - this.targetX)
		return diff <= this.options.precision!
	}

	/**
	 * Reset captcha
	 */
	reset(): void {
		this.currentX = 0
		this._verified = false
		this.tracks = []

		// Reset ARIA value
		this.updateAriaValue()

		if (this.sliderCanvas) {
			setStyle(this.sliderCanvas, { left: '2px' })
		}
		if (this.sliderBtn) {
			setStyle(this.sliderBtn, {
				left: '2px',
				background: '#fff',
				borderColor: '#e1e4e8',
			})
			this.sliderBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#1991fa" d="M8 5v14l11-7z"/></svg>'
		}
		if (this.sliderProgress) {
			setStyle(this.sliderProgress, {
				width: '40px',
				border: '1px solid #f7f9fa',
				background: '#f7f9fa',
			})
		}
		if (this.hintText) {
			setStyle(this.hintText, { opacity: '1' })
		}
		if (this.statusOverlay) {
			setStyle(this.statusOverlay, { display: 'none' })
		}
	}

	/**
	 * Destroy captcha
	 */
	destroy(): void {
		if (this.sliderBtn) {
			off(this.sliderBtn, 'mousedown', this.onDragStart)
			off(this.sliderBtn, 'touchstart', this.onDragStart)
		}
		off(document, 'mousemove', this.onDragMove)
		off(document, 'touchmove', this.onDragMove)
		off(document, 'mouseup', this.onDragEnd)
		off(document, 'touchend', this.onDragEnd)

		// Remove keyboard event listeners
		if (this.sliderContainer) {
			off(this.sliderContainer, 'keydown', this.onKeyDown)
			off(this.sliderContainer, 'focus', this.onFocus)
			off(this.sliderContainer, 'blur', this.onBlur)
		}

		if (this.container) {
			this.container.innerHTML = ''
		}

		this.container = null
		this.bgCanvas = null
		this.sliderCanvas = null
		this.sliderBtn = null
		this.sliderProgress = null
		this.statusOverlay = null
		this.hintText = null
		this.sliderContainer = null
	}

	/**
	 * Refresh captcha
	 */
	async refresh(): Promise<void> {
		this.reset()
		if (this.options.verifyMode === 'backend' && this.options.backendVerify?.getCaptcha) {
			await this.fetchBackendCaptcha()
		} else if (this.options.bgImage) {
			this.loadImages()
		} else {
			this.generateCaptcha()
		}
	}

	/**
	 * Get captcha data (synchronous, without signature)
	 * Returns target position for verification
	 */
	getData(): CaptchaData {
		const timestamp = Date.now()
		const nonce = generateNonce()

		return {
			type: 'slider',
			captchaId: this.captchaId,
			bgImage: this.options.bgImage,
			sliderImage: this.options.sliderImage,
			target: [this.targetX],
			timestamp,
			nonce,
		}
	}

	/**
	 * Get signed captcha data (asynchronous, with signature)
	 * Returns user's slider position for backend verification
	 */
	async getSignedData(): Promise<CaptchaData> {
		const timestamp = Date.now()
		const nonce = generateNonce()

		const data: CaptchaData = {
			type: 'slider',
			captchaId: this.captchaId,
			bgImage: this.options.bgImage,
			sliderImage: this.options.sliderImage,
			target: [this.currentX],
			timestamp,
			nonce,
		}

		// Add signature if security is enabled
		if (this.options.security?.enableSign && this.options.security.secretKey) {
			data.signature = await generateSignature(
				'slider',
				data.target,
				timestamp,
				nonce,
				this.options.security.secretKey
			)
		}

		return data
	}

	/**
	 * Get slider position
	 */
	getSliderPosition(): number {
		return this.currentX
	}

	/**
	 * Get statistics
	 */
	getStatistics(): CaptchaStatistics {
		const stats = this.statistics
		const successRate = stats.totalAttempts > 0
			? Math.round((stats.successCount / stats.totalAttempts) * 100)
			: 0

		return {
			totalAttempts: stats.totalAttempts,
			successCount: stats.successCount,
			failCount: stats.failCount,
			successRate,
			avgVerifyTime: stats.totalAttempts > 0
				? Math.round(stats.totalVerifyTime / stats.totalAttempts)
				: 0,
			avgDragDistance: stats.totalAttempts > 0
				? Math.round(stats.totalDragDistance / stats.totalAttempts)
				: 0,
			avgDragTime: stats.totalAttempts > 0
				? Math.round(stats.totalDragTime / stats.totalAttempts)
				: 0,
			avgClickCount: 0,
		}
	}

	/**
	 * Reset statistics
	 */
	resetStatistics(): void {
		this.statistics = {
			totalAttempts: 0,
			successCount: 0,
			failCount: 0,
			totalVerifyTime: 0,
			totalDragDistance: 0,
			totalDragTime: 0,
			totalClickCount: 0,
		}
	}
}

export default SliderCaptcha
