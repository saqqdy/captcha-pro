/**
 * @captcha-pro/taro-react — Taro + React Captcha Components (backend-only)
 */
export { default as ClickCaptcha } from './components/ClickCaptcha'
export { default as PopupCaptcha } from './components/PopupCaptcha'
export { default as SliderCaptcha } from './components/SliderCaptcha'

export { useClickCaptcha, type UseClickCaptchaOptions } from './hooks/useClickCaptcha'
export { usePopupCaptcha, type UsePopupCaptchaOptions } from './hooks/usePopupCaptcha'
export { useSliderCaptcha, type UseSliderCaptchaOptions } from './hooks/useSliderCaptcha'

export { fetchCaptcha, verifyCaptcha } from './request'

export type {
  BackendCaptchaParams,
  BackendCaptchaResponse,
  BackendConfig,
  BackendVerifyRequest,
  BackendVerifyResponse,
  ClickCaptchaProps,
  ClickCaptchaRef,
  PopupCaptchaProps,
  PopupCaptchaRef,
  SliderCaptchaProps,
  SliderCaptchaRef,
} from './types'
