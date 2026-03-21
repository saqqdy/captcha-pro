import { useLocale } from '../hooks/useLocale'

export function Features() {
  const { currentLocale, t } = useLocale()

  const features = [
    { zh: '随机滑块形状', en: 'Random slider shapes' },
    { zh: '迷惑坑位防机器人', en: 'Decoy holes anti-bot' },
    { zh: '渐变背景装饰', en: 'Gradient background' },
    { zh: '中文词汇库', en: 'Chinese vocabulary' },
    { zh: '弹窗模式', en: 'Popup mode' },
    { zh: '后端验证', en: 'Backend verify' },
    { zh: '智能无感验证', en: 'Invisible captcha' },
    { zh: '多语言支持', en: 'i18n support' },
  ]

  return (
    <section className="features">
      <h2>{t('功能特性', 'Features')}</h2>
      <div className="feature-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-item">✓ {currentLocale === 'zh-CN' ? f.zh : f.en}</div>
        ))}
      </div>
    </section>
  )
}
