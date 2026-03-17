import { describe, expect, it } from 'vitest'
import {
	aesDecrypt,
	aesEncrypt,
	decryptCaptchaData,
	generateEncryptedData,
	generateNonce,
	random,
	randomString,
	validateTimestamp,
} from '../src/utils'

describe('Utils', () => {
	describe('random', () => {
		it('should generate random number in range', () => {
			for (let i = 0; i < 100; i++) {
				const result = random(1, 10)
				expect(result).toBeGreaterThanOrEqual(1)
				expect(result).toBeLessThanOrEqual(10)
			}
		})

		it('should return min when min equals max', () => {
			const result = random(5, 5)
			expect(result).toBe(5)
		})
	})

	describe('randomString', () => {
		it('should generate string of specified length', () => {
			const result = randomString(10)
			expect(result).toHaveLength(10)
		})

		it('should use custom character set', () => {
			const result = randomString(10, 'abc')
			expect(result).toHaveLength(10)
			expect(/^[abc]+$/.test(result)).toBeTruthy()
		})
	})

	describe('generateNonce', () => {
		it('should generate nonce with default length', () => {
			const result = generateNonce()
			expect(result).toHaveLength(16)
		})

		it('should generate nonce with custom length', () => {
			const result = generateNonce(32)
			expect(result).toHaveLength(32)
		})

		it('should generate unique nonces', () => {
			const nonce1 = generateNonce()
			const nonce2 = generateNonce()
			expect(nonce1).not.toBe(nonce2)
		})
	})

	describe('validateTimestamp', () => {
		it('should validate current timestamp', () => {
			const now = Date.now()
			expect(validateTimestamp(now)).toBeTruthy()
		})

		it('should reject expired timestamp', () => {
			const expired = Date.now() - 120000 // 2 minutes ago
			expect(validateTimestamp(expired)).toBeFalsy()
		})

		it('should accept timestamp within tolerance', () => {
			const nearFuture = Date.now() + 30000 // 30 seconds in future
			expect(validateTimestamp(nearFuture)).toBeTruthy()
		})

		it('should use custom tolerance', () => {
			const expired = Date.now() - 30000 // 30 seconds ago
			expect(validateTimestamp(expired, 60000)).toBeTruthy()
			expect(validateTimestamp(expired, 20000)).toBeFalsy()
		})
	})
})

