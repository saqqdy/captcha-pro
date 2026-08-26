import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'

/**
 * 暗黑模式 hook
 * 从存储读取主题状态，如果未设置则跟随系统主题
 */
export function useTheme(): { isDark: boolean } {
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

  return { isDark }
}
