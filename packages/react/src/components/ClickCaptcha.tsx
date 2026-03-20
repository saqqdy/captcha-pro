import {
  type CaptchaData,
  type CaptchaStatistics,
  ClickCaptcha as ClickCaptchaCore,
  type ClickCaptchaInstance,
  type ClickCaptchaOptions,
} from '@captcha/core'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

export interface ClickCaptchaProps {
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
  onReady?: (instance: ClickCaptchaInstance) => void
  className?: string
}

export interface ClickCaptchaRef {
  refresh: () => void
  getData: () => CaptchaData
  getStatistics: () => CaptchaStatistics
  getInstance: () => ClickCaptchaInstance | null
}

export const ClickCaptcha = forwardRef<ClickCaptchaRef, ClickCaptchaProps>(
  (props, ref) => {
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
      onReady,
      className,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const captchaInstance = useRef<ClickCaptchaInstance | null>(null)
    const [status, setStatus] = useState<'' | 'success' | 'fail'>('')

    const statusText =
      status === 'success' ? (locale === 'zh-CN' ? '验证成功' : 'Success') : status === 'fail' ? (locale === 'zh-CN' ? '验证失败' : 'Failed') : ''

    useEffect(() => {
      if (!containerRef.current) return

      const options: ClickCaptchaOptions = {
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

      captchaInstance.current = new ClickCaptchaCore(options) as ClickCaptchaInstance
      onReady?.(captchaInstance.current)

      return () => {
        captchaInstance.current?.destroy()
        captchaInstance.current = null
      }
    }, [])

    useEffect(() => {
      captchaInstance.current?.refresh()
    }, [bgImage])

    useImperativeHandle(ref, () => ({
      refresh: () => captchaInstance.current?.refresh(),
      getData: () => captchaInstance.current?.getData() as CaptchaData,
      getStatistics: () => captchaInstance.current?.getStatistics() as CaptchaStatistics,
      getInstance: () => captchaInstance.current,
    }))

    return (
      <div className={`captcha-react-wrapper ${className || ''}`}>
        <div ref={containerRef} className="captcha-container" />
        {status && (
          <div className={`captcha-status ${status}`}>
            {statusText}
          </div>
        )}
      </div>
    )
  }
)

ClickCaptcha.displayName = 'ClickCaptcha'
