import type {
	BackendCaptchaResponse,
	BackendVerifyResponse,
	CaptchaData,
	CaptchaStatistics,
	ClickCaptchaInstance,
	ClickCaptchaOptions,
	Point,
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

// Chinese vocabulary library (common idioms and words) - no duplicate characters in each word
const CHINESE_WORDS = [
	// Common idioms - Blessings and good fortune
	'一帆风顺', '二龙腾飞', '三阳开泰', '四季平安', '五福临门',
	'七星高照', '八方来财', '万事如意', '心想事成', '步步高升',
	'财源广进', '恭喜发财', '龙马精神', '马到成功', '金玉满堂',
	'花开富贵', '锦绣前程', '吉祥如意', '瑞气盈门', '紫气东来',
	// Common idioms - Prosperity
	'风调雨顺', '国泰民安', '繁荣昌盛', '万象更新', '春回大地',
	'阳光明媚', '奋发图强', '自强不息', '勇往直前', '坚持不懈',
	'厚德载物', '海纳百川', '宁静致远', '淡泊明志', '天道酬勤',
	// Common idioms - Virtue and character
	'实事求是', '与时俱进', '开拓创新', '继往开来', '励精图治',
	'安居乐业', '幸福美满', '和谐共处', '德才兼备', '品学兼优',
	'诚实守信', '勤劳致富', '艰苦奋斗', '团结友爱', '尊老爱幼',
	// Common idioms - Learning and progress
	'学无止境', '勤奋好学', '刻苦钻研', '博览群书', '学以致用',
	'融会贯通', '举一反三', '触类旁通', '温故知新', '循序渐进',
	'厚积薄发', '持之以恒', '孜孜不倦', '废寝忘食', '夜以继日',
	// Common idioms - Nature and scenery
	'春暖花开', '秋高气爽', '山清水秀', '鸟语花香', '绿树成荫',
	'风和日丽', '云淡风轻', '晴空万里', '皓月当空', '繁星闪烁',
	'波光粼粼', '层峦叠嶂', '悬崖峭壁', '山高水长', '水天一色',
	// Technology and innovation vocabulary
	'科技创新', '人工智能', '云计算', '大数据', '物联网',
	'智慧城市', '数字经济', '智能制造', '绿色发展', '生态环保',
	'区块链', '元宇宙', '量子计算', '机器学习', '深度学习',
	'自动驾驶', '智能家居', '工业互联', '数字孪生', '虚拟现实',
	// Life and emotion vocabulary
	'健康生活', '快乐工作', '简单实用', '美好时光', '精彩无限',
	'梦想成真', '未来可期', '热爱生活', '积极向上', '诚信为本',
	'品质至上', '服务周到', '客户满意', '合作共赢', '互利共赢',
	// Business and economy vocabulary
	'商业模式', '品牌价值', '核心竞争', '市场份额', '战略规划',
	'创新驱动', '转型升级', '经济效益', '企业文化', '团队协作',
	'人才培养', '绩效管理', '流程优化', '降本增效', '稳健经营',
	// Culture and education vocabulary
	'文化传承', '教育创新', '素质教育', '终身学习', '知识更新',
	'思维创新', '能力提升', '全面发展', '特色教育', '因材施教',
	'传统文化', '现代文明', '文化自信', '文化繁荣', '精神文明',
	// Health and wellness vocabulary
	'养生之道', '健康饮食', '适量运动', '心理平衡', '作息规律',
	'预防为主', '身心和谐', '养生保健', '延年益寿', '中医养生',
	'食疗药膳', '运动健身', '心理健康', '睡眠充足', '早睡早起',
	// Era development vocabulary
	'改革开放', '创新发展', '协调发展', '绿色发展', '共享发展',
	'乡村振兴', '城乡融合', '区域协调', '生态文明', '美丽中国',
	'数字中国', '网络强国', '科技强国', '人才强国', '文化强国',
	// Four-character auspicious words
	'福星高照', '鸿运当头', '前途光明', '事业有成', '功成名就',
	'名利双收', '前程似锦', '大展宏图', '鹏程万里', '旗开得胜',
	'马到功成', '飞黄腾达', '平步青云', '扶摇直上',
]

const defaultOptions: Partial<ClickCaptchaOptions> = {
	width: 300,
	height: 170,
	showRefresh: true,
	className: 'captcha-click',
	verifyMode: 'frontend',
}

/**
 * Click Captcha (Text Click Captcha)
 */
export class ClickCaptcha implements ClickCaptchaInstance {
	private options: ClickCaptchaOptions
	private container: HTMLElement | null = null
	private bgCanvas: HTMLCanvasElement | null = null
	private textCanvas: HTMLCanvasElement | null = null
	private statusOverlay: HTMLElement | null = null
	private promptContainer: HTMLElement | null = null
	private targetPoints: Point[] = []
	private clickPoints: Point[] = []
	private clickTexts: string[] = []
	private clickCharImages: string[] = [] // Base64 images for prompt display (from backend or generated)
	private decoyTexts: string[] = [] // Decoy characters to confuse bots
	private decoyPoints: Point[] = [] // Decoy character positions
	private _verified: boolean = false
	private captchaId: string = ''
	// @ts-expect-error - stored for potential future use
	private _backendData: BackendCaptchaResponse | null = null
	private clickStartTime: number = 0
	private _text?: string
	private statistics: StatisticsData = {
		totalAttempts: 0,
		successCount: 0,
		failCount: 0,
		totalVerifyTime: 0,
		totalDragDistance: 0,
		totalDragTime: 0,
		totalClickCount: 0,
	}

	constructor(options: ClickCaptchaOptions) {
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
			this.loadBackgroundImage()
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
			if (response.data.clickTexts) {
				this._text = response.data.clickTexts.join('')
				this.clickTexts = response.data.clickTexts
				this.options.count = response.data.clickTexts.length
			}
			if (response.data.clickCharImages) {
				this.clickCharImages = response.data.clickCharImages
			}
			await this.loadBackgroundImage()
		} catch (error) {
			console.error('Failed to fetch captcha from backend', error)
			const errorMessage = error instanceof Error ? error.message : '获取验证码失败'
			this.showErrorStatus(errorMessage)
			throw error
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
		this.container.setAttribute('aria-label', 'Click Captcha Verification')

		// Screen reader instructions (visually hidden)
		const instructions = createElement('div', {
			id: 'captcha-click-instructions',
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
		instructions.textContent = 'Click on the characters in the order shown below. Use mouse or tap to select.'
		this.container.appendChild(instructions)

		// Image container
		const imageContainer = createElement('div', {
			class: 'captcha-image-container',
			role: 'img',
			'aria-label': 'Captcha image with characters',
		}, {
			position: 'relative',
			width: '100%',
			height: `${this.options.height!  }px`,
			overflow: 'hidden',
			borderRadius: '4px',
		})
		this.container.appendChild(imageContainer)

		// Background canvas
		this.bgCanvas = createElement('canvas', {
			'aria-hidden': 'true',
		}, { width: this.options.width!, height: this.options.height! }) as HTMLCanvasElement
		this.bgCanvas.width = this.options.width!
		this.bgCanvas.height = this.options.height!
		imageContainer.appendChild(this.bgCanvas)

		// Text canvas (overlay for click points)
		this.textCanvas = createElement('canvas', {
			role: 'button',
			'aria-label': 'Click area - click on the characters in order',
			tabindex: '0',
		}, {
			position: 'absolute',
			top: 0,
			left: 0,
			cursor: 'pointer',
		}) as HTMLCanvasElement
		this.textCanvas.width = this.options.width!
		this.textCanvas.height = this.options.height!
		imageContainer.appendChild(this.textCanvas)

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

		// Status overlay (slide up from bottom) - for screen reader announcements
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

		// Text prompt bar
		const promptContainer = createElement('div', {
			class: 'captcha-prompt',
			role: 'status',
			'aria-live': 'polite',
		}, {
			width: '100%',
			height: '40px',
			background: '#f7f9fa',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: '14px',
			color: '#333',
			marginTop: '5px',
			borderRadius: '4px',
		})
		this.container.appendChild(promptContainer)
		this.promptContainer = promptContainer
	}

	/**
	 * Load background image
	 */
	private async loadBackgroundImage(): Promise<void> {
		if (!this.options.bgImage || !this.bgCanvas) return

		try {
			const img = await loadImage(this.options.bgImage)
			const ctx = this.bgCanvas.getContext('2d')!
			const { width, height } = this.options

			// Clear previous content before drawing new image
			ctx.clearRect(0, 0, width!, height!)

			// Draw image scaled to fit
			const scale = Math.max(width! / img.width, height! / img.height)
			const sw = width! / scale
			const sh = height! / scale
			const sx = (img.width - sw) / 2
			const sy = (img.height - sh) / 2

			ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width!, height!)

			// Only generate click points in frontend mode
			// In backend mode, images and texts are already generated by server
			if (this.options.verifyMode !== 'backend') {
				this.generateClickPoints()
			} else {
				// In backend mode, just update the prompt with clickTexts from server
				this.updatePrompt()
			}
		} catch (error) {
			console.error('Failed to load captcha background image', error)
		}
	}

	/**
	 * Generate captcha automatically
	 */
	private generateCaptcha(): void {
		if (!this.bgCanvas) return

		const ctx = this.bgCanvas.getContext('2d')!
		const { width, height } = this.options

		// Generate gradient background (same as slider)
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
				// Rectangle
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

		this.generateClickPoints()
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
	 * Generate click points with text
	 */
	private generateClickPoints(): void {
		if (!this.bgCanvas) return

		const { width, height } = this.options
		// Auto-generate random count (3-4) if not specified
		const count = this.options.count || random(3, 4)
		this.options.count = count
		const ctx = this.bgCanvas.getContext('2d')!

		// Generate or use provided text (from backend)
		let chars: string
		if (this._text) {
			chars = this._text
		} else {
			// Randomly select a word from Chinese vocabulary
			const randomWord = CHINESE_WORDS[random(0, CHINESE_WORDS.length - 1)]
			// If word length is insufficient, select other words or supplement
			if (randomWord.length >= count!) {
				chars = randomWord.slice(0, count)
			} else {
				// When word length is insufficient, combine from multiple words
				chars = randomWord
				while (chars.length < count!) {
					const extraWord = CHINESE_WORDS[random(0, CHINESE_WORDS.length - 1)]
					chars += extraWord.slice(0, count! - chars.length)
				}
			}
		}

		this.clickTexts = chars.split('').slice(0, count!)
		this.targetPoints = []
		this.clickPoints = []
		this.decoyTexts = []
		this.decoyPoints = []

		// Generate 1-2 decoy characters to confuse bots
		const decoyCount = random(1, 2)
		const usedChars = new Set(this.clickTexts)

		for (let i = 0; i < decoyCount; i++) {
			// Pick random characters from vocabulary that are not in clickTexts
			let decoyChar = '',
			 attempts = 0
			const maxAttempts = 50

			while (!decoyChar && attempts < maxAttempts) {
				const randomWord = CHINESE_WORDS[random(0, CHINESE_WORDS.length - 1)]
				for (const char of randomWord) {
					if (!usedChars.has(char)) {
						decoyChar = char
						usedChars.add(char)
						break
					}
				}
				attempts++
			}

			if (decoyChar) {
				this.decoyTexts.push(decoyChar)
			}
		}

		// Generate random positions for each character
		const fontSize = 20
		const padding = fontSize + 10

		// Draw click target characters
		for (let i = 0; i < this.clickTexts.length; i++) {
			let x: number,
				y: number,
				attempts = 0
			const maxAttempts = 100

			// Find non-overlapping position
			do {
				x = random(padding, width! - padding)
				y = random(padding, height! - padding)
				attempts++
			} while (this.isOverlapping(x, y, fontSize) && attempts < maxAttempts)

			this.targetPoints.push({ x, y })

			// Draw character
			ctx.save()
			ctx.font = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif`
			ctx.fillStyle = '#333'
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'

			// Random rotation (Chinese characters rotate slightly less)
			const rotation = (random(-20, 20) * Math.PI) / 180
			ctx.translate(x, y)
			ctx.rotate(rotation)
			ctx.fillText(this.clickTexts[i], 0, 0)
			ctx.restore()
		}

		// Draw decoy characters (lighter color to make them slightly different)
		for (let i = 0; i < this.decoyTexts.length; i++) {
			let x: number,
				y: number,
				attempts = 0
			const maxAttempts = 100

			// Find non-overlapping position
			do {
				x = random(padding, width! - padding)
				y = random(padding, height! - padding)
				attempts++
			} while (this.isOverlapping(x, y, fontSize, true) && attempts < maxAttempts)

			// Store decoy position for overlap checking
			this.decoyPoints.push({ x, y })

			// Draw decoy character with slightly lighter color
			ctx.save()
			ctx.font = `${fontSize}px "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif`
			ctx.fillStyle = '#555' // Slightly lighter than target chars
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'

			// Random rotation
			const rotation = (random(-25, 25) * Math.PI) / 180
			ctx.translate(x, y)
			ctx.rotate(rotation)
			ctx.fillText(this.decoyTexts[i], 0, 0)
			ctx.restore()
		}

		// Update prompt text
		this.updatePrompt()
	}

	/**
	 * Check if position overlaps with existing points
	 */
	private isOverlapping(x: number, y: number, size: number, checkDecoys: boolean = false): boolean {
		// Check against target points
		for (const point of this.targetPoints) {
			const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)
			if (distance < size * 1.5) {
				return true
			}
		}
		// Check against decoy points if needed
		if (checkDecoys) {
			for (const point of this.decoyPoints) {
				const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)
				if (distance < size * 1.5) {
					return true
				}
			}
		}
		return false
	}

	/**
	 * Generate base64 image for a character
	 */
	private generateCharImage(char: string): string {
		const canvas = document.createElement('canvas')
		const fontSize = 16
		const padding = 4
		canvas.width = fontSize + padding * 2
		canvas.height = fontSize + padding * 2

		const ctx = canvas.getContext('2d')!
		ctx.font = `bold ${fontSize}px "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif`
		ctx.fillStyle = '#1991fa'
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'

		// Random slight rotation for anti-bot
		const rotation = (random(-10, 10) * Math.PI) / 180
		ctx.translate(canvas.width / 2, canvas.height / 2)
		ctx.rotate(rotation)
		ctx.fillText(char, 0, 0)

		return canvas.toDataURL('image/png')
	}

	/**
	 * Update prompt text
	 */
	private updatePrompt(): void {
		if (this.promptContainer) {
			// Use backend images if available, otherwise generate base64 images for each character
			let charImages: string

			if (this.clickCharImages.length > 0) {
				// Use images from backend
				charImages = this.clickCharImages
					.map(imgSrc => `<img src="${imgSrc}" alt="" style="vertical-align: middle; margin: 0 2px;" width="24" height="24" aria-hidden="true">`)
					.join('')
			} else {
				// Generate base64 images for each character to prevent bot recognition (frontend mode)
				charImages = this.clickTexts
					.map(char => {
						const imgSrc = this.generateCharImage(char)
						return `<img src="${imgSrc}" alt="" style="vertical-align: middle; margin: 0 2px;" width="24" height="24" aria-hidden="true">`
					})
					.join('')
			}

			this.promptContainer.innerHTML = `请依次点击: <span style="display: inline-block; margin-left: 4px; vertical-align: middle;">${charImages}</span>`
		}
	}

	/**
	 * Show success status
	 */
	private showSuccessStatus(): void {
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
	 * Show error status (for API errors, without auto refresh)
	 */
	private showErrorStatus(message: string): void {
		if (this.statusOverlay) {
			this.statusOverlay.innerHTML = `
				<svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
				<span style="color: #fff;">${message}</span>
			`
			this.statusOverlay.style.background = 'rgba(250, 173, 20, 0.9)'
			setStyle(this.statusOverlay, { display: 'flex' })
		}
	}

	/**
	 * Show fail status
	 */
	private showFailStatus(message?: string): void {
		if (this.statusOverlay) {
			this.statusOverlay.innerHTML = `
				<svg viewBox="0 0 24 24" width="14" height="14"><path fill="#fff" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
				<span style="color: #fff;">${message || '验证失败'}</span>
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
	 * Bind events
	 */
	private bindEvents(): void {
		if (!this.textCanvas) return

		on(this.textCanvas, 'click', this.onClick)
	}

	/**
	 * Click handler
	 */
	private onClick = (e: Event): void => {
		if (this._verified) return

		// Don't process clicks if clickTexts is not ready (e.g., waiting for backend)
		if (this.clickTexts.length === 0) return

		// Don't allow more clicks than required
		if (this.clickPoints.length >= this.clickTexts.length) return

		if (this.clickPoints.length === 0) {
			this.clickStartTime = Date.now()
		}

		const pos = getEventPosition(e as MouseEvent, this.textCanvas!)
		this.clickPoints.push(pos)

		// Draw click marker
		this.drawClickMarker(pos.x, pos.y, this.clickPoints.length)

		// Check if all points clicked
		if (this.clickPoints.length >= this.clickTexts.length) {
			this.verifyPoints()
		}
	}

	/**
	 * Draw click marker
	 */
	private drawClickMarker(x: number, y: number, index: number): void {
		if (!this.textCanvas) return

		const ctx = this.textCanvas.getContext('2d')!

		// Draw circle with indicator style
		ctx.beginPath()
		ctx.arc(x, y, 14, 0, Math.PI * 2)
		ctx.fillStyle = '#1991fa'
		ctx.fill()

		// Draw border
		ctx.strokeStyle = '#fff'
		ctx.lineWidth = 2
		ctx.stroke()

		// Draw number
		ctx.font = 'bold 12px Arial'
		ctx.fillStyle = '#fff'
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.fillText(String(index), x, y)
	}

	/**
	 * Verify click points
	 */
	private async verifyPoints(): Promise<void> {
		const verifyTime = Date.now() - this.clickStartTime
		this.statistics.totalAttempts++
		this.statistics.totalVerifyTime += verifyTime
		this.statistics.totalClickCount += this.clickPoints.length

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
		const precision = 25 // Click precision in pixels

		if (this.clickPoints.length !== this.targetPoints.length) {
			this.statistics.failCount++
			this.showFailStatus()
			this.options.onFail?.()
			return
		}

		// Check each click point against target (in order)
		for (let i = 0; i < this.targetPoints.length; i++) {
			const target = this.targetPoints[i]
			const clicked = this.clickPoints[i]
			const distance = Math.sqrt((clicked.x - target.x) ** 2 + (clicked.y - target.y) ** 2)

			if (distance > precision) {
				this.statistics.failCount++
				this.showFailStatus()
				this.options.onFail?.()
				return
			}
		}

		this._verified = true
		this.statistics.successCount++
		this.showSuccessStatus()
		this.options.onSuccess?.()
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
				this.showSuccessStatus()
				this.options.onSuccess?.()
			} else {
				this.statistics.failCount++
				this.showFailStatus(response.message)
				this.options.onFail?.()
			}
		} catch (error) {
			console.error('Backend verification failed', error)
			this.statistics.failCount++
			const errorMessage = error instanceof Error ? error.message : '验证失败'
			this.showFailStatus(errorMessage)
			this.options.onFail?.()
		}
	}

	/**
	 * Verify captcha
	 */
	verify(data: number[] | Point[]): boolean {
		if (!Array.isArray(data) || data.length !== this.targetPoints.length) return false

		const precision = 25

		for (let i = 0; i < this.targetPoints.length; i++) {
			const target = this.targetPoints[i]
			const clicked = data[i]
			const clickPoint = typeof clicked === 'number' ? { x: clicked, y: 0 } : clicked
			const distance = Math.sqrt((clickPoint.x - target.x) ** 2 + (clickPoint.y - target.y) ** 2)

			if (distance > precision) return false
		}

		return true
	}

	/**
	 * Reset captcha
	 */
	reset(): void {
		this.clickPoints = []
		this._verified = false

		// Clear click markers
		if (this.textCanvas) {
			const ctx = this.textCanvas.getContext('2d')!
			ctx.clearRect(0, 0, this.options.width!, this.options.height!)
		}

		// Hide status overlay
		if (this.statusOverlay) {
			setStyle(this.statusOverlay, { display: 'none' })
		}
	}

	/**
	 * Destroy captcha
	 */
	destroy(): void {
		if (this.textCanvas) {
			off(this.textCanvas, 'click', this.onClick)
		}

		if (this.container) {
			this.container.innerHTML = ''
		}

		this.container = null
		this.bgCanvas = null
		this.textCanvas = null
		this.statusOverlay = null
		this.promptContainer = null
	}

	/**
	 * Refresh captcha
	 */
	async refresh(): Promise<void> {
		this.reset()
		// Reset count to allow random generation on next refresh
		this.options.count = undefined as unknown as number

		if (this.options.verifyMode === 'backend' && this.options.backendVerify?.getCaptcha) {
			// Save old data in case fetch fails
			const oldClickTexts = [...this.clickTexts]
			const oldClickCharImages = [...this.clickCharImages]
			this.clickTexts = []
			this.clickCharImages = []

			try {
				await this.fetchBackendCaptcha()
			} catch (error) {
				// Restore old data if fetch failed
				this.clickTexts = oldClickTexts
				this.clickCharImages = oldClickCharImages
				console.error('Failed to refresh captcha from backend', error)
			}
		} else {
			this.clickTexts = []
			this.clickCharImages = []
			if (this.options.bgImage) {
				this.loadBackgroundImage()
			} else {
				this.generateCaptcha()
			}
		}
	}

	/**
	 * Get captcha data (synchronous, without signature)
	 * Returns target points that user needs to click
	 */
	getData(): CaptchaData {
		const timestamp = Date.now()
		const nonce = generateNonce()

		return {
			type: 'click',
			captchaId: this.captchaId,
			bgImage: this.options.bgImage,
			target: this.targetPoints,
			timestamp,
			nonce,
		}
	}

	/**
	 * Get signed captcha data (asynchronous, with signature)
	 * Returns user's clicked points for verification
	 */
	async getSignedData(): Promise<CaptchaData> {
		const timestamp = Date.now()
		const nonce = generateNonce()

		const data: CaptchaData = {
			type: 'click',
			captchaId: this.captchaId,
			bgImage: this.options.bgImage,
			target: this.clickPoints,
			timestamp,
			nonce,
		}

		// Add signature if security is enabled
		if (this.options.security?.enableSign && this.options.security.secretKey) {
			data.signature = await generateSignature(
				'click',
				data.target,
				timestamp,
				nonce,
				this.options.security.secretKey
			)
		}

		return data
	}

	/**
	 * Get click points
	 */
	getClickPoints(): Point[] {
		return [...this.clickPoints]
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
			avgDragDistance: 0,
			avgDragTime: 0,
			avgClickCount: stats.totalAttempts > 0
				? Math.round(stats.totalClickCount / stats.totalAttempts)
				: 0,
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

export default ClickCaptcha
