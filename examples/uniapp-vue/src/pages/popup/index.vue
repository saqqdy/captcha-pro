<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PopupCaptcha from '@captcha-pro/uniapp-vue/popup-captcha.vue'
import type { BackendConfig, PopupCaptchaRef } from '@captcha-pro/uniapp-vue'

const isDark = ref(false)

onMounted(() => {
  try {
    const saved = uni.getStorageSync('cp-theme')
    const systemDark = uni.getSystemInfoSync().theme === 'dark'
    isDark.value = saved === 'dark' || (saved !== 'light' && systemDark)
  } catch (e) {
    // ignore
  }
})

const backend: BackendConfig = {
  getCaptcha: 'http://localhost:3001/api/captcha',
  verify: 'http://localhost:3001/api/captcha/verify',
  timeout: 15000,
}

const status = ref('')
const sliderPopupRef = ref<PopupCaptchaRef>()
const clickPopupRef = ref<PopupCaptchaRef>()

const showSlider = () => {
  sliderPopupRef.value?.show()
}

const showClick = () => {
  clickPopupRef.value?.show()
}

const onSuccess = () => {
  status.value = '验证成功'
  uni.showToast({ title: '验证成功', icon: 'success' })
}

const onFail = () => {
  status.value = '验证失败'
  uni.showToast({ title: '验证失败', icon: 'error' })
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
  <view class="container" :class="{ 'cp-dark': isDark }">
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
  padding: 40rpx 30rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
}

.section {
  margin-bottom: 30rpx;
}

.captcha-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.btn {
  display: block;
  padding: 24rpx 0;
  margin-bottom: 20rpx;
  background: #1991fa;
  color: #fff;
  font-size: 30rpx;
  font-weight: 500;
  text-align: center;
  border-radius: 12rpx;
}

.btn-secondary {
  background: #667eea;
}

.desc {
  font-size: 26rpx;
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
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.3);
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
