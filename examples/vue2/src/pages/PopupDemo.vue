<template>
  <section class="demo-section">
    <h2>💬 {{ locale === 'zh-CN' ? '弹窗验证码' : 'Popup Captcha' }}</h2>

    <div class="options">
      <div class="option-row">
        <label>{{ locale === 'zh-CN' ? '验证码类型' : 'Type' }}:</label>
        <select v-model="type">
          <option value="slider">{{ locale === 'zh-CN' ? '滑块验证' : 'Slider' }}</option>
          <option value="click">{{ locale === 'zh-CN' ? '点击验证' : 'Click' }}</option>
        </select>
      </div>
      <div class="option-row">
        <label>{{ locale === 'zh-CN' ? '自动关闭' : 'Auto Close' }}:</label>
        <input type="checkbox" v-model="autoClose">
      </div>
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" @click="show">{{ locale === 'zh-CN' ? '打开验证弹窗' : 'Open Popup' }}</button>
    </div>

    <PopupCaptcha
      ref="captchaRef"
      :type="type"
      :auto-close="autoClose"
      :captcha-options="{ width: 320, height: 180, locale: locale }"
      @success="onSuccess"
    />
  </section>
</template>

<script>
import { PopupCaptcha } from '@captcha/vue2'

export default {
  name: 'PopupDemo',
  components: { PopupCaptcha },
  props: {
    locale: { type: String, default: 'zh-CN' }
  },
  data() {
    return {
      type: 'slider',
      autoClose: true
    }
  },
  methods: {
    show() {
      this.$refs.captchaRef?.show()
    },
    onSuccess() {
      console.log('Popup captcha success')
    }
  }
}
</script>
