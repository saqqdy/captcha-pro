<script setup lang="ts">
import { ref } from 'vue'
import { PopupCaptcha } from '@captcha/vue3'
import { useLocale } from '../composables/useLocale'

const { currentLocale, t } = useLocale()

const config = ref({
  type: 'slider' as 'slider' | 'click',
  title: '安全验证',
  autoClose: true
})
const popupRef = ref()

const showPopup = () => popupRef.value?.show()

const onSuccess = () => console.log('Popup captcha success')
</script>

<template>
  <section class="demo-section">
    <h2>💬 {{ currentLocale === 'zh-CN' ? '弹窗验证码' : 'Popup Captcha' }}</h2>

    <div class="options">
      <div class="option-row">
        <label>{{ currentLocale === 'zh-CN' ? '验证码类型' : 'Type' }}:</label>
        <select v-model="config.type">
          <option value="slider">{{ currentLocale === 'zh-CN' ? '滑块验证' : 'Slider' }}</option>
          <option value="click">{{ currentLocale === 'zh-CN' ? '点击验证' : 'Click' }}</option>
        </select>
      </div>
      <div class="option-row">
        <label>{{ currentLocale === 'zh-CN' ? '弹窗标题' : 'Title' }}:</label>
        <input type="text" v-model="config.title" :placeholder="currentLocale === 'zh-CN' ? '安全验证' : 'Security Verification'">
      </div>
      <div class="option-row">
        <label>{{ currentLocale === 'zh-CN' ? '自动关闭' : 'Auto Close' }}:</label>
        <input type="checkbox" v-model="config.autoClose">
      </div>
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" @click="showPopup">{{ currentLocale === 'zh-CN' ? '打开验证弹窗' : 'Open Popup' }}</button>
    </div>

    <PopupCaptcha
      ref="popupRef"
      :type="config.type"
      :auto-close="config.autoClose"
      :captcha-options="{ width: 320, height: 180, locale: currentLocale }"
      :modal="{ title: config.title }"
      @success="onSuccess"
    />
  </section>
</template>
