import { useState, useRef } from 'react'
import { SliderCaptcha, type SliderCaptchaInstance, type CaptchaStatistics } from '@captcha/react'
import { useLocale } from '../hooks/useLocale'

export function SliderDemo() {
  const { currentLocale, t } = useLocale()
  const [precision, setPrecision] = useState(5)
  const [stats, setStats] = useState<CaptchaStatistics | null>(null)
  const captchaRef = useRef<SliderCaptchaInstance>(null)

  const updateStats = () => {
    const s = captchaRef.current?.getStatistics()
    if (s) setStats(s)
  }

  return (
    <section className="demo-section">
      <h2>🧩 {t('滑动拼图验证码', 'Slider Captcha')}</h2>

      <div className="options">
        <div className="option-row">
          <label>{t('验证精度', 'Precision')}:</label>
          <select value={precision} onChange={(e) => setPrecision(Number(e.target.value))}>
            <option value={3}>{t('高 (3px)', 'High (3px)')}</option>
            <option value={5}>{t('中 (5px)', 'Medium (5px)')}</option>
            <option value={10}>{t('低 (10px)', 'Low (10px)')}</option>
          </select>
        </div>
      </div>

      <div className="captcha-box">
        <SliderCaptcha
          ref={captchaRef}
          width={320}
          height={180}
          precision={precision}
          locale={currentLocale}
          onSuccess={() => { console.log('Slider success'); updateStats() }}
        />
      </div>

      <div className="btn-group">
        <button className="btn btn-primary" onClick={() => captchaRef.current?.refresh()}>
          {t('重置验证码', 'Reset')}
        </button>
        <button className="btn btn-secondary" onClick={() => {
          console.log('Slider data:', captchaRef.current?.getData())
          alert(t('验证数据已输出到控制台', 'Data logged to console'))
        }}>
          {t('获取数据', 'Get Data')}
        </button>
        <button className="btn btn-secondary" onClick={updateStats}>
          {t('查看统计', 'Statistics')}
        </button>
      </div>

      {stats && (
        <div className="stats">
          <div className="stat-item">
            <span className="stat-value">{stats.totalAttempts}</span>
            <span className="stat-label">{t('总尝试', 'Attempts')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.successCount}</span>
            <span className="stat-label">{t('成功', 'Success')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.successRate}%</span>
            <span className="stat-label">{t('成功率', 'Rate')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.avgVerifyTime}ms</span>
            <span className="stat-label">{t('平均耗时', 'Avg Time')}</span>
          </div>
        </div>
      )}
    </section>
  )
}
