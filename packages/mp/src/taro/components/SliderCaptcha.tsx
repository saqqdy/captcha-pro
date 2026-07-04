import type { FC, Ref } from 'react'
import type { SliderCaptchaProps, SliderCaptchaRef } from '../types'
import { Image, MovableArea, MovableView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchCaptcha, verifyCaptcha } from '../request'
import '../styles/captcha.scss'

/** SliderCaptcha — backend-only mode */
const SliderCaptcha: FC<SliderCaptchaProps & { ref?: Ref<SliderCaptchaRef> }> = ({
	width = 650,
	height = 380,
	sliderWidth = 80,
	sliderHeight = 80,
	showRefresh = true,
	backend,
	onSuccess,
	onFail,
	onRefresh,
	onError,
}) => {
	// Backend data
	const [captchaId, setCaptchaId] = useState('')
	const [bgImage, setBgImage] = useState('')
	const [sliderImage, setSliderImage] = useState('')
	const [sliderY, setSliderY] = useState(0)

	// UI state
	const [sliderX, setSliderX] = useState(0)
	const [status, setStatus] = useState<'' | 'success' | 'fail'>('')
	const [loading, setLoading] = useState(true)
	const [errorMsg, setErrorMsg] = useState('')

	// Track loading to avoid race conditions
	const loadSeqRef = useRef(0)

	// Convert rpx to px
	const rpxToPx = useCallback((rpx: number) => {
		const info = Taro.getSystemInfoSync()
		return Math.floor(rpx * info.screenWidth / 750)
	}, [])

	// Container size in px (computed from rpx)
	const widthPx = useMemo(() => rpxToPx(width), [width, rpxToPx])
	const heightPx = useMemo(() => rpxToPx(height), [height, rpxToPx])

	// Load captcha from backend
	const loadCaptcha = useCallback(async () => {
		const seq = ++loadSeqRef.current
		setLoading(true)
		setErrorMsg('')
		setStatus('')
		setSliderX(0)

		try {
			const res = await fetchCaptcha(backend, {
				type: 'slider',
				width: widthPx || rpxToPx(width),
				height: heightPx || rpxToPx(height),
				sliderWidth: rpxToPx(sliderWidth),
				sliderHeight: rpxToPx(sliderHeight),
			})

			// Skip if a newer load was triggered
			if (seq !== loadSeqRef.current) return

			if (!res.success || !res.data) {
				throw new Error(res.message || 'Failed to get captcha')
			}

			const { captchaId: id, bgImage: bg, sliderImage: slider, sliderY: y } = res.data
			setCaptchaId(id)
			setBgImage(bg)
			setSliderImage(slider ?? '')
			setSliderY(y ?? 0)
		} catch (err) {
			if (seq !== loadSeqRef.current) return
			const error = err instanceof Error ? err : new Error(String(err))
			setErrorMsg(error.message)
			onError?.(error)
		} finally {
			if (seq === loadSeqRef.current) {
				setLoading(false)
			}
		}
	}, [backend, widthPx, heightPx, width, height, sliderWidth, sliderHeight, rpxToPx, onError])

	// Load on mount
	useEffect(() => {
		if (widthPx && heightPx) {
			loadCaptcha()
		}
	}, [widthPx, heightPx, loadCaptcha])

	// Handle slider drag
	const handleSliderChange = useCallback((e: { detail: { x: number } }): void => {
		if (status || loading) return
		setSliderX(e.detail.x)
	}, [status, loading])

	// Handle slider release → verify
	const handleSliderEnd = useCallback(async (): Promise<void> => {
		if (status || loading || !captchaId) return

		setLoading(true)
		try {
			const res = await verifyCaptcha(backend, {
				captchaId,
				type: 'slider',
				target: [sliderX],
			})

			if (res.success) {
				setStatus('success')
				onSuccess?.(res.data)
			} else {
				setStatus('fail')
				onFail?.()
				// Auto refresh after failure
				setTimeout(() => {
					loadCaptcha()
					onRefresh?.()
				}, 800)
			}
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err))
			onError?.(error)
			setStatus('fail')
			setTimeout(() => loadCaptcha(), 800)
		} finally {
			setLoading(false)
		}
	}, [status, loading, captchaId, sliderX, backend, onSuccess, onFail, onRefresh, onError, loadCaptcha])

	// Manual refresh
	const refresh = useCallback(() => {
		loadCaptcha()
		onRefresh?.()
	}, [loadCaptcha, onRefresh])

	const actualSliderWidth = rpxToPx(sliderWidth)
	const actualSliderHeight = rpxToPx(sliderHeight)
	const sliderBarHeight = rpxToPx(80)

	return (
		<View className="captcha-container">
			{/* Captcha area */}
			<View
				className="captcha-area"
				style={{
					width: `${widthPx}px`,
					height: `${heightPx}px`,
					borderRadius: '16rpx',
				}}
			>
				{/* Background image from backend */}
				{bgImage ? (
					<Image
						src={bgImage}
						mode="aspectFill"
						className="bg-image"
						style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
					/>
				) : (
					<View className="captcha-loading" style={{ width: `${widthPx}px`, height: `${heightPx}px` }}>
						<Text>{errorMsg || '加载中...'}</Text>
					</View>
				)}

				{/* Slider block overlay from backend */}
				{sliderImage && !loading && (
					<Image
						src={sliderImage}
						className="slider-block"
						style={{
							width: `${actualSliderWidth}px`,
							height: `${actualSliderHeight}px`,
							top: `${sliderY}px`,
							left: `${sliderX}px`,
						}}
					/>
				)}

				{/* Refresh button */}
				{showRefresh && !loading && (
					<View className="refresh-btn" onClick={refresh}>
						<Text className="refresh-icon">⟳</Text>
					</View>
				)}

				{/* Status overlay */}
				{status && (
					<View className={`status-overlay ${status}`}>
						<View className="status-icon"><Text>{status === 'success' ? '✓' : '✕'}</Text></View>
						<Text className="status-text">{status === 'success' ? '验证成功' : '验证失败'}</Text>
					</View>
				)}
			</View>

			{/* Slider bar */}
			<View
				className="slider-bar"
				style={{ width: `${widthPx}px`, height: `${sliderBarHeight}px` }}
			>
				<View className="slider-track" />
				<View className="slider-hint">
					<Text>→ 按住滑块，拖动完成验证</Text>
				</View>
				<MovableArea
					className="slider-area"
					style={{ width: `${widthPx}px`, height: `${sliderBarHeight}px` }}
				>
					<MovableView
						className="slider-thumb"
						direction="horizontal"
						x={sliderX}
						damping={40}
						onChange={handleSliderChange}
						onTouchEnd={handleSliderEnd}
						style={{ width: `${actualSliderWidth}px`, height: `${sliderBarHeight}px` }}
					>
						<Text className="slider-arrow">→</Text>
					</MovableView>
				</MovableArea>
			</View>
		</View>
	)
}

export default SliderCaptcha
