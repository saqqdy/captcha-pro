import { useState, useRef } from 'react'
import { View, Text, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import SliderCaptcha from '../../components/SliderCaptcha'
import type { SliderCaptchaProps } from '../../components/SliderCaptcha'
import { useLocale } from '../../hooks/useLocale'
import './index.scss'

const PRECISION_OPTIONS = [3, 5, 10]

export default function Slider() {
  const { locale, toggleLocale } = useLocale()

  const [config, setConfig] = useState({
    precision: 5,
    showRefresh: true,
  })
  const [status, setStatus] = useState('')
  const [precisionIndex, setPrecisionIndex] = useState(1)

  const handleSuccess = () => {
    setStatus(locale === 'zh-CN' ? '验证成功' : 'Success')
    Taro.showToast({ title: locale === 'zh-CN' ? '验证成功' : 'Success', icon: 'success' })
  }

  const handleFail = () => {
    setStatus(locale === 'zh-CN' ? '验证失败' : 'Failed')
    Taro.showToast({ title: locale === 'zh-CN' ? '验证失败' : 'Failed', icon: 'error' })
  }

  const handleRefresh = () => {
    setStatus('')
  }

  const resetCaptcha = () => {
    setStatus('')
    // Force refresh by remount - in real app you'd use a ref
    Taro.showToast({ title: locale === 'zh-CN' ? '已重置' : 'Reset', icon: 'none' })
  }

  const handlePrecisionChange = (e) => {
    const index = e.detail.value
    setPrecisionIndex(index)
    setConfig(prev => ({ ...prev, precision: PRECISION_OPTIONS[index] }))
  }

  const getPrecisionLabel = (value: number) => {
    if (locale === 'zh-CN') {
      if (value === 3) return '高 (3px)'
      if (value === 5) return '中 (5px)'
      return '低 (10px)'
    }
    if (value === 3) return 'High (3px)'
    if (value === 5) return 'Medium (5px)'
    return 'Low (10px)'
  }

  return (
    <View className='slider-page'>
      {/* Header */}
      <View className='page-header'>
        <Text className='page-title'>🧩 {locale === 'zh-CN' ? '滑块验证码' : 'Slider Captcha'}</Text>
        <View className='locale-btn' onClick={toggleLocale}>
          <Text>{locale === 'zh-CN' ? 'EN' : '中文'}</Text>
        </View>
      </View>

      {/* Options */}
      <View className='options-card'>
        <View className='option-row'>
          <Text className='option-label'>{locale === 'zh-CN' ? '验证精度' : 'Precision'}:</Text>
          <Picker
            mode='selector'
            range={PRECISION_OPTIONS.map(v => getPrecisionLabel(v))}
            value={precisionIndex}
            onChange={handlePrecisionChange}
          >
            <View className='picker'>
              <Text>{getPrecisionLabel(config.precision)}</Text>
              <Text className='picker-arrow'>▼</Text>
            </View>
          </Picker>
        </View>
        <View className='option-row'>
          <Text className='option-label'>{locale === 'zh-CN' ? '显示刷新' : 'Refresh'}:</Text>
          <View
            className={`switch ${config.showRefresh ? 'on' : ''}`}
            onClick={() => setConfig(prev => ({ ...prev, showRefresh: !prev.showRefresh }))}
          >
            <View className='switch-dot' />
          </View>
        </View>
      </View>

      {/* Captcha box */}
      <View className='captcha-box'>
        <SliderCaptcha
          width={650}
          height={380}
          precision={config.precision}
          showRefresh={config.showRefresh}
          onSuccess={handleSuccess}
          onFail={handleFail}
          onRefresh={handleRefresh}
        />
      </View>

      {/* Buttons */}
      <View className='btn-group'>
        <View className='btn btn-primary' onClick={resetCaptcha}>
          <Text>{locale === 'zh-CN' ? '重置验证码' : 'Reset'}</Text>
        </View>
      </View>

      {/* Status */}
      {status && (
        <View className={`status-card ${status.includes('成功') || status.includes('Success') ? 'success' : 'fail'}`}>
          <Text>{status}</Text>
        </View>
      )}
    </View>
  )
}
