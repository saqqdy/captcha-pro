<script setup lang="ts">
import { ref, watch } from 'vue'
import { SliderCaptcha, type CaptchaStatistics } from '@captcha/vue3'
import { useLocale } from '../composables/useLocale'

const { currentLocale, t } = useLocale()

const config = ref({
  precision: 5,
  verifyMode: 'frontend' as 'frontend' | 'backend',
  showRefresh: true
})
const captchaRef = ref()
const stats = ref<CaptchaStatistics | null>(null)

const onSuccess = () => {
  console.log('Slider success:', captchaRef.value?.getData())
  updateStats()
}

const updateStats = () => {
  const s = captchaRef.value?.getStatistics()
  if (s) stats.value = s
}

const reset = () => captchaRef.value?.refresh()

const getData = () => {
  const data = captchaRef.value?.getData()
  console.log('Slider data:', data)
  alert(t('验证数据已输出到控制台\n\n', 'Data logged to console\n\n') + JSON.stringify(data, null, 2))
}

watch(() => config.value.precision, () => captchaRef.value?.refresh())
</script>

<template>
  <section class="demo-section">
    <h2>🧩 {{ currentLocale === 'zh-CN' ? '滑动拼图验证码' : 'Slider Captcha' }}</h2>

    <div class="options">
      <div class="option-row">
        <label>{{ currentLocale === 'zh-CN' ? '验证精度' : 'Precision' }}:</label>
        <select v-model.number="config.precision">
          <option :value="3">{{ currentLocale === 'zh-CN' ? '高 (3px)' : 'High (3px)' }}</option>
          <option :value="5">{{ currentLocale === 'zh-CN' ? '中 (5px)' : 'Medium (5px)' }}</option>
          <option :value="10">{{ currentLocale === 'zh-CN' ? '低 (10px)' : 'Low (10px)' }}</option>
        </select>
      </div>
      <div class="option-row">
        <label>{{ currentLocale === 'zh-CN' ? '验证模式' : 'Mode' }}:</label>
        <select v-model="config.verifyMode">
          <option value="frontend">{{ currentLocale === 'zh-CN' ? '前端验证' : 'Frontend' }}</option>
          <option value="backend">{{ currentLocale === 'zh-CN' ? '后端验证' : 'Backend' }}</option>
        </select>
      </div>
      <div class="option-row">
        <label>{{ currentLocale === 'zh-CN' ? '显示刷新' : 'Show Refresh' }}:</label>
        <input type="checkbox" v-model="config.showRefresh">
      </div>
    </div>

    <div class="captcha-box">
      <SliderCaptcha
        ref="captchaRef"
        :width="320"
        :height="180"
        :precision="config.precision"
        :verify-mode="config.verifyMode"
        :show-refresh="config.showRefresh"
        :locale="currentLocale"
        @success="onSuccess"
      />
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" @click="reset">{{ currentLocale === 'zh-CN' ? '重置验证码' : 'Reset' }}</button>
      <button class="btn btn-secondary" @click="getData">{{ currentLocale === 'zh-CN' ? '获取数据' : 'Get Data' }}</button>
      <button class="btn btn-secondary" @click="updateStats">{{ currentLocale === 'zh-CN' ? '查看统计' : 'Statistics' }}</button>
    </div>

    <div v-if="stats && Object.keys(stats).length" class="stats">
      <div class="stat-item">
        <span class="stat-value">{{ stats.totalAttempts }}</span>
        <span class="stat-label">{{ currentLocale === 'zh-CN' ? '总尝试' : 'Attempts' }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.successCount }}</span>
        <span class="stat-label">{{ currentLocale === 'zh-CN' ? '成功' : 'Success' }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.successRate }}%</span>
        <span class="stat-label">{{ currentLocale === 'zh-CN' ? '成功率' : 'Rate' }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.avgVerifyTime }}ms</span>
        <span class="stat-label">{{ currentLocale === 'zh-CN' ? '平均耗时' : 'Avg Time' }}</span>
      </div>
    </div>
  </section>
</template>
