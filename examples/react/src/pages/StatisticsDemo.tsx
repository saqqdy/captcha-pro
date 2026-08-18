import type { ReactElement } from 'react'
import { ClickCaptcha, SliderCaptcha } from '@captcha-pro/react'
import { useRef, useState } from 'react'
import { useLocale } from '../hooks/useLocale'

export default function StatisticsDemo(): ReactElement {
  const { currentLocale, t } = useLocale()
  const sliderRef = useRef<any>(null)
  const clickRef = useRef<any>(null)
  const [sliderStats, setSliderStats] = useState<any>(null)
  const [clickStats, setClickStats] = useState<any>(null)
  const [sliderResult, setSliderResult] = useState('')
  const [clickResult, setClickResult] = useState('')

  const onSliderSuccess = (): void => {
    const stats = sliderRef.current?.getStatistics?.()
    setSliderStats(stats)
    setSliderResult(`${t('验证成功！耗时：', 'Verification successful! Time: ')  }${stats?.verificationTime?.toFixed(0) || 0}ms`)
  }

  const onClickSuccess = (): void => {
    const stats = clickRef.current?.getStatistics?.()
    setClickStats(stats)
    setClickResult(`${t('验证成功！点击次数：', 'Verification successful! Clicks: ')  }${stats?.clickCount || 0}`)
  }

  const resetAll = (): void => {
    sliderRef.current?.refresh()
    clickRef.current?.refresh()
    setSliderStats(null)
    setClickStats(null)
    setSliderResult('')
    setClickResult('')
  }

  return (
    <section className="demo-section">
      <h2>📊 {t('统计数据演示', 'Statistics Demo')}</h2>

      <div className="info-box">
        <h3>{t('统计数据 API', 'Statistics API')}</h3>
        <p>{t('通过 getStatistics() 方法获取验证过程的详细统计数据', 'Get detailed statistics via getStatistics() method')}</p>
      </div>

      <div className="demo-grid">
        <div className="demo-item">
          <h3>{t('滑块验证码统计', 'Slider Captcha Statistics')}</h3>
          <div className="captcha-box">
            <SliderCaptcha
              ref={sliderRef}
              width={300}
              height={170}
              locale={currentLocale}
              onSuccess={onSliderSuccess}
            />
          </div>
          {sliderResult && <div className="result success">{sliderResult}</div>}
          {sliderStats && (
            <div className="stats-panel">
              <h4>{t('统计数据', 'Statistics')}</h4>
              <div className="stat-item">
                <span className="label">{t('验证耗时', 'Time')}:</span>
                <span className="value">{sliderStats.verificationTime?.toFixed(0) || 0}ms</span>
              </div>
            </div>
          )}
        </div>

        <div className="demo-item">
          <h3>{t('点选验证码统计', 'Click Captcha Statistics')}</h3>
          <div className="captcha-box">
            <ClickCaptcha
              ref={clickRef}
              width={300}
              height={170}
              locale={currentLocale}
              onSuccess={onClickSuccess}
            />
          </div>
          {clickResult && <div className="result success">{clickResult}</div>}
          {clickStats && (
            <div className="stats-panel">
              <h4>{t('统计数据', 'Statistics')}</h4>
              <div className="stat-item">
                <span className="label">{t('验证耗时', 'Time')}:</span>
                <span className="value">{clickStats.verificationTime?.toFixed(0) || 0}ms</span>
              </div>
              <div className="stat-item">
                <span className="label">{t('点击次数', 'Clicks')}:</span>
                <span className="value">{clickStats.clickCount || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-primary" onClick={resetAll}>{t('重置所有', 'Reset All')}</button>
      </div>
    </section>
  )
}
