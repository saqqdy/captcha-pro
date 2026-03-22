/**
 * Taro Canvas Renderer
 * Unified renderer for Taro framework (supports WeChat, Alipay, etc.)
 */
import type Taro from '@tarojs/taro'

/**
 * Convert HSL to HEX color (for mini-program compatibility)
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/**
 * Convert HSLA to RGBA color
 */
function hslaToRgba(h: number, s: number, l: number, a: number): string {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const f = (n: number) => l - (s * Math.min(l, 1 - l) * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1))
  const r = Math.round(255 * f(0))
  const g = Math.round(255 * f(8))
  const b = Math.round(255 * f(4))
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface DrawTextOptions {
  color?: string
  fontSize?: number
  fontFamily?: string
  align?: 'left' | 'center' | 'right'
  baseline?: 'top' | 'middle' | 'bottom'
}

export interface DrawShapeOptions {
  fill?: boolean
  stroke?: boolean
  borderRadius?: number
  fillColor?: string
  strokeColor?: string
  lineWidth?: number
}

/**
 * Taro Canvas Renderer
 */
export class TaroRenderer {
  private ctx: Taro.CanvasContext
  private width: number
  private height: number

  constructor(ctx: Taro.CanvasContext, width: number, height: number) {
    this.ctx = ctx
    this.width = width
    this.height = height
  }

  /**
   * Clear canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.draw()
  }

  /**
   * Draw image
   */
  drawImage(imagePath: string, x: number, y: number, width?: number, height?: number): void {
    this.ctx.drawImage(imagePath, x, y, width || 0, height || 0)
  }

  /**
   * Draw text
   */
  drawText(text: string, x: number, y: number, options?: DrawTextOptions): void {
    if (options?.color) {
      this.ctx.setFillStyle(options.color)
    }
    if (options?.fontSize) {
      this.ctx.setFontSize(options.fontSize)
    }
    if (options?.align) {
      this.ctx.setTextAlign(options.align)
    }
    if (options?.baseline) {
      this.ctx.setTextBaseline(options.baseline)
    }
    this.ctx.fillText(text, x, y)
  }

  /**
   * Draw rounded rectangle
   */
  drawRoundedRect(x: number, y: number, width: number, height: number, options?: DrawShapeOptions): void {
    const r = options?.borderRadius || 0
    this.ctx.beginPath()
    this.ctx.moveTo(x + r, y)
    this.ctx.lineTo(x + width - r, y)
    this.ctx.arcTo(x + width, y, x + width, y + r, r)
    this.ctx.lineTo(x + width, y + height - r)
    this.ctx.arcTo(x + width, y + height, x + width - r, y + height, r)
    this.ctx.lineTo(x + r, y + height)
    this.ctx.arcTo(x, y + height, x, y + height - r, r)
    this.ctx.lineTo(x, y + r)
    this.ctx.arcTo(x, y, x + r, y, r)
    this.ctx.closePath()

    if (options?.fill !== false) {
      this.ctx.setFillStyle(options?.fillColor || '#fff')
      this.ctx.fill()
    }
    if (options?.stroke) {
      this.ctx.setStrokeStyle(options?.strokeColor || '#000')
      this.ctx.setLineWidth(options?.lineWidth || 1)
      this.ctx.stroke()
    }
  }

  /**
   * Draw circle
   */
  drawCircle(x: number, y: number, radius: number, options?: DrawShapeOptions): void {
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.closePath()

    if (options?.fill !== false) {
      this.ctx.setFillStyle(options?.fillColor || '#fff')
      this.ctx.fill()
    }
    if (options?.stroke) {
      this.ctx.setStrokeStyle(options?.strokeColor || '#000')
      this.ctx.setLineWidth(options?.lineWidth || 1)
      this.ctx.stroke()
    }
  }

  /**
   * Draw line
   */
  drawLine(x1: number, y1: number, x2: number, y2: number, color: string = '#000', lineWidth: number = 1): void {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.setStrokeStyle(color)
    this.ctx.setLineWidth(lineWidth)
    this.ctx.stroke()
  }

  /**
   * Fill rectangle
   */
  fillRect(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.setFillStyle(color)
    this.ctx.fillRect(x, y, width, height)
  }

