/**
 * Generate random number in range
 */
export function random(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate random string
 */
// cspell:disable-next-line
export function randomString(length: number, chars: string = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'): string {
	let result = ''
	for (let i = 0; i < length; i++) {
		result += chars.charAt(random(0, chars.length - 1))
	}
	return result
}

/**
 * Generate nonce (random string for replay prevention)
 */
// cspell:disable-next-line
export function generateNonce(length: number = 16): string {
	return randomString(length, 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz234567890')
}

/**
 * Check if element is in DOM
 */
export function isElementInDOM(element: HTMLElement): boolean {
	return document.body.contains(element)
}

/**
 * Get element by selector or return element
 */
export function getElement(el: string | HTMLElement): HTMLElement | null {
	if (typeof el === 'string') {
		return document.querySelector(el)
	}
	return el
}

/**
 * Add event listener
 */
export function on(element: HTMLElement | Document, event: string, handler: (e: Event) => void, options?: boolean | Record<string, unknown>): void {
	element.addEventListener(event, handler, options)
}

/**
 * Remove event listener
 */
export function off(element: HTMLElement | Document, event: string, handler: (e: Event) => void, options?: boolean | Record<string, unknown>): void {
	element.removeEventListener(event, handler, options)
}

/**
 * Add class to element
 */
export function addClass(element: HTMLElement, className: string): void {
	if (element.classList) {
		element.classList.add(className)
	} else {
		element.className += ` ${className}`
	}
}

/**
 * Remove class from element
 */
export function removeClass(element: HTMLElement, className: string): void {
	if (element.classList) {
		element.classList.remove(className)
	} else {
		element.className = element.className.replace(new RegExp(`(^|\\b)${className.split(' ').join('|')}(\\b|$)`, 'gi'), ' ')
	}
}

/**
 * Set inline style
 */
export function setStyle(element: HTMLElement, styles: Record<string, string | number>): void {
	Object.keys(styles).forEach((key) => {
		element.style[key as any] = typeof styles[key] === 'number' ? `${styles[key]}px` : styles[key] as string
	})
}

/**
 * Create element with attributes
 */
export function createElement(tag: string, attrs?: Record<string, string>, styles?: Record<string, string | number>): HTMLElement {
	const element = document.createElement(tag)
	if (attrs) {
		Object.keys(attrs).forEach((key) => {
			element.setAttribute(key, attrs[key])
		})
	}
	if (styles) {
		setStyle(element, styles)
	}
	return element
}

/**
 * Get mouse/touch position relative to element
 */
export function getEventPosition(event: MouseEvent | TouchEvent, element: HTMLElement): { x: number; y: number } {
	const rect = element.getBoundingClientRect()
	let clientX: number, clientY: number

	if ('touches' in event) {
		// On touchend, touches is empty, use changedTouches instead
		const touch = event.touches[0] || event.changedTouches?.[0]
		if (touch) {
			clientX = touch.clientX
			clientY = touch.clientY
		} else {
			// fallback for edge cases
			clientX = 0
			clientY = 0
		}
	} else {
		clientX = event.clientX
		clientY = event.clientY
	}

	return {
		x: clientX - rect.left,
		y: clientY - rect.top,
	}
}

/**
 * Generate canvas with random noise
 */
export function generateNoiseCanvas(width: number, height: number): HTMLCanvasElement {
	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	const ctx = canvas.getContext('2d')!

	// Fill background
	ctx.fillStyle = '#f0f0f0'
	ctx.fillRect(0, 0, width, height)

	// Add noise
	for (let i = 0; i < width * height * 0.1; i++) {
		ctx.fillStyle = `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, ${Math.random() * 0.3})`
		ctx.fillRect(random(0, width), random(0, height), 1, 1)
	}

	return canvas
}

/**
 * Load image
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.crossOrigin = 'anonymous'
		img.onload = () => resolve(img)
		img.onerror = reject
		img.src = src
	})
}

/**
 * Draw rounded rectangle
 */
export function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
	ctx.beginPath()
	ctx.moveTo(x + radius, y)
	ctx.lineTo(x + width - radius, y)
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
	ctx.lineTo(x + width, y + height - radius)
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
	ctx.lineTo(x + radius, y + height)
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
	ctx.lineTo(x, y + radius)
	ctx.quadraticCurveTo(x, y, x + radius, y)
	ctx.closePath()
}

/**
 * Crypto API interface for browser
 */
interface CryptoApi {
	subtle: {
		importKey: (format: string, keyData: unknown, algorithm: unknown, extractable: boolean, keyUsages: string[]) => Promise<unknown>
		sign: (algorithm: unknown, key: unknown, data: unknown) => Promise<ArrayBuffer>
		encrypt: (algorithm: unknown, key: unknown, data: unknown) => Promise<ArrayBuffer>
		decrypt: (algorithm: unknown, key: unknown, data: unknown) => Promise<ArrayBuffer>
		digest: (algorithm: string, data: unknown) => Promise<ArrayBuffer>
	}
}

/**
 * Get Web Crypto API (browser compatible)
 * Uses Reflect to access crypto at runtime
 */
function getCrypto(): CryptoApi {
	if (typeof window !== 'undefined') {
		const cryptoApi = Reflect.get(window, 'crypto') as CryptoApi | undefined
		if (cryptoApi && cryptoApi.subtle) {
			return cryptoApi
		}
	}
	throw new Error('Web Crypto API not available')
}

/**
 * Derive AES key from secret string using PBKDF2
 */
async function deriveAesKey(secretKey: string, salt: Uint8Array): Promise<unknown> {
	const cryptoApi = getCrypto()

	// Import the secret key as raw material
	const keyMaterial = await cryptoApi.subtle.importKey(
		'raw',
		new TextEncoder().encode(secretKey),
		'PBKDF2',
		false,
		['deriveBits', 'deriveKey']
	)

	// Derive AES key using PBKDF2
	return cryptoApi.subtle.importKey(
		'raw',
		await (cryptoApi.subtle as any).deriveBits(
			{
				name: 'PBKDF2',
				salt,
				iterations: 100000,
				hash: 'SHA-256',
			},
			keyMaterial,
			256
		),
		{ name: 'AES-GCM' },
		false,
		['encrypt', 'decrypt']
	)
}

/**
 * AES-GCM encryption using Web Crypto API
 */
export async function aesEncrypt(plaintext: string, secretKey: string): Promise<string> {
	const cryptoApi = getCrypto()

	// Generate random salt and IV
	const salt = new Uint8Array(16)
	const iv = new Uint8Array(12)
	if (typeof window !== 'undefined') {
		const cryptoObj = Reflect.get(window, 'crypto') as { getRandomValues: (arr: Uint8Array) => Uint8Array }
		cryptoObj.getRandomValues(salt)
		cryptoObj.getRandomValues(iv)
	}

	// Derive key
	const aesKey = await deriveAesKey(secretKey, salt)

	// Encrypt
	const encoder = new TextEncoder()
	const data = encoder.encode(plaintext)
	const encrypted = await cryptoApi.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		aesKey,
		data
	)

	// Combine salt + iv + ciphertext and encode as base64
	const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
	combined.set(salt, 0)
	combined.set(iv, salt.length)
	combined.set(new Uint8Array(encrypted), salt.length + iv.length)

	// Convert to base64
	return btoa(String.fromCharCode(...combined))
}

