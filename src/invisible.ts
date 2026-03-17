import type {
	CaptchaData,
	CaptchaStatistics,
	ClickCaptchaOptions,
	InvisibleCaptchaInstance,
	InvisibleCaptchaOptions,
	Point,
	SliderCaptchaOptions,
} from './types'
import { ClickCaptcha } from './click'
import { SliderCaptcha } from './slider'
import { calculateBehaviorScore, generateFingerprint, getElement, off, on } from './utils'

const defaultOptions: Partial<InvisibleCaptchaOptions> = {
	trigger: 'click',
	challengeType: 'slider',
	riskAssessment: {
		threshold: 0.7,
		behaviorCheck: {
			minInteractionTime: 500,
			trackAnalysis: true,
		},
	},
}

/**
 * Invisible Captcha
 * Risk-based captcha that shows challenge only when necessary
 */
export class InvisibleCaptcha implements InvisibleCaptchaInstance {
	private options: InvisibleCaptchaOptions
	private triggerElement: HTMLElement | null = null
	private captchaInstance: SliderCaptcha | ClickCaptcha | null = null
	private captchaContainer: HTMLElement | null = null
	private riskScore: number = 0
	private interactionStartTime: number = 0
	private tracks: { x: number; y: number; timestamp: number }[] = []
	private clickCount: number = 0
	private isMonitoring: boolean = false
	// @ts-expect-error - stored for potential future use
	private _fingerprint: string = ''

	constructor(options: InvisibleCaptchaOptions) {
		this.options = { ...defaultOptions, ...options }
		this._fingerprint = generateFingerprint()
		this.init()
	}

	/**
	 * Initialize invisible captcha
	 */
	private init(): void {
		const el = getElement(this.options.el)
		if (!el) {
			console.error('Trigger element not found')
			return
		}

		this.triggerElement = el
		this.bindEvents()
		this.startMonitoring()
	}

	/**
	 * Bind events
	 */
	private bindEvents(): void {
		if (!this.triggerElement) return

		const trigger = this.options.trigger!

		if (trigger === 'click') {
			on(this.triggerElement, 'click', this.onTrigger)
		} else if (trigger === 'submit') {
			on(this.triggerElement, 'submit', this.onTrigger)
		} else if (trigger === 'focus') {
			on(this.triggerElement, 'focus', this.onTrigger)
		}
	}

	/**
	 * Start monitoring user behavior
	 */
	private startMonitoring(): void {
		this.isMonitoring = true
		this.interactionStartTime = Date.now()

		// Monitor mouse/touch movements
		on(document, 'mousemove', this.onMouseMove as (e: Event) => void)
		on(document, 'touchmove', this.onTouchMove as (e: Event) => void)
		on(document, 'click', this.onClick)
	}

	/**
	 * Stop monitoring
	 */
	private stopMonitoring(): void {
		this.isMonitoring = false
		off(document, 'mousemove', this.onMouseMove as (e: Event) => void)
		off(document, 'touchmove', this.onTouchMove as (e: Event) => void)
		off(document, 'click', this.onClick)
	}

	/**
	 * Mouse move handler
	 */
	private onMouseMove = (e: MouseEvent): void => {
		if (!this.isMonitoring) return
		this.tracks.push({
			x: e.clientX,
			y: e.clientY,
			timestamp: Date.now(),
		})
	}

	/**
	 * Touch move handler
	 */
	private onTouchMove = (e: TouchEvent): void => {
		if (!this.isMonitoring) return
		if (e.touches.length > 0) {
			this.tracks.push({
				x: e.touches[0].clientX,
				y: e.touches[0].clientY,
				timestamp: Date.now(),
			})
		}
	}

	/**
	 * Click handler
	 */
	private onClick = (): void => {
		if (!this.isMonitoring) return
		this.clickCount++
	}

	/**
	 * Trigger handler
	 */
	private onTrigger = async (e: Event): Promise<void> => {
		e.preventDefault()

		// Calculate risk score
		this.calculateRisk()

		const threshold = this.options.riskAssessment?.threshold ?? 0.7

		if (this.riskScore < threshold) {
			// Low risk - pass directly
			this.options.onSuccess?.()
		} else {
			// High risk - show challenge
			this.options.onChallenge?.()
			await this.showChallenge()
		}
	}

