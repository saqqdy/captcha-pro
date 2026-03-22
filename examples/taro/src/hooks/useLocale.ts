import { useState, useCallback } from 'react'
import Taro from '@tarojs/taro'

type Locale = 'zh-CN' | 'en-US'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const savedLocale = Taro.getStorageSync('locale')
    return (savedLocale as Locale) || 'zh-CN'
  })

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    Taro.setStorageSync('locale', newLocale)
  }, [])

  const toggleLocale = useCallback(() => {
    const newLocale = locale === 'zh-CN' ? 'en-US' : 'zh-CN'
    setLocale(newLocale)
  }, [locale, setLocale])

  return {
    locale,
    setLocale,
    toggleLocale,
  }
}