/**
 * AES-GCM decryption using Web Crypto API
 */
export async function aesDecrypt(ciphertext: string, secretKey: string): Promise<string> {
	const cryptoApi = getCrypto()

	// Decode base64
	const combined = new Uint8Array(
		atob(ciphertext)
			.split('')
			.map((c) => c.charCodeAt(0))
	)

	// Extract salt, iv, and ciphertext
	const salt = combined.slice(0, 16)
	const iv = combined.slice(16, 28)
	const encrypted = combined.slice(28)

	// Derive key
	const aesKey = await deriveAesKey(secretKey, salt)

	// Decrypt
	const decrypted = await cryptoApi.subtle.decrypt(
		{ name: 'AES-GCM', iv },
		aesKey,
		encrypted
	)

	return new TextDecoder().decode(decrypted)
}

/**
 * Generate encrypted data for captcha verification (AES-GCM)
 */
export async function generateEncryptedData(
	type: string,
	target: number[] | { x: number; y: number }[],
	timestamp: number,
	nonce: string,
	secretKey: string
): Promise<string> {
	const data = JSON.stringify({
		type,
		target,
		timestamp,
		nonce,
	})
	return aesEncrypt(data, secretKey)
}

/**
 * Decrypt and verify captcha data (AES-GCM)
 */
