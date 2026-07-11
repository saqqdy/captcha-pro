import type { BackendConfig, PopupCaptchaRef } from '@captcha-pro/taro-react'
import { PopupCaptcha } from '@captcha-pro/taro-react'
import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import * as React from 'react'
import { useRef, useState } from 'react'
import './index.scss'

// 移到组件外部，避免每次渲染创建新引用
const backend: BackendConfig = {
  getCaptcha: 'http://localhost:3001/api/captcha',
  verify: 'http://localhost:3001/api/captcha/verify',
  timeout: 15000,
}

export default function Popup(): React.ReactNode {
  const sliderRef = useRef<PopupCaptchaRef>(null)
  const clickRef = useRef<PopupCaptchaRef>(null)
  const [status, setStatus] = useState('')

  const showSlider = (): void => {
    sliderRef.current?.show()
  }

  const showClick = (): void => {
    clickRef.current?.show()
  }

  const handleSuccess = (): void => {
    setStatus('验证成功')
    Taro.showToast({ title: '验证成功', icon: 'success' })
  }

  const handleFail = (): void => {
    setStatus('验证失败')
    Taro.showToast({ title: '验证失败', icon: 'error' })
  }

  const handleRefresh = (): void => {
    setStatus('')
  }

  const handleOpen = (): void => {
    // popup opened
  }

  const handleClose = (): void => {
    // popup closed
  }

  return (
    <View class='container'>
      <View class='title'>弹窗验证码</View>

      <View class='section captcha-section'>
        <View class='btn' onClick={showSlider}>
          弹出滑块验证
        </View>
        <View class='btn btn-secondary' onClick={showClick}>
          弹出点击验证
        </View>
      </View>

      <View class='section'>
        <Text>验证结果: {status}</Text>
      </View>

      <View class='section'>
        <View class='section-title'>使用说明</View>
        <Text class='desc'>弹窗验证码将滑块或点击验证码包裹在弹窗中，通过 ref 调用 show()/hide() 方法控制显示隐藏。</Text>
      </View>

      <PopupCaptcha
        ref={sliderRef}
        type='slider'
        backend={backend}
        onSuccess={handleSuccess}
        onFail={handleFail}
        onRefresh={handleRefresh}
        onOpen={handleOpen}
        onClose={handleClose}
      />

      <PopupCaptcha
        ref={clickRef}
        type='click'
        backend={backend}
        onSuccess={handleSuccess}
        onFail={handleFail}
        onRefresh={handleRefresh}
        onOpen={handleOpen}
        onClose={handleClose}
      />
    </View>
  )
}
