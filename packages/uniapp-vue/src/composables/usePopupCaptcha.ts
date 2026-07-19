import type { BackendConfig } from '@captcha-pro/mp-shared'
/**
 * uni-app Popup Captcha Composable (Vue 3)
 *
 * Composes slider / click composable with popup visibility control.
 */
import { ref, type Ref } from 'vue'
import { useClickCaptcha, type UseClickCaptchaOptions, type UseClickCaptchaReturn } from './useClickCaptcha'
import { useSliderCaptcha, type UseSliderCaptchaOptions, type UseSliderCaptchaReturn } from './useSliderCaptcha'

export interface UsePopupCaptchaOptions {
	type?: 'slider' | 'click'
	sliderOptions?: Omit<UseSliderCaptchaOptions, 'onSuccess' | 'onFail' | 'onRefresh' | 'onError'>
	clickOptions?: Omit<UseClickCaptchaOptions, 'onSuccess' | 'onFail' | 'onRefresh' | 'onError'>
	onSuccess?: (data?: { verifiedAt: number }) => void
	onFail?: () => void
	onRefresh?: () => void
	onOpen?: () => void
	onClose?: () => void
	onError?: (err: Error) => void
}

export interface UsePopupCaptchaReturn {
	visible: Ref<boolean>
	show: () => void
	hide: () => void
	slider: UseSliderCaptchaReturn
	click: UseClickCaptchaReturn
}

export function usePopupCaptcha(config: BackendConfig, options: UsePopupCaptchaOptions = {}): UsePopupCaptchaReturn {
	const visible = ref(false)

	const show = (): void => {
		visible.value = true
		options.onOpen?.()
	}
	const hide = (): void => {
		visible.value = false
		options.onClose?.()
	}

	const onError = (err: Error): void => {
		options.onError?.(err)
	}

	const slider = useSliderCaptcha(config, {
		...options.sliderOptions,
		onSuccess: (data) => {
			options.onSuccess?.(data)
			hide()
		},
		onFail: options.onFail,
		onRefresh: options.onRefresh,
		onError,
	})

	const click = useClickCaptcha(config, {
		...options.clickOptions,
		onSuccess: (data) => {
			options.onSuccess?.(data)
			hide()
		},
		onFail: options.onFail,
		onRefresh: options.onRefresh,
		onError,
	})

	return {
		visible,
		show,
		hide,
		slider,
		click,
	}
}
