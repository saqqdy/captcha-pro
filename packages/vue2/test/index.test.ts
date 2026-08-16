import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Vue from 'vue'
import { clickCaptchaMixin } from '../src/mixins/clickCaptcha'
import { sliderCaptchaMixin } from '../src/mixins/sliderCaptcha'

// Shared mock-state for the most recently constructed core captcha instance.
// Hoisted so the vi.mock factories (which run at module load) can reference it.
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

// Stub the .vue SFC components so importing src/index.js (which pulls them
// in) does not require a Vue SFC compiler. The components are thin templates
// that delegate to the mixins; their rendering is out of scope here.
vi.mock('../src/components/ClickCaptcha.vue', () => ({ default: { name: 'ClickCaptchaStub' } }))
vi.mock('../src/components/PopupCaptcha.vue', () => ({ default: { name: 'PopupCaptchaStub' } }))
vi.mock('../src/components/SliderCaptcha.vue', () => ({ default: { name: 'SliderCaptchaStub' } }))

// Tracks mounted vms so every test tears down its Vue 2 instance.
const mounted: Array<{ vm: Vue; el: HTMLElement }> = []

// Mounts a Vue 2 root instance with the given mixin + propsData. Uses a
// render function with ref="containerRef" so the mixin's mounted() finds
// $refs.containerRef — no template compiler required.
function mountMixin(mixin: any, propsData: Record<string, any> = {}) {
	const el = document.createElement('div')
	document.body.appendChild(el)
	const vm = new Vue({
		mixins: [mixin],
		propsData,
		render: (h: any) => h('div', { ref: 'containerRef' }),
	}).$mount(el)
	mounted.push({ vm, el })
	return { vm, unmount: () => vm.$destroy() }
}

beforeEach(() => {
	mocks.instances.length = 0
})

afterEach(() => {
	while (mounted.length) {
		const { vm, el } = mounted.pop()!
		vm.$destroy()
		el.remove()
	}
})

describe('package exports', () => {
	it('exports components, mixins, version, CaptchaPro, and core re-exports', async () => {
		const mod = await import('../src')
		expect(mod.ClickCaptcha).toBeDefined()
		expect(mod.PopupCaptcha).toBeDefined()
		expect(mod.SliderCaptcha).toBeDefined()
		expect(typeof mod.clickCaptchaMixin).toBe('object')
		expect(typeof mod.sliderCaptchaMixin).toBe('object')
		expect(typeof mod.version).toBe('string')
		expect(typeof mod.CaptchaPro).toBe('object')
		expect(typeof mod.CaptchaPro.install).toBe('function')
		expect(typeof mod.createClickCaptcha).toBe('function')
	})

	it('CaptchaPro.install registers the components on a Vue constructor', async () => {
		const { CaptchaPro } = await import('../src')
		const registered: string[] = []
		const FakeVue = { component: (name: string) => registered.push(name) }
		;(CaptchaPro as any).install(FakeVue)
		expect(registered).toEqual(
			expect.arrayContaining(['ClickCaptcha', 'PopupCaptcha', 'SliderCaptcha']),
		)
	})
})

describe('clickCaptchaMixin', () => {
	it('creates a core instance on mount with el and options wired through', () => {
		const { vm } = mountMixin(clickCaptchaMixin, { width: 250, count: 5 })
		expect(mocks.instances).toHaveLength(1)
		expect(mocks.instances[0].options.el).toBe(vm.$refs.containerRef)
		expect(mocks.instances[0].options.width).toBe(250)
		expect(mocks.instances[0].options.count).toBe(5)
	})

	it('forwards callbacks, updates status, and emits events', () => {
		const onSuccess = vi.fn()
		const onFail = vi.fn()
		const onRefresh = vi.fn()
		const { vm } = mountMixin(clickCaptchaMixin, { locale: 'en-US' })
		vm.$on('success', onSuccess)
		vm.$on('fail', onFail)
		vm.$on('refresh', onRefresh)

		mocks.instances[0].options.onSuccess()
		expect(onSuccess).toHaveBeenCalledTimes(1)
		expect(vm.status).toBe('success')
		expect(vm.statusText).toBe('Success')

		mocks.instances[0].options.onFail()
		expect(onFail).toHaveBeenCalledTimes(1)
		expect(vm.status).toBe('fail')
		expect(vm.statusText).toBe('Failed')

		mocks.instances[0].options.onRefresh()
		expect(onRefresh).toHaveBeenCalledTimes(1)
		expect(vm.status).toBe('')
	})

	it('delegates refresh/getData/getStatistics to the core instance', () => {
		const { vm } = mountMixin(clickCaptchaMixin)
		// Vue 2 watchers are not immediate, so no auto-refresh on mount.
		vm.refresh()
		expect(mocks.instances[0].refresh).toHaveBeenCalledTimes(1)
		vm.getData()
		expect(mocks.instances[0].getData).toHaveBeenCalledTimes(1)
		vm.getStatistics()
		expect(mocks.instances[0].getStatistics).toHaveBeenCalledTimes(1)
	})

	it('destroys the core instance on $destroy', () => {
		const { vm, unmount } = mountMixin(clickCaptchaMixin)
		unmount()
		expect(mocks.instances[0].destroy).toHaveBeenCalledTimes(1)
		expect(vm.captchaInstance).toBeNull()
	})
})

describe('sliderCaptchaMixin', () => {
	it('creates a core instance and forwards slider-specific options', () => {
		const { vm } = mountMixin(sliderCaptchaMixin, { sliderWidth: 50, precision: 3 })
		expect(mocks.instances).toHaveLength(1)
		expect(mocks.instances[0].options.el).toBe(vm.$refs.containerRef)
		expect(mocks.instances[0].options.sliderWidth).toBe(50)
		expect(mocks.instances[0].options.precision).toBe(3)
	})

	it('delegates methods and destroys on $destroy', () => {
		const { vm, unmount } = mountMixin(sliderCaptchaMixin)
		vm.refresh()
		expect(mocks.instances[0].refresh).toHaveBeenCalledTimes(1)
		unmount()
		expect(mocks.instances[0].destroy).toHaveBeenCalledTimes(1)
		expect(vm.captchaInstance).toBeNull()
	})
})
