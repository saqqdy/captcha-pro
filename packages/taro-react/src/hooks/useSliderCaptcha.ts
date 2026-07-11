import type { BackendConfig, CaptchaState } from '@captcha-pro/mp-shared'
import { createInitialCaptchaState, DEFAULT_HEIGHT, DEFAULT_SLIDER_HEIGHT, DEFAULT_SLIDER_WIDTH, DEFAULT_WIDTH, loadCaptcha, resetCaptcha, verifySlider } from '@captcha-pro/mp-shared'
import Taro from '@tarojs/taro'
/**
 * Taro Slider Captcha Hook (React)
 *
 * 基于 shared/captcha-logic.ts 的状态管理，
 * 触摸交互由组件层（MovableView）处理。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchCaptcha, verifyCaptcha } from '../request'

export interface UseSliderCaptchaOptions {
  width?: number
  height?: number
  sliderWidth?: number
  sliderHeight?: number
  onSuccess?: (data?: { verifiedAt: number }) => void
  onFail?: () => void
  onRefresh?: () => void
  onError?: (err: Error) => void
}

export interface UseSliderCaptchaReturn {
  state: CaptchaState
  rpxToPx: (rpx: number) => number
  widthPx: number
  heightPx: number
  refresh: () => void
  handleSliderChange: (x: number) => void
  handleSliderEnd: () => void
}

export function useSliderCaptcha(config: BackendConfig, options: UseSliderCaptchaOptions = {}): UseSliderCaptchaReturn {
  const [state, setState] = useState<CaptchaState>(createInitialCaptchaState)

  const rpxToPx = useCallback((rpx: number) => {
    return Math.floor(rpx * Taro.getWindowInfo().screenWidth / 750)
  }, [])

  const widthPx = useMemo(() => rpxToPx(options.width ?? DEFAULT_WIDTH), [options.width, rpxToPx])
  const heightPx = useMemo(() => rpxToPx(options.height ?? DEFAULT_HEIGHT), [options.height, rpxToPx])

  const refresh = useCallback(() => {
    setState(prev => {
      const draft = { ...prev }
      resetCaptcha(draft)
      return draft
    })
    const draft = createInitialCaptchaState()
    loadCaptcha(
      draft,
      config,
      {
        type: 'slider',
        width: widthPx,
        height: heightPx,
        sliderWidth: rpxToPx(options.sliderWidth ?? DEFAULT_SLIDER_WIDTH),
        sliderHeight: rpxToPx(options.sliderHeight ?? DEFAULT_SLIDER_HEIGHT),
      },
      fetchCaptcha,
      options.onError,
    ).then(() => setState({ ...draft }))
  }, [config, widthPx, heightPx, rpxToPx, options])

  const handleSliderChange = useCallback((x: number) => {
    setState(prev => ({ ...prev, sliderX: x }))
  }, [])

  const handleSliderEnd = useCallback(() => {
    setState(prev => {
      if (prev.status || prev.loading || !prev.captchaId) return prev
      const draft = { ...prev }
      draft.loading = true
      verifySlider(
        draft,
        config,
        verifyCaptcha,
        options.onSuccess,
        options.onFail,
        () => {
          refresh()
          options.onRefresh?.()
        },
        options.onError,
      ).then(() => setState({ ...draft }))
      return draft
    })
  }, [config, options, refresh])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    state,
    rpxToPx,
    widthPx,
    heightPx,
    refresh,
    handleSliderChange,
    handleSliderEnd,
  }
}
