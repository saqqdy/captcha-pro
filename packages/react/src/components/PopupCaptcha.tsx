import {
  PopupCaptcha as PopupCaptchaCore,
  type PopupCaptchaInstance,
  type PopupCaptchaOptions,
} from '@captcha/core'
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface PopupCaptchaProps {
  type?: 'slider' | 'click'
  trigger?: string
  children?: React.ReactNode
  modal?: {
    maskClosable?: boolean
    escClosable?: boolean
    showClose?: boolean
    title?: string
  }
  autoClose?: boolean
  closeDelay?: number
  captchaOptions?: Record<string, unknown>
  onOpen?: () => void
  onClose?: () => void
  onSuccess?: () => void
  onFail?: () => void
  onReady?: (instance: PopupCaptchaInstance) => void
}

export interface PopupCaptchaRef {
  show: () => void
  hide: () => void
  isVisible: () => boolean
  getInstance: () => PopupCaptchaInstance | null
}

export const PopupCaptcha = forwardRef<PopupCaptchaRef, PopupCaptchaProps>(
  (props, ref) => {
    const {
      type = 'slider',
      trigger,
      modal,
      autoClose = true,
      closeDelay = 500,
      captchaOptions,
      onOpen,
      onClose,
      onSuccess,
      onFail,
      onReady,
    } = props

    const popupInstance = useRef<PopupCaptchaInstance | null>(null)

    useEffect(() => {
      const options: PopupCaptchaOptions = {
        type,
        trigger,
        modal,
        autoClose,
        closeDelay,
        captchaOptions: captchaOptions as any,
        onOpen,
        onClose,
        onSuccess,
        onFail,
      }

      popupInstance.current = new PopupCaptchaCore(options) as PopupCaptchaInstance
      onReady?.(popupInstance.current)

      return () => {
        popupInstance.current?.destroy()
        popupInstance.current = null
      }
    }, [])

    useImperativeHandle(ref, () => ({
      show: () => popupInstance.current?.show(),
      hide: () => popupInstance.current?.hide(),
      isVisible: () => popupInstance.current?.isVisible() ?? false,
      getInstance: () => popupInstance.current,
    }))

    return <>{props.children}</>
  }
)

PopupCaptcha.displayName = 'PopupCaptcha'
