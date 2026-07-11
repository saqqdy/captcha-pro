import type { BackendConfig, CaptchaState } from '@captcha-pro/mp-shared'
import { createInitialCaptchaState, DEFAULT_HEIGHT, DEFAULT_SLIDER_HEIGHT, DEFAULT_SLIDER_WIDTH, DEFAULT_WIDTH, loadCaptcha, resetCaptcha, verifySlider  } from '@captcha-pro/mp-shared'
import Taro from '@tarojs/taro'
/**
 * Taro Slider Captcha Composable (Vue 3)
 *
 * 基于 shared/captcha-logic.ts 的状态管理，
 * 触摸交互由组件层（MovableView）处理。
 */
import { onMounted, reactive, toRefs, type ToRefs } from 'vue'
import { fetchCaptcha, verifyCaptcha } from '../request'

export interface UseSliderCaptchaOptions {
	width?: number
	height?: number
	sliderWidth?: number
	sliderHeight?: number
	onSuccess?: (data?: { verifiedAt: number }) => void
	onFail?: () => void
	onRefresh?: () => void
	onError?: (err: Error) => void
}

export interface UseSliderCaptchaReturn extends ToRefs<CaptchaState> {
	rpxToPx: (rpx: number) => number
	widthPx: number
	heightPx: number
	refresh: () => void
	handleSliderChange: (x: number) => void
	handleSliderEnd: () => void
}

export function useSliderCaptcha(config: BackendConfig, options: UseSliderCaptchaOptions = {}): UseSliderCaptchaReturn {
	const state = reactive<CaptchaState>(createInitialCaptchaState())

	const width = options.width ?? DEFAULT_WIDTH
	const height = options.height ?? DEFAULT_HEIGHT

	const rpxToPx = (rpx: number): number => {
		return Math.floor(rpx * Taro.getWindowInfo().screenWidth / 750)
	}

	const widthPx = rpxToPx(width)
	const heightPx = rpxToPx(height)

	const refresh = (): void => {
		resetCaptcha(state)
		loadCaptcha(
			state,
			config,
			{
				type: 'slider',
				width: widthPx,
				height: heightPx,
				sliderWidth: rpxToPx(options.sliderWidth ?? DEFAULT_SLIDER_WIDTH),
				sliderHeight: rpxToPx(options.sliderHeight ?? DEFAULT_SLIDER_HEIGHT),
			},
			fetchCaptcha,
			options.onError,
		)
	}

	const handleSliderChange = (x: number): void => {
		state.sliderX = x
	}

	const handleSliderEnd = (): void => {
		verifySlider(
			state,
			config,
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

	onMounted(refresh)

	return {
		...toRefs(state),
		rpxToPx,
		widthPx,
		heightPx,
		refresh,
		handleSliderChange,
		handleSliderEnd,
	}
}
