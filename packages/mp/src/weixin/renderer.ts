import type { CaptchaRenderer, DrawShapeOptions, DrawTextOptions, ShapeType } from '../core/renderer'

export class WxRenderer implements CaptchaRenderer {
  private ctx: WechatMiniprogram.CanvasContext

  constructor(ctx: WechatMiniprogram.CanvasContext) {
    this.ctx = ctx
  }

  clear(): void {
    const { width, height } = this.ctx.canvas || { width: 300, height: 170 }
    this.ctx.clearRect(0, 0, width, height)
  }

  drawImage(image: string, x: number, y: number, width?: number, height?: number): void {
    this.ctx.drawImage(image, x, y, width || 0, height || 0)
  }

  drawText(text: string, x: number, y: number, options?: DrawTextOptions): void {
    if (options?.color) {
      this.ctx.setFillStyle(options.color)
    }
    if (options?.fontSize) {
      this.ctx.setFontSize(options.fontSize)
    }
    this.ctx.fillText(text, x, y)
  }

  drawShape(type: ShapeType, x: number, y: number, width: number, height: number, options?: DrawShapeOptions): void {
    this.ctx.beginPath()

    switch (type) {
      case 'rect':
        this.ctx.rect(x, y, width, height)
        break
      case 'roundedRect':
        const r = options?.borderRadius || 0
        this.ctx.moveTo(x + r, y)
        this.ctx.lineTo(x + width - r, y)
        this.ctx.arcTo(x + width, y, x + width, y + r, r)
        this.ctx.lineTo(x + width, y + height - r)
        this.ctx.arcTo(x + width, y + height, x + width - r, y + height, r)
        this.ctx.lineTo(x + r, y + height)
        this.ctx.arcTo(x, y + height, x, y + height - r, r)
        this.ctx.lineTo(x, y + r)
        this.ctx.arcTo(x, y, x + r, y, r)
        break
      case 'circle':
        const radius = Math.min(width, height) / 2
        this.ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2)
        break
      case 'triangle':
        this.ctx.moveTo(x + width / 2, y)
        this.ctx.lineTo(x + width, y + height)
        this.ctx.lineTo(x, y + height)
        break
    }

    this.ctx.closePath()

    if (options?.color) {
      this.ctx.setFillStyle(options.color)
    }

    if (options?.fill !== false) {
      this.ctx.fill()
    }
    if (options?.stroke) {
      this.ctx.stroke()
    }
  }

  setFillStyle(color: string): void {
    this.ctx.setFillStyle(color)
  }

  setStrokeStyle(color: string): void {
    this.ctx.setStrokeStyle(color)
  }

  setLineWidth(width: number): void {
    this.ctx.setLineWidth(width)
  }

  setFont(font: string): void {
    // WeChat miniprogram uses setFontSize
    const match = font.match(/(\d+)px/)
    if (match) {
      this.ctx.setFontSize(Number.parseInt(match[1], 10))
    }
  }

  translate(x: number, y: number): void {
    this.ctx.translate(x, y)
  }

  rotate(angle: number): void {
    this.ctx.rotate(angle)
  }

  save(): void {
    this.ctx.save()
  }

  restore(): void {
    this.ctx.restore()
  }

  clip(): void {
    this.ctx.clip()
  }

  async getImageData(x: number, y: number, width: number, height: number): Promise<ImageData> {
    // WeChat miniprogram Canvas 2D API
    return this.ctx.getImageData(x, y, width, height)
  }
}
