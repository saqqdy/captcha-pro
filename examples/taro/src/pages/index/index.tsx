import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useLocale } from '../../hooks/useLocale'
import './index.scss'

export default function Index() {
  const { locale, toggleLocale } = useLocale()

  const navigateTo = (url: string) => {
    Taro.navigateTo({ url })
  }

  return (
    <View className='index-page'>
      {/* Locale switcher */}
      <View className='locale-switcher' onClick={toggleLocale}>
        <Text className='locale-btn'>{locale === 'zh-CN' ? 'EN' : '中文'}</Text>
      </View>

      {/* Header */}
      <View className='index-header'>
        <Text className='index-logo'>🔐</Text>
        <Text className='index-title'>{locale === 'zh-CN' ? '验证码示例' : 'Captcha Demo'}</Text>
        <Text className='index-subtitle'>
          {locale === 'zh-CN' ? '多端验证码解决方案' : 'Cross-platform Captcha Solution'}
        </Text>
      </View>

      {/* Navigation cards */}
      <View className='index-cards'>
        <View className='nav-card' onClick={() => navigateTo('/pages/slider/index')}>
          <Text className='nav-card-icon'>🧩</Text>
          <View className='nav-card-content'>
            <Text className='nav-card-title'>{locale === 'zh-CN' ? '滑块验证码' : 'Slider Captcha'}</Text>
            <Text className='nav-card-desc'>
              {locale === 'zh-CN' ? '拖动滑块完成验证' : 'Drag slider to verify'}
            </Text>
          </View>
          <Text className='nav-card-arrow'>→</Text>
        </View>

        <View className='nav-card' onClick={() => navigateTo('/pages/click/index')}>
          <Text className='nav-card-icon'>🎯</Text>
          <View className='nav-card-content'>
            <Text className='nav-card-title'>{locale === 'zh-CN' ? '点击验证码' : 'Click Captcha'}</Text>
            <Text className='nav-card-desc'>
              {locale === 'zh-CN' ? '按序点击文字验证' : 'Click characters in order'}
            </Text>
          </View>
          <Text className='nav-card-arrow'>→</Text>
        </View>
      </View>

      {/* Footer */}
      <View className='index-footer'>
        <Text className='footer-text'>Powered by @captcha/mp</Text>
      </View>
    </View>
  )
}
