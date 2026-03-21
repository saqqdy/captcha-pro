import { useState, useRef } from 'react'
import { PopupCaptcha, type PopupCaptchaInstance } from '@captcha/react'
import { useLocale } from '../hooks/useLocale'

export function PopupDemo() {
  const { currentLocale, t } = useLocale()
  const [type, setType] = useState<'slider' | 'click'>('slider')
  const [autoClose, setAutoClose] = useState(true)
  const popupRef = useRef<PopupCaptchaInstance>(null)

  return (
    <section className="demo-section">
      <h2>💬 {t('弹窗验证码', 'Popup Captcha')}</h2>

      <div className="options">
        <div className="option-row">
          <label>{t('验证码类型', 'Type')}:</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'slider' | 'click')}>
            <option value="slider">{t('滑块验证', 'Slider')}</option>
            <option value="click">{t('点击验证', 'Click')}</option>
          </select>
        </div>
        <div className="option-row">
          <label>{t('自动关闭', 'Auto Close')}:</label>
          <input type="checkbox" checked={autoClose} onChange={(e) => setAutoClose(e.target.checked)} />
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-primary" onClick={() => popupRef.current?.show()}>
          {t('打开验证弹窗', 'Open Popup')}
        </button>
      </div>

      <PopupCaptcha
        ref={popupRef}
        type={type}
        autoClose={autoClose}
        captchaOptions={{ width: 320, height: 180, locale: currentLocale }}
        onSuccess={() => console.log('Popup success')}
      >
        <span></span>
      </PopupCaptcha>
    </section>
  )
}
