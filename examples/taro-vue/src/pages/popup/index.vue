<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { PopupCaptcha } from '@captcha-pro/taro-vue'
import type { BackendConfig, PopupCaptchaRef } from '@captcha-pro/taro-vue'

const backend: BackendConfig = {
  getCaptcha: 'http://localhost:3001/api/captcha',
  verify: 'http://localhost:3001/api/captcha/verify',
  timeout: 15000,
}

const status = ref('')
const isDark = ref(false)
const sliderPopupRef = ref<PopupCaptchaRef>()
const clickPopupRef = ref<PopupCaptchaRef>()

onMounted(() => {
  try {
    const saved = Taro.getStorageSync('cp-theme')
    const systemDark = Taro.getSystemInfoSync().theme === 'dark'
    isDark.value = saved === 'dark' || (saved !== 'light' && systemDark)
  } catch (e) {
    // ignore
  }
})

const showSlider = () => {
  sliderPopupRef.value?.show()
}

const showClick = () => {
  clickPopupRef.value?.show()
}

const onSuccess = () => {
  status.value = '验证成功'
  Taro.showToast({ title: '验证成功', icon: 'success' })
}

const onFail = () => {
  status.value = '验证失败'
  Taro.showToast({ title: '验证失败', icon: 'error' })
}

const onRefresh = () => {
  status.value = ''
}

const onOpen = () => {
  console.log('popup opened')
}

const onClose = () => {
  console.log('popup closed')
}
</script>

<template>
  <view class="container" :class="isDark ? 'cp-dark' : 'cp-light'">
    <view class="title">弹窗验证码</view>

    <view class="section captcha-section">
      <view class="btn" @tap="showSlider">弹出滑块验证</view>
      <view class="btn btn-secondary" @tap="showClick">弹出点击验证</view>
    </view>

    <view class="section" v-if="status">
      <text>验证结果: {{ status }}</text>
    </view>

    <view class="section">
      <view class="section-title">使用说明</view>
      <text class="desc">弹窗验证码将滑块或点击验证码包裹在弹窗中，通过 ref 调用 show()/hide() 方法控制显示隐藏。</text>
    </view>

    <PopupCaptcha
      ref="sliderPopupRef"
      type="slider"
      :backend="backend"
      @success="onSuccess"
      @fail="onFail"
      @refresh="onRefresh"
      @open="onOpen"
      @close="onClose"
    />

    <PopupCaptcha
      ref="clickPopupRef"
      type="click"
      :backend="backend"
      @success="onSuccess"
      @fail="onFail"
      @refresh="onRefresh"
      @open="onOpen"
      @close="onClose"
    />
  </view>
</template>

<style lang="scss">
.container {
  padding: 40px 30px;
}

.title {
  font-size: 40px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40px;
}

.section {
  margin-bottom: 30px;
}

.captcha-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 16px;
}

.btn {
  display: block;
  padding: 24px 0;
  margin-bottom: 20px;
  background: #1991fa;
  color: #fff;
  font-size: 30px;
  font-weight: 500;
  text-align: center;
  border-radius: 12px;
}

.btn-secondary {
  background: #667eea;
}

.desc {
  font-size: 26px;
  color: #666;
  line-height: 1.6;
}

/* Dark mode */
.container.cp-dark {
  background: #1a1a1a;
}

.container.cp-dark .title {
  color: #fff;
}

.container.cp-dark .captcha-section {
  background: #2a2a2a;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.container.cp-dark .section-title {
  color: #eeeeee;
}

.container.cp-dark .desc {
  color: #aaaaaa;
}

.container.cp-dark .section {
  color: #eeeeee;
}
</style>
