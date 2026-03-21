import { useState, useRef } from 'react'
import { ClickCaptcha, type ClickCaptchaInstance } from '@captcha/react'
import { useLocale } from '../hooks/useLocale'

export function ClickDemo() {
  const { currentLocale, t } = useLocale()
  const [count, setCount] = useState(3)
  const captchaRef = useRef<ClickCaptchaInstance>(null)

  return (
    <section className="demo-section">
      <h2>🎯 {t('点选文字验证码', 'Click Captcha')}</h2>

      <div className="info-box">
        💡 {t('使用中文词汇库自动生成，包含200+常用成语和词汇。', 'Auto-generated from Chinese vocabulary (200+ words).')}
      </div>

      <div className="options">
        <div className="option-row">
          <label>{t('点击数量', 'Click Count')}:</label>
          <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
      </div>

      <div className="captcha-box">
        <ClickCaptcha
          ref={captchaRef}
          width={320}
          height={180}
          count={count}
          locale={currentLocale}
          onSuccess={() => console.log('Click success')}
        />
      </div>

      <div className="btn-group">
        <button className="btn btn-primary" onClick={() => captchaRef.current?.refresh()}>
          {t('重置验证码', 'Reset')}
        </button>
        <button className="btn btn-secondary" onClick={() => {
          console.log('Click data:', captchaRef.current?.getData())
          alert(t('验证数据已输出到控制台', 'Data logged to console'))
        }}>
          {t('获取数据', 'Get Data')}
        </button>
      </div>
    </section>
  )
}
