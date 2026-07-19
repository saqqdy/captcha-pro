<script setup lang="ts">
import { ref } from 'vue'
import ClickCaptcha from '@captcha-pro/uniapp-vue/click-captcha.vue'
import type { BackendConfig } from '@captcha-pro/uniapp-vue'

const backend: BackendConfig = {
  getCaptcha: 'http://localhost:3001/api/captcha',
  verify: 'http://localhost:3001/api/captcha/verify',
  timeout: 10000,
}

const status = ref('')

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

const onError = (err: unknown) => {
  console.error('captcha error:', err)
  uni.showToast({ title: '加载失败', icon: 'error' })
}
</script>

<template>
  <view class="container">
    <view class="title">点击验证码</view>

    <view class="section captcha-section">
      <ClickCaptcha
        :width="650"
        :height="380"
        :show-refresh="true"
        :backend="backend"
        @success="onSuccess"
        @fail="onFail"
        @refresh="onRefresh"
        @error="onError"
      />
    </view>

    <view class="section" v-if="status">
      <text>验证结果: {{ status }}</text>
    </view>

    <view class="section">
      <view class="section-title">使用说明</view>
      <text class="desc">点击验证码采用后端服务模式，需要配置 backend 参数。{{ '\n' }}按照提示文字依次点击图中对应位置完成验证。</text>
    </view>
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

.desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
</style>
