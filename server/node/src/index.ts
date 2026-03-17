/**
 * Captcha Pro Server - Express 5 Backend
 *
 * A backend service for generating and verifying captcha images.
 * Supports slider and click captcha types.
 */
import type { CacheStore, CaptchaGenerateOptions, CaptchaType, VerifyRequest } from './types'
import cors from 'cors'
import express, { type Express, type NextFunction, type Request, type Response } from 'express'
import { captchaCache } from './cache'
import { CaptchaGenerator } from './captcha-generator'
import { decryptCaptchaData, validateTimestamp } from './crypto'
import { SecurityManager, securityManager } from './security'

// Server configuration
const config = {
	port: Number(process.env.PORT) || 3001,
	host: process.env.HOST || 'localhost',
	secretKey: process.env.SECRET_KEY || 'captcha-pro-secret-key',
	expireTime: Number(process.env.EXPIRE_TIME) || 60000, // 60 seconds
	timestampTolerance: Number(process.env.TIMESTAMP_TOLERANCE) || 60000, // 60 seconds
}

// Create Express app
const app: Express = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Captcha generator instance
const generator = new CaptchaGenerator()

// Cache store adapter
const cacheStore: CacheStore = {
	get: async (key: string) => captchaCache.get(key),
	set: async (key: string, value, ttl: number) => captchaCache.set(key, value, ttl),
	delete: async (key: string) => captchaCache.delete(key),
}

/**
 * Security middleware - Check IP blacklist and rate limit
 */
function securityMiddleware(req: Request, res: Response, next: NextFunction): void {
	const ip = securityManager.getClientIP(req)

	// Check blacklist
	const blacklistResult = securityManager.isBlacklisted(ip)
	if (blacklistResult.blocked) {
		res.status(403).json({
			success: false,
			message: 'Access denied',
			reason: blacklistResult.reason,
		})
		return
	}

	// Check rate limit
	const rateLimitResult = securityManager.isRateLimited(ip)
	if (rateLimitResult.limited) {
		res.setHeader('Retry-After', rateLimitResult.retryAfter || 60)
		res.status(429).json({
			success: false,
			message: 'Too many requests',
			retryAfter: rateLimitResult.retryAfter,
		})
		return
	}

	// Add rate limit headers
	if (rateLimitResult.remaining !== undefined) {
		res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining)
	}

	next()
}

// Apply security middleware to API routes
app.use('/api', securityMiddleware)

/**
 * Generate captcha
 * GET /api/captcha?type=slider&width=280&height=155
 */
app.get('/api/captcha', async (req: Request, res: Response) => {
	try {
		const type = (req.query.type as CaptchaType) || 'slider'
		const width = Number(req.query.width) || 280
		const height = Number(req.query.height) || 155
		const sliderWidth = Number(req.query.sliderWidth) || 50
		const sliderHeight = Number(req.query.sliderHeight) || 50
		const precision = Number(req.query.precision) || 5
		const clickCount = Number(req.query.clickCount) || 3
		const clickText = req.query.clickText as string | undefined

		const options: CaptchaGenerateOptions = {
			type,
			width,
			height,
			sliderWidth,
			sliderHeight,
			precision,
			clickCount,
			clickText,
		}

		const { cache, response } = generator.generate(options)

		// Store in cache
		await cacheStore.set(cache.id, cache, config.expireTime)

		res.json({
			success: true,
			data: response,
		})
	} catch (error) {
		console.error('Generate captcha error:', error)
		res.status(500).json({
			success: false,
			message: 'Failed to generate captcha',
		})
	}
})

/**
 * Verify captcha
 * POST /api/captcha/verify
 *
 * Supports two modes:
 * 1. Plain mode: captchaId + type + target
 * 2. Encrypted mode: signature (AES-GCM encrypted data)
 */
