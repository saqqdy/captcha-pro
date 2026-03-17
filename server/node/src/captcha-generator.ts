import type { CaptchaCache, CaptchaGenerateOptions, CaptchaResponse, Point } from './types'
import { type CanvasRenderingContext2D, createCanvas } from 'canvas'
import { v4 as uuidv4 } from 'uuid'

/**
 * Random number in range
 */
function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Random string generator
 */
function randomString(length: number, chars: string = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(random(0, chars.length - 1))
  }
  return result
}

/**
 * Draw rounded rectangle
 */
function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * Draw puzzle mask shape
 */
function drawPuzzleMask(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: boolean = false): void {
  ctx.save()
  ctx.beginPath()

  // Main rectangle with rounded corners
  drawRoundedRect(ctx, x, y, w, h, 5)

  // Add puzzle notch on right side
  const notchSize = 10
  const notchY = y + h / 2 - notchSize / 2
  ctx.moveTo(x + w, notchY)
  ctx.arc(x + w + notchSize, notchY + notchSize / 2, notchSize, Math.PI / 2, -Math.PI / 2, true)
  ctx.lineTo(x + w, notchY + notchSize)

  // Add puzzle notch on bottom
  const bottomNotchX = x + w / 2 - notchSize / 2
  ctx.moveTo(bottomNotchX, y + h)
  ctx.arc(bottomNotchX + notchSize, y + h + notchSize, notchSize, Math.PI, 0, true)
  ctx.lineTo(bottomNotchX + notchSize * 2, y + h)

  ctx.closePath()

  if (fill) {
    ctx.fill()
  }

  ctx.restore()
}

/**
 * Captcha Generator class
 */
export class CaptchaGenerator {
  private defaultOptions: Required<CaptchaGenerateOptions> = {
    type: 'slider',
    width: 280,
    height: 155,
    sliderWidth: 50,
    sliderHeight: 50,
    precision: 5,
    clickCount: 3,
    clickText: '',
  }

  /**
   * Generate slider captcha
   */
  generateSlider(options: CaptchaGenerateOptions = {}): { cache: CaptchaCache; response: CaptchaResponse } {
    const opts = { ...this.defaultOptions, ...options }
    const { width, height, sliderWidth, sliderHeight } = opts

    // Create background canvas
    const bgCanvas = createCanvas(width, height)
    const bgCtx = bgCanvas.getContext('2d')

    // Generate random background pattern
    bgCtx.fillStyle = '#e8e8e8'
    bgCtx.fillRect(0, 0, width, height)

    // Add random shapes
    for (let i = 0; i < 20; i++) {
      bgCtx.fillStyle = `rgba(${random(100, 200)}, ${random(100, 200)}, ${random(100, 200)}, 0.3)`
      bgCtx.beginPath()
      bgCtx.arc(random(0, width), random(0, height), random(10, 30), 0, Math.PI * 2)
      bgCtx.fill()
    }

    // Random target position
    const targetX = random(sliderWidth + 20, width - sliderWidth - 20)
    const targetY = random(20, height - sliderHeight - 20)

    // Create slider canvas
    const sliderCanvas = createCanvas(sliderWidth, sliderHeight)
    const sliderCtx = sliderCanvas.getContext('2d')

    // Get background image data for puzzle piece
    const imageData = bgCtx.getImageData(targetX, targetY, sliderWidth, sliderHeight)
    sliderCtx.putImageData(imageData, 0, 0)

    // Draw puzzle shape mask
    drawPuzzleMask(bgCtx, targetX, targetY, sliderWidth, sliderHeight)
    drawPuzzleMask(sliderCtx, 0, 0, sliderWidth, sliderHeight, true)

    // Clear the puzzle area on background
    bgCtx.globalCompositeOperation = 'destination-out'
    drawPuzzleMask(bgCtx, targetX, targetY, sliderWidth, sliderHeight)
    bgCtx.globalCompositeOperation = 'source-over'

    // Draw puzzle outline
    bgCtx.strokeStyle = '#fff'
    bgCtx.lineWidth = 2
    drawPuzzleMask(bgCtx, targetX, targetY, sliderWidth, sliderHeight)
    bgCtx.stroke()

    // Generate captcha ID
    const captchaId = uuidv4()
    const now = Date.now()
    const expireTime = 60000 // 60 seconds

    // Create cache entry
    const cache: CaptchaCache = {
      id: captchaId,
      type: 'slider',
      target: [targetX],
      createdAt: now,
      expiresAt: now + expireTime,
    }

    // Create response
    const response: CaptchaResponse = {
      captchaId,
      type: 'slider',
      bgImage: bgCanvas.toDataURL('image/png'),
      sliderImage: sliderCanvas.toDataURL('image/png'),
      width,
      height,
      expiresAt: now + expireTime,
    }

    return { cache, response }
  }

