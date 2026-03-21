import {
  type CaptchaData,
  type CaptchaStatistics,
  ClickCaptcha as ClickCaptchaCore,
  type ClickCaptchaInstance,
  type ClickCaptchaOptions,
  type BackendVerifyOptions,
} from '@captcha/core'
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface ClickCaptchaProps {
  width?: number
  height?: number
  bgImage?: string
  count?: number
  showRefresh?: boolean
  verifyMode?: 'frontend' | 'backend'
  locale?: 'zh-CN' | 'en-US'
  secretKey?: string
  backendVerify?: BackendVerifyOptions
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
      backendVerify,
      onSuccess,
      onFail,
      onRefresh,
      onReady,
      className,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const captchaInstance = useRef<ClickCaptchaInstance | null>(null)

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
        backendVerify,
        onSuccess,
        onFail,
        onRefresh,
      }

      captchaInstance.current = new ClickCaptchaCore(options) as ClickCaptchaInstance
      onReady?.(captchaInstance.current)

      return () => {
        captchaInstance.current?.destroy()
        captchaInstance.current = null
      }
    }, [width, height, bgImage, count, showRefresh, verifyMode, locale, secretKey, backendVerify, onSuccess, onFail, onRefresh, onReady])

    useImperativeHandle(ref, () => ({
      refresh: () => captchaInstance.current?.refresh(),
      getData: () => captchaInstance.current?.getData() as CaptchaData,
      getStatistics: () => captchaInstance.current?.getStatistics() as CaptchaStatistics,
      getInstance: () => captchaInstance.current,
    }))

    return (
      <div className={`captcha-react-wrapper ${className || ''}`}>
        <div ref={containerRef} className="captcha-container" />
      </div>
    )
  }
)

ClickCaptcha.displayName = 'ClickCaptcha'
