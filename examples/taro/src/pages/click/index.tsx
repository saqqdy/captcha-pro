import { useState } from 'react'
import { View, Text, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import ClickCaptcha from '../../components/ClickCaptcha'
import { useLocale } from '../../hooks/useLocale'
import './index.scss'

const COUNT_OPTIONS = [2, 3, 4]

export default function Click() {
  const { locale, toggleLocale } = useLocale()

  const [config, setConfig] = useState({
    count: 3,
    showRefresh: true,
  })
  const [status, setStatus] = useState('')
  const [countIndex, setCountIndex] = useState(1)

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
    Taro.showToast({ title: locale === 'zh-CN' ? '已重置' : 'Reset', icon: 'none' })
  }

  const handleCountChange = (e) => {
    const index = e.detail.value
    setCountIndex(index)
    setConfig(prev => ({ ...prev, count: COUNT_OPTIONS[index] }))
  }

  return (
    <View className='click-page'>
      {/* Header */}
      <View className='page-header'>
        <Text className='page-title'>🎯 {locale === 'zh-CN' ? '点击验证码' : 'Click Captcha'}</Text>
        <View className='locale-btn' onClick={toggleLocale}>
          <Text>{locale === 'zh-CN' ? 'EN' : '中文'}</Text>
        </View>
      </View>

      {/* Info */}
      <View className='info-card'>
        <Text className='info-text'>
          💡 {locale === 'zh-CN'
            ? '使用中文词汇库自动生成，包含200+常用成语和词汇'
            : 'Auto-generated from Chinese vocabulary (200+ words)'}
        </Text>
      </View>

      {/* Options */}
      <View className='options-card'>
        <View className='option-row'>
          <Text className='option-label'>{locale === 'zh-CN' ? '点击数量' : 'Count'}:</Text>
          <Picker
            mode='selector'
            range={COUNT_OPTIONS}
            value={countIndex}
            onChange={handleCountChange}
          >
            <View className='picker'>
              <Text>{config.count}</Text>
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
        <ClickCaptcha
          width={650}
          height={380}
          count={config.count}
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
