<template>
  <section class="demo-section">
    <h2>🧩 {{ locale === 'zh-CN' ? '滑动拼图验证码' : 'Slider Captcha' }}</h2>

    <div class="options">
      <div class="option-row">
        <label>{{ locale === 'zh-CN' ? '验证精度' : 'Precision' }}:</label>
        <select v-model.number="precision">
          <option :value="3">{{ locale === 'zh-CN' ? '高 (3px)' : 'High (3px)' }}</option>
          <option :value="5">{{ locale === 'zh-CN' ? '中 (5px)' : 'Medium (5px)' }}</option>
          <option :value="10">{{ locale === 'zh-CN' ? '低 (10px)' : 'Low (10px)' }}</option>
        </select>
      </div>
      <div class="option-row">
        <label>{{ locale === 'zh-CN' ? '显示刷新' : 'Show Refresh' }}:</label>
        <input type="checkbox" v-model="showRefresh">
      </div>
    </div>

    <div class="captcha-box">
      <SliderCaptcha
        ref="captchaRef"
        :width="320"
        :height="180"
        :precision="precision"
        :show-refresh="showRefresh"
        :locale="locale"
        @success="onSuccess"
      />
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" @click="reset">{{ locale === 'zh-CN' ? '重置验证码' : 'Reset' }}</button>
      <button class="btn btn-secondary" @click="getData">{{ locale === 'zh-CN' ? '获取数据' : 'Get Data' }}</button>
      <button class="btn btn-secondary" @click="updateStats">{{ locale === 'zh-CN' ? '查看统计' : 'Statistics' }}</button>
    </div>

    <div v-if="stats.totalAttempts" class="stats">
      <div class="stat-item">
        <span class="stat-value">{{ stats.totalAttempts }}</span>
        <span class="stat-label">{{ locale === 'zh-CN' ? '总尝试' : 'Attempts' }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.successCount }}</span>
        <span class="stat-label">{{ locale === 'zh-CN' ? '成功' : 'Success' }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.successRate }}%</span>
        <span class="stat-label">{{ locale === 'zh-CN' ? '成功率' : 'Rate' }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.avgVerifyTime }}ms</span>
        <span class="stat-label">{{ locale === 'zh-CN' ? '平均耗时' : 'Avg Time' }}</span>
      </div>
    </div>
  </section>
</template>

<script>
import { SliderCaptcha } from '@captcha/vue2'

export default {
  name: 'SliderDemo',
  components: { SliderCaptcha },
  props: {
    locale: { type: String, default: 'zh-CN' }
  },
  data() {
    return {
      precision: 5,
      showRefresh: true,
      stats: {}
    }
  },
  methods: {
    onSuccess() {
      console.log('Slider success:', this.$refs.captchaRef?.getData())
      this.updateStats()
    },
    updateStats() {
      const stats = this.$refs.captchaRef?.getStatistics()
      if (stats) {
        this.stats = {
          totalAttempts: stats.totalAttempts,
          successCount: stats.successCount,
          successRate: stats.successRate,
          avgVerifyTime: stats.avgVerifyTime
        }
      }
    },
    reset() {
      this.$refs.captchaRef?.refresh()
    },
    getData() {
      const data = this.$refs.captchaRef?.getData()
      console.log('Slider data:', data)
      alert(this.locale === 'zh-CN' ? '验证数据已输出到控制台' : 'Data logged to console')
    }
  }
}
</script>
