import type { FC } from 'react'
import { Canvas, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useCallback, useEffect, useRef, useState } from 'react'
import '../styles/captcha.scss'

// Chinese vocabulary library
const CHINESE_WORDS = [
  '一帆风顺', '二龙腾飞', '三阳开泰', '四季平安', '五福临门',
  '七星高照', '八方来财', '万事如意', '心想事成', '步步高升',
  '财源广进', '恭喜发财', '龙马精神', '马到成功', '金玉满堂',
  '花开富贵', '锦绣前程', '吉祥如意', '瑞气盈门', '紫气东来',
  '风调雨顺', '国泰民安', '繁荣昌盛', '万象更新', '春回大地',
  '阳光明媚', '奋发图强', '自强不息', '勇往直前', '坚持不懈',
]

interface Point {
  x: number
  y: number
}

export interface ClickCaptchaProps {
  width?: number
  height?: number
  bgImage?: string
  count?: number
  precision?: number
  showRefresh?: boolean
  onSuccess?: () => void
  onFail?: () => void
  onRefresh?: () => void
}

// 生成唯一 ID
const generateId = () => `click-canvas-${Math.random().toString(36).substr(2, 9)}`

const ClickCaptcha: FC<ClickCaptchaProps> = ({
  width = 650,
  height = 380,
  bgImage,
  count = 3,
  precision = 50,
  showRefresh = true,
  onSuccess,
  onFail,
  onRefresh,
}) => {
  const canvasId = useRef(generateId())
  const [canvasWidth, setCanvasWidth] = useState(0)
  const [canvasHeight, setCanvasHeight] = useState(0)

  const [status, setStatus] = useState<'' | 'success' | 'fail'>('')
  const [targetPoints, setTargetPoints] = useState<Point[]>([])
  const [clickMarkers, setClickMarkers] = useState<Array<Point & { index: number }>>([])
  const [clickTexts, setClickTexts] = useState<string[]>([])
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

  // Check overlapping
  const isOverlapping = useCallback((x: number, y: number, size: number, points: Point[]): boolean => {
    for (const point of points) {
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)
      if (distance < size * 2) return true
    }
    return false
  }, [])

  // Draw captcha on canvas
  const drawCaptcha = useCallback((points: Point[], texts: string[], decoys: Array<Point & { text: string }>) => {
    if (!canvasWidth || !canvasHeight) return

    const query = Taro.createSelectorQuery()
    query.select(`#${canvasId.current}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]?.node) {
          console.log('Canvas node not found')
          return
        }

        const info = Taro.getSystemInfoSync()
        const pixelRatio = info.pixelRatio || 2
        const { node, width: nodeWidth, height: nodeHeight } = res[0]
        const canvas = node as HTMLCanvasElement
        const ctx = canvas.getContext('2d')

        // Set canvas size with device pixel ratio
        canvas.width = nodeWidth * pixelRatio
        canvas.height = nodeHeight * pixelRatio
        ctx.scale(pixelRatio, pixelRatio)

        // Font size based on canvas width
        const fontSize = Math.max(24, Math.floor(canvasWidth * 0.06))

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

        // Set font
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Draw decoy characters
        for (const point of decoys) {
          ctx.save()
          ctx.fillStyle = '#777'
          ctx.translate(point.x, point.y)
          ctx.rotate((Math.floor(Math.random() * 40) - 20) * Math.PI / 180)
          ctx.fillText(point.text, 0, 0)
          ctx.restore()
        }

        // Draw target characters
        for (let i = 0; i < points.length; i++) {
          ctx.save()
          ctx.fillStyle = '#333'
          ctx.font = `bold ${fontSize}px sans-serif`
          ctx.translate(points[i].x, points[i].y)
          ctx.rotate((Math.floor(Math.random() * 30) - 15) * Math.PI / 180)
          ctx.fillText(texts[i], 0, 0)
          ctx.restore()
        }

        setIsReady(true)
      })
  }, [canvasWidth, canvasHeight])

  // Generate captcha
  const generateCaptcha = useCallback(() => {
    if (!canvasWidth || !canvasHeight) return

    // Generate random text
    const randomWord = CHINESE_WORDS[Math.floor(Math.random() * CHINESE_WORDS.length)]
    let chars = ''
    if (randomWord.length >= count) {
      chars = randomWord.slice(0, count)
    } else {
      chars = randomWord
      while (chars.length < count) {
        const extraWord = CHINESE_WORDS[Math.floor(Math.random() * CHINESE_WORDS.length)]
        chars += extraWord.slice(0, count - chars.length)
      }
    }

    const texts = chars.split('').slice(0, count)
    setClickTexts(texts)
    setClickMarkers([])

    // Font size based on canvas width
    const fontSize = Math.max(24, Math.floor(canvasWidth * 0.06))
    const padding = fontSize + 30

    // Generate decoy characters
    const decoyCount = Math.floor(Math.random() * 2) + 1
    const usedChars = new Set(texts)
    const decoys: Array<Point & { text: string }> = []

    for (let i = 0; i < decoyCount; i++) {
      let decoyChar = '', attempts = 0
      while (!decoyChar && attempts < 50) {
        const word = CHINESE_WORDS[Math.floor(Math.random() * CHINESE_WORDS.length)]
        for (const char of word) {
          if (!usedChars.has(char)) {
            decoyChar = char
            usedChars.add(char)
            break
          }
        }
        attempts++
      }
      if (decoyChar) {
        decoys.push({ x: 0, y: 0, text: decoyChar })
      }
    }

    // Generate positions
    const points: Point[] = []
    const decoyPts: Array<Point & { text: string }> = []

    // Generate target positions
    for (let i = 0; i < texts.length; i++) {
      let x, y, attempts = 0
      do {
        x = Math.floor(Math.random() * (canvasWidth - padding * 2)) + padding
        y = Math.floor(Math.random() * (canvasHeight - padding * 2)) + padding
        attempts++
      } while (isOverlapping(x, y, fontSize, points) && attempts < 100)

      points.push({ x, y })
    }

    // Generate decoy positions
    for (let i = 0; i < decoys.length; i++) {
      let x, y, attempts = 0
      do {
        x = Math.floor(Math.random() * (canvasWidth - padding * 2)) + padding
        y = Math.floor(Math.random() * (canvasHeight - padding * 2)) + padding
        attempts++
      } while (isOverlapping(x, y, fontSize, [...points, ...decoyPts]) && attempts < 100)

      decoyPts.push({ x, y, text: decoys[i].text })
    }

    setTargetPoints(points)
    setStatus('')

    // Draw
    setTimeout(() => drawCaptcha(points, texts, decoyPts), 150)
  }, [canvasWidth, canvasHeight, count, isOverlapping, drawCaptcha])

  // Initialize
  useEffect(() => {
    if (canvasWidth && canvasHeight) {
      generateCaptcha()
    }
  }, [canvasWidth, canvasHeight])

  // Handle click
  const handleClick = useCallback((e) => {
    if (status || !isReady) return
    if (clickMarkers.length >= clickTexts.length) return

    const touch = e.touches?.[0] || e.detail
    const query = Taro.createSelectorQuery()
    query.select('.captcha-area').boundingClientRect((rect) => {
      if (!rect) return
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      const newMarkers = [...clickMarkers, { x, y, index: clickMarkers.length + 1 }]
      setClickMarkers(newMarkers)

      // Verify if all clicked
      if (newMarkers.length >= clickTexts.length) {
        setTimeout(() => {
          const actualPrecision = rpxToPx(precision)
          let success = true

          for (let i = 0; i < targetPoints.length; i++) {
            const target = targetPoints[i]
            const clicked = newMarkers[i]
            const distance = Math.sqrt((clicked.x - target.x) ** 2 + (clicked.y - target.y) ** 2)

            if (distance > actualPrecision) {
              success = false
              break
            }
          }

          if (success) {
            setStatus('success')
            onSuccess?.()
          } else {
            setStatus('fail')
            onFail?.()
            setTimeout(() => {
              setStatus('')
              generateCaptcha()
            }, 800)
          }
        }, 200)
      }
    }).exec()
  }, [status, isReady, clickMarkers, clickTexts.length, targetPoints, precision, rpxToPx, generateCaptcha, onSuccess, onFail])

  // Refresh
  const refresh = useCallback(() => {
    setIsReady(false)
    setStatus('')
    generateCaptcha()
    onRefresh?.()
  }, [generateCaptcha, onRefresh])

  // Convert px to rpx for marker positioning
  const pxToRpx = useCallback((px: number) => {
    const info = Taro.getSystemInfoSync()
    return px * 750 / info.screenWidth
  }, [])

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
        onClick={handleClick}
      >
        {/* Background canvas */}
        <Canvas
          id={canvasId.current}
          canvasId={canvasId.current}
          type="2d"
          className="bg-canvas"
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
        />

        {/* Click markers */}
        {clickMarkers.map((marker, index) => (
          <View
            key={index}
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
        {showRefresh && (
          <View className="refresh-btn" onClick={(e) => { e.stopPropagation(); refresh() }}>
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

      {/* Prompt bar */}
      <View
        className="prompt-bar"
        style={{ width: `${canvasWidth}px` }}
      >
        <Text className="prompt-text">请依次点击：</Text>
        <View className="prompt-chars">
          {clickTexts.map((char, index) => (
            <View key={index} className="char-item">
              <Text className="char-text">{char}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default ClickCaptcha