describe('AES Encryption', () => {
	const secretKey = 'test-secret-key-for-aes-encryption'

	describe('aesEncrypt', () => {
		it('should encrypt plaintext string', async () => {
			const plaintext = 'Hello, World!'
			const encrypted = await aesEncrypt(plaintext, secretKey)

			expect(typeof encrypted).toBe('string')
			expect(encrypted.length).toBeGreaterThan(0)
			expect(encrypted).not.toBe(plaintext)
		})

		it('should generate different ciphertext for same plaintext', async () => {
			const plaintext = 'Hello, World!'
			const encrypted1 = await aesEncrypt(plaintext, secretKey)
			const encrypted2 = await aesEncrypt(plaintext, secretKey)

			// Different due to random salt and IV
			expect(encrypted1).not.toBe(encrypted2)
		})

		it('should produce base64 encoded output', async () => {
			const plaintext = 'Test data'
			const encrypted = await aesEncrypt(plaintext, secretKey)

			// Should be valid base64
			expect(() => atob(encrypted)).not.toThrow()
		})
	})

	describe('aesDecrypt', () => {
		it('should decrypt encrypted data correctly', async () => {
			const plaintext = 'Hello, World!'
			const encrypted = await aesEncrypt(plaintext, secretKey)
			const decrypted = await aesDecrypt(encrypted, secretKey)

			expect(decrypted).toBe(plaintext)
		})

		it('should fail with wrong secret key', async () => {
			const plaintext = 'Hello, World!'
			const encrypted = await aesEncrypt(plaintext, secretKey)

			await expect(aesDecrypt(encrypted, 'wrong-secret-key')).rejects.toThrow()
		})

		it('should handle complex data', async () => {
			const data = {
				type: 'slider',
				target: [123, 45],
				timestamp: Date.now(),
				nonce: generateNonce(),
			}
			const plaintext = JSON.stringify(data)
			const encrypted = await aesEncrypt(plaintext, secretKey)
			const decrypted = await aesDecrypt(encrypted, secretKey)

			expect(JSON.parse(decrypted)).toEqual(data)
		})

		it('should fail with invalid ciphertext', async () => {
			await expect(aesDecrypt('invalid-base64!!', secretKey)).rejects.toThrow()
		})
	})

	describe('generateEncryptedData', () => {
		it('should generate encrypted captcha data for slider', async () => {
			const type = 'slider'
			const target = [123]
			const timestamp = Date.now()
			const nonce = generateNonce()

			const encrypted = await generateEncryptedData(type, target, timestamp, nonce, secretKey)

			expect(typeof encrypted).toBe('string')
			expect(encrypted.length).toBeGreaterThan(0)
		})

		it('should generate encrypted captcha data for click', async () => {
			const type = 'click'
			const target = [{ x: 100, y: 50 }, { x: 150, y: 80 }]
			const timestamp = Date.now()
			const nonce = generateNonce()

			const encrypted = await generateEncryptedData(type, target, timestamp, nonce, secretKey)

			expect(typeof encrypted).toBe('string')
			expect(encrypted.length).toBeGreaterThan(0)
		})
	})

	describe('decryptCaptchaData', () => {
		it('should decrypt and parse captcha data for slider', async () => {
			const type = 'slider'
			const target = [123]
			const timestamp = Date.now()
			const nonce = generateNonce()

			const encrypted = await generateEncryptedData(type, target, timestamp, nonce, secretKey)
			const decrypted = await decryptCaptchaData(encrypted, secretKey)

			expect(decrypted.type).toBe(type)
			expect(decrypted.target).toEqual(target)
			expect(decrypted.timestamp).toBe(timestamp)
			expect(decrypted.nonce).toBe(nonce)
		})

		it('should decrypt and parse captcha data for click', async () => {
			const type = 'click'
			const target = [{ x: 100, y: 50 }, { x: 150, y: 80 }, { x: 200, y: 100 }]
			const timestamp = Date.now()
			const nonce = generateNonce()

			const encrypted = await generateEncryptedData(type, target, timestamp, nonce, secretKey)
			const decrypted = await decryptCaptchaData(encrypted, secretKey)

			expect(decrypted.type).toBe(type)
			expect(decrypted.target).toEqual(target)
			expect(decrypted.timestamp).toBe(timestamp)
			expect(decrypted.nonce).toBe(nonce)
		})

		it('should fail with wrong secret key', async () => {
			const type = 'slider'
			const target = [123]
			const timestamp = Date.now()
			const nonce = generateNonce()

			const encrypted = await generateEncryptedData(type, target, timestamp, nonce, secretKey)

			await expect(decryptCaptchaData(encrypted, 'wrong-secret-key')).rejects.toThrow()
		})
	})

	describe('round-trip encryption', () => {
		it('should maintain data integrity through encrypt/decrypt cycle', async () => {
			const testData = [
				{ type: 'slider', target: [0] },
				{ type: 'slider', target: [300] },
				{ type: 'slider', target: [150] },
				{ type: 'click', target: [{ x: 10, y: 20 }] },
				{ type: 'click', target: [{ x: 0, y: 0 }, { x: 300, y: 170 }] },
				{ type: 'click', target: [{ x: 100, y: 50 }, { x: 150, y: 80 }, { x: 200, y: 100 }] },
			]

			for (const { type, target } of testData) {
				const timestamp = Date.now()
				const nonce = generateNonce()

				const encrypted = await generateEncryptedData(type, target, timestamp, nonce, secretKey)
				const decrypted = await decryptCaptchaData(encrypted, secretKey)

				expect(decrypted.type).toBe(type)
				expect(decrypted.target).toEqual(target)
				expect(decrypted.timestamp).toBe(timestamp)
				expect(decrypted.nonce).toBe(nonce)
			}
		})
	})
})
