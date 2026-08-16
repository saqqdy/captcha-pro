import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useClickCaptcha } from '../src/hooks/useClickCaptcha'
import { useSliderCaptcha } from '../src/hooks/useSliderCaptcha'

// Enable React's act() environment so effect flushes are tracked.
;

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

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

// Tracks mounted roots so every test tears down its React tree.
const roots: Array<{ root: ReturnType<typeof createRoot>; container: HTMLElement }> = []

// Renders a hook by mounting a probe component that attaches the hook's
// containerRef to a real DOM node, so the hook's mount effect runs.
function renderHook<T>(useHook: () => T): { result: { current: T }; unmount: () => void } {
	const container = document.createElement('div')
	document.body.appendChild(container)
	const root = createRoot(container)
	const result = { current: undefined as T }
	function Probe(): ReactNode {
		result.current = useHook()
		const ref = (result.current as any).containerRef
		return <div ref={ref} />
	}
	act(() => {
		root.render(<Probe />)
	})
	roots.push({ root, container })
	return {
		result,
		unmount: () => act(() => root.unmount()),
	}
}

beforeEach(() => {
	mocks.instances.length = 0
})

afterEach(() => {
	while (roots.length) {
		const { root, container } = roots.pop()!
		act(() => root.unmount())
		container.remove()
	}
})

describe('package exports', () => {
	it('exports components, hooks, version, and core re-exports', async () => {
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
		const { result } = renderHook(() => useClickCaptcha({ width: 250, count: 5 }))
		expect(mocks.instances).toHaveLength(1)
		expect(mocks.instances[0].options.el).toBeInstanceOf(HTMLElement)
		expect(mocks.instances[0].options.width).toBe(250)
		expect(mocks.instances[0].options.count).toBe(5)
		// React useRef does not proxy, so identity holds.
		expect(result.current.getInstance()).toBe(mocks.instances[0])
	})

	it('forwards callbacks and updates status', () => {
		const onSuccess = vi.fn()
		const onFail = vi.fn()
		const onRefresh = vi.fn()
		const { result } = renderHook(() =>
			useClickCaptcha({ onSuccess, onFail, onRefresh, locale: 'en-US' }),
		)
		act(() => mocks.instances[0].options.onSuccess())
		expect(onSuccess).toHaveBeenCalledTimes(1)
		expect(result.current.status).toBe('success')
		expect(result.current.statusText).toBe('Success')
		act(() => mocks.instances[0].options.onFail())
		expect(result.current.status).toBe('fail')
		expect(result.current.statusText).toBe('Failed')
		act(() => mocks.instances[0].options.onRefresh())
		expect(result.current.status).toBe('')
	})

	it('delegates refresh/getData/getStatistics to the core instance', () => {
		const { result } = renderHook(() => useClickCaptcha({}))
		// The hook's [bgImage] effect auto-refreshes once on mount, so assert
		// an increment over the baseline rather than an absolute count.
		const refreshBefore = mocks.instances[0].refresh.mock.calls.length
		act(() => result.current.refresh())
		expect(mocks.instances[0].refresh.mock.calls.length).toBe(refreshBefore + 1)
		result.current.getData()
		expect(mocks.instances[0].getData).toHaveBeenCalledTimes(1)
		result.current.getStatistics()
		expect(mocks.instances[0].getStatistics).toHaveBeenCalledTimes(1)
	})

	it('destroys the core instance on unmount', () => {
		const { result, unmount } = renderHook(() => useClickCaptcha({}))
		unmount()
		expect(mocks.instances[0].destroy).toHaveBeenCalledTimes(1)
		expect(result.current.getInstance()).toBeNull()
	})
})

describe('useSliderCaptcha', () => {
	it('creates a core instance and forwards slider-specific options', () => {
		const { result } = renderHook(() => useSliderCaptcha({ sliderWidth: 50, precision: 3 }))
		expect(mocks.instances).toHaveLength(1)
		expect(mocks.instances[0].options.sliderWidth).toBe(50)
		expect(mocks.instances[0].options.precision).toBe(3)
		expect(result.current.getInstance()).toBe(mocks.instances[0])
	})

	it('delegates methods and destroys on unmount', () => {
		const { result, unmount } = renderHook(() => useSliderCaptcha({}))
		// Slider's [bgImage, sliderImage] effect also auto-refreshes on mount.
		const refreshBefore = mocks.instances[0].refresh.mock.calls.length
		act(() => result.current.refresh())
		expect(mocks.instances[0].refresh.mock.calls.length).toBe(refreshBefore + 1)
		unmount()
		expect(mocks.instances[0].destroy).toHaveBeenCalledTimes(1)
		expect(result.current.getInstance()).toBeNull()
	})
})
