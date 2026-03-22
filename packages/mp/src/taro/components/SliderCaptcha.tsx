import type { FC } from 'react'
import { Canvas, Text, View, MovableArea, MovableView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCallback, useEffect, useRef, useState } from 'react'
import '../styles/captcha.scss'

export interface SliderCaptchaProps {
  width?: number
  height?: number
  bgImage?: string
  precision?: number
  showRefresh?: boolean
  sliderWidth?: number
  sliderHeight?: number
  onSuccess?: () => void
  onFail?: () => void
  onRefresh?: () => void
}

// 生成唯一 ID
const generateId = () => `bg-canvas-${Math.random().toString(36).substr(2, 9)}`

const SliderCaptcha: FC<SliderCaptchaProps> = ({
  width = 650,
  height = 380,
  bgImage,
  precision = 5,
  showRefresh = true,
  sliderWidth = 80,
  sliderHeight = 80,
  onSuccess,
  onFail,
  onRefresh,
}) => {
  const canvasId = useRef(generateId())
  const [canvasWidth, setCanvasWidth] = useState(0)
  const [canvasHeight, setCanvasHeight] = useState(0)

  const [sliderX, setSliderX] = useState(0)
  const [sliderY, setSliderY] = useState(0)
  const [targetX, setTargetX] = useState(0)
  const [status, setStatus] = useState<'' | 'success' | 'fail'>('')
  const [isReady, setIsReady] = useState(false)

  // Convert rpx to px
  const rpxToPx = useCallback((rpx: number) => {
    const info = Taro.getSystemInfoSync()
    return Math.floor(rpx * info.screenWidth / 750)
  }, [])

  // Initialize canvas size
  useEffect(() => {
    setCanvasWidth(rpxToPx(width))
    setCanvasHeight(rpxToPx(height))
  }, [width, height, rpxToPx])

  // Generate random position
  const generateCaptcha = useCallback(() => {
    const newTargetX = Math.floor(
      Math.random() * (canvasWidth - rpxToPx(sliderWidth) - 20) + rpxToPx(sliderWidth) + 10
    )
    const newSliderY = Math.floor(
      Math.random() * (canvasHeight - rpxToPx(sliderHeight) - 20) + 10
    )

    setSliderX(0)
    setSliderY(newSliderY)
    setTargetX(newTargetX)
    setStatus('')
  }, [canvasWidth, canvasHeight, sliderWidth, sliderHeight, rpxToPx])

  // Draw background canvas
  const drawBackground = useCallback(() => {
    if (!canvasWidth || !canvasHeight) return

    const query = Taro.createSelectorQuery()
    query.select(`#${canvasId.current}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) {
          console.log('Canvas node not found')
          return
        }

        const { node, width: nodeWidth, height: nodeHeight } = res[0]
        if (!node) {
          console.log('Canvas node is null')
          return
        }

        const info = Taro.getSystemInfoSync()
        const pixelRatio = info.pixelRatio || 2
        const canvas = node as HTMLCanvasElement
        const ctx = canvas.getContext('2d')

        // Set canvas size with device pixel ratio
        canvas.width = nodeWidth * pixelRatio
        canvas.height = nodeHeight * pixelRatio
        ctx.scale(pixelRatio, pixelRatio)

        const actualSliderWidth = rpxToPx(sliderWidth)
        const actualSliderHeight = rpxToPx(sliderHeight)

        // Draw gradient background
        const hue1 = Math.floor(Math.random() * 360)
        const hue2 = (hue1 + Math.floor(Math.random() * 60)) % 360
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
        gradient.addColorStop(0, `hsl(${hue1}, 70%, 85%)`)
        gradient.addColorStop(1, `hsl(${hue2}, 70%, 75%)`)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)

        // Draw decorative shapes
        for (let i = 0; i < 6; i++) {
          const shapeHue = (hue1 + Math.floor(Math.random() * 120)) % 360
          ctx.fillStyle = `hsla(${shapeHue}, 60%, 60%, 0.2)`
          ctx.beginPath()
          const x = Math.floor(Math.random() * canvasWidth)
          const y = Math.floor(Math.random() * canvasHeight)
          const size = Math.floor(Math.random() * 60) + 30
          ctx.arc(x, y, size / 2, 0, Math.PI * 2)
          ctx.fill()
        }

        // Draw target hole (shadow area) - the gap where slider should go
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
        ctx.fillRect(targetX, sliderY, actualSliderWidth, actualSliderHeight)

        // Draw border around target
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.lineWidth = 2
        ctx.strokeRect(targetX, sliderY, actualSliderWidth, actualSliderHeight)

        setIsReady(true)
      })
  }, [canvasWidth, canvasHeight, targetX, sliderY, sliderWidth, sliderHeight, rpxToPx])

  // Initialize
  useEffect(() => {
    if (canvasWidth && canvasHeight) {
      generateCaptcha()
    }
  }, [canvasWidth, canvasHeight])

  useEffect(() => {
    if (targetX > 0 && sliderY >= 0) {
      setTimeout(drawBackground, 150)
    }
  }, [targetX, sliderY, drawBackground])

  // Handle slider change
  const handleSliderChange = useCallback((e) => {
    if (status || !isReady) return
    const x = e.detail.x
    setSliderX(x)
  }, [status, isReady])

  // Handle slider end
  const handleSliderEnd = useCallback(() => {
    if (status || !isReady) return

    const diff = Math.abs(sliderX - targetX)

    if (diff <= precision) {
      setStatus('success')
      onSuccess?.()
    } else {
      setStatus('fail')
      onFail?.()
      setTimeout(() => {
        generateCaptcha()
        drawBackground()
        onRefresh?.()
      }, 800)
    }
  }, [status, isReady, sliderX, targetX, precision, generateCaptcha, drawBackground, onSuccess, onFail, onRefresh])

  // Refresh captcha
  const refresh = useCallback(() => {
    setIsReady(false)
    generateCaptcha()
    setTimeout(drawBackground, 150)
    onRefresh?.()
  }, [generateCaptcha, drawBackground, onRefresh])

  const actualSliderWidth = rpxToPx(sliderWidth)
  const sliderBarHeight = rpxToPx(80)

  return (
    <View className="captcha-container">
      {/* Captcha area */}
      <View
        className="captcha-area"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          borderRadius: '16rpx'
        }}
      >
        {/* Background canvas */}
        <Canvas
          id={canvasId.current}
          canvasId={canvasId.current}
          type="2d"
          className="bg-canvas"
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
        />

        {/* Slider block overlay - shows current position */}
        {isReady && (
          <View
            className="slider-block"
            style={{
              width: `${actualSliderWidth}px`,
              height: `${rpxToPx(sliderHeight)}px`,
              top: `${sliderY}px`,
              left: `${sliderX}px`,
            }}
          >
            <Text className="slider-block-icon">≫</Text>
          </View>
        )}

        {/* Refresh button */}
        {showRefresh && (
          <View className="refresh-btn" onClick={refresh}>
            <Text className="refresh-icon">⟳</Text>
          </View>
        )}

        {/* Status overlay */}
        {status && (
          <View className={`status-overlay ${status}`}>
            <Text className="status-text">{status === 'success' ? '验证成功' : '验证失败'}</Text>
          </View>
        )}
      </View>

      {/* Slider bar */}
      <View
        className="slider-bar"
        style={{ width: `${canvasWidth}px`, height: `${sliderBarHeight}px` }}
      >
        <View className="slider-track" />
        <View className="slider-hint">
          <Text>→ 按住滑块，拖动完成验证</Text>
        </View>
        <MovableArea
          className="slider-area"
          style={{ width: `${canvasWidth}px`, height: `${sliderBarHeight}px` }}
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
