/**
 * Captcha types
 */
export type CaptchaType = 'slider' | 'click' | 'invisible'

/**
 * Verification mode
 */
export type VerifyMode = 'frontend' | 'backend'

/**
 * Security options for captcha
 */
export interface SecurityOptions {
	/**
	 * Secret key for signing (shared with backend)
	 */
	secretKey?: string
	/**
	 * Enable signature verification
	 */
	enableSign?: boolean
	/**
	 * Timestamp tolerance in milliseconds (default: 60000)
	 */
	timestampTolerance?: number
}

/**
 * Backend verify options
 */
export interface BackendVerifyOptions {
	/**
	 * URL or function to get captcha
	 */
	getCaptcha?: string | ((params?: Record<string, unknown>) => Promise<BackendCaptchaResponse>)
	/**
	 * URL or function to verify captcha
	 */
	verify?: string | ((data: CaptchaData) => Promise<BackendVerifyResponse>)
	/**
	 * Request headers
	 */
	headers?: Record<string, string>
	/**
	 * Request timeout in milliseconds
	 */
	timeout?: number
}

/**
 * Backend captcha response
 */
export interface BackendCaptchaResponse {
	/**
	 * Response data
	 */
	data: {
		/**
		 * Captcha ID
		 */
		captchaId: string
		/**
		 * Background image (URL or base64)
		 */
		bgImage: string
		/**
		 * Slider image (for slider captcha)
		 */
		sliderImage?: string
		/**
		 * Click texts (for click captcha)
		 */
		clickTexts?: string[]
		/**
		 * Timestamp
		 */
		timestamp?: number
	}
}

/**
 * Backend verify response
 */
export interface BackendVerifyResponse {
	/**
	 * Verify success
	 */
	success: boolean
	/**
	 * Message
	 */
	message?: string
	/**
	 * Additional data
	 */
	data?: Record<string, unknown>
}

/**
 * Captcha statistics
 */
export interface CaptchaStatistics {
	/**
	 * Total verification attempts
	 */
	totalAttempts: number
	/**
	 * Success count
	 */
	successCount: number
	/**
	 * Fail count
	 */
	failCount: number
	/**
	 * Success rate (0-100)
	 */
	successRate: number
	/**
	 * Average verification time in milliseconds
	 */
	avgVerifyTime: number
	/**
	 * Average drag distance in pixels (slider captcha)
	 */
	avgDragDistance: number
	/**
	 * Average drag time in milliseconds
	 */
	avgDragTime: number
	/**
	 * Average click count
	 */
	avgClickCount: number
}

/**
 * Statistics data (internal)
 */
export interface StatisticsData {
	totalAttempts: number
	successCount: number
	failCount: number
	totalVerifyTime: number
	totalDragDistance: number
	totalDragTime: number
	totalClickCount: number
}

/**
 * Risk assessment options for invisible captcha
 */
export interface RiskAssessmentOptions {
	/**
	 * Behavior check options
	 */
	behaviorCheck?: {
		/**
		 * Minimum interaction time in milliseconds
		 */
		minInteractionTime?: number
		/**
		 * Enable track analysis
		 */
		trackAnalysis?: boolean
	}
	/**
	 * Enable device fingerprint
	 */
	fingerprint?: boolean
	/**
	 * Risk threshold (0-1, below this value will pass directly)
	 */
	threshold?: number
}

/**
 * Base captcha options
 */
export interface BaseCaptchaOptions {
	/**
	 * Container element or selector
	 */
	el: string | HTMLElement
	/**
	 * Width of the captcha container
	 */
	width?: number
	/**
	 * Height of the captcha container
	 */
	height?: number
	/**
	 * Show refresh button
	 */
	showRefresh?: boolean
	/**
	 * Custom class name
	 */
	className?: string
	/**
	 * Verification mode
	 */
	verifyMode?: VerifyMode
	/**
	 * Backend verify options
	 */
	backendVerify?: BackendVerifyOptions
	/**
	 * Security options
	 */
	security?: SecurityOptions
	/**
	 * Success callback
	 */
	onSuccess?: () => void
	/**
	 * Fail callback
	 */
	onFail?: () => void
	/**
	 * Refresh callback
	 */
	onRefresh?: () => void
}

/**
 * Slider captcha options
 */
export interface SliderCaptchaOptions extends BaseCaptchaOptions {
	/**
	 * Background image URL or base64
	 */
	bgImage?: string
	/**
	 * Slider image URL or base64
	 */
	sliderImage?: string
	/**
	 * Slider width
	 */
	sliderWidth?: number
	/**
	 * Slider height
	 */
	sliderHeight?: number
	/**
	 * Precision for validation (px)
	 */
	precision?: number
}

/**
 * Click captcha options
 */
export interface ClickCaptchaOptions extends BaseCaptchaOptions {
	/**
	 * Background image URL or base64
	 */
	bgImage?: string
	/**
	 * Number of click points
	 */
	count?: number
}

/**
 * Invisible captcha options
 */
