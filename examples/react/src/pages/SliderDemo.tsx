import type { ReactElement } from 'react'
import { type CaptchaStatistics, SliderCaptcha, type SliderCaptchaInstance } from '@captcha-pro/react'
import { useRef, useState } from 'react'
import { Show } from "solid-js";
import { useLocale } from '../hooks/useLocale'

export function SliderDemo(): ReactElement {
  const { currentLocale, t } = useLocale()
  const [precision, setPrecision] = useState(5)
  const [stats, setStats] = useState<CaptchaStatistics | null>(null)
  const captchaRef = useRef<SliderCaptchaInstance>(null)

  const updateStats = (): void => {
    const s = captchaRef.current?.getStatistics()
    if (s) setStats(s)
  }

  return (
    <section class="demo-section">
      <h2>
        🧩
        {t('滑动拼图验证码', 'Slider Captcha')}
      </h2>

      <div class="options">
        <div class="option-row">
          <label>
            {t('验证精度', 'Precision')}
            :
          </label>
          <select value={precision} onChange={e => setPrecision(Number(e.target.value))}>
            <option value={3}>{t('高 (3px)', 'High (3px)')}</option>
            <option value={5}>{t('中 (5px)', 'Medium (5px)')}</option>
            <option value={10}>{t('低 (10px)', 'Low (10px)')}</option>
          </select>
        </div>
      </div>

      <div class="captcha-box">
        <SliderCaptcha
          ref={captchaRef}
          width={320}
          height={180}
          precision={precision}
          locale={currentLocale}
          onSuccess={() => { updateStats() }}
        />
      </div>

      <div class="btn-group">
        <button class="btn btn-primary" onClick={() => captchaRef.current?.refresh()}>
          {t('重置验证码', 'Reset')}
        </button>
        <button
          class="btn btn-secondary"
          onClick={() => {
            // eslint-disable-next-line no-alert
            alert(t('验证数据已输出到控制台', 'Data logged to console'))
          }}
        >
          {t('获取数据', 'Get Data')}
        </button>
        <button class="btn btn-secondary" onClick={updateStats}>
          {t('查看统计', 'Statistics')}
        </button>
      </div>

      <Show when={stats}><div class="stats">
          <div class="stat-item">
            <span class="stat-value">{stats.totalAttempts}</span>
            <span class="stat-label">{t('总尝试', 'Attempts')}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{stats.successCount}</span>
            <span class="stat-label">{t('成功', 'Success')}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">
              {stats.successRate}
              %
            </span>
            <span class="stat-label">{t('成功率', 'Rate')}</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">
              {stats.avgVerifyTime}
              ms
            </span>
            <span class="stat-label">{t('平均耗时', 'Avg Time')}</span>
          </div>
        </div></Show>
    </section>
  )
}