	/**
	 * Calculate risk score
	 */
	private calculateRisk(): void {
		const interactionTime = Date.now() - this.interactionStartTime

		// Calculate behavior score
		const behaviorScore = calculateBehaviorScore({
			tracks: this.tracks,
			interactionTime,
			clickCount: this.clickCount,
		})

		// Combine scores
		let score = behaviorScore

		// Add fingerprint-based adjustment (simplified)
		if (this.options.riskAssessment?.fingerprint) {
			// In a real implementation, this would check against a database
			// of known bot fingerprints
			score *= 0.95 // Slight reduction for legitimate fingerprint
		}

		this.riskScore = score
	}

	/**
	 * Show challenge captcha
	 */
	private async showChallenge(): Promise<void> {
		// Create container for captcha
		if (!this.captchaContainer) {
			this.captchaContainer = document.createElement('div')
			this.captchaContainer.style.cssText = `
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				z-index: 10000;
				background: #fff;
				padding: 20px;
				border-radius: 8px;
				box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
			`
			document.body.appendChild(this.captchaContainer)
		}

		// Create overlay
		const overlay = document.createElement('div')
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.5);
			z-index: 9999;
		`
		document.body.appendChild(overlay)

		// Create captcha based on type
		const challengeType = this.options.challengeType || 'slider'
		const challengeOptions = {
			...this.options.challengeOptions,
			el: this.captchaContainer,
			onSuccess: () => {
				this.options.onSuccess?.()
				this.hideChallenge()
			},
			onFail: () => {
				this.options.onFail?.()
			},
		} as SliderCaptchaOptions | ClickCaptchaOptions

		switch (challengeType) {
			case 'slider':
				this.captchaInstance = new SliderCaptcha(challengeOptions as SliderCaptchaOptions)
				break
			case 'click':
				this.captchaInstance = new ClickCaptcha(challengeOptions as ClickCaptchaOptions)
				break
		}

		// Click overlay to close
		overlay.onclick = () => {
			this.hideChallenge()
			overlay.remove()
		}
	}

	/**
	 * Hide challenge
	 */
	private hideChallenge(): void {
		if (this.captchaInstance) {
			this.captchaInstance.destroy()
			this.captchaInstance = null
		}
		if (this.captchaContainer) {
			this.captchaContainer.remove()
			this.captchaContainer = null
		}
	}

	/**
	 * Trigger verification manually
	 */
	trigger(): void {
		this.calculateRisk()
		const threshold = this.options.riskAssessment?.threshold ?? 0.7

		if (this.riskScore < threshold) {
			this.options.onSuccess?.()
		} else {
			this.options.onChallenge?.()
			this.showChallenge()
		}
	}

	/**
	 * Get risk score
	 */
	getRiskScore(): number {
		return this.riskScore
	}

	/**
	 * Get captcha data
	 */
	getData(): CaptchaData {
		return {
			type: 'invisible',
			target: [this.riskScore],
			timestamp: Date.now(),
		}
	}

	/**
	 * Get signed captcha data
	 */
	async getSignedData(): Promise<CaptchaData> {
		return this.getData()
	}

	/**
	 * Verify (always returns true for invisible captcha)
	 */
	verify(_data: number[] | Point[]): boolean {
		return this.riskScore < (this.options.riskAssessment?.threshold ?? 0.7)
	}

	/**
	 * Reset
	 */
	reset(): void {
		this.riskScore = 0
		this.tracks = []
		this.clickCount = 0
		this.interactionStartTime = Date.now()
	}

	/**
	 * Destroy instance
	 */
	destroy(): void {
		this.stopMonitoring()
		this.hideChallenge()

		if (this.triggerElement) {
			const trigger = this.options.trigger!
			if (trigger === 'click') {
				off(this.triggerElement, 'click', this.onTrigger)
			} else if (trigger === 'submit') {
				off(this.triggerElement, 'submit', this.onTrigger)
			} else if (trigger === 'focus') {
				off(this.triggerElement, 'focus', this.onTrigger)
			}
		}

		this.triggerElement = null
	}

	/**
	 * Refresh
	 */
	refresh(): void {
		this.reset()
	}

	/**
	 * Get statistics
	 */
	getStatistics(): CaptchaStatistics {
		return {
			totalAttempts: 0,
			successCount: 0,
			failCount: 0,
			successRate: 0,
			avgVerifyTime: 0,
			avgDragDistance: 0,
			avgDragTime: 0,
			avgClickCount: this.clickCount,
		}
	}

	/**
	 * Reset statistics
	 */
	resetStatistics(): void {
		this.clickCount = 0
	}
}

export default InvisibleCaptcha
