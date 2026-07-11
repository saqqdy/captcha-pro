import type { BackendConfig } from '@captcha-pro/mp-shared'
/**
 * Taro Popup Captcha Hook (React)
 *
 * 组合 slider / click hook，叠加弹窗显隐控制。
 */
import { useCallback, useState } from 'react'
import { useClickCaptcha, type UseClickCaptchaOptions, type UseClickCaptchaReturn } from './useClickCaptcha'
import { useSliderCaptcha, type UseSliderCaptchaOptions, type UseSliderCaptchaReturn } from './useSliderCaptcha'

export interface UsePopupCaptchaOptions {
  type?: 'slider' | 'click'
  sliderOptions?: Omit<UseSliderCaptchaOptions, 'onSuccess' | 'onFail' | 'onRefresh' | 'onError'>
  clickOptions?: Omit<UseClickCaptchaOptions, 'onSuccess' | 'onFail' | 'onRefresh' | 'onError'>
  onSuccess?: (data?: { verifiedAt: number }) => void
  onFail?: () => void
  onRefresh?: () => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (err: Error) => void
}

export interface UsePopupCaptchaReturn {
  visible: boolean
  show: () => void
  hide: () => void
  slider: UseSliderCaptchaReturn
  click: UseClickCaptchaReturn
}

export function usePopupCaptcha(config: BackendConfig, options: UsePopupCaptchaOptions = {}): UsePopupCaptchaReturn {
  const [visible, setVisible] = useState(false)

  const show = useCallback(() => {
    setVisible(true)
    options.onOpen?.()
  }, [options])

  const hide = useCallback(() => {
    setVisible(false)
    options.onClose?.()
  }, [options])

  const handleError = useCallback((err: Error) => {
    options.onError?.(err)
  }, [options])

  const slider = useSliderCaptcha(config, {
    ...options.sliderOptions,
    onSuccess: data => {
      options.onSuccess?.(data)
      hide()
    },
    onFail: options.onFail,
    onRefresh: options.onRefresh,
    onError: handleError,
  })

  const click = useClickCaptcha(config, {
    ...options.clickOptions,
    onSuccess: data => {
      options.onSuccess?.(data)
      hide()
    },
    onFail: options.onFail,
    onRefresh: options.onRefresh,
    onError: handleError,
  })

  return {
    visible,
    show,
    hide,
    slider,
    click,
  }
}
