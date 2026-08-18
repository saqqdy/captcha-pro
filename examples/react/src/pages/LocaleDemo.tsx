import type { ReactElement } from 'react'
import { ClickCaptcha, getLocale, setLocale, SliderCaptcha } from '@captcha-pro/react'
import { useState } from 'react'
import { useLocale } from '../hooks/useLocale'

export default function LocaleDemo(): ReactElement {
  const { t } = useLocale()
  const [selectedLocale, setSelectedLocale] = useState(getLocale())

  const locales = [
    { code: 'zh-CN', label: '简体中文' },
    { code: 'en-US', label: 'English' }
  ]

  const i18nKeys = [
    { key: 'slider_hint', zh: '向右拖动滑块填满缺口', en: 'Drag the slider to fill the gap' },
    { key: 'click_prompt', zh: '请依次点击', en: 'Please click in order' },
    { key: 'loading', zh: '加载中...', en: 'Loading...' },
    { key: 'refresh', zh: '刷新', en: 'Refresh' },
    { key: 'success', zh: '验证成功', en: 'Verification successful' },
    { key: 'fail', zh: '验证失败', en: 'Verification failed' }
  ]

  const switchLocale = (loc: string): void => {
    setSelectedLocale(loc)
    setLocale(loc)
  }

  return (
    <section className="demo-section">
      <h2>🌐 {t('国际化演示', 'Internationalization Demo')}</h2>

      <div className="locale-switcher">
        {locales.map(loc => (
          <button
            key={loc.code}
            className={selectedLocale === loc.code ? 'active' : ''}
            onClick={() => switchLocale(loc.code)}
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
              <th>简体中文</th>
              <th>English</th>
            </tr>
          </thead>
          <tbody>
            {i18nKeys.map(item => (
              <tr key={item.key}>
                <td><code>{item.key}</code></td>
                <td>{item.zh}</td>
                <td>{item.en}</td>
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
              locale={selectedLocale}
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
              locale={selectedLocale}
              onSuccess={() => {}}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
