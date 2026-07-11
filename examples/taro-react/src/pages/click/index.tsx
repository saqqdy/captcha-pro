import type { BackendConfig } from '@captcha-pro/taro-react'
import { ClickCaptcha } from '@captcha-pro/taro-react'
import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import * as React from 'react'
import { useState } from 'react'
import './index.scss'

const backend: BackendConfig = {
  getCaptcha: 'http://localhost:3001/api/captcha',
  verify: 'http://localhost:3001/api/captcha/verify',
  timeout: 10000,
}

export default function Click(): React.ReactNode {
  const [status, setStatus] = useState('')

  const onSuccess = (): void => {
    setStatus('验证成功')
    Taro.showToast({ title: '验证成功', icon: 'success' })
  }

  const onFail = (): void => {
    setStatus('验证失败')
    Taro.showToast({ title: '验证失败', icon: 'error' })
  }

  const onRefresh = (): void => {
    setStatus('')
  }

  const onError = (err: unknown): void => {
    console.error('captcha error:', err)
    Taro.showToast({ title: '加载失败', icon: 'error' })
  }

  return (
    <View class='container'>
      <View class='title'>点击验证码</View>

      <View class='section captcha-section'>
        <ClickCaptcha
          width={650}
          height={380}
          count={3}
          showRefresh
          backend={backend}
          onSuccess={onSuccess}
          onFail={onFail}
          onRefresh={onRefresh}
          onError={onError}
        />
      </View>

      <View class='section'>
        <Text>验证结果: {status}</Text>
      </View>

      <View class='section'>
        <View class='section-title'>使用说明</View>
        <Text class='desc'>点击验证码采用后端服务模式，需要配置 backend 参数。{'\n'}按照提示文字依次点击图中对应位置完成验证。</Text>
      </View>
    </View>
  )
}
