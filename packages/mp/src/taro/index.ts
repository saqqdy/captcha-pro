/**
 * Taro Captcha Components
 * Export Taro components and renderer
 */

// Components
export { default as SliderCaptcha } from './components/SliderCaptcha'
export type { SliderCaptchaProps, SliderCaptchaRef } from './components/SliderCaptcha'

export { default as ClickCaptcha } from './components/ClickCaptcha'
export type { ClickCaptchaProps, ClickCaptchaRef } from './components/ClickCaptcha'

export { default as PopupCaptcha } from './components/PopupCaptcha'
export type { PopupCaptchaProps, PopupCaptchaRef } from './components/PopupCaptcha'

// Renderer
export { TaroRenderer } from './renderer'
export type { Point, Size, DrawTextOptions, DrawShapeOptions } from './renderer'