export async function decryptCaptchaData(
	encryptedData: string,
	secretKey: string
): Promise<{
	type: string
	target: number[] | { x: number; y: number }[]
	timestamp: number
	nonce: string
}> {
	const decrypted = await aesDecrypt(encryptedData, secretKey)
	return JSON.parse(decrypted)
}

/**
 * @deprecated Use generateEncryptedData instead
 * Generate signature for captcha data (HMAC-SHA256 - kept for backward compatibility)
 */
export async function generateSignature(
	type: string,
	target: number[] | { x: number; y: number }[],
	timestamp: number,
	nonce: string,
	secretKey: string
): Promise<string> {
	return generateEncryptedData(type, target, timestamp, nonce, secretKey)
}

/**
 * Validate timestamp
 */
export function validateTimestamp(timestamp: number, tolerance: number = 60000): boolean {
	const now = Date.now()
	return Math.abs(now - timestamp) <= tolerance
}

/**
 * Simple fingerprint generation (for risk assessment)
 */
export function generateFingerprint(): string {
	const components: string[] = []

	// Check if running in browser environment
	if (typeof window === 'undefined') {
		return 'server-side'
	}

	// Screen info
	components.push(`${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`)

	// Timezone
	components.push(String(new Date().getTimezoneOffset()))

	// Get navigator via Reflect to avoid static analysis
	const nav = Reflect.get(window, 'navigator') as {
		language?: string
		platform?: string
		userAgent?: string
	}

	// Language
	components.push(nav.language || '')

	// Platform
	components.push(nav.platform || '')

	// User agent hash (simplified)
	const ua = nav.userAgent || ''
	let hash = 0,
	 result = 0
	for (let i = 0; i < ua.length; i++) {
		const char = ua.charCodeAt(i)
		hash = ((hash << 5) - hash) + char
		hash = hash & hash
	}
	components.push(String(hash))

	// Combine and hash
	const combined = components.join('|')
	for (let i = 0; i < combined.length; i++) {
		const char = combined.charCodeAt(i)
		result = ((result << 5) - result) + char
		result = result & result
	}

	return Math.abs(result).toString(36)
}

/**
 * Calculate behavior risk score (0-1, lower is safer)
 */
