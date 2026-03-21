<template>
  <section class="demo-section">
    <h2>🎯 {{ locale === 'zh-CN' ? '点选文字验证码' : 'Click Captcha' }}</h2>

    <div class="info-box">
      💡 {{ locale === 'zh-CN' ? '使用中文词汇库自动生成，包含200+常用成语和词汇。' : 'Auto-generated from Chinese vocabulary (200+ words).' }}
    </div>

    <div class="options">
      <div class="option-row">
        <label>{{ locale === 'zh-CN' ? '点击数量' : 'Click Count' }}:</label>
        <select v-model.number="count">
          <option :value="2">2</option>
          <option :value="3">3</option>
          <option :value="4">4</option>
        </select>
      </div>
    </div>

    <div class="captcha-box">
      <ClickCaptcha
        ref="captchaRef"
        :width="320"
        :height="180"
        :count="count"
        :locale="locale"
        @success="onSuccess"
      />
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" @click="reset">{{ locale === 'zh-CN' ? '重置验证码' : 'Reset' }}</button>
      <button class="btn btn-secondary" @click="getData">{{ locale === 'zh-CN' ? '获取数据' : 'Get Data' }}</button>
    </div>
  </section>
</template>

<script>
import { ClickCaptcha } from '@captcha/vue2'

export default {
  name: 'ClickDemo',
  components: { ClickCaptcha },
  props: {
    locale: { type: String, default: 'zh-CN' }
  },
  data() {
    return { count: 3 }
  },
  methods: {
    onSuccess() {
      console.log('Click success:', this.$refs.captchaRef?.getData())
    },
    reset() {
      this.$refs.captchaRef?.refresh()
    },
    getData() {
      const data = this.$refs.captchaRef?.getData()
      console.log('Click data:', data)
      alert(this.locale === 'zh-CN' ? '验证数据已输出到控制台' : 'Data logged to console')
    }
  }
}
</script>
