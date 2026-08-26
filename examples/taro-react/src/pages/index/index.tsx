import { Navigator, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import * as React from 'react'
import { useEffect, useState } from 'react'
import './index.scss'

export default function Index(): React.ReactNode {
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

  const toggleTheme = (): void => {
    const next = !isDark
    setIsDark(next)
    try {
      Taro.setStorageSync('cp-theme', next ? 'dark' : 'light')
    } catch {
      // ignore
    }
  }

  return (
    <View className={`index ${isDark ? 'cp-dark' : 'cp-light'}`}>
      <View className="title">Captcha Pro</View>
      <View className="subtitle">Taro + React 示例</View>

      <View className="theme-switch">
        <button onClick={toggleTheme}>
          {isDark ? '☀️ 浅色模式' : '🌙 暗色模式'}
        </button>
      </View>

      <View className="features">
        <View className="features-title">v2.x 功能特性</View>
        <View className="feature-item">✓ 系统暗色模式 <Text className="badge">v2.3.0</Text></View>
        <View className="feature-item">✓ 弹窗焦点陷阱 <Text className="badge">v2.3.0</Text></View>
        <View className="feature-item">✓ 无障碍(a11y) <Text className="badge">v2.2.0</Text></View>
        <View className="feature-item">✓ Native 三端对齐 <Text className="badge">v2.1.0</Text></View>
        <View className="feature-item">✓ 后端验证</View>
        <View className="feature-item">✓ 智能无感验证</View>
        <View className="feature-item">✓ 多语言支持</View>
      </View>

      <Navigator url="/pages/slider/index" className="card">
        <Text className="card-title">滑块验证码</Text>
        <Text className="card-desc">拖动滑块至缺口位置完成验证</Text>
      </Navigator>
      <Navigator url="/pages/click/index" className="card">
        <Text className="card-title">点击验证码</Text>
        <Text className="card-desc">按提示依次点击图中对应位置</Text>
      </Navigator>
      <Navigator url="/pages/popup/index" className="card">
        <Text className="card-title">弹窗验证码</Text>
        <Text className="card-desc">弹窗形式的滑块或点击验证</Text>
      </Navigator>
    </View>
  )
}
