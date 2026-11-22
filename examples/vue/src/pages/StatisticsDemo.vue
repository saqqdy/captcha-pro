<script setup lang="ts">
import { ref } from 'vue'
import { SliderCaptcha, ClickCaptcha } from '@captcha-pro/vue'
import { useLocale } from '../composables/useLocale'

const { currentLocale, t } = useLocale()

const sliderRef = ref()
const clickRef = ref()

const sliderStats = ref<Record<string, number> | null>(null)
const clickStats = ref<Record<string, number> | null>(null)

const sliderResult = ref('')
const clickResult = ref('')

const updateSliderStats = () => {
  sliderStats.value = sliderRef.value?.getStatistics?.() || null
}

const updateClickStats = () => {
  clickStats.value = clickRef.value?.getStatistics?.() || null
}

const onSliderSuccess = () => {
  updateSliderStats()
  sliderResult.value = t('验证成功！耗时：', 'Verification successful! Time: ') + `${sliderStats.value?.avgVerifyTime || 0}ms`
}

const onSliderFail = () => {
  updateSliderStats()
}

const onClickSuccess = () => {
  updateClickStats()
  clickResult.value = t('验证成功！点击次数：', 'Verification successful! Clicks: ') + `${clickStats.value?.avgClickCount || 0}`
}

const onClickFail = () => {
  updateClickStats()
}

const resetAll = () => {
  sliderRef.value?.refresh()
  clickRef.value?.refresh()
  sliderStats.value = null
  clickStats.value = null
  sliderResult.value = ''
  clickResult.value = ''
}
</script>

<template>
  <section class="demo-section">
    <h2>📊 {{ t('统计数据演示', 'Statistics Demo') }}</h2>

    <div class="info-box">
      <h3>{{ t('统计数据 API', 'Statistics API') }}</h3>
      <p>{{ t('通过 getStatistics() 方法获取验证过程的详细统计数据', 'Get detailed statistics of the verification process via getStatistics() method') }}</p>
      <ul>
        <li><code>totalAttempts</code> - {{ t('总尝试次数', 'Total attempts') }}</li>
        <li><code>successRate</code> - {{ t('成功率（%）', 'Success rate (%)') }}</li>
        <li><code>avgVerifyTime</code> - {{ t('平均验证耗时（毫秒）', 'Average verification time (ms)') }}</li>
        <li><code>avgDragDistance</code> - {{ t('平均滑动距离（滑块验证码）', 'Average drag distance (Slider Captcha)') }}</li>
        <li><code>avgClickCount</code> - {{ t('平均点击次数（点选验证码）', 'Average click count (Click Captcha)') }}</li>
      </ul>
    </div>

    <div class="demo-grid">
      <div class="demo-item">
        <h3>{{ t('滑块验证码统计', 'Slider Captcha Statistics') }}</h3>
        <div class="captcha-box">
          <SliderCaptcha
            ref="sliderRef"
            :width="300"
            :height="170"
            :locale="currentLocale"
            @success="onSliderSuccess"
            @fail="onSliderFail"
          />
        </div>
        <div v-if="sliderResult" class="result success">{{ sliderResult }}</div>
        <div v-if="sliderStats" class="stats-panel">
          <h4>{{ t('统计数据', 'Statistics') }}</h4>
          <div class="stat-item">
            <span class="label">{{ t('验证耗时', 'Verification Time') }}:</span>
            <span class="value">{{ sliderStats.avgVerifyTime || 0 }}ms</span>
          </div>
          <div class="stat-item">
            <span class="label">{{ t('滑动距离', 'Slider Distance') }}:</span>
            <span class="value">{{ sliderStats.avgDragDistance || 0 }}px</span>
          </div>
          <div class="stat-item">
            <span class="label">{{ t('尝试次数', 'Attempts') }}:</span>
            <span class="value">{{ sliderStats.totalAttempts || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="label">{{ t('成功率', 'Rate') }}:</span>
            <span class="value">{{ sliderStats.successRate || 0 }}%</span>
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
            :locale="currentLocale"
            @success="onClickSuccess"
            @fail="onClickFail"
          />
        </div>
        <div v-if="clickResult" class="result success">{{ clickResult }}</div>
        <div v-if="clickStats" class="stats-panel">
          <h4>{{ t('统计数据', 'Statistics') }}</h4>
          <div class="stat-item">
            <span class="label">{{ t('验证耗时', 'Verification Time') }}:</span>
            <span class="value">{{ clickStats.avgVerifyTime || 0 }}ms</span>
          </div>
          <div class="stat-item">
            <span class="label">{{ t('点击次数', 'Click Count') }}:</span>
            <span class="value">{{ clickStats.avgClickCount || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="label">{{ t('尝试次数', 'Attempts') }}:</span>
            <span class="value">{{ clickStats.totalAttempts || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="label">{{ t('成功率', 'Rate') }}:</span>
            <span class="value">{{ clickStats.successRate || 0 }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" @click="resetAll">{{ t('重置所有', 'Reset All') }}</button>
    </div>

    <div class="code-example">
      <h3>{{ t('代码示例', 'Code Example') }}</h3>
      <pre><code>&lt;SliderCaptcha ref="captchaRef" @success="onSuccess" /&gt;

// 通过组件 ref 获取统计数据
const onSuccess = () => {
  const stats = captchaRef.value?.getStatistics()
  console.log('平均耗时:', stats?.avgVerifyTime)
  console.log('成功率:', stats?.successRate)
  console.log('尝试次数:', stats?.totalAttempts)
}</code></pre>
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
  margin-bottom: 12px;
  color: #6c757d;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
}

.info-box li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.info-box code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
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

.code-example {
  background: #2d2d2d;
  border-radius: 8px;
  padding: 20px;
}

.code-example h3 {
  color: #fff;
  margin-top: 0;
  margin-bottom: 12px;
}

.code-example pre {
  margin: 0;
  color: #f8f8f2;
}

.code-example code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
}

  html.cp-dark .info-box {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }

  html.cp-dark .info-box h3 {
    color: #aaaaaa;
  }

  html.cp-dark .info-box p {
    color: #888888;
  }

  html.cp-dark .info-box code {
    background: #3a3a3a;
  }

  html.cp-dark .demo-item {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }

  html.cp-dark .demo-item h3 {
    color: #aaaaaa;
  }

  html.cp-dark .result.success {
    background: #1e3a1e;
    color: #5cb85c;
  }

  html.cp-dark .stats-panel {
    background: #1f1f1f;
    border-color: #3a3a3a;
  }

  html.cp-dark .stats-panel h4 {
    color: #aaaaaa;
  }

  html.cp-dark .stat-item {
    border-color: #3a3a3a;
  }

  html.cp-dark .stat-item .label {
    color: #888888;
  }

  html.cp-dark .stat-item .value {
    color: #aaaaaa;
  }
</style>