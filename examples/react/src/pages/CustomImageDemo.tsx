import { useState, useRef } from 'react'
import { SliderCaptcha, type SliderCaptchaInstance } from '@captcha/react'
import { useLocale } from '../hooks/useLocale'

const images = [
  'https://picsum.photos/seed/captcha1/300/170',
  'https://picsum.photos/seed/captcha2/300/170',
  'https://picsum.photos/seed/captcha3/300/170',
]

export function CustomImageDemo() {
  const { currentLocale, t } = useLocale()
  const [index, setIndex] = useState(0)
  const captchaRef = useRef<SliderCaptchaInstance>(null)

  return (
    <section className="demo-section">
      <h2>🖼️ {t('自定义图片验证码', 'Custom Image Captcha')}</h2>

      <div className="info-box">
        💡 {t('支持使用自定义背景图片。', 'Support custom background images.')}
      </div>

      <div className="captcha-box">
        <SliderCaptcha
          ref={captchaRef}
          width={320}
          height={180}
          bgImage={images[index]}
          locale={currentLocale}
          onSuccess={() => console.log('Custom captcha success')}
        />
      </div>

      <div className="btn-group">
        <button className="btn btn-primary" onClick={() => setIndex((i) => (i + 1) % images.length)}>
          {t('更换图片', 'Change Image')}
        </button>
      </div>

      <p className="image-info">
        {t('当前图片', 'Current image')}: {index + 1} / {images.length}
      </p>
    </section>
  )
}
