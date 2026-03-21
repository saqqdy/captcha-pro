<script setup lang="ts">
import { ref, watch } from 'vue'
import { ClickCaptcha, type CaptchaStatistics } from '@captcha/vue3'
import { useLocale } from '../composables/useLocale'

const { currentLocale, t } = useLocale()

const config = ref({
  count: 3,
  showRefresh: true
})
const captchaRef = ref()
const stats = ref<CaptchaStatistics | null>(null)

const onSuccess = () => {
  console.log('Click success:', captchaRef.value?.getData())
  updateStats()
}

const updateStats = () => {
  const s = captchaRef.value?.getStatistics()
  if (s) stats.value = s
}

const reset = () => captchaRef.value?.refresh()

const getData = () => {
  const data = captchaRef.value?.getData()
  const points = captchaRef.value?.getClickPoints()
  console.log('Click data:', data, 'Points:', points)
  alert(t('验证数据已输出到控制台', 'Data logged to console'))
}

watch(() => config.value.count, () => captchaRef.value?.refresh())
</script>

<template>
  <section class="demo-section">
    <h2>🎯 {{ currentLocale === 'zh-CN' ? '点选文字验证码' : 'Click Captcha' }}</h2>

    <div class="info-box">
      💡 {{ currentLocale === 'zh-CN'
        ? '使用中文词汇库自动生成，包含200+常用成语和词汇。提示文字以图片形式显示防止机器识别。'
        : 'Auto-generated from Chinese vocabulary (200+ words). Prompt displayed as image to prevent bot detection.' }}
    </div>

    <div class="options">
      <div class="option-row">
        <label>{{ currentLocale === 'zh-CN' ? '点击数量' : 'Click Count' }}:</label>
        <select v-model.number="config.count">
          <option :value="2">2</option>
          <option :value="3">3</option>
          <option :value="4">4</option>
        </select>
      </div>
      <div class="option-row">
        <label>{{ currentLocale === 'zh-CN' ? '显示刷新' : 'Show Refresh' }}:</label>
        <input type="checkbox" v-model="config.showRefresh">
      </div>
    </div>

    <div class="captcha-box">
      <ClickCaptcha
        ref="captchaRef"
        :width="320"
        :height="180"
        :count="config.count"
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
