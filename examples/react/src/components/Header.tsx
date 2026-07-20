import type { ReactElement } from 'react'
import { useLocale } from '../hooks/useLocale'

export function Header(): ReactElement {
  const { currentLocale, t, switchLanguage } = useLocale()

  return (
    <header>
      <h1>
        🔐 Captcha Pro
        <span class="version-badge">v1.1.0</span>
      </h1>
      <p class="subtitle">
        {t('轻量级行为验证码库', 'Lightweight Behavioral Captcha Library')}
      </p>
      <div class="lang-switch">
        <button
          class={currentLocale === 'zh-CN' ? 'active' : ''}
          onClick={() => switchLanguage('zh-CN')}
        >
          中文
        </button>
        <button
          class={currentLocale === 'en-US' ? 'active' : ''}
          onClick={() => switchLanguage('en-US')}
        >
          English
        </button>
      </div>
    </header>
  )
}
