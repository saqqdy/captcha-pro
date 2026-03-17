/**
 * Captcha types
 */
export type CaptchaType = 'slider' | 'click'

/**
 * Point coordinate
 */
export interface Point {
  x: number
  y: number
}

/**
 * Captcha data stored in cache
 */
export interface CaptchaCache {
  id: string
  type: CaptchaType
  target: number[] | Point[]
  clickTexts?: string[]
  createdAt: number
  expiresAt: number
}

/**
 * Captcha generation options
 */
export interface CaptchaGenerateOptions {
  type?: CaptchaType
  width?: number
  height?: number
  sliderWidth?: number
  sliderHeight?: number
  precision?: number
  clickCount?: number
  clickText?: string
}

/**
 * Captcha response for frontend
 */
export interface CaptchaResponse {
  captchaId: string
  type: CaptchaType
  bgImage: string
  sliderImage?: string
  clickTexts?: string[]
  width: number
  height: number
  expiresAt: number
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

/**
 * Captcha generation result
 */
export interface CaptchaGenerateResult {
  cache: CaptchaCache
  response: CaptchaResponse
}

/**
 * Verify request from frontend
 */
export interface VerifyRequest {
  captchaId: string
  type: CaptchaType
  target: number[] | Point[]
  timestamp?: number
  signature?: string
  nonce?: string
}

/**
 * Verify response data
 */
export interface VerifyData {
  verifiedAt: number
}

/**
 * Verify response
 */
export interface VerifyResponse {
  success: boolean
  message?: string
  data?: VerifyData
}

/**
 * Server configuration
 */
export interface ServerConfig {
  port?: number
  host?: string
  secretKey?: string
  expireTime?: number
  timestampTolerance?: number
}

/**
 * Cache store interface
 */
export interface CacheStore {
  get: (key: string) => Promise<CaptchaCache | null>
  set: (key: string, value: CaptchaCache, ttl: number) => Promise<void>
  delete: (key: string) => Promise<void>
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: number
  cacheSize: number
}

/**
 * Server info response
 */
export interface ServerInfoResponse {
  name: string
  version: string
  description: string
  supportedTypes: CaptchaType[]
  features: string[]
  config: {
    expireTime: number
    timestampTolerance: number
    security: SecurityConfig
  }
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

/**
 * Security status response
 */
export interface SecurityStatusResponse {
  ip: string
  rateLimited: boolean
  blacklisted: boolean
  failedAttempts: number
}

/**
 * Blacklist entry
 */
export interface BlacklistEntry {
  ip: string
  reason: string
  blockedAt: number
  expiresAt?: number
}

/**
 * Blacklist request
 */
export interface BlacklistRequest {
  ip: string
  reason?: string
  duration?: number
}