  /**
   * Generate click captcha
   */
  generateClick(options: CaptchaGenerateOptions = {}): { cache: CaptchaCache; response: CaptchaResponse } {
    const opts = { ...this.defaultOptions, ...options }
    const { width, height, clickCount, clickText } = opts

    // Create background canvas
    const bgCanvas = createCanvas(width, height)
    const bgCtx = bgCanvas.getContext('2d')

    // Generate random background pattern
    bgCtx.fillStyle = '#e8e8e8'
    bgCtx.fillRect(0, 0, width, height)

    // Add random shapes
    for (let i = 0; i < 30; i++) {
      bgCtx.fillStyle = `rgba(${random(100, 200)}, ${random(100, 200)}, ${random(100, 200)}, 0.3)`
      bgCtx.beginPath()
      bgCtx.arc(random(0, width), random(0, height), random(10, 30), 0, Math.PI * 2)
      bgCtx.fill()
    }

    // Generate or use provided text
    const chars = clickText || randomString(clickCount, 'ABCDEFGHJKMNPQRSTWXYZ')
    const clickTexts = chars.split('').slice(0, clickCount)
    const targetPoints: Point[] = []

    // Generate random positions for each character
    const fontSize = 20
    const padding = fontSize + 10

    for (let i = 0; i < clickTexts.length; i++) {
      let x: number, y: number, attempts = 0
      const maxAttempts = 100

      // Find non-overlapping position
      do {
        x = random(padding, width - padding)
        y = random(padding, height - padding)
        attempts++
      } while (this.isOverlapping(x, y, fontSize, targetPoints) && attempts < maxAttempts)

      targetPoints.push({ x, y })

      // Draw character
      bgCtx.save()
      bgCtx.font = `bold ${fontSize}px Arial`
      bgCtx.fillStyle = '#333'
      bgCtx.textAlign = 'center'
      bgCtx.textBaseline = 'middle'

      // Random rotation
      const rotation = (random(-30, 30) * Math.PI) / 180
      bgCtx.translate(x, y)
      bgCtx.rotate(rotation)
      bgCtx.fillText(clickTexts[i], 0, 0)
      bgCtx.restore()
    }

    // Generate captcha ID
    const captchaId = uuidv4()
    const now = Date.now()
    const expireTime = 60000 // 60 seconds

    // Create cache entry
    const cache: CaptchaCache = {
      id: captchaId,
      type: 'click',
      target: targetPoints,
      clickTexts,
      createdAt: now,
      expiresAt: now + expireTime,
    }

    // Create response
    const response: CaptchaResponse = {
      captchaId,
      type: 'click',
      bgImage: bgCanvas.toDataURL('image/png'),
      clickTexts,
      width,
      height,
      expiresAt: now + expireTime,
    }

    return { cache, response }
  }

  /**
   * Check if position overlaps with existing points
   */
  private isOverlapping(x: number, y: number, size: number, points: Point[]): boolean {
    for (const point of points) {
      const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2)
      if (distance < size * 1.5) {
        return true
      }
    }
    return false
  }

  /**
   * Generate captcha based on type
   */
  generate(options: CaptchaGenerateOptions = {}): { cache: CaptchaCache; response: CaptchaResponse } {
    const type = options.type || 'slider'

    switch (type) {
      case 'click':
        return this.generateClick(options)
      case 'slider':
      default:
        return this.generateSlider(options)
    }
  }
}

export default CaptchaGenerator
