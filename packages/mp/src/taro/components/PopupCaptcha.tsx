import type { FC, Ref } from 'react'
import type { ClickCaptchaProps, PopupCaptchaProps, PopupCaptchaRef, SliderCaptchaProps } from '../types'
import { Text, View } from '@tarojs/components'
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import ClickCaptcha from './ClickCaptcha'
import SliderCaptcha from './SliderCaptcha'
import '../styles/captcha.scss'

const EMPTY_OPTS: Record<string, unknown> = {}

const PopupCaptcha: FC<PopupCaptchaProps & { ref?: Ref<PopupCaptchaRef> }> = forwardRef<PopupCaptchaRef, PopupCaptchaProps>(({
	type = 'slider',
	title = '安全验证',
	maskClosable = true,
	showClose = true,
	autoClose = true,
	closeDelay = 500,
	sliderOptions = EMPTY_OPTS as SliderCaptchaProps,
	clickOptions = EMPTY_OPTS as ClickCaptchaProps,
	backend,
	onSuccess,
	onFail,
	onOpen,
	onClose,
}, ref) => {
	const [visible, setVisible] = useState(false)

	const show = useCallback(() => {
		setVisible(true)
		onOpen?.()
	}, [onOpen])

	const hide = useCallback(() => {
		setVisible(false)
		onClose?.()
	}, [onClose])

	const isVisible = useCallback(() => visible, [visible])

	const handleMaskClick = useCallback(() => {
		if (maskClosable) hide()
	}, [maskClosable, hide])

	const handleSuccess = useCallback((data?: { verifiedAt: number }) => {
		onSuccess?.(data)
		if (autoClose) setTimeout(hide, closeDelay)
	}, [onSuccess, autoClose, closeDelay, hide])

	const handleFail = useCallback(() => {
		onFail?.()
	}, [onFail])

	useImperativeHandle(ref, () => ({
		show,
		hide,
		isVisible,
	}))

	if (!visible) return null

	const sliderProps: SliderCaptchaProps = { ...sliderOptions, backend, onSuccess: handleSuccess, onFail: handleFail }
	const clickProps: ClickCaptchaProps = { ...clickOptions, backend, onSuccess: handleSuccess, onFail: handleFail }

	return (
		<View className="popup-captcha" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			{/* Mask */}
			<View
				className="popup-mask"
				style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)' }}
				onClick={handleMaskClick}
			/>

			{/* Content */}
			<View
				className="popup-content"
				style={{ position: 'relative', zIndex: 1, background: '#fff', borderRadius: '24rpx', overflow: 'hidden', boxShadow: '0 8rpx 32rpx rgba(0, 0, 0, 0.2)', maxWidth: '90vw' }}
			>
				{/* Header */}
				<View
					className="popup-header"
					style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24rpx 32rpx', borderBottom: '1rpx solid #eee' }}
				>
					<Text style={{ fontSize: '32rpx', fontWeight: '600', color: '#333' }}>{title}</Text>
					{showClose && (
						<View className="popup-close" style={{ width: '48rpx', height: '48rpx', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={hide}>
							<Text style={{ fontSize: '40rpx', color: '#999', lineHeight: 1 }}>×</Text>
						</View>
					)}
				</View>

				{/* Captcha */}
				<View className="popup-body" style={{ padding: '32rpx' }}>
					{type === 'slider' ? (
						<SliderCaptcha {...sliderProps} />
					) : (
						<ClickCaptcha {...clickProps} />
					)}
				</View>
			</View>
		</View>
	)
})

PopupCaptcha.displayName = 'PopupCaptcha'

export default PopupCaptcha
