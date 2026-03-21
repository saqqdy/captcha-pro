import type { RefObject } from 'react'
import {
  type CaptchaData,
  type CaptchaStatistics,
  ClickCaptcha as ClickCaptchaCore,
  type ClickCaptchaInstance,
  type ClickCaptchaOptions,
} from '@captcha/core'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseClickCaptchaOptions {
  width?: number
  height?: number
  bgImage?: string
  count?: number
  showRefresh?: boolean
  verifyMode?: 'frontend' | 'backend'
  locale?: 'zh-CN' | 'en-US'
  secretKey?: string
  onSuccess?: () => void
  onFail?: () => void
  onRefresh?: () => void
}

export interface UseClickCaptchaReturn {
  containerRef: RefObject<HTMLDivElement | null>
  status: '' | 'success' | 'fail'
  statusText: string
  refresh: () => void
  getData: () => CaptchaData | undefined
  getStatistics: () => CaptchaStatistics | undefined
  getInstance: () => ClickCaptchaInstance | null
}

export function useClickCaptcha(options: UseClickCaptchaOptions = {}): UseClickCaptchaReturn {
  const {
    width = 300,
    height = 170,
    bgImage,
    count = 3,
    showRefresh = true,
    verifyMode = 'frontend',
    locale = 'zh-CN',
    secretKey,
    onSuccess,
    onFail,
    onRefresh,
  } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const captchaInstance = useRef<ClickCaptchaInstance | null>(null)
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

    const captchaOptions: ClickCaptchaOptions = {
      el: containerRef.current,
      width,
      height,
      bgImage,
      count,
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

    captchaInstance.current = new ClickCaptchaCore(captchaOptions) as ClickCaptchaInstance

    return () => {
      captchaInstance.current?.destroy()
      captchaInstance.current = null
    }
  }, [])

  useEffect(() => {
    captchaInstance.current?.refresh()
  }, [bgImage])

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
