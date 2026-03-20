import type { CaptchaCache, CaptchaGenerateOptions, CaptchaResponse, Point } from './types'
import { type CanvasRenderingContext2D, createCanvas } from 'canvas'
import { v4 as uuidv4 } from 'uuid'

/**
 * Random number in range
 */
function random(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Chinese vocabulary library (common idioms and words) - no duplicate characters in each word
 */
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

/**
 * Shape types for puzzle
 */
type ShapeType = 'square' | 'triangle' | 'trapezoid' | 'pentagon'

/**
 * Draw rounded rectangle
 */
function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
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
 * Draw triangle
 */
function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
	ctx.beginPath()
	ctx.moveTo(x + w / 2, y)
	ctx.lineTo(x + w, y + h)
	ctx.lineTo(x, y + h)
	ctx.closePath()
}

/**
 * Draw trapezoid
 */
function drawTrapezoid(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
	const topInset = w * 0.15
	ctx.beginPath()
	ctx.moveTo(x + topInset, y)
	ctx.lineTo(x + w - topInset, y)
	ctx.lineTo(x + w, y + h)
	ctx.lineTo(x, y + h)
	ctx.closePath()
}

/**
 * Draw pentagon
 */
function drawPentagon(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
	const centerX = x + w / 2
	const centerY = y + h / 2
	const radius = Math.min(w, h) / 2

	ctx.beginPath()
	for (let i = 0; i < 5; i++) {
		const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
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
 * Draw shape based on type
 */
function drawShape(ctx: CanvasRenderingContext2D, shape: ShapeType, x: number, y: number, w: number, h: number, r: number): void {
	switch (shape) {
		case 'square':
			drawRoundedRect(ctx, x, y, w, h, r)
			break
		case 'triangle':
			drawTriangle(ctx, x, y, w, h)
			break
		case 'trapezoid':
			drawTrapezoid(ctx, x, y, w, h)
			break
		case 'pentagon':
			drawPentagon(ctx, x, y, w, h)
			break
	}
}

/**
 * Add noise texture to canvas
 */
function addNoiseTexture(ctx: CanvasRenderingContext2D, width: number, height: number, opacity: number): void {
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
 * Generate background with gradient and decorations
 */
function generateBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
	// Generate gradient background
	const bgGradient = ctx.createLinearGradient(0, 0, width, height)
	const hue1 = random(0, 360)
	const hue2 = (hue1 + random(30, 60)) % 360
	bgGradient.addColorStop(0, `hsl(${hue1}, 70%, 85%)`)
	bgGradient.addColorStop(1, `hsl(${hue2}, 70%, 75%)`)
	ctx.fillStyle = bgGradient
	ctx.fillRect(0, 0, width, height)

	// Add decorative background shapes
	for (let i = 0; i < 8; i++) {
		const shapeHue = (hue1 + random(0, 120)) % 360
		ctx.fillStyle = `hsla(${shapeHue}, 60%, 60%, 0.15)`
		ctx.beginPath()
		const shapeType = random(0, 2)
		const x = random(-20, width - 20)
		const y = random(-20, height - 20)
		const size = random(40, 80)
		if (shapeType === 0) {
			ctx.arc(x, y, size, 0, Math.PI * 2)
		} else if (shapeType === 1) {
			ctx.moveTo(x, y)
			ctx.lineTo(x + size * 1.5, y)
			ctx.lineTo(x + size * 1.5, y + size)
			ctx.lineTo(x, y + size)
			ctx.closePath()
		} else {
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
		ctx.arc(random(0, width), random(0, height), random(2, 8), 0, Math.PI * 2)
		ctx.fill()
	}

	// Add some lines
	for (let i = 0; i < 5; i++) {
		const lineHue = (hue1 + random(0, 180)) % 360
		ctx.strokeStyle = `hsla(${lineHue}, 40%, 50%, 0.2)`
		ctx.lineWidth = random(1, 3)
		ctx.beginPath()
		ctx.moveTo(random(0, width), random(0, height))
		ctx.lineTo(random(0, width), random(0, height))
		ctx.stroke()
	}

	// Add subtle noise texture overlay
	addNoiseTexture(ctx, width, height, 0.02)
}

/**
 * Captcha Generator class
 */
export class CaptchaGenerator {
	private defaultOptions: Required<CaptchaGenerateOptions> = {
		type: 'slider',
		width: 300,
		height: 170,
		sliderWidth: 42,
		sliderHeight: 42,
		precision: 5,
		clickText: '',
	}

	/**
	 * Generate slider captcha
	 */
	generateSlider(options: CaptchaGenerateOptions = {}): { cache: CaptchaCache; response: CaptchaResponse } {
		const opts = { ...this.defaultOptions, ...options }
		const { width, height, sliderWidth, sliderHeight } = opts
		const borderRadius = 8

		// Create background canvas
		const bgCanvas = createCanvas(width, height)
		const bgCtx = bgCanvas.getContext('2d')

		// Generate background
		generateBackground(bgCtx, width, height)

		// Random shape type
		const shapes: ShapeType[] = ['square', 'triangle', 'trapezoid', 'pentagon']
		const currentShape = shapes[random(0, 3)]

		// Random target position (avoid edges)
		const targetX = random(sliderWidth + 20, width - sliderWidth - 20)
		const targetY = random(10, height - sliderHeight - 10)

		// Create slider canvas
		const sliderCanvas = createCanvas(sliderWidth, sliderHeight)
		const sliderCtx = sliderCanvas.getContext('2d')

		// Create temporary canvas to save image data
		const tempCanvas = createCanvas(sliderWidth, sliderHeight)
		const tempCtx = tempCanvas.getContext('2d')

		// Get puzzle area image data from background
		tempCtx.drawImage(bgCanvas, targetX, targetY, sliderWidth, sliderHeight, 0, 0, sliderWidth, sliderHeight)

		// Clear slider canvas
		sliderCtx.clearRect(0, 0, sliderWidth, sliderHeight)

		// Draw shape path and clip
		sliderCtx.save()
		drawShape(sliderCtx, currentShape, 0, 0, sliderWidth, sliderHeight, borderRadius)
		sliderCtx.clip()

		// Draw image within clipped area
		sliderCtx.drawImage(tempCanvas, 0, 0)
		sliderCtx.restore()

		// Draw puzzle border with shadow
		sliderCtx.save()
		drawShape(sliderCtx, currentShape, 0, 0, sliderWidth, sliderHeight, borderRadius)
		sliderCtx.shadowColor = 'rgba(0, 0, 0, 0.5)'
		sliderCtx.shadowBlur = 4
		sliderCtx.shadowOffsetX = 0
		sliderCtx.shadowOffsetY = 0
		sliderCtx.strokeStyle = 'rgba(255, 255, 255, 1)'
		sliderCtx.lineWidth = 1
		sliderCtx.stroke()
		sliderCtx.restore()

		// Draw decoy hole (deceptive pit with random rotation)
		this.drawDecoyHole(bgCtx, currentShape, sliderWidth, sliderHeight, borderRadius, width, height, targetX, targetY)

		// Clear the puzzle area on background
		bgCtx.save()
		drawShape(bgCtx, currentShape, targetX, targetY, sliderWidth, sliderHeight, borderRadius)
		bgCtx.globalCompositeOperation = 'destination-out'
		bgCtx.fill()
		bgCtx.restore()

		// Draw hole: white border + dark overlay
		bgCtx.save()
		drawShape(bgCtx, currentShape, targetX, targetY, sliderWidth, sliderHeight, borderRadius)
		bgCtx.fillStyle = 'rgba(0, 0, 0, 0.3)'
		bgCtx.fill()
		bgCtx.strokeStyle = 'rgba(255, 255, 255, 1)'
		bgCtx.lineWidth = 1
		bgCtx.stroke()
		bgCtx.restore()

		// Generate captcha ID
		const captchaId = uuidv4()
		const now = Date.now()
		const expireTime = 60000 // 60 seconds

		// Create cache entry
		const cache: CaptchaCache = {
			id: captchaId,
			type: 'slider',
			target: [targetX],
			createdAt: now,
			expiresAt: now + expireTime,
		}

		// Create response
		const response: CaptchaResponse = {
			captchaId,
			type: 'slider',
			bgImage: bgCanvas.toDataURL('image/png'),
			sliderImage: sliderCanvas.toDataURL('image/png'),
			sliderY: targetY,
			width,
			height,
			expiresAt: now + expireTime,
		}

		return { cache, response }
	}

	/**
	 * Draw decoy hole (deceptive pit with random rotation)
	 */
	private drawDecoyHole(
		ctx: CanvasRenderingContext2D,
		shape: ShapeType,
		w: number,
		h: number,
		r: number,
		width: number,
		height: number,
		targetX: number,
		targetY: number
	): void {
		// Random decoy position (avoid overlapping with target)
		let decoyX: number, decoyY: number
		do {
			decoyX = random(w + 10, width - w - 10)
			decoyY = random(10, height - h - 10)
		} while (Math.abs(decoyX - targetX) < w + 20 && Math.abs(decoyY - targetY) < h + 20)

		// Random rotation angle (5-15 degrees)
		const rotation = (random(5, 15) * Math.PI) / 180

		ctx.save()

		// Translate to decoy center and rotate
		ctx.translate(decoyX + w / 2, decoyY + h / 2)
		ctx.rotate(rotation)
		ctx.translate(-(decoyX + w / 2), -(decoyY + h / 2))

		// Draw decoy hole: white border + dark overlay
		drawShape(ctx, shape, decoyX, decoyY, w, h, r)
		ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
		ctx.fill()
		ctx.strokeStyle = 'rgba(255, 255, 255, 1)'
		ctx.lineWidth = 1
		ctx.stroke()

		ctx.restore()
	}

	/**
	 * Generate click captcha
	 */
	generateClick(options: CaptchaGenerateOptions = {}): { cache: CaptchaCache; response: CaptchaResponse } {
		const opts = { ...this.defaultOptions, ...options }
		const { width, height, clickText } = opts
		// Auto-generate random count (3-4) if not specified
		const clickCount = opts.clickCount || random(3, 4)

		// Create background canvas
		const bgCanvas = createCanvas(width, height)
		const bgCtx = bgCanvas.getContext('2d')

		// Generate background
		generateBackground(bgCtx, width, height)

		// Generate or use provided text (from backend)
		let chars: string
		if (clickText) {
			chars = clickText
		} else {
			// Randomly select a word from Chinese vocabulary
			const randomWord = CHINESE_WORDS[random(0, CHINESE_WORDS.length - 1)]
			// If word length is insufficient, select other words or supplement
			if (randomWord.length >= clickCount) {
				chars = randomWord.slice(0, clickCount)
			} else {
				// When word length is insufficient, combine from multiple words
				chars = randomWord
				while (chars.length < clickCount) {
					const extraWord = CHINESE_WORDS[random(0, CHINESE_WORDS.length - 1)]
					chars += extraWord.slice(0, clickCount - chars.length)
				}
			}
		}

		const clickTexts = chars.split('').slice(0, clickCount)
		const targetPoints: Point[] = []
		const decoyPoints: Point[] = []

		// Generate 1-2 decoy characters to confuse bots
		const decoyCount = random(1, 2)
		const usedChars = new Set(clickTexts)
		const decoyTexts: string[] = []

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
				decoyTexts.push(decoyChar)
			}
		}

		// Generate random positions for each character
		const fontSize = 20
		const padding = fontSize + 10

		// Draw click target characters
		for (let i = 0; i < clickTexts.length; i++) {
			let x: number, y: number, attempts = 0
			const maxAttempts = 100

			// Find non-overlapping position
			do {
				x = random(padding, width - padding)
				y = random(padding, height - padding)
				attempts++
			} while (this.isOverlapping(x, y, fontSize, targetPoints) && attempts < maxAttempts)

			targetPoints.push({ x, y })

			// Draw character
			bgCtx.save()
			bgCtx.font = `bold ${fontSize}px Arial`
			bgCtx.fillStyle = '#333'
			bgCtx.textAlign = 'center'
			bgCtx.textBaseline = 'middle'

			// Random rotation
			const rotation = (random(-30, 30) * Math.PI) / 180
			bgCtx.translate(x, y)
			bgCtx.rotate(rotation)
			bgCtx.fillText(clickTexts[i], 0, 0)
			bgCtx.restore()
		}

		// Draw decoy characters (lighter color)
		for (let i = 0; i < decoyTexts.length; i++) {
			let x: number, y: number, attempts = 0
			const maxAttempts = 100

			// Find non-overlapping position (check against both target and decoy points)
			do {
				x = random(padding, width - padding)
				y = random(padding, height - padding)
				attempts++
			} while (this.isOverlapping(x, y, fontSize, [...targetPoints, ...decoyPoints]) && attempts < maxAttempts)

			decoyPoints.push({ x, y })

			// Draw decoy character with slightly lighter color
			bgCtx.save()
			bgCtx.font = `${fontSize}px Arial`
			bgCtx.fillStyle = '#555'
			bgCtx.textAlign = 'center'
			bgCtx.textBaseline = 'middle'

			// Random rotation
			const rotation = (random(-25, 25) * Math.PI) / 180
			bgCtx.translate(x, y)
			bgCtx.rotate(rotation)
			bgCtx.fillText(decoyTexts[i], 0, 0)
			bgCtx.restore()
		}

		// Generate captcha ID
		const captchaId = uuidv4()
		const now = Date.now()
		const expireTime = 60000 // 60 seconds

		// Generate base64 images for each character (for prompt display)
		const clickCharImages = clickTexts.map(char => this.generateCharImage(char))

		// Create cache entry
		const cache: CaptchaCache = {
			id: captchaId,
			type: 'click',
			target: targetPoints,
			clickTexts,
			createdAt: now,
			expiresAt: now + expireTime,
		}

		// Create response
		const response: CaptchaResponse = {
			captchaId,
			type: 'click',
			bgImage: bgCanvas.toDataURL('image/png'),
			clickTexts,
			clickCharImages,
			width,
			height,
			expiresAt: now + expireTime,
		}

		return { cache, response }
	}

	/**
	 * Generate base64 image for a character (for prompt display)
	 */
	private generateCharImage(char: string): string {
		const fontSize = 16
		const padding = 4
		const charCanvas = createCanvas(fontSize + padding * 2, fontSize + padding * 2)
		const charCtx = charCanvas.getContext('2d')

		charCtx.font = `bold ${fontSize}px Arial, sans-serif`
		charCtx.fillStyle = '#1991fa'
		charCtx.textAlign = 'center'
		charCtx.textBaseline = 'middle'

		// Random slight rotation for anti-bot
		const rotation = (random(-10, 10) * Math.PI) / 180
		charCtx.translate(charCanvas.width / 2, charCanvas.height / 2)
		charCtx.rotate(rotation)
		charCtx.fillText(char, 0, 0)

		return charCanvas.toDataURL('image/png')
	}

	/**
	 * Check if position overlaps with existing points
	 */
	private isOverlapping(x: number, y: number, size: number, points: Point[]): boolean {
		for (const point of points) {
			const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)
			if (distance < size * 1.5) {
				return true
			}
		}
		return false
	}

	/**
	 * Generate captcha based on type
	 */
	generate(options: CaptchaGenerateOptions = {}): { cache: CaptchaCache; response: CaptchaResponse } {
		const type = options.type || 'slider'

		switch (type) {
			case 'click':
				return this.generateClick(options)
			case 'slider':
			default:
				return this.generateSlider(options)
		}
	}
}

export default CaptchaGenerator
