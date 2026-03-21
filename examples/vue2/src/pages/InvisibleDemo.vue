<template>
  <section class="demo-section">
    <h2>👻 {{ locale === 'zh-CN' ? '智能无感验证' : 'Invisible Captcha' }}<span class="new-badge">NEW</span></h2>

    <div class="info-box">
      💡 {{ locale === 'zh-CN' ? '基于风险评估的无感验证，仅在检测到可疑行为时才显示验证码挑战。' : 'Risk-based invisible verification that only shows captcha challenge when suspicious behavior is detected.' }}
    </div>

    <div class="options">
      <div class="option-row">
        <label>{{ locale === 'zh-CN' ? '风险阈值' : 'Threshold' }}:</label>
        <select v-model.number="threshold">
          <option :value="0.3">{{ locale === 'zh-CN' ? '宽松 (0.3)' : 'Relaxed (0.3)' }}</option>
          <option :value="0.5">{{ locale === 'zh-CN' ? '适中 (0.5)' : 'Moderate (0.5)' }}</option>
          <option :value="0.7">{{ locale === 'zh-CN' ? '严格 (0.7)' : 'Strict (0.7)' }}</option>
          <option :value="0.9">{{ locale === 'zh-CN' ? '非常严格 (0.9)' : 'Very Strict (0.9)' }}</option>
        </select>
      </div>
      <div class="option-row">
        <label>{{ locale === 'zh-CN' ? '挑战类型' : 'Challenge' }}:</label>
        <select v-model="challengeType">
          <option value="slider">{{ locale === 'zh-CN' ? '滑块验证' : 'Slider' }}</option>
          <option value="click">{{ locale === 'zh-CN' ? '点击验证' : 'Click' }}</option>
        </select>
      </div>
    </div>

    <div class="btn-group" style="margin-bottom: 20px;">
      <button id="invisible-trigger" class="btn btn-primary">{{ locale === 'zh-CN' ? '点击验证' : 'Click to Verify' }}</button>
    </div>

    <div v-if="result" class="result" :class="result.success ? 'success' : 'error'">
      {{ result.message }}
      <span v-if="result.riskScore !== undefined">({{ locale === 'zh-CN' ? '风险评分' : 'Risk Score' }}: {{ result.riskScore.toFixed(2) }})</span>
    </div>
  </section>
</template>

<script>
import { createInvisibleCaptcha } from '@captcha/vue2'

export default {
  name: 'InvisibleDemo',
  props: {
    locale: { type: String, default: 'zh-CN' }
  },
  data() {
    return {
      threshold: 0.7,
      challengeType: 'slider',
      result: null,
      captcha: null
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    this.captcha?.destroy()
  },
  watch: {
    threshold() { this.init() },
    challengeType() { this.init() }
  },
  methods: {
    init() {
      this.captcha?.destroy()
      const self = this
      this.captcha = createInvisibleCaptcha({
        el: '#invisible-trigger',
        trigger: 'click',
        riskAssessment: { threshold: this.threshold, behaviorCheck: { minInteractionTime: 500, trackAnalysis: true } },
        challengeType: this.challengeType,
        challengeOptions: { width: 300, height: 170, locale: this.locale },
        onChallenge() {
          self.result = { success: false, message: self.locale === 'zh-CN' ? '检测到可疑行为，请完成验证' : 'Suspicious behavior detected' }
        },
        onSuccess() {
          const risk = self.captcha?.getRiskScore() || 0
          self.result = { success: true, message: self.locale === 'zh-CN' ? '验证通过' : 'Verification passed', riskScore: risk }
        },
        onFail() {
          self.result = { success: false, message: self.locale === 'zh-CN' ? '验证失败' : 'Verification failed' }
        }
      })
    }
  }
}
</script>
