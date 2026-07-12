import type { ClickCaptchaProps, PopupCaptchaProps, PopupCaptchaRef, SliderCaptchaProps } from '../types'
import { Text, View } from '@tarojs/components'
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { Show } from 'solid-js'
import ClickCaptcha from './ClickCaptcha'
import SliderCaptcha from './SliderCaptcha'
import '../styles/captcha.scss'

const EMPTY_OPTS: Record<string, unknown> = {}

const PopupCaptcha = forwardRef<PopupCaptchaRef, PopupCaptchaProps>((props, ref) => {
  const { type = 'slider', title = '安全验证', maskClosable: _maskClosable = true, showClose = true, autoClose = true, closeDelay = 500, sliderOptions: _sliderOptions = EMPTY_OPTS, clickOptions: _clickOptions = EMPTY_OPTS, backend: _backend, onSuccess, onFail, onRefresh: _onRefresh, onOpen, onClose } = props

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
    <View class="popup-captcha" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 'z-index': 1000, display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}>
      <View
        class="popup-mask"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleMaskClick}
      />
      <View
        class="popup-content"
        style={{ position: 'relative', 'z-index': 1, background: '#fff', 'border-radius': '24rpx', overflow: 'hidden', 'box-shadow': '0 8rpx 32rpx rgba(0, 0, 0, 0.2)', 'max-width': '90vw' }}
      >
        <View
          class="popup-header"
          style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', padding: '24rpx 32rpx', 'border-bottom': '1rpx solid #eee' }}
        >
          <Text style={{ 'font-size': '32rpx', 'font-weight': '600', color: '#333' }}>{title}</Text>
          <Show when={showClose}>
            <View
              class="popup-close"
              style={{ width: '48rpx', height: '48rpx', display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}
              onClick={() => { setVisible(false); onClose?.() }}
            >
              <Text style={{ 'font-size': '40rpx', color: '#999', 'line-height': '1' }}>×</Text>
            </View>
          </Show>
        </View>
        <View class="popup-body" style={{ padding: '32rpx' }}>
          <Show when={type === 'slider'} fallback={<ClickCaptcha {...clickProps} />}><SliderCaptcha {...sliderProps} /></Show>
        </View>
      </View>
    </View>
  )
})

PopupCaptcha.displayName = 'PopupCaptcha'

export default PopupCaptcha
