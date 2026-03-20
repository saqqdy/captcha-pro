/**
 * Abstract renderer interface for mini-program platforms
 */
export interface CaptchaRenderer {
  // Basic drawing
  clear: () => void
  drawImage: (image: string, x: number, y: number, width?: number, height?: number) => void
  drawText: (text: string, x: number, y: number, options?: DrawTextOptions) => void
  drawShape: (type: ShapeType, x: number, y: number, width: number, height: number, options?: DrawShapeOptions) => void

  // Style settings
  setFillStyle: (color: string) => void
  setStrokeStyle: (color: string) => void
  setLineWidth: (width: number) => void
  setFont: (font: string) => void

  // Transform
  translate: (x: number, y: number) => void
  rotate: (angle: number) => void
  save: () => void
  restore: () => void

  // Clip
  clip: () => void

  // Get image data
  getImageData: (x: number, y: number, width: number, height: number) => Promise<ImageData>
}

export type ShapeType = 'rect' | 'roundedRect' | 'circle' | 'triangle'

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
  color?: string
}