  /**
   * Create linear gradient
   */
  createLinearGradient(x0: number, y0: number, x1: number, y1: number, colorStops: Array<{ offset: number; color: string }>): void {
    const gradient = this.ctx.createLinearGradient(x0, y0, x1, y1)
    colorStops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color)
    })
    this.ctx.setFillStyle(gradient)
  }

  /**
   * Save state
   */
  save(): void {
    this.ctx.save()
  }

  /**
   * Restore state
   */
  restore(): void {
    this.ctx.restore()
  }

  /**
   * Translate
   */
  translate(x: number, y: number): void {
    this.ctx.translate(x, y)
  }

  /**
   * Rotate
   */
  rotate(angle: number): void {
    this.ctx.rotate(angle)
  }

  /**
   * Scale
   */
  scale(x: number, y: number): void {
    this.ctx.scale(x, y)
  }

  /**
   * Commit drawing
   */
  commit(): void {
    this.ctx.draw()
  }

  /**
   * Commit drawing with reserve
   */
  commitReserve(): void {
    this.ctx.draw(true)
  }

  /**
   * Draw slider captcha
   */
  drawSliderCaptcha(options: {
    width: number
    height: number
    targetX: number
    targetY: number
    sliderWidth: number
    sliderHeight: number
    bgImage?: string
  }): void {
    const { width, height, targetX, targetY, sliderWidth, sliderHeight, bgImage } = options

    // Draw gradient background
    const hue1 = Math.floor(Math.random() * 360)
    const hue2 = (hue1 + Math.floor(Math.random() * 60)) % 360
    this.createLinearGradient(0, 0, width, height, [
      { offset: 0, color: hslToHex(hue1, 70, 85) },
      { offset: 1, color: hslToHex(hue2, 70, 75) },
    ])
    this.ctx.fillRect(0, 0, width, height)

    // Draw decorative shapes
    for (let i = 0; i < 8; i++) {
      const shapeHue = (hue1 + Math.floor(Math.random() * 120)) % 360
      this.ctx.setFillStyle(hslaToRgba(shapeHue, 60, 60, 0.15))
      this.ctx.beginPath()
      const x = Math.floor(Math.random() * (width - 40))
      const y = Math.floor(Math.random() * (height - 40))
      const size = Math.floor(Math.random() * 40) + 40
      this.ctx.arc(x, y, size / 2, 0, Math.PI * 2)
      this.ctx.fill()
    }

    // Draw target hole (shadow area)
    this.ctx.setFillStyle('rgba(0, 0, 0, 0.3)')
    this.ctx.fillRect(targetX, targetY, sliderWidth, sliderHeight)

    // Draw border
    this.ctx.setStrokeStyle('rgba(255, 255, 255, 0.8)')
    this.ctx.setLineWidth(2)
    this.ctx.strokeRect(targetX, targetY, sliderWidth, sliderHeight)

    this.commit()
  }

  /**
   * Draw click captcha
   */
  drawClickCaptcha(options: {
    width: number
    height: number
    points: Array<{ x: number; y: number; text: string }>
    decoyPoints?: Array<{ x: number; y: number; text: string }>
    fontSize?: number
  }): void {
    const { width, height, points, decoyPoints = [], fontSize = 20 } = options

    // Draw gradient background
    const hue1 = Math.floor(Math.random() * 360)
    const hue2 = (hue1 + Math.floor(Math.random() * 60)) % 360
    this.createLinearGradient(0, 0, width, height, [
      { offset: 0, color: hslToHex(hue1, 70, 85) },
      { offset: 1, color: hslToHex(hue2, 70, 75) },
    ])
    this.ctx.fillRect(0, 0, width, height)

    // Draw decorative shapes
    for (let i = 0; i < 8; i++) {
      const shapeHue = (hue1 + Math.floor(Math.random() * 120)) % 360
      this.ctx.setFillStyle(hslaToRgba(shapeHue, 60, 60, 0.15))
      this.ctx.beginPath()
      const x = Math.floor(Math.random() * (width - 40))
      const y = Math.floor(Math.random() * (height - 40))
      const size = Math.floor(Math.random() * 40) + 40
      this.ctx.arc(x, y, size / 2, 0, Math.PI * 2)
      this.ctx.fill()
    }

    // Draw decoy characters
    this.ctx.setFontSize(fontSize)
    this.ctx.setTextAlign('center')
    this.ctx.setTextBaseline('middle')

    for (const point of decoyPoints) {
      this.ctx.save()
      this.ctx.setFillStyle('#555')
      const rotation = (Math.floor(Math.random() * 50) - 25) * Math.PI / 180
      this.ctx.translate(point.x, point.y)
      this.ctx.rotate(rotation)
      this.ctx.fillText(point.text, 0, 0)
      this.ctx.restore()
    }

    // Draw target characters
    for (const point of points) {
      this.ctx.save()
      this.ctx.setFillStyle('#333')
      const rotation = (Math.floor(Math.random() * 40) - 20) * Math.PI / 180
      this.ctx.translate(point.x, point.y)
      this.ctx.rotate(rotation)
      this.ctx.fillText(point.text, 0, 0)
      this.ctx.restore()
    }

    this.commit()
  }

  /**
   * Draw click marker
   */
  drawClickMarker(x: number, y: number, index: number): void {
    // Draw circle
    this.ctx.beginPath()
    this.ctx.arc(x, y, 14, 0, Math.PI * 2)
    this.ctx.setFillStyle('#1991fa')
    this.ctx.fill()

    // Draw border
    this.ctx.setStrokeStyle('#fff')
    this.ctx.setLineWidth(2)
    this.ctx.stroke()

    // Draw number
    this.ctx.setFontSize(12)
    this.ctx.setFillStyle('#fff')
    this.ctx.setTextAlign('center')
    this.ctx.setTextBaseline('middle')
    this.ctx.fillText(String(index), x, y)

    this.commitReserve()
  }
}

export default TaroRenderer
