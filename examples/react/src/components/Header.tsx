import { useLocale } from '../hooks/useLocale'

export function Header() {
  const { currentLocale, t, switchLanguage } = useLocale()

  return (
    <header>
      <h1>
        🔐 Captcha Pro
        <span className="version-badge">v1.1.0</span>
      </h1>
      <p className="subtitle">
        {t('轻量级行为验证码库', 'Lightweight Behavioral Captcha Library')}
      </p>
      <div className="lang-switch">
        <button
          className={currentLocale === 'zh-CN' ? 'active' : ''}
          onClick={() => switchLanguage('zh-CN')}
        >中文</button>
        <button
          className={currentLocale === 'en-US' ? 'active' : ''}
          onClick={() => switchLanguage('en-US')}
        >English</button>
      </div>
    </header>
  )
}
