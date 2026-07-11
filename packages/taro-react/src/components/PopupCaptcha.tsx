import type { ClickCaptchaProps, PopupCaptchaProps, PopupCaptchaRef, SliderCaptchaProps } from '../types'
import { Text, View } from '@tarojs/components'
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import ClickCaptcha from './ClickCaptcha'
import SliderCaptcha from './SliderCaptcha'
import '../styles/captcha.scss'

const EMPTY_OPTS: Record<string, unknown> = {}

const PopupCaptcha = forwardRef<PopupCaptchaRef, PopupCaptchaProps>((props, ref) => {
  const { type = 'slider', title = '安全验证', maskClosable = true, showClose = true, autoClose = true, closeDelay = 500, sliderOptions = EMPTY_OPTS, clickOptions = EMPTY_OPTS, backend, onSuccess, onFail, onRefresh, onOpen, onClose } = props

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
    <View className="popup-captcha" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <View
        className="popup-mask"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleMaskClick}
      />
      <View
        className="popup-content"
        style={{ position: 'relative', zIndex: 1, background: '#fff', borderRadius: '24rpx', overflow: 'hidden', boxShadow: '0 8rpx 32rpx rgba(0, 0, 0, 0.2)', maxWidth: '90vw' }}
      >
        <View
          className="popup-header"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24rpx 32rpx', borderBottom: '1rpx solid #eee' }}
        >
          <Text style={{ fontSize: '32rpx', fontWeight: '600', color: '#333' }}>{title}</Text>
          {showClose && (
            <View
              className="popup-close"
              style={{ width: '48rpx', height: '48rpx', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => { setVisible(false); onClose?.() }}
            >
              <Text style={{ fontSize: '40rpx', color: '#999', lineHeight: 1 }}>×</Text>
            </View>
          )}
        </View>
        <View className="popup-body" style={{ padding: '32rpx' }}>
          {type === 'slider' ? <SliderCaptcha {...sliderProps} /> : <ClickCaptcha {...clickProps} />}
        </View>
      </View>
    </View>
  )
})

PopupCaptcha.displayName = 'PopupCaptcha'

export default PopupCaptcha