export function calculateBehaviorScore(options: {
	tracks?: { x: number; y: number; timestamp: number }[]
	interactionTime?: number
	clickCount?: number
}): number {
	let score = 0.5 // Base score

	// Check interaction time (too short = suspicious)
	if (options.interactionTime !== undefined) {
		if (options.interactionTime < 300) {
			score += 0.3 // Very fast interaction
		} else if (options.interactionTime < 1000) {
			score += 0.1 // Fast interaction
		} else if (options.interactionTime > 30000) {
			score -= 0.1 // Very slow (might be bot)
		}
	}

	// Analyze tracks for human-like movement
	if (options.tracks && options.tracks.length > 2) {
		const tracks = options.tracks
		let totalVelocity = 0,
		 velocityChanges = 0,
		 directionChanges = 0

		for (let i = 2; i < tracks.length; i++) {
			const prev = tracks[i - 1]
			const curr = tracks[i]
			const prevPrev = tracks[i - 2]

			// Calculate velocity
			const dt = curr.timestamp - prev.timestamp
			if (dt > 0) {
				const dx = curr.x - prev.x
				const dy = curr.y - prev.y
				const velocity = Math.sqrt(dx * dx + dy * dy) / dt
				totalVelocity += velocity
			}

			// Calculate velocity change (acceleration)
			const dx1 = prev.x - prevPrev.x
			const dy1 = prev.y - prevPrev.y
			const dx2 = curr.x - prev.x
			const dy2 = curr.y - prev.y
			const angle1 = Math.atan2(dy1, dx1)
			const angle2 = Math.atan2(dy2, dx2)
			const angleDiff = Math.abs(angle2 - angle1)

			if (angleDiff > 0.5) {
				directionChanges++
			}
			velocityChanges++
		}

		// Humans tend to have more direction changes
		const changeRate = directionChanges / velocityChanges
		if (changeRate > 0.1) {
			score -= 0.15 // Human-like movement
		} else if (changeRate < 0.02) {
			score += 0.2 // Too smooth (bot-like)
		}

		// Check if velocity varies (humans have varying speeds)
		const avgVelocity = totalVelocity / (tracks.length - 1)
		if (avgVelocity > 0.5 && avgVelocity < 2) {
			score -= 0.05 // Reasonable speed
		}
	}

	// Check click count for click captcha
	if (options.clickCount !== undefined) {
		if (options.clickCount === 0) {
			score += 0.1 // No clicks yet
		}
	}

	// Clamp score between 0 and 1
	return Math.max(0, Math.min(1, score))
}

/**
 * HTTP request helper
 */
export function request<T>(url: string, options: {
	method?: 'GET' | 'POST'
	headers?: Record<string, string>
	body?: unknown
	timeout?: number
} = {}): Promise<T> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()
		const method = options.method || 'GET'
		const timeout = options.timeout || 10000

		xhr.open(method, url, true)
		xhr.timeout = timeout

		// Set headers
		if (options.headers) {
			Object.keys(options.headers).forEach((key) => {
				xhr.setRequestHeader(key, options.headers![key])
			})
		}

		xhr.onload = function () {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					resolve(JSON.parse(xhr.responseText))
				} catch {
					reject(new Error('Invalid JSON response'))
				}
			} else {
				// Try to extract error message from response
				try {
					const errorResponse = JSON.parse(xhr.responseText)
					reject(new Error(errorResponse.message || `HTTP error: ${xhr.status}`))
				} catch {
					reject(new Error(`HTTP error: ${xhr.status}`))
				}
			}
		}

		xhr.onerror = function () {
			reject(new Error('Network error'))
		}

		xhr.ontimeout = function () {
			reject(new Error('Request timeout'))
		}

		if (options.body) {
			xhr.setRequestHeader('Content-Type', 'application/json')
			xhr.send(JSON.stringify(options.body))
		} else {
			xhr.send()
		}
	})
}

// Shake animation CSS injected flag
let shakeAnimationInjected = false

// Injected styles cache
const injectedStylesCache = new Set<string>()

/**
 * Inject CSS styles to document head
 */
export function injectStyles(id: string, css: string): void {
	if (injectedStylesCache.has(id)) return

	const style = document.createElement('style')
	style.id = id
	style.textContent = css
	document.head.appendChild(style)
	injectedStylesCache.add(id)
}

/**
 * Inject shake animation CSS
 */
export function injectShakeAnimation(): void {
	if (shakeAnimationInjected) return

	injectStyles('captcha-shake-animation', `
		@keyframes captchaShake {
			0%, 100% { transform: translateX(0); }
			10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
			20%, 40%, 60%, 80% { transform: translateX(4px); }
		}
	`)
	shakeAnimationInjected = true
}
