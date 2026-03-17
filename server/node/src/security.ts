/**
 * Security module for captcha server
 * Provides rate limiting, IP blacklist, and brute-force protection
 */

/**
 * Rate limit record
 */
interface RateLimitRecord {
	count: number
	resetAt: number
	blocked: boolean
	blockedUntil?: number
}

/**
 * IP blacklist record
 */
interface BlacklistRecord {
	ip: string
	reason: string
	blockedAt: number
	expiresAt?: number
}

/**
 * Failed attempt record
 */
interface FailedAttempt {
	count: number
	firstAttemptAt: number
	lastAttemptAt: number
}

/**
 * Security configuration
 */
export interface SecurityConfig {
	/** Enable rate limiting */
	enableRateLimit: boolean
	/** Max requests per window */
	rateLimitMax: number
	/** Rate limit window in ms */
	rateLimitWindow: number
	/** Block duration in ms after rate limit exceeded */
	rateLimitBlockDuration: number

	/** Enable IP blacklist */
	enableBlacklist: boolean
	/** Default blacklist duration in ms (0 = permanent) */
	blacklistDuration: number

	/** Enable brute-force protection */
	enableBruteForce: boolean
	/** Max failed attempts before blocking */
	maxFailedAttempts: number
	/** Failed attempts window in ms */
	failedAttemptsWindow: number
	/** Block duration after brute-force detected */
	bruteForceBlockDuration: number
}

const defaultSecurityConfig: SecurityConfig = {
	enableRateLimit: true,
	rateLimitMax: 60, // 60 requests per minute
	rateLimitWindow: 60000, // 1 minute
	rateLimitBlockDuration: 300000, // 5 minutes

	enableBlacklist: true,
	blacklistDuration: 0, // Permanent by default

	enableBruteForce: true,
	maxFailedAttempts: 10, // 10 failed attempts
	failedAttemptsWindow: 300000, // 5 minutes
	bruteForceBlockDuration: 900000, // 15 minutes
}

/**
 * Security manager class
 */
export class SecurityManager {
	private config: SecurityConfig
	private rateLimitStore: Map<string, RateLimitRecord> = new Map()
	private blacklistStore: Map<string, BlacklistRecord> = new Map()
	private failedAttemptsStore: Map<string, FailedAttempt> = new Map()

	constructor(config: Partial<SecurityConfig> = {}) {
		this.config = { ...defaultSecurityConfig, ...config }

		// Cleanup interval (every 5 minutes)
		setInterval(() => this.cleanup(), 300000)
	}

	/**
	 * Get client IP from request
	 */
	getClientIP(req: { ip?: string; headers: Record<string, unknown> }): string {
		// Check X-Forwarded-For header (for reverse proxy)
		const forwarded = req.headers['x-forwarded-for']
		if (typeof forwarded === 'string') {
			return forwarded.split(',')[0].trim()
		}

		// Check X-Real-IP header
		const realIP = req.headers['x-real-ip']
		if (typeof realIP === 'string') {
			return realIP
		}

		// Fall back to req.ip
		return req.ip || 'unknown'
	}

	/**
	 * Check if IP is rate limited
	 */
	isRateLimited(ip: string): { limited: boolean; retryAfter?: number; remaining?: number } {
		if (!this.config.enableRateLimit) {
			return { limited: false }
		}

		const now = Date.now()
		const record = this.rateLimitStore.get(ip)

		// Check if currently blocked
		if (record?.blocked && record.blockedUntil && now < record.blockedUntil) {
			return {
				limited: true,
				retryAfter: Math.ceil((record.blockedUntil - now) / 1000),
			}
		}

		// Create new record or reset expired one
		if (!record || now > record.resetAt) {
			this.rateLimitStore.set(ip, {
				count: 1,
				resetAt: now + this.config.rateLimitWindow,
				blocked: false,
			})
			return {
				limited: false,
				remaining: this.config.rateLimitMax - 1,
			}
		}

		// Increment count
		record.count++

		// Check if limit exceeded
		if (record.count > this.config.rateLimitMax) {
			record.blocked = true
			record.blockedUntil = now + this.config.rateLimitBlockDuration

			// Auto-add to blacklist if repeatedly blocked
			if (this.config.enableBlacklist) {
				this.addToBlacklist(ip, 'Rate limit exceeded multiple times', now + 3600000) // 1 hour
			}

			return {
				limited: true,
				retryAfter: Math.ceil(this.config.rateLimitBlockDuration / 1000),
			}
		}

		return {
			limited: false,
			remaining: this.config.rateLimitMax - record.count,
		}
	}

