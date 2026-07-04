import type { FC, Ref } from 'react'
import type { ClickCaptchaProps, ClickCaptchaRef, Point } from '../types'
import { Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { fetchCaptcha, verifyCaptcha } from '../request'
import '../styles/captcha.scss'

/** ClickCaptcha — backend-only mode */
const ClickCaptcha: FC<ClickCaptchaProps & { ref?: Ref<ClickCaptchaRef> }> = ({
	width = 650,
	height = 380,
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
	const [clickTexts, setClickTexts] = useState<string[]>([])
	const [clickCharImages, setClickCharImages] = useState<string[]>([])

	// UI state
	const [status, setStatus] = useState<'' | 'success' | 'fail'>('')
	const [clickMarkers, setClickMarkers] = useState<Array<Point & { index: number }>>([])
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
		setClickMarkers([])
		setClickTexts([])
		setClickCharImages([])

		try {
			const res = await fetchCaptcha(backend, {
				type: 'click',
				width: widthPx || rpxToPx(width),
				height: heightPx || rpxToPx(height),
			})

			if (seq !== loadSeqRef.current) return

			if (!res.success || !res.data) {
				throw new Error(res.message || 'Failed to get captcha')
			}

			const { captchaId: id, bgImage: bg, clickTexts: texts, clickCharImages: images } = res.data
			setCaptchaId(id)
			setBgImage(bg)
			setClickTexts(texts ?? [])
			setClickCharImages(images ?? [])
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
	}, [backend, widthPx, heightPx, width, height, rpxToPx, onError])

	// Load on mount
	useEffect(() => {
		if (widthPx && heightPx) {
			loadCaptcha()
		}
	}, [widthPx, heightPx, loadCaptcha])

	// Handle click on captcha area
	const handleClick = useCallback((e: { touches?: Array<{ clientX: number; clientY: number }>; detail?: { clientX: number; clientY: number }; changedTouches?: Array<{ clientX: number; clientY: number }> }): void => {
		if (status || loading) return
		if (clickMarkers.length >= clickTexts.length) return

		const touch = e.touches?.[0] || e.detail
		if (!touch) return
		const query = Taro.createSelectorQuery()
		query.select('.captcha-area').boundingClientRect((rect) => {
			if (!rect) return
			const x = touch.clientX - rect.left
			const y = touch.clientY - rect.top

			const newMarkers = [...clickMarkers, { x, y, index: clickMarkers.length + 1 }]
			setClickMarkers(newMarkers)

			// Verify when all points are clicked
			if (newMarkers.length >= clickTexts.length) {
				const verifyPoints = newMarkers.map((m) => ({ x: m.x, y: m.y }))
				const doVerify = async (): Promise<void> => {
					setLoading(true)
					try {
						const res = await verifyCaptcha(backend, {
							captchaId,
							type: 'click',
							target: verifyPoints,
						})

						if (res.success) {
							setStatus('success')
							onSuccess?.(res.data)
						} else {
							setStatus('fail')
							onFail?.()
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
				}
				setTimeout(doVerify, 200)
			}
		}).exec()
	}, [status, loading, clickMarkers, clickTexts.length, captchaId, backend, onSuccess, onFail, onRefresh, onError, loadCaptcha])

	// Manual refresh
	const refresh = useCallback(() => {
		loadCaptcha()
		onRefresh?.()
	}, [loadCaptcha, onRefresh])

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
				onClick={handleClick}
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

				{/* Click markers */}
				{clickMarkers.map((marker) => (
					<View
						key={marker.index}
						className="click-marker"
						style={{
							left: `${marker.x}px`,
							top: `${marker.y}px`,
						}}
					>
						<Text className="marker-text">{marker.index}</Text>
					</View>
				))}

				{/* Refresh button */}
				{showRefresh && !loading && (
					<View className="refresh-btn" onClick={(e) => { e.stopPropagation(); refresh() }}>
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

			{/* Prompt bar */}
			<View
				className="prompt-bar"
				style={{ width: `${widthPx}px` }}
			>
				<Text className="prompt-text">请依次点击：</Text>
				<View className="prompt-chars">
					{clickCharImages.length > 0
						? clickCharImages.map((img) => (
							<View key={img} className="char-item">
								<Image src={img} className="char-img" mode="aspectFit" />
							</View>
						))
						: clickTexts.map((char) => (
							<View key={char} className="char-item">
								<Text className="char-text">{char}</Text>
							</View>
						))
					}
				</View>
			</View>
		</View>
	)
}

export default ClickCaptcha
