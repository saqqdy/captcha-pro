import type { ReactElement } from 'react'
import { useLocale } from '../hooks/useLocale'

export function Features(): ReactElement {
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
    { zh: '系统暗色模式', en: 'System dark mode', badge: 'v2.3.0' },
    { zh: '弹窗焦点陷阱', en: 'Popup focus trap', badge: 'v2.3.0' },
    { zh: '无障碍(a11y)', en: 'Accessibility (a11y)', badge: 'v2.2.0' },
    { zh: 'Native 三端对齐', en: 'Native alignment', badge: 'v2.1.0' },
  ]

  return (
    <section className="features">
      <h2>{t('功能特性', 'Features')}</h2>
      <div className="feature-grid">
        {features.map((f) => (
          <div key={f.en} className="feature-item">
            ✓
            {currentLocale === 'zh-CN' ? f.zh : f.en}
            {f.badge && <span className="new-badge">{f.badge}</span>}
          </div>
        ))}
      </div>
    </section>
  )
}