	/**
	 * Check if IP is blacklisted
	 */
	isBlacklisted(ip: string): { blocked: boolean; reason?: string } {
		if (!this.config.enableBlacklist) {
			return { blocked: false }
		}

		const record = this.blacklistStore.get(ip)
		if (!record) {
			return { blocked: false }
		}

		// Check if temporary blacklist expired
		if (record.expiresAt && Date.now() > record.expiresAt) {
			this.blacklistStore.delete(ip)
			return { blocked: false }
		}

		return {
			blocked: true,
			reason: record.reason,
		}
	}

	/**
	 * Add IP to blacklist
	 */
	addToBlacklist(ip: string, reason: string, expiresAt?: number): void {
		this.blacklistStore.set(ip, {
			ip,
			reason,
			blockedAt: Date.now(),
			expiresAt: expiresAt || (this.config.blacklistDuration > 0 ? Date.now() + this.config.blacklistDuration : undefined),
		})
	}

	/**
	 * Remove IP from blacklist
	 */
	removeFromBlacklist(ip: string): boolean {
		return this.blacklistStore.delete(ip)
	}

	/**
	 * Record a failed verification attempt
	 */
	recordFailedAttempt(ip: string): { blocked: boolean; retryAfter?: number } {
		if (!this.config.enableBruteForce) {
			return { blocked: false }
		}

		const now = Date.now()
		const record = this.failedAttemptsStore.get(ip)

		// Create new record or reset expired one
		if (!record || now - record.firstAttemptAt > this.config.failedAttemptsWindow) {
			this.failedAttemptsStore.set(ip, {
				count: 1,
				firstAttemptAt: now,
				lastAttemptAt: now,
			})
			return { blocked: false }
		}

		// Update record
		record.count++
		record.lastAttemptAt = now

		// Check if brute-force threshold reached
		if (record.count >= this.config.maxFailedAttempts) {
			// Add to blacklist
			if (this.config.enableBlacklist) {
				this.addToBlacklist(ip, 'Brute-force attack detected', now + this.config.bruteForceBlockDuration)
			}

			// Clear failed attempts
			this.failedAttemptsStore.delete(ip)

			return {
				blocked: true,
				retryAfter: Math.ceil(this.config.bruteForceBlockDuration / 1000),
			}
		}

		return { blocked: false }
	}

	/**
	 * Record a successful verification (clear failed attempts)
	 */
	recordSuccessfulAttempt(ip: string): void {
		this.failedAttemptsStore.delete(ip)
	}

	/**
	 * Get security status for IP
	 */
	getStatus(ip: string): {
		rateLimited: boolean
		blacklisted: boolean
		failedAttempts: number
	} {
		const rateLimit = this.isRateLimited(ip)
		const blacklist = this.isBlacklisted(ip)
		const failedAttempts = this.failedAttemptsStore.get(ip)

		return {
			rateLimited: rateLimit.limited,
			blacklisted: blacklist.blocked,
			failedAttempts: failedAttempts?.count || 0,
		}
	}

	/**
	 * Get blacklist entries
	 */
	getBlacklist(): BlacklistRecord[] {
		return Array.from(this.blacklistStore.values())
	}

	/**
	 * Clear all stores (for testing)
	 */
	clear(): void {
		this.rateLimitStore.clear()
		this.blacklistStore.clear()
		this.failedAttemptsStore.clear()
	}

	/**
	 * Cleanup expired records
	 */
	private cleanup(): void {
		const now = Date.now()

		// Cleanup rate limit records
		for (const [ip, record] of this.rateLimitStore) {
			if (now > record.resetAt && (!record.blockedUntil || now > record.blockedUntil)) {
				this.rateLimitStore.delete(ip)
			}
		}

		// Cleanup blacklist
		for (const [ip, record] of this.blacklistStore) {
			if (record.expiresAt && now > record.expiresAt) {
				this.blacklistStore.delete(ip)
			}
		}

		// Cleanup failed attempts
		for (const [ip, record] of this.failedAttemptsStore) {
			if (now - record.firstAttemptAt > this.config.failedAttemptsWindow) {
				this.failedAttemptsStore.delete(ip)
			}
		}
	}

	/**
	 * Get security config
	 */
	getConfig(): SecurityConfig {
		return { ...this.config }
	}

	/**
	 * Update security config
	 */
	updateConfig(config: Partial<SecurityConfig>): void {
		this.config = { ...this.config, ...config }
	}
}

// Global security manager instance
export const securityManager = new SecurityManager()
