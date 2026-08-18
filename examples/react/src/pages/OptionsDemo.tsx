import type { ReactElement } from 'react'
import { ClickCaptcha, SliderCaptcha } from '@captcha-pro/react'
import { useState } from 'react'
import { useLocale } from '../hooks/useLocale'

export default function OptionsDemo(): ReactElement {
  const { currentLocale, t } = useLocale()
  const [configs, setConfigs] = useState({
    precision: 5,
    showRefresh: true
  })

  const [sliderResult, setSliderResult] = useState('')
  const [clickResult, setClickResult] = useState('')

  return (
    <section className="demo-section">
      <h2>⚙️ {t('配置选项演示', 'Configuration Options Demo')}</h2>

      <div className="info-box">
        <h3>{t('可配置选项', 'Available Options')}</h3>
        <p>{t('通过 props 自定义验证码组件的行为', 'Customize captcha via props')}</p>
      </div>

      <div className="config-panel">
        <h3>{t('配置面板', 'Configuration Panel')}</h3>
        <div className="config-grid">
          <div className="config-item">
            <label>
              <span className="config-label">{t('验证精度', 'Precision')}</span>
            </label>
            <input
              type="number"
              min={1}
              max={20}
              step={1}
              value={configs.precision}
              onChange={e => setConfigs({ ...configs, precision: Number(e.target.value) })}
            />
          </div>

          <div className="config-item">
            <label>
              <span className="config-label">{t('显示刷新按钮', 'Show Refresh')}</span>
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={configs.showRefresh}
                onChange={e => setConfigs({ ...configs, showRefresh: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="demo-grid">
        <div className="demo-item">
          <h3>{t('滑块验证码', 'Slider Captcha')}</h3>
          <div className="captcha-box">
            <SliderCaptcha
              width={300}
              height={170}
              precision={configs.precision}
              showRefresh={configs.showRefresh}
              locale={currentLocale}
              onSuccess={() => setSliderResult(t('验证成功！', 'Verification successful!'))}
            />
          </div>
          {sliderResult && <div className="result success">{sliderResult}</div>}
        </div>

        <div className="demo-item">
          <h3>{t('点选验证码', 'Click Captcha')}</h3>
          <div className="captcha-box">
            <ClickCaptcha
              width={300}
              height={170}
              precision={configs.precision}
              showRefresh={configs.showRefresh}
              locale={currentLocale}
              onSuccess={() => setClickResult(t('验证成功！', 'Verification successful!'))}
            />
          </div>
          {clickResult && <div className="result success">{clickResult}</div>}
        </div>
      </div>
    </section>
  )
}