export interface InvisibleCaptchaOptions {
	/**
	 * Trigger element or selector
	 */
	el: string | HTMLElement
	/**
	 * Trigger event type
	 */
	trigger?: 'click' | 'submit' | 'focus'
	/**
	 * Risk assessment options
	 */
	riskAssessment?: RiskAssessmentOptions
	/**
	 * Captcha type to show on challenge
	 */
	challengeType?: 'slider' | 'click'
	/**
	 * Captcha options for challenge
	 */
	challengeOptions?: SliderCaptchaOptions | ClickCaptchaOptions
	/**
	 * Callback when challenge is needed
	 */
	onChallenge?: () => void
	/**
	 * Success callback (direct pass or verify success)
	 */
	onSuccess?: () => void
	/**
	 * Fail callback
	 */
	onFail?: () => void
}

/**
 * Captcha instance interface
 */
export interface CaptchaInstance {
	/**
	 * Verify the captcha
	 */
	verify: (data: number[] | Point[]) => boolean
	/**
	 * Reset the captcha
	 */
	reset: () => void
	/**
	 * Destroy the captcha
	 */
	destroy: () => void
	/**
	 * Refresh the captcha
	 */
	refresh: () => void | Promise<void>
	/**
	 * Get captcha data (synchronous, without signature)
	 */
	getData: () => CaptchaData
	/**
	 * Get signed captcha data (asynchronous, with signature)
	 */
	getSignedData: () => Promise<CaptchaData>
	/**
	 * Get statistics
	 */
	getStatistics: () => CaptchaStatistics
	/**
	 * Reset statistics
	 */
	resetStatistics: () => void
}

/**
 * Slider captcha instance
 */
export interface SliderCaptchaInstance extends CaptchaInstance {
	/**
	 * Get slider position
	 */
	getSliderPosition: () => number
}

/**
 * Click captcha instance
 */
export interface ClickCaptchaInstance extends CaptchaInstance {
	/**
	 * Get click points
	 */
	getClickPoints: () => Point[]
}

/**
 * Captcha data
 */
export interface CaptchaData {
	/**
	 * Captcha type
	 */
	type: CaptchaType
	/**
	 * Captcha ID (for backend verification)
	 */
	captchaId?: string
	/**
	 * Background image
	 */
	bgImage?: string
	/**
	 * Slider image (for slider captcha)
	 */
	sliderImage?: string
	/**
	 * Target position/points/angle
	 */
	target: number[] | Point[]
	/**
	 * Timestamp
	 */
	timestamp: number
	/**
	 * HMAC-SHA256 signature
	 */
	signature?: string
	/**
	 * Random string for replay prevention
	 */
	nonce?: string
}

/**
 * Point coordinate
 */
export interface Point {
	x: number
	y: number
}

/**
 * Slider track data
 */
export interface SliderTrack {
	x: number
	y: number
	timestamp: number
}

/**
 * Invisible captcha instance
 */
export interface InvisibleCaptchaInstance {
	/**
	 * Trigger verification
	 */
	trigger: () => void
	/**
	 * Get risk score
	 */
	getRiskScore: () => number
	/**
	 * Destroy instance
	 */
	destroy: () => void
}

/**
 * Popup modal options
 */
export interface PopupModalOptions {
	/**
	 * Click mask to close (default: true)
	 */
	maskClosable?: boolean
	/**
	 * Press ESC to close (default: true)
	 */
	escClosable?: boolean
	/**
	 * Show close button (default: true)
	 */
	showClose?: boolean
	/**
	 * Modal title
	 */
	title?: string
}

/**
 * Popup captcha options
 */
export interface PopupCaptchaOptions {
	/**
	 * Trigger element or selector (optional, can use show() method instead)
	 */
	trigger?: string | HTMLElement
	/**
	 * Captcha type (default: 'slider')
	 */
	type?: 'slider' | 'click'
	/**
	 * Captcha options (passed to SliderCaptcha or ClickCaptcha)
	 */
	captchaOptions?: SliderCaptchaOptions | ClickCaptchaOptions
	/**
	 * Modal options
	 */
	modal?: PopupModalOptions
	/**
	 * Auto close on success (default: true)
	 */
	autoClose?: boolean
	/**
	 * Close delay in milliseconds after success (default: 500)
	 */
	closeDelay?: number
	/**
	 * Callback when popup opens
	 */
	onOpen?: () => void
	/**
	 * Callback when popup closes
	 */
	onClose?: () => void
	/**
	 * Success callback
	 */
	onSuccess?: () => void
	/**
	 * Fail callback
	 */
	onFail?: () => void
}

/**
 * Popup captcha instance
 */
export interface PopupCaptchaInstance {
	/**
	 * Show popup
	 */
	show: () => void
	/**
	 * Hide popup
	 */
	hide: () => void
	/**
	 * Get visibility state
	 */
	isVisible: () => boolean
	/**
	 * Get inner captcha instance
	 */
	getCaptcha: () => SliderCaptchaInstance | ClickCaptchaInstance | null
	/**
	 * Destroy instance
	 */
	destroy: () => void
}
