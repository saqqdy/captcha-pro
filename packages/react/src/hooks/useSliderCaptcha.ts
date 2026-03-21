import type { RefObject } from 'react'
import {
  type CaptchaData,
  type CaptchaStatistics,
  SliderCaptcha as SliderCaptchaCore,
  type SliderCaptchaInstance,
  type SliderCaptchaOptions,
} from '@captcha/core'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseSliderCaptchaOptions {
  width?: number
  height?: number
  bgImage?: string
  sliderImage?: string
  sliderWidth?: number
  sliderHeight?: number
  precision?: number
  showRefresh?: boolean
  verifyMode?: 'frontend' | 'backend'
  locale?: 'zh-CN' | 'en-US'
  secretKey?: string
  onSuccess?: () => void
  onFail?: () => void
  onRefresh?: () => void
}

export interface UseSliderCaptchaReturn {
  containerRef: RefObject<HTMLDivElement | null>
  status: '' | 'success' | 'fail'
  statusText: string
  refresh: () => void
  getData: () => CaptchaData | undefined
  getStatistics: () => CaptchaStatistics | undefined
  getInstance: () => SliderCaptchaInstance | null
}

export function useSliderCaptcha(options: UseSliderCaptchaOptions = {}): UseSliderCaptchaReturn {
  const {
    width = 300,
    height = 170,
    bgImage,
    sliderImage,
    sliderWidth = 42,
    sliderHeight = 42,
    precision = 5,
    showRefresh = true,
    verifyMode = 'frontend',
    locale = 'zh-CN',
    secretKey,
    onSuccess,
    onFail,
    onRefresh,
  } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const captchaInstance = useRef<SliderCaptchaInstance | null>(null)
  const [status, setStatus] = useState<'' | 'success' | 'fail'>('')

  const statusText =
    status === 'success'
      ? locale === 'zh-CN'
        ? '验证成功'
        : 'Success'
      : status === 'fail'
        ? locale === 'zh-CN'
          ? '验证失败'
          : 'Failed'
        : ''

  useEffect(() => {
    if (!containerRef.current) return

    const captchaOptions: SliderCaptchaOptions = {
      el: containerRef.current,
      width,
      height,
      bgImage,
      sliderImage,
      sliderWidth,
      sliderHeight,
      precision,
      showRefresh,
      verifyMode,
      locale,
      security: secretKey ? { secretKey } : undefined,
      onSuccess: () => {
        setStatus('success')
        onSuccess?.()
      },
      onFail: () => {
        setStatus('fail')
        onFail?.()
      },
      onRefresh: () => {
        setStatus('')
        onRefresh?.()
      },
    }

    captchaInstance.current = new SliderCaptchaCore(captchaOptions) as SliderCaptchaInstance

    return () => {
      captchaInstance.current?.destroy()
      captchaInstance.current = null
    }
  }, [])

  useEffect(() => {
    captchaInstance.current?.refresh()
  }, [bgImage, sliderImage])

  const refresh = useCallback(() => {
    captchaInstance.current?.refresh()
  }, [])

  const getData = useCallback(() => {
    return captchaInstance.current?.getData()
  }, [])

  const getStatistics = useCallback(() => {
    return captchaInstance.current?.getStatistics()
  }, [])

  const getInstance = useCallback(() => {
    return captchaInstance.current
  }, [])

  return {
    containerRef,
    status,
    statusText,
    refresh,
    getData,
    getStatistics,
    getInstance,
  }
}
