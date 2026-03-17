/**
 * Memory cache store for captcha data
 */
import type { CaptchaCache } from './types'

export class MemoryCache {
	private store: Map<string, CaptchaCache> = new Map()
	private timers: Map<string, ReturnType<typeof setTimeout>> = new Map()

	/**
	 * Get captcha data by ID
	 */
	get(key: string): CaptchaCache | null {
		return this.store.get(key) || null
	}

	/**
	 * Set captcha data with TTL
	 */
	set(key: string, value: CaptchaCache, ttl: number): void {
		// Clear existing timer if any
		if (this.timers.has(key)) {
			clearTimeout(this.timers.get(key)!)
		}

		// Store value
		this.store.set(key, value)

		// Set auto-expire timer
		const timer = setTimeout(() => {
			this.delete(key)
		}, ttl)
		this.timers.set(key, timer)
	}

	/**
	 * Delete captcha data
	 */
	delete(key: string): void {
		this.store.delete(key)
		if (this.timers.has(key)) {
			clearTimeout(this.timers.get(key)!)
			this.timers.delete(key)
		}
	}

	/**
	 * Check if key exists
	 */
	has(key: string): boolean {
		return this.store.has(key)
	}

	/**
	 * Clear all cache
	 */
	clear(): void {
		for (const timer of this.timers.values()) {
			clearTimeout(timer)
		}
		this.store.clear()
		this.timers.clear()
	}

	/**
	 * Get cache size
	 */
	get size(): number {
		return this.store.size
	}
}

// Global cache instance
export const captchaCache = new MemoryCache()
