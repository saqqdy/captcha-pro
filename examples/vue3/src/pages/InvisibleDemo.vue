<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { createInvisibleCaptcha, type InvisibleCaptchaInstance } from '@captcha/vue3'
import { useLocale } from '../composables/useLocale'

const { currentLocale, t } = useLocale()

const config = ref({
  threshold: 0.7,
  challengeType: 'slider' as 'slider' | 'click'
})
const captcha = ref<InvisibleCaptchaInstance | null>(null)
const result = ref<{ success: boolean; message: string; riskScore?: number } | null>(null)

const init = () => {
  if (captcha.value) captcha.value.destroy()
  captcha.value = createInvisibleCaptcha({
    el: '#invisible-trigger',
    trigger: 'click',
    riskAssessment: {
      threshold: config.value.threshold,
      behaviorCheck: { minInteractionTime: 500, trackAnalysis: true }
    },
    challengeType: config.value.challengeType,
    challengeOptions: { width: 300, height: 170, locale: currentLocale.value },
    onChallenge: () => {
      result.value = { success: false, message: t('检测到可疑行为，请完成验证', 'Suspicious behavior detected, please complete verification') }
    },
    onSuccess: () => {
      const risk = captcha.value?.getRiskScore() || 0
      result.value = { success: true, message: t('验证通过', 'Verification passed'), riskScore: risk }
    },
    onFail: () => {
      result.value = { success: false, message: t('验证失败', 'Verification failed') }
    }
  })
}

watch(config, init, { deep: true })
onMounted(init)
onUnmounted(() => captcha.value?.destroy())
</script>

<template>
  <section class="demo-section">
    <h2>👻 {{ currentLocale === 'zh-CN' ? '智能无感验证' : 'Invisible Captcha' }}<span class="new-badge">NEW</span></h2>

    <div class="info-box">
      💡 {{ currentLocale === 'zh-CN'
        ? '基于风险评估的无感验证，仅在检测到可疑行为时才显示验证码挑战。'
        : 'Risk-based invisible verification that only shows captcha challenge when suspicious behavior is detected.' }}
    </div>

    <div class="options">
      <div class="option-row">
        <label>{{ currentLocale === 'zh-CN' ? '风险阈值' : 'Threshold' }}:</label>
        <select v-model.number="config.threshold">
          <option :value="0.3">{{ currentLocale === 'zh-CN' ? '宽松 (0.3)' : 'Relaxed (0.3)' }}</option>
          <option :value="0.5">{{ currentLocale === 'zh-CN' ? '适中 (0.5)' : 'Moderate (0.5)' }}</option>
          <option :value="0.7">{{ currentLocale === 'zh-CN' ? '严格 (0.7)' : 'Strict (0.7)' }}</option>
          <option :value="0.9">{{ currentLocale === 'zh-CN' ? '非常严格 (0.9)' : 'Very Strict (0.9)' }}</option>
        </select>
      </div>
      <div class="option-row">
        <label>{{ currentLocale === 'zh-CN' ? '挑战类型' : 'Challenge' }}:</label>
        <select v-model="config.challengeType">
          <option value="slider">{{ currentLocale === 'zh-CN' ? '滑块验证' : 'Slider' }}</option>
          <option value="click">{{ currentLocale === 'zh-CN' ? '点击验证' : 'Click' }}</option>
        </select>
      </div>
    </div>

    <div class="btn-group" style="margin-bottom: 20px;">
      <button id="invisible-trigger" class="btn btn-primary">{{ currentLocale === 'zh-CN' ? '点击验证' : 'Click to Verify' }}</button>
    </div>

    <div v-if="result" class="result" :class="result.success ? 'success' : 'error'">
      {{ result.message }}
      <span v-if="result.riskScore !== undefined">
        ({{ currentLocale === 'zh-CN' ? '风险评分' : 'Risk Score' }}: {{ result.riskScore.toFixed(2) }})
      </span>
    </div>
  </section>
</template>