app.post('/api/captcha/verify', async (req: Request, res: Response) => {
	const ip = securityManager.getClientIP(req)

	try {
		const data: VerifyRequest = req.body

		// Handle encrypted signature mode
		if (data.signature) {
			try {
				const decrypted = await decryptCaptchaData(data.signature, config.secretKey)

				// Validate timestamp
				if (!validateTimestamp(decrypted.timestamp, config.timestampTolerance)) {
					res.status(400).json({
						success: false,
						message: 'Timestamp expired',
					})
					return
				}

				// Use decrypted data for verification
				data.target = decrypted.target
				data.type = decrypted.type as CaptchaType
				// captchaId still needed from request for cache lookup
			} catch (decryptError) {
				console.error('Decryption failed:', decryptError)
				res.status(400).json({
					success: false,
					message: 'Invalid encrypted data',
				})
				return
			}
		}

		// Validate required fields
		if (!data.captchaId || !data.type || !data.target) {
			res.status(400).json({
				success: false,
				message: 'Missing required fields',
			})
			return
		}

		// Get cached captcha data
		const cached = await cacheStore.get(data.captchaId)
		if (!cached) {
			// Record failed attempt (possible brute-force)
			securityManager.recordFailedAttempt(ip)

			res.status(400).json({
				success: false,
				message: 'Captcha expired or not found',
			})
			return
		}

		// Check if expired
		if (Date.now() > cached.expiresAt) {
			await cacheStore.delete(data.captchaId)
			securityManager.recordFailedAttempt(ip)

			res.status(400).json({
				success: false,
				message: 'Captcha expired',
			})
			return
		}

		// Validate type match
		if (cached.type !== data.type) {
			securityManager.recordFailedAttempt(ip)

			res.status(400).json({
				success: false,
				message: 'Captcha type mismatch',
			})
			return
		}

		// Verify based on type
		let success = false
		const precision = 5 // Default precision

		switch (data.type) {
			case 'slider': {
				const targetX = (cached.target as number[])[0]
				const userX = (data.target as number[])[0]
				success = Math.abs(targetX - userX) <= precision
				break
			}
			case 'click': {
				const targetPoints = cached.target as { x: number; y: number }[]
				const userPoints = data.target as { x: number; y: number }[]
				const clickPrecision = 25

				if (userPoints.length !== targetPoints.length) {
					success = false
					break
				}

				success = targetPoints.every((target, i) => {
					const user = userPoints[i]
					const distance = Math.sqrt((user.x - target.x) ** 2 + (user.y - target.y) ** 2)
					return distance <= clickPrecision
				})
				break
			}
		}

		// Delete used captcha
		await cacheStore.delete(data.captchaId)

		if (success) {
			// Clear failed attempts on success
			securityManager.recordSuccessfulAttempt(ip)
		} else {
			// Record failed attempt
			const bruteForceResult = securityManager.recordFailedAttempt(ip)
			if (bruteForceResult.blocked) {
				res.status(429).json({
					success: false,
					message: 'Too many failed attempts. Please try again later.',
					retryAfter: bruteForceResult.retryAfter,
				})
				return
			}
		}

		res.json({
			success,
			message: success ? 'Verification successful' : 'Verification failed',
			data: success ? { verifiedAt: Date.now() } : undefined,
		})
	} catch (error) {
		console.error('Verify captcha error:', error)
		res.status(500).json({
			success: false,
			message: 'Failed to verify captcha',
		})
	}
})

/**
 * Health check
 */
app.get('/api/health', (_req: Request, res: Response) => {
	res.json({
		status: 'ok',
		timestamp: Date.now(),
		cacheSize: captchaCache.size,
	})
})

/**
 * Get server info
 */
app.get('/api/info', (_req: Request, res: Response) => {
	res.json({
		name: 'captcha-pro-server-demo',
		version: '1.0.0',
		description: 'Captcha Pro Backend Demo Server (Node.js/Express)',
		supportedTypes: ['slider', 'click'],
		features: ['rate-limit', 'ip-blacklist', 'brute-force-protection'],
		config: {
			expireTime: config.expireTime,
			timestampTolerance: config.timestampTolerance,
			security: securityManager.getConfig(),
		},
	})
})

/**
 * Get security status for an IP (admin endpoint)
 */
app.get('/api/security/status/:ip', (req: Request, res: Response) => {
	const ip = Array.isArray(req.params.ip) ? req.params.ip[0] : req.params.ip
	const status = securityManager.getStatus(ip)

	res.json({
		ip,
		...status,
	})
})

/**
 * Add IP to blacklist (admin endpoint)
 */
app.post('/api/security/blacklist', (req: Request, res: Response) => {
	const { ip, reason, duration } = req.body

	if (!ip) {
		res.status(400).json({
			success: false,
			message: 'IP address is required',
		})
		return
	}

	const expiresAt = duration ? Date.now() + duration : undefined
	securityManager.addToBlacklist(ip, reason || 'Manual block', expiresAt)

	res.json({
		success: true,
		message: 'IP added to blacklist',
		data: { ip, reason, expiresAt },
	})
})

/**
 * Remove IP from blacklist (admin endpoint)
 */
app.delete('/api/security/blacklist/:ip', (req: Request, res: Response) => {
	const ip = Array.isArray(req.params.ip) ? req.params.ip[0] : req.params.ip
	const removed = securityManager.removeFromBlacklist(ip)

	res.json({
		success: removed,
		message: removed ? 'IP removed from blacklist' : 'IP not found in blacklist',
	})
})

/**
 * Get blacklist entries (admin endpoint)
 */
app.get('/api/security/blacklist', (_req: Request, res: Response) => {
	const blacklist = securityManager.getBlacklist()

	res.json({
		success: true,
		data: blacklist,
	})
})

/**
 * Error handler
 */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error('Server error:', err)
	res.status(500).json({
		success: false,
		message: 'Internal server error',
	})
})

/**
 * Start server
 */
function start(): void {
	app.listen(config.port, config.host, () => {
		console.info(`Captcha Pro Server running at http://${config.host}:${config.port}`)
		console.info(`API endpoints:`)
		console.info(`  GET  /api/captcha              - Generate captcha`)
		console.info(`  POST /api/captcha/verify       - Verify captcha`)
		console.info(`  GET  /api/health               - Health check`)
		console.info(`  GET  /api/info                 - Server info`)
		console.info(`Security endpoints:`)
		console.info(`  GET  /api/security/status/:ip  - Get IP security status`)
		console.info(`  GET  /api/security/blacklist   - Get blacklist entries`)
		console.info(`  POST /api/security/blacklist   - Add IP to blacklist`)
		console.info(`  DELETE /api/security/blacklist/:ip - Remove IP from blacklist`)
	})
}

// Export for testing
export { app, start, generator, cacheStore, config, securityManager, SecurityManager }

// Default export
export default app
