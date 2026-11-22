import type { ReactElement } from 'react'
import { ClickCaptcha, SliderCaptcha, t as translate } from '@captcha-pro/react'
import { type Locale, useLocale } from '../hooks/useLocale'

export default function LocaleDemo(): ReactElement {
  const { t, currentLocale, switchLanguage } = useLocale()

  const locales = [
    { code: 'zh-CN', label: '简体中文' },
    { code: 'zh-TW', label: '繁體中文' },
    { code: 'en-US', label: 'English' },
    { code: 'fr-FR', label: 'Français' },
    { code: 'de-DE', label: 'Deutsch' },
    { code: 'es-ES', label: 'Español' }
  ]

  const messageKeys = [
    'refresh',
    'slider.slide',
    'slider.success',
    'slider.fail',
    'click.prompt',
    'click.success',
    'click.fail',
    'popup.title',
    'popup.close',
    'errors.network',
    'errors.expired',
    'errors.invalid',
    'errors.notFound',
    'errors.fetchFailed'
  ]


  return (
    <section className="demo-section page-locale">
      <h2>🌐 {t('国际化演示', 'Internationalization Demo')}</h2>

      <div className="locale-switcher">
        {locales.map(loc => (
          <button
            key={loc.code}
            className={currentLocale === loc.code ? 'active' : ''}
            onClick={() => switchLanguage(loc.code as Locale)}
          >
            {loc.label}
          </button>
        ))}
      </div>

      <div className="i18n-table">
        <h3>{t('支持的语言 Key', 'Supported i18n Keys')}</h3>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              {locales.map(loc => <th key={loc.code}>{loc.code}</th>)}
            </tr>
          </thead>
          <tbody>
            {messageKeys.map(key => (
              <tr key={key}>
                <td><code>{key}</code></td>
                {locales.map(loc => <td key={loc.code}>{translate(key, loc.code as Locale)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="demo-grid">
        <div className="demo-item">
          <h3>{t('滑块验证码', 'Slider Captcha')}</h3>
          <div className="captcha-box">
            <SliderCaptcha
              width={300}
              height={170}
              locale={currentLocale}
              onSuccess={() => {}}
            />
          </div>
        </div>

        <div className="demo-item">
          <h3>{t('点选验证码', 'Click Captcha')}</h3>
          <div className="captcha-box">
            <ClickCaptcha
              width={300}
              height={170}
              locale={currentLocale}
              onSuccess={() => {}}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
