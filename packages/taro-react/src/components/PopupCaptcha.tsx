import type { ClickCaptchaProps, PopupCaptchaProps, PopupCaptchaRef, SliderCaptchaProps } from '../types'
import { DEFAULT_LOCALE, getLocaleMessage } from '@captcha-pro/mp-shared'
import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import ClickCaptcha from './ClickCaptcha'
import SliderCaptcha from './SliderCaptcha'
import '../styles/captcha.scss'

const EMPTY_OPTS: Record<string, unknown> = {}

const PopupCaptcha = forwardRef<PopupCaptchaRef, PopupCaptchaProps>((props, ref) => {
  const { type = 'slider', title = '安全验证', maskClosable: _maskClosable = true, showClose = true, autoClose = true, closeDelay = 500, sliderOptions: _sliderOptions = EMPTY_OPTS, clickOptions: _clickOptions = EMPTY_OPTS, backend: _backend, onSuccess, onFail, onRefresh: _onRefresh, onOpen, onClose } = props

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    try {
      const saved = Taro.getStorageSync('cp-theme')
      const systemDark = Taro.getSystemInfoSync().theme === 'dark'
      setIsDark(saved === 'dark' || (saved !== 'light' && systemDark))
    } catch {
      // ignore
    }
  }, [])

  const t = (key: string): string => getLocaleMessage(DEFAULT_LOCALE, key)

  const [visible, setVisible] = useState(false)

  // Use refs for callbacks to avoid dependency issues
  const onSuccessRef = useRef(props.onSuccess)
  const onFailRef = useRef(props.onFail)
  const onOpenRef = useRef(props.onOpen)
  const onCloseRef = useRef(props.onClose)

  // Update refs when props change
  onSuccessRef.current = props.onSuccess
  onFailRef.current = props.onFail
  onOpenRef.current = props.onOpen
  onCloseRef.current = props.onClose

  useImperativeHandle(ref, () => ({
    show: () => {
      setVisible(true)
      onOpen?.()
    },
    hide: () => {
      setVisible(false)
      onClose?.()
    },
    isVisible: () => visible,
  }), [])

  const handleMaskClick = useCallback(() => {
    if (props.maskClosable) {
      setVisible(false)
      onClose?.()
    }
  }, [props.maskClosable])

  const handleSuccess = useCallback((data?: { verifiedAt: number }) => {
    onSuccess?.(data)
    if (autoClose) {
      setTimeout(() => {
        setVisible(false)
        onClose?.()
      }, closeDelay)
    }
  }, [autoClose, closeDelay, onSuccess, onClose])

  const handleFail = useCallback(() => {
    onFail?.()
  }, [])

  // Early return is safe for React components
  if (!visible) return null

  const sliderProps: SliderCaptchaProps = { ...props.sliderOptions, backend: props.backend, onSuccess: handleSuccess, onFail: handleFail, onRefresh: props.onRefresh }
  const clickProps: ClickCaptchaProps = { ...props.clickOptions, backend: props.backend, onSuccess: handleSuccess, onFail: handleFail, onRefresh: props.onRefresh }

  return (
    <View className={`popup-captcha ${isDark ? 'cp-dark' : 'cp-light'}`} role="dialog" aria-modal="true" aria-label={title}>
      <View
        className="popup-mask"
        role="button"
        aria-label={t('popup_close')}
        onClick={handleMaskClick}
      />
      <View className="popup-content">
        <View className="popup-header">
          <Text className="popup-title">{title}</Text>
          {showClose && (
            <View
              className="popup-close"
              role="button"
              aria-label={t('popup_close')}
              onClick={() => { setVisible(false); onClose?.() }}
            >
              <Text className="popup-close-text">×</Text>
            </View>
          )}
        </View>
        <View className="popup-body">
          {type === 'slider' ? <SliderCaptcha {...sliderProps} /> : <ClickCaptcha {...clickProps} />}
        </View>
      </View>
    </View>
  )
})

PopupCaptcha.displayName = 'PopupCaptcha'

export default PopupCaptcha
