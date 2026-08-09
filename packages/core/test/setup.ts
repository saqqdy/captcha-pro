// Test setup file for vitest
import { webcrypto } from 'node:crypto'
import { vi } from 'vitest'

// Polyfill Web Crypto API: happy-dom's window.crypto lacks crypto.subtle,
// so provide Node's WebCrypto for AES-GCM/PBKDF2 encryption tests.
Object.defineProperty(window, 'crypto', { value: webcrypto, configurable: true, writable: true })


// Mock canvas gradient
const mockGradient = {
	addColorStop: vi.fn(),
}

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
	arc: vi.fn(),
	beginPath: vi.fn(),
	clearRect: vi.fn(),
	clip: vi.fn(),
	closePath: vi.fn(),
	createLinearGradient: vi.fn(() => mockGradient),
	createRadialGradient: vi.fn(() => mockGradient),
	drawImage: vi.fn(),
	fill: vi.fn(),
	fillRect: vi.fn(),
	fillText: vi.fn(),
	getImageData: vi.fn(() => ({
		data: new Uint8ClampedArray(100),
		height: 10,
		width: 10,
	})),
	globalCompositeOperation: 'source-over',
	lineTo: vi.fn(),
	measureText: vi.fn(() => ({ width: 20 })),
	moveTo: vi.fn(),
	putImageData: vi.fn(),
	quadraticCurveTo: vi.fn(),
	restore: vi.fn(),
	rotate: vi.fn(),
	save: vi.fn(),
	stroke: vi.fn(),
	strokeStyle: '',
	strokeText: vi.fn(),
	translate: vi.fn(),
})) as any

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock')

// Mock getBoundingClientRect
HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
	bottom: 155,
	height: 155,
	left: 0,
	right: 280,
	toJSON: () => ({}),
	top: 0,
	width: 280,
	x: 0,
	y: 0,
})) as any
