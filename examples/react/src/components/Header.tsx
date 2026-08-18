import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { useLocale } from '../hooks/useLocale'

export function Header(): ReactElement {
  const { currentLocale, t, switchLanguage } = useLocale()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('cp-theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (saved === 'dark' || (saved === null && systemDark)) {
      setIsDark(true)
      document.documentElement.classList.add('cp-dark')
      document.documentElement.classList.remove('cp-light')
    } else if (saved === 'light') {
      setIsDark(false)
      document.documentElement.classList.add('cp-light')
      document.documentElement.classList.remove('cp-dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('cp-dark', 'cp-light')
    }
  }, [])

  const toggleTheme = (): void => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('cp-dark', next)
    document.documentElement.classList.toggle('cp-light', !next)
    localStorage.setItem('cp-theme', next ? 'dark' : 'light')
  }

  return (
    <header>
      <h1>
        🔐 Captcha Pro
        <span className="version-badge">v2.3.0</span>
      </h1>
      <p className="subtitle">
        {t('轻量级行为验证码库', 'Lightweight Behavioral Captcha Library')}
      </p>
      <div className="lang-switch">
        <button
          className={currentLocale === 'zh-CN' ? 'active' : ''}
          onClick={() => switchLanguage('zh-CN')}
        >
          中文
        </button>
        <button
          className={currentLocale === 'en-US' ? 'active' : ''}
          onClick={() => switchLanguage('en-US')}
        >
          English
        </button>
      </div>
      <div className="theme-switch">
        <button className={isDark ? 'active' : ''} onClick={toggleTheme}>
          {isDark
            ? (currentLocale === 'zh-CN' ? '☀️ 浅色模式' : '☀️ Light')
            : (currentLocale === 'zh-CN' ? '🌙 暗色模式' : '🌙 Dark')}
        </button>
      </div>
    </header>
  )
}
