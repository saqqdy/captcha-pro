import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type App, createApp, h } from 'vue'
import { useClickCaptcha } from '../src/composables/useClickCaptcha'
import { useSliderCaptcha } from '../src/composables/useSliderCaptcha'

// Shared mock-state for the most recently constructed core captcha instance.
// Hoisted so the vi.mock factory (which runs at module load) can reference it.
const mocks = vi.hoisted(() => ({ instances: [] as any[] }))

// Mock only the captcha classes from @captcha-pro/core; everything else
// (types, createClickCaptcha, ...) passes through unchanged. We test the
// framework adapter's wiring — core's behaviour is covered by its own suite.
vi.mock('@captcha-pro/core', async (importOriginal) => {
	const actual = (await importOriginal()) as any
	class MockCaptcha {
		options: any
		refresh = vi.fn()
		getData = vi.fn()
		getStatistics = vi.fn()
		destroy = vi.fn()
		constructor(options: any) {
			this.options = options
			mocks.instances.push(this)
		}
	}
	return { ...actual, ClickCaptcha: MockCaptcha, SliderCaptcha: MockCaptcha }
})

// Tracks mounted apps so every test tears down its Vue instance tree.
const mounted: Array<{ app: App; host: HTMLElement; el: HTMLElement }> = []

function withSetup<T>(factory: (el: HTMLElement) => T) {
	const host = document.createElement('div')
	document.body.appendChild(host)
	const el = document.createElement('div')
	document.body.appendChild(el)
	let result!: T
	const app = createApp({
		setup() {
			result = factory(el)
			return () => h('div')
		},
	})
	app.mount(host)
	mounted.push({ app, host, el })
	return { result, el, unmount: () => app.unmount() }
}

beforeEach(() => {
	mocks.instances.length = 0
})

afterEach(() => {
	while (mounted.length) {
		const { app, host, el } = mounted.pop()!
		app.unmount()
		host.remove()
		el.remove()
	}
})

describe('package exports', () => {
	it('exports components, composables, version, and core re-exports', async () => {
		const mod = await import('../src')
		expect(mod.ClickCaptcha).toBeDefined()
		expect(mod.PopupCaptcha).toBeDefined()
		expect(mod.SliderCaptcha).toBeDefined()
		expect(typeof mod.useClickCaptcha).toBe('function')
		expect(typeof mod.useSliderCaptcha).toBe('function')
		expect(typeof mod.version).toBe('string')
		expect(typeof mod.createClickCaptcha).toBe('function')
	})
})

describe('useClickCaptcha', () => {
	it('creates a core instance on mount with el and options wired through', () => {
		const { result, el } = withSetup((el) =>
			useClickCaptcha({ el: () => el, width: 250, count: 5 }),
		)
		// ref() wraps the instance in a reactive proxy, so assert via the raw
		// captured instance rather than identity with instance.value.
		expect(result.isReady.value).toBe(true)
		expect(mocks.instances).toHaveLength(1)
		expect(mocks.instances[0].options.el).toBe(el)
		expect(mocks.instances[0].options.width).toBe(250)
		expect(mocks.instances[0].options.count).toBe(5)
	})

	it('forwards onSuccess/onFail/onRefresh callbacks to core options', () => {
		const onSuccess = vi.fn()
		const onFail = vi.fn()
		const onRefresh = vi.fn()
		withSetup((el) => useClickCaptcha({ el: () => el, onSuccess, onFail, onRefresh }))
		mocks.instances[0].options.onSuccess()
		expect(onSuccess).toHaveBeenCalledTimes(1)
		mocks.instances[0].options.onFail()
		expect(onFail).toHaveBeenCalledTimes(1)
		mocks.instances[0].options.onRefresh()
		expect(onRefresh).toHaveBeenCalledTimes(1)
	})

	it('delegates refresh/getData/getStatistics to the core instance', () => {
		const { result } = withSetup((el) => useClickCaptcha({ el: () => el }))
		result.refresh()
		expect(mocks.instances[0].refresh).toHaveBeenCalledTimes(1)
		result.getData()
		expect(mocks.instances[0].getData).toHaveBeenCalledTimes(1)
		result.getStatistics()
		expect(mocks.instances[0].getStatistics).toHaveBeenCalledTimes(1)
	})

	it('destroys the core instance on unmount', () => {
		const { result, unmount } = withSetup((el) => useClickCaptcha({ el: () => el }))
		unmount()
		expect(mocks.instances[0].destroy).toHaveBeenCalledTimes(1)
		expect(result.instance.value).toBeNull()
	})
})

describe('useSliderCaptcha', () => {
	it('creates a core instance and forwards slider-specific options', () => {
		const { result, el } = withSetup((el) =>
			useSliderCaptcha({ el: () => el, sliderWidth: 50, precision: 3 }),
		)
		expect(result.isReady.value).toBe(true)
		expect(mocks.instances).toHaveLength(1)
		expect(mocks.instances[0].options.el).toBe(el)
		expect(mocks.instances[0].options.sliderWidth).toBe(50)
		expect(mocks.instances[0].options.precision).toBe(3)
	})

	it('delegates methods and destroys on unmount', () => {
		const { result, unmount } = withSetup((el) => useSliderCaptcha({ el: () => el }))
		result.refresh()
		expect(mocks.instances[0].refresh).toHaveBeenCalledTimes(1)
		unmount()
		expect(mocks.instances[0].destroy).toHaveBeenCalledTimes(1)
		expect(result.instance.value).toBeNull()
	})
})
