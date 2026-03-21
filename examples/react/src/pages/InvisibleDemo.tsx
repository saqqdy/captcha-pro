import { useState, useEffect, useRef } from 'react'
import { createInvisibleCaptcha, type InvisibleCaptchaInstance } from '@captcha/react'
import { useLocale } from '../hooks/useLocale'

export function InvisibleDemo() {
  const { currentLocale, t } = useLocale()
  const [threshold, setThreshold] = useState(0.7)
  const [challengeType, setChallengeType] = useState<'slider' | 'click'>('slider')
  const [result, setResult] = useState<{ success: boolean; message: string; riskScore?: number } | null>(null)
  const captchaRef = useRef<InvisibleCaptchaInstance | null>(null)

  useEffect(() => {
    captchaRef.current?.destroy()
    captchaRef.current = createInvisibleCaptcha({
      el: '#invisible-trigger',
      trigger: 'click',
      riskAssessment: { threshold, behaviorCheck: { minInteractionTime: 500, trackAnalysis: true } },
      challengeType,
      challengeOptions: { width: 300, height: 170, locale: currentLocale },
      onChallenge: () => setResult({ success: false, message: t('检测到可疑行为，请完成验证', 'Suspicious behavior detected') }),
      onSuccess: () => {
        const risk = captchaRef.current?.getRiskScore() || 0
        setResult({ success: true, message: t('验证通过', 'Verification passed'), riskScore: risk })
      },
      onFail: () => setResult({ success: false, message: t('验证失败', 'Verification failed') })
    })
    return () => captchaRef.current?.destroy()
  }, [threshold, challengeType, currentLocale, t])

  return (
    <section className="demo-section">
      <h2>👻 {t('智能无感验证', 'Invisible Captcha')}<span className="new-badge">NEW</span></h2>

      <div className="info-box">
        💡 {t('基于风险评估的无感验证，仅在检测到可疑行为时才显示验证码挑战。', 'Risk-based invisible verification that only shows captcha challenge when suspicious behavior is detected.')}
      </div>

      <div className="options">
        <div className="option-row">
          <label>{t('风险阈值', 'Threshold')}:</label>
          <select value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}>
            <option value={0.3}>{t('宽松 (0.3)', 'Relaxed (0.3)')}</option>
            <option value={0.5}>{t('适中 (0.5)', 'Moderate (0.5)')}</option>
            <option value={0.7}>{t('严格 (0.7)', 'Strict (0.7)')}</option>
            <option value={0.9}>{t('非常严格 (0.9)', 'Very Strict (0.9)')}</option>
          </select>
        </div>
        <div className="option-row">
          <label>{t('挑战类型', 'Challenge')}:</label>
          <select value={challengeType} onChange={(e) => setChallengeType(e.target.value as 'slider' | 'click')}>
            <option value="slider">{t('滑块验证', 'Slider')}</option>
            <option value="click">{t('点击验证', 'Click')}</option>
          </select>
        </div>
      </div>

      <div className="btn-group" style={{ marginBottom: 20 }}>
        <button id="invisible-trigger" className="btn btn-primary">
          {t('点击验证', 'Click to Verify')}
        </button>
      </div>

      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.message}
          {result.riskScore !== undefined && (
            <span> ({t('风险评分', 'Risk Score')}: {result.riskScore.toFixed(2)})</span>
          )}
        </div>
      )}
    </section>
  )
}
