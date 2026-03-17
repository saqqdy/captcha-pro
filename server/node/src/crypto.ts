/**
 * AES-GCM encryption utilities for captcha server
 * Compatible with frontend Web Crypto API implementation
 *
 * Frontend format: base64(salt[16] + iv[12] + ciphertext[variable])
 * Note: Web Crypto API includes authTag at the end of ciphertext
 */

import * as crypto from 'node:crypto'

/**
 * Derive AES key from secret string using PBKDF2
 */
function deriveAesKey(secretKey: string, salt: Buffer): Buffer {
	return crypto.pbkdf2Sync(secretKey, salt, 100000, 32, 'sha256')
}

/**
 * AES-GCM encryption
 * Output format: base64(salt[16] + iv[12] + ciphertext + authTag[16])
 */
export function aesEncrypt(plaintext: string, secretKey: string): string {
	// Generate random salt (16 bytes) and IV (12 bytes)
	const salt = crypto.randomBytes(16)
	const iv = crypto.randomBytes(12)

	// Derive key
	const key = deriveAesKey(secretKey, salt)

	// Encrypt
	const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
	const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
	const authTag = cipher.getAuthTag()

	// Combine: salt + iv + ciphertext + authTag
	// This matches Web Crypto API output format
	const combined = Buffer.concat([salt, iv, encrypted, authTag])

	return combined.toString('base64')
}

/**
 * AES-GCM decryption
 * Input format: base64(salt[16] + iv[12] + ciphertext + authTag[16])
 */
export function aesDecrypt(ciphertext: string, secretKey: string): string {
	// Decode base64
	const combined = Buffer.from(ciphertext, 'base64')

	// Extract components
	const salt = combined.subarray(0, 16)
	const iv = combined.subarray(16, 28)
	// AuthTag is the last 16 bytes
	const authTag = combined.subarray(-16)
	// Ciphertext is everything between iv and authTag
	const encrypted = combined.subarray(28, -16)

	// Derive key
	const key = deriveAesKey(secretKey, salt)

	// Decrypt
	const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
	decipher.setAuthTag(authTag)

	try {
		const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
		return decrypted.toString('utf8')
	} catch {
		throw new Error('Decryption failed: invalid ciphertext or wrong key')
	}
}

/**
 * Generate encrypted captcha data
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
 * Decrypt and parse captcha data
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
	const decrypted = aesDecrypt(encryptedData, secretKey)
	return JSON.parse(decrypted)
}

/**
 * Validate timestamp
 */
export function validateTimestamp(timestamp: number, tolerance: number = 60000): boolean {
	const now = Date.now()
	return Math.abs(now - timestamp) <= tolerance
}
