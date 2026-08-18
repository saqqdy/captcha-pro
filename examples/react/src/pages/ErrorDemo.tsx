import type { ReactElement } from 'react'
import { ClickCaptcha, SliderCaptcha } from '@captcha-pro/react'
import { useRef, useState } from 'react'
import { useLocale } from '../hooks/useLocale'

export default function ErrorDemo(): ReactElement {
  const { currentLocale, t } = useLocale()
  const sliderRef = useRef<any>(null)
  const clickRef = useRef<any>(null)
  const [sliderResult, setSliderResult] = useState('')
  const [clickResult, setClickResult] = useState('')
  const [sliderError, setSliderError] = useState('')
  const [clickError, setClickError] = useState('')

  const onSliderSuccess = (): void => {
    setSliderResult(t('验证成功！', 'Verification successful!'))
    setSliderError('')
  }

  const onSliderFail = (): void => {
    setSliderError(t('验证失败，请重试', 'Verification failed, please retry'))
    setSliderResult('')
  }

  const onClickSuccess = (): void => {
    setClickResult(t('验证成功！', 'Verification successful!'))
    setClickError('')
  }

  const onClickFail = (): void => {
    setClickError(t('验证失败，请重试', 'Verification failed, please retry'))
    setClickResult('')
  }

  const resetAll = (): void => {
    sliderRef.current?.refresh()
    clickRef.current?.refresh()
    setSliderResult('')
    setClickResult('')
    setSliderError('')
    setClickError('')
  }

  return (
    <section className="demo-section">
      <h2>❌ {t('错误处理演示', 'Error Handling Demo')}</h2>

      <div className="info-box">
        <h3>{t('错误事件', 'Error Events')}</h3>
        <p>{t('监听 onFail 事件处理验证失败情况', 'Listen to onFail event to handle failures')}</p>
      </div>

      <div className="demo-grid">
        <div className="demo-item">
          <h3>{t('滑块验证码错误处理', 'Slider Captcha Error')}</h3>
          <div className="captcha-box">
            <SliderCaptcha
              ref={sliderRef}
              width={300}
              height={170}
              locale={currentLocale}
              onSuccess={onSliderSuccess}
              onFail={onSliderFail}
            />
          </div>
          {sliderResult && <div className="result success">{sliderResult}</div>}
          {sliderError && <div className="result error">{sliderError}</div>}
        </div>

        <div className="demo-item">
          <h3>{t('点选验证码错误处理', 'Click Captcha Error')}</h3>
          <div className="captcha-box">
            <ClickCaptcha
              ref={clickRef}
              width={300}
              height={170}
              locale={currentLocale}
              onSuccess={onClickSuccess}
              onFail={onClickFail}
            />
          </div>
          {clickResult && <div className="result success">{clickResult}</div>}
          {clickError && <div className="result error">{clickError}</div>}
        </div>
      </div>

      <div className="btn-group">
        <button className="btn btn-primary" onClick={resetAll}>{t('重置所有', 'Reset All')}</button>
      </div>
    </section>
  )
}
