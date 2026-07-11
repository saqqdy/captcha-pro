import type { BackendCaptchaResponse, BackendConfig, CaptchaState, Point } from '@captcha-pro/mp-shared'
import { createInitialCaptchaState, DEFAULT_CLICK_COUNT, DEFAULT_HEIGHT, DEFAULT_WIDTH, resetCaptcha, verifyClick } from '@captcha-pro/mp-shared'
import Taro from '@tarojs/taro'
/**
 * Taro Click Captcha Hook (React)
 *
 * clickPoints 由组件交互层维护。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchCaptcha, verifyCaptcha } from '../request'

export interface UseClickCaptchaOptions {
  width?: number
  height?: number
  clickCount?: number
  onSuccess?: (data?: { verifiedAt: number }) => void
  onFail?: () => void
  onRefresh?: () => void
  onError?: (err: Error) => void
}

export interface UseClickCaptchaReturn {
  state: CaptchaState
  clickPoints: Point[]
  clickTexts: string[]
  clickCharImages: string[]
  setClickTexts: (v: string[]) => void
  setClickCharImages: (v: string[]) => void
  rpxToPx: (rpx: number) => number
  widthPx: number
  heightPx: number
  refresh: () => void
  addClickPointAndGet: (point: Point) => number
  verify: () => void
}

export function useClickCaptcha(config: BackendConfig, options: UseClickCaptchaOptions = {}): UseClickCaptchaReturn {
  const [state, setState] = useState<CaptchaState>(createInitialCaptchaState)
  const [clickPoints, setClickPoints] = useState<Point[]>([])
  const [clickTexts, setClickTexts] = useState<string[]>([])
  const [clickCharImages, setClickCharImages] = useState<string[]>([])

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
    setClickPoints([])
    setClickTexts([])
    setClickCharImages([])

    // Single fetch: populate shared state + click-specific metadata
    const draft = createInitialCaptchaState()
    draft.loading = true
    draft.errorMsg = ''
    draft.status = ''
    draft.sliderX = 0

    fetchCaptcha(config, {
      type: 'click',
      width: widthPx,
      height: heightPx,
      clickCount: options.clickCount ?? DEFAULT_CLICK_COUNT,
    })
      .then((res: BackendCaptchaResponse) => {
        if (!res.success || !res.data) throw new Error(res.message || 'Failed to get captcha')
        draft.captchaId = res.data.captchaId
        draft.bgImage = res.data.bgImage
        draft.sliderImage = res.data.sliderImage ?? ''
        draft.sliderY = res.data.sliderY ?? 0
        draft.loading = false
        setState({ ...draft })
        // Extract click-specific metadata from the same response
        setClickTexts(res.data.clickTexts ?? [])
        setClickCharImages(res.data.clickCharImages ?? [])
      })
      .catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err))
        draft.errorMsg = error.message
        draft.loading = false
        setState({ ...draft })
        options.onError?.(error)
      })
  }, [config, widthPx, heightPx, rpxToPx, options])

  /** Add a click point and return the new length (avoids stale closure on clickPoints.length) */
  const addClickPointAndGet = useCallback((point: Point): number => {
    let newLength = 0
    setClickPoints(prev => {
      const max = options.clickCount ?? DEFAULT_CLICK_COUNT
      if (prev.length >= max) {
        newLength = prev.length
        return prev
      }
      const next = [...prev, point]
      newLength = next.length
      return next
    })
    return newLength
  }, [options])

  const verify = useCallback(() => {
    setState(prev => {
      if (prev.status || prev.loading || !prev.captchaId) return prev
      const draft = { ...prev }
      draft.loading = true
      verifyClick(
        draft,
        config,
        clickPoints,
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
  }, [config, clickPoints, options, refresh])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    state,
    clickPoints,
    clickTexts,
    clickCharImages,
    setClickTexts: (v: string[]) => { setClickTexts(v) },
    setClickCharImages: (v: string[]) => { setClickCharImages(v) },
    rpxToPx,
    widthPx,
    heightPx,
    refresh,
    addClickPointAndGet,
    verify,
  }
}
