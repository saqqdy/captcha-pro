import {
  type CaptchaData,
  type CaptchaStatistics,
  SliderCaptcha as SliderCaptchaCore,
  type SliderCaptchaInstance,
  type SliderCaptchaOptions,
  type BackendVerifyOptions,
} from '@captcha/core'
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface SliderCaptchaProps {
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
  backendVerify?: BackendVerifyOptions
  onSuccess?: () => void
  onFail?: () => void
  onRefresh?: () => void
  onReady?: (instance: SliderCaptchaInstance) => void
  className?: string
}

export interface SliderCaptchaRef {
  refresh: () => void
  getData: () => CaptchaData
  getStatistics: () => CaptchaStatistics
  getInstance: () => SliderCaptchaInstance | null
}

export const SliderCaptcha = forwardRef<SliderCaptchaRef, SliderCaptchaProps>(
  (props, ref) => {
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
      backendVerify,
      onSuccess,
      onFail,
      onRefresh,
      onReady,
      className,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const captchaInstance = useRef<SliderCaptchaInstance | null>(null)

    useEffect(() => {
      if (!containerRef.current) return

      const options: SliderCaptchaOptions = {
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
        backendVerify,
        onSuccess,
        onFail,
        onRefresh,
      }

      captchaInstance.current = new SliderCaptchaCore(options) as SliderCaptchaInstance
      onReady?.(captchaInstance.current)

      return () => {
        captchaInstance.current?.destroy()
        captchaInstance.current = null
      }
    }, [width, height, bgImage, sliderImage, sliderWidth, sliderHeight, precision, showRefresh, verifyMode, locale, secretKey, backendVerify, onSuccess, onFail, onRefresh, onReady])

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

SliderCaptcha.displayName = 'SliderCaptcha'
