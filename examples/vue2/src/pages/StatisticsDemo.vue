<script>
import { ref } from 'vue'
import SliderCaptcha from '@captcha-pro/vue2'
import ClickCaptcha from '@captcha-pro/vue2'

export default {
  name: 'StatisticsDemo',
  components: { SliderCaptcha, ClickCaptcha },
  props: {
    locale: {
      type: String,
      default: 'zh-CN'
    }
  },
  setup(props) {
    const sliderRef = ref(null)
    const clickRef = ref(null)
    const sliderStats = ref(null)
    const clickStats = ref(null)
    const sliderResult = ref('')
    const clickResult = ref('')

    const t = (zh, en) => props.locale === 'zh-CN' ? zh : en

    const onSliderSuccess = () => {
      sliderStats.value = sliderRef.value?.getStatistics?.() || null
      sliderResult.value = t('验证成功！耗时：', 'Verification successful! Time: ') + `${sliderStats.value?.verificationTime?.toFixed(0) || 0}ms`
    }

    const onClickSuccess = () => {
      clickStats.value = clickRef.value?.getStatistics?.() || null
      clickResult.value = t('验证成功！点击次数：', 'Verification successful! Clicks: ') + `${clickStats.value?.clickCount || 0}`
    }

    const resetAll = () => {
      sliderRef.value?.refresh()
      clickRef.value?.refresh()
      sliderStats.value = null
      clickStats.value = null
      sliderResult.value = ''
      clickResult.value = ''
    }

    return {
      sliderRef,
      clickRef,
      sliderStats,
      clickStats,
      sliderResult,
      clickResult,
      t,
      onSliderSuccess,
      onClickSuccess,
      resetAll
    }
  }
}
</script>

<template>
  <section class="demo-section">
    <h2>📊 {{ t('统计数据演示', 'Statistics Demo') }}</h2>

    <div class="info-box">
      <h3>{{ t('统计数据 API', 'Statistics API') }}</h3>
      <p>{{ t('通过 getStatistics() 方法获取验证过程的详细统计数据', 'Get detailed statistics via getStatistics() method') }}</p>
    </div>

    <div class="demo-grid">
      <div class="demo-item">
        <h3>{{ t('滑块验证码统计', 'Slider Captcha Statistics') }}</h3>
        <div class="captcha-box">
          <SliderCaptcha
            ref="sliderRef"
            :width="300"
            :height="170"
            :locale="locale"
            @success="onSliderSuccess"
          />
        </div>
        <div v-if="sliderResult" class="result success">{{ sliderResult }}</div>
        <div v-if="sliderStats" class="stats-panel">
          <h4>{{ t('统计数据', 'Statistics') }}</h4>
          <div class="stat-item">
            <span class="label">{{ t('验证耗时', 'Time') }}:</span>
            <span class="value">{{ sliderStats.verificationTime?.toFixed(0) || 0 }}ms</span>
          </div>
        </div>
      </div>

      <div class="demo-item">
        <h3>{{ t('点选验证码统计', 'Click Captcha Statistics') }}</h3>
        <div class="captcha-box">
          <ClickCaptcha
            ref="clickRef"
            :width="300"
            :height="170"
            :locale="locale"
            @success="onClickSuccess"
          />
        </div>
        <div v-if="clickResult" class="result success">{{ clickResult }}</div>
        <div v-if="clickStats" class="stats-panel">
          <h4>{{ t('统计数据', 'Statistics') }}</h4>
          <div class="stat-item">
            <span class="label">{{ t('验证耗时', 'Time') }}:</span>
            <span class="value">{{ clickStats.verificationTime?.toFixed(0) || 0 }}ms</span>
          </div>
          <div class="stat-item">
            <span class="label">{{ t('点击次数', 'Clicks') }}:</span>
            <span class="value">{{ clickStats.clickCount || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" @click="resetAll">{{ t('重置所有', 'Reset All') }}</button>
    </div>
  </section>
</template>

<style scoped>
.info-box {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-box h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #495057;
}

.info-box p {
  margin: 0;
  color: #6c757d;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.demo-item {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.demo-item h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #495057;
}

.captcha-box {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.result {
  text-align: center;
  padding: 12px;
  border-radius: 6px;
  font-weight: 500;
  margin-bottom: 12px;
}

.result.success {
  background: #d4edda;
  color: #155724;
}

.stats-panel {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 16px;
}

.stats-panel h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #495057;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item .label {
  color: #6c757d;
  font-size: 14px;
}

.stat-item .value {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

@media (prefers-color-scheme: dark) {
  .info-box {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }

  .info-box h3 {
    color: #aaaaaa;
  }

  .info-box p {
    color: #888888;
  }

  .demo-item {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }

  .demo-item h3 {
    color: #aaaaaa;
  }

  .result.success {
    background: #1e3a1e;
    color: #5cb85c;
  }

  .stats-panel {
    background: #1f1f1f;
    border-color: #3a3a3a;
  }

  .stats-panel h4 {
    color: #aaaaaa;
  }

  .stat-item {
    border-color: #3a3a3a;
  }

  .stat-item .label {
    color: #888888;
  }

  .stat-item .value {
    color: #aaaaaa;
  }
}
</style>
