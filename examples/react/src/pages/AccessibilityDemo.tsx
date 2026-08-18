import type { ReactElement } from 'react'
import { ClickCaptcha, SliderCaptcha } from '@captcha-pro/react'
import { useState } from 'react'
import { useLocale } from '../hooks/useLocale'

export default function AccessibilityDemo(): ReactElement {
  const { currentLocale, t } = useLocale()
  const [sliderResult, setSliderResult] = useState('')
  const [clickResult, setClickResult] = useState('')

  return (
    <section className="demo-section">
      <h2>♿ {t('无障碍支持演示', 'Accessibility Demo')}</h2>

      <div className="info-box">
        <h3>{t('WCAG 2.2 Level AA 合规', 'WCAG 2.2 Level AA Compliance')}</h3>
        <ul>
          <li><strong>{t('弹窗焦点陷阱', 'Popup Focus Trap')} <span className="new-badge">v2.3.0</span>:</strong>
            <ul>
              <li>{t('打开弹窗时焦点自动移入关闭按钮', 'Focus moves to close button when popup opens')}</li>
              <li><code>Tab</code>/<code>Shift+Tab</code> - {t('焦点在弹窗内循环，不会逃逸到页面', 'Focus cycles within the popup, never escapes to the page')}</li>
              <li>{t('关闭后焦点返回触发元素', 'Focus returns to the trigger element after closing')}</li>
            </ul>
          </li>
          <li><strong>{t('键盘操作', 'Keyboard Operation')}:</strong>
            <ul>
              <li><code>Tab</code> - {t('在验证码元素间导航', 'Navigate between captcha elements')}</li>
              <li><code>Enter</code> - {t('触发刷新按钮', 'Trigger refresh button')}</li>
              <li><code>←/→</code> - {t('调整滑块位置', 'Adjust slider position')}</li>
            </ul>
          </li>
          <li><strong>{t('屏幕阅读器', 'Screen Reader')}:</strong>
            <ul>
              <li>{t('所有按钮都有语义化标签', 'All buttons have semantic labels')}</li>
              <li>{t('成功/失败状态实时播报', 'Success/Failure status announced in real-time')}</li>
            </ul>
          </li>
        </ul>
      </div>

      <div className="demo-grid">
        <div className="demo-item">
          <h3>{t('滑块验证码 - 键盘可操作', 'Slider Captcha - Keyboard Operable')}</h3>
          <div className="captcha-box">
            <SliderCaptcha
              width={300}
              height={170}
              locale={currentLocale}
              onSuccess={() => setSliderResult(t('验证成功！', 'Verification successful!'))}
            />
          </div>
          {sliderResult && <div className="result success">{sliderResult}</div>}
          <p className="hint">{t('提示：使用 Tab 聚焦滑块，用 ←/→ 键调整位置', 'Tip: Use Tab to focus slider, ←/→ keys to adjust position')}</p>
        </div>

        <div className="demo-item">
          <h3>{t('点选验证码 - 屏幕阅读器友好', 'Click Captcha - Screen Reader Friendly')}</h3>
          <div className="captcha-box">
            <ClickCaptcha
              width={300}
              height={170}
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