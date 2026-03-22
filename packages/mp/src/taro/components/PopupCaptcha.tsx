import type { FC } from 'react'
import { View, Text } from '@tarojs/components'
import { useCallback, useImperativeHandle, useRef, useState, forwardRef } from 'react'
import SliderCaptcha, { SliderCaptchaProps, SliderCaptchaRef } from './SliderCaptcha'
import ClickCaptcha, { ClickCaptchaProps, ClickCaptchaRef } from './ClickCaptcha'

export interface PopupCaptchaProps {
  /** Captcha type: 'slider' or 'click' */
  type?: 'slider' | 'click'
  /** Modal title */
  title?: string
  /** Whether to close on mask click */
  maskClosable?: boolean
  /** Whether to show close button */
  showClose?: boolean
  /** Whether to auto close after success */
  autoClose?: boolean
  /** Delay before auto close (ms) */
  closeDelay?: number
  /** Slider captcha props */
  sliderOptions?: Omit<SliderCaptchaProps, 'ref'>
  /** Click captcha props */
  clickOptions?: Omit<ClickCaptchaProps, 'ref'>
  /** Success callback */
  onSuccess?: () => void
  /** Fail callback */
  onFail?: () => void
  /** Open callback */
  onOpen?: () => void
  /** Close callback */
  onClose?: () => void
}

export interface PopupCaptchaRef {
  show: () => void
  hide: () => void
  isVisible: () => boolean
}

const popupStyles = `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`

const PopupCaptcha: FC<PopupCaptchaProps & { ref?: React.Ref<PopupCaptchaRef> }> = forwardRef<PopupCaptchaRef, PopupCaptchaProps>(({
  type = 'slider',
  title = '安全验证',
  maskClosable = true,
  showClose = true,
  autoClose = true,
  closeDelay = 500,
  sliderOptions = {},
  clickOptions = {},
  onSuccess,
  onFail,
  onOpen,
  onClose,
}, ref) => {
  const [visible, setVisible] = useState(false)
  const captchaRef = useRef<SliderCaptchaRef | ClickCaptchaRef>(null)

  const show = useCallback(() => {
    setVisible(true)
    onOpen?.()
  }, [onOpen])

  const hide = useCallback(() => {
    setVisible(false)
    onClose?.()
  }, [onClose])

  const isVisible = useCallback(() => visible, [visible])

  const handleMaskClick = useCallback(() => {
    if (maskClosable) {
      hide()
    }
  }, [maskClosable, hide])

  const handleSuccess = useCallback(() => {
    onSuccess?.()
    if (autoClose) {
      setTimeout(hide, closeDelay)
    }
  }, [onSuccess, autoClose, closeDelay, hide])

  const handleFail = useCallback(() => {
    onFail?.()
  }, [onFail])

  useImperativeHandle(ref, () => ({
    show,
    hide,
    isVisible,
  }))

  if (!visible) return null

  return (
    <View className='popup-captcha' style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Mask */}
      <View
        className='popup-mask'
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleMaskClick}
      />

      {/* Content */}
      <View
        className='popup-content'
        style={{ position: 'relative', zIndex: 1, background: '#fff', borderRadius: '24rpx', overflow: 'hidden', boxShadow: '0 8rpx 32rpx rgba(0, 0, 0, 0.2)', maxWidth: '90vw' }}
      >
        {/* Header */}
        <View
          className='popup-header'
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24rpx 32rpx', borderBottom: '1rpx solid #eee' }}
        >
          <Text style={{ fontSize: '32rpx', fontWeight: '600', color: '#333' }}>{title}</Text>
          {showClose && (
            <View className='popup-close' style={{ width: '48rpx', height: '48rpx', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={hide}>
              <Text style={{ fontSize: '40rpx', color: '#999', lineHeight: 1 }}>×</Text>
            </View>
          )}
        </View>

        {/* Captcha */}
        <View className='popup-body' style={{ padding: '32rpx' }}>
          {type === 'slider' ? (
            <SliderCaptcha
              ref={captchaRef as React.Ref<SliderCaptchaRef>}
              {...sliderOptions}
              onSuccess={handleSuccess}
              onFail={handleFail}
            />
          ) : (
            <ClickCaptcha
              ref={captchaRef as React.Ref<ClickCaptchaRef>}
              {...clickOptions}
              onSuccess={handleSuccess}
              onFail={handleFail}
            />
          )}
        </View>
      </View>
    </View>
  )
})

PopupCaptcha.displayName = 'PopupCaptcha'

export default PopupCaptcha
