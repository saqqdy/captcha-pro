import type { BackendConfig, CaptchaState, Point } from '@captcha-pro/mp-shared'
import { createInitialCaptchaState, DEFAULT_CLICK_COUNT, DEFAULT_HEIGHT, DEFAULT_WIDTH, resetCaptcha, verifyClick } from '@captcha-pro/mp-shared'
/**
 * uni-app Click Captcha Composable (Vue 3)
 */
import { onMounted, reactive, ref, type Ref, toRefs, type ToRefs } from 'vue'
import { fetchCaptcha, verifyCaptcha } from '../request'

export interface UseClickCaptchaOptions {
	width?: number
	height?: number
	clickCount?: number
	onSuccess?: (data?: { verifiedAt: number }) => void
	onFail?: () => void
	onRefresh?: () => void
	onError?: (err: Error) => void
}

export interface UseClickCaptchaReturn extends ToRefs<CaptchaState> {
	clickPoints: Ref<Point[]>
	clickTexts: Ref<string[]>
	clickCharImages: Ref<string[]>
	setClickTexts: (v: string[]) => void
	setClickCharImages: (v: string[]) => void
	rpxToPx: (rpx: number) => number
	widthPx: number
	heightPx: number
	refresh: () => void
	addClickPoint: (point: Point) => void
	verify: () => void
}

export function useClickCaptcha(config: BackendConfig, options: UseClickCaptchaOptions = {}): UseClickCaptchaReturn {
	const state = reactive<CaptchaState>(createInitialCaptchaState())
	const clickPoints = ref<Point[]>([])
	const clickTexts = ref<string[]>([])
	const clickCharImages = ref<string[]>([])

	const rpxToPx = (rpx: number): number => {
		const systemInfo = uni.getSystemInfoSync()
		return Math.floor(rpx * systemInfo.screenWidth / 750)
	}

	const widthPx = rpxToPx(options.width ?? DEFAULT_WIDTH)
	const heightPx = rpxToPx(options.height ?? DEFAULT_HEIGHT)

	const refresh = (): void => {
		resetCaptcha(state)
		clickPoints.value = []
		clickTexts.value = []
		clickCharImages.value = []

		// Single fetch: populate shared state + click-specific metadata
		state.loading = true
		state.errorMsg = ''
		state.status = ''
		state.sliderX = 0

		fetchCaptcha(config, {
			type: 'click',
			width: widthPx,
			height: heightPx,
			clickCount: options.clickCount ?? DEFAULT_CLICK_COUNT,
		})
			.then((res) => {
				if (!res.success || !res.data) throw new Error(res.message || 'Failed to get captcha')
				state.captchaId = res.data.captchaId
				state.bgImage = res.data.bgImage
				state.sliderImage = res.data.sliderImage ?? ''
				state.sliderY = res.data.sliderY ?? 0
				clickTexts.value = res.data.clickTexts ?? []
				clickCharImages.value = res.data.clickCharImages ?? []
			})
			.catch((err: unknown) => {
				const error = err instanceof Error ? err : new Error(String(err))
				state.errorMsg = error.message
				options.onError?.(error)
			})
			.finally(() => {
				state.loading = false
			})
	}

	const addClickPoint = (point: Point): void => {
		const max = options.clickCount ?? DEFAULT_CLICK_COUNT
		if (clickPoints.value.length >= max) return
		clickPoints.value = [...clickPoints.value, point]
	}

	const verify = (): void => {
		verifyClick(
			state,
			config,
			clickPoints.value,
			verifyCaptcha,
			options.onSuccess,
			options.onFail,
			() => {
				refresh()
				options.onRefresh?.()
			},
			options.onError,
		)
	}

	onMounted(() => {
		refresh()
	})

	return {
		...toRefs(state),
		clickPoints,
		clickTexts,
		clickCharImages,
		setClickTexts: (v: string[]) => { clickTexts.value = v },
		setClickCharImages: (v: string[]) => { clickCharImages.value = v },
		rpxToPx,
		widthPx,
		heightPx,
		refresh,
		addClickPoint,
		verify,
	}
}
