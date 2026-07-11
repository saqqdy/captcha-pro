<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import { SliderCaptcha } from '@captcha-pro/taro-vue'
import type { BackendConfig } from '@captcha-pro/taro-vue'

const backend: BackendConfig = {
  getCaptcha: 'http://localhost:3001/api/captcha',
  verify: 'http://localhost:3001/api/captcha/verify',
  timeout: 10000,
}

const status = ref('')

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

const onError = (err: unknown) => {
  console.error('captcha error:', err)
  Taro.showToast({ title: '加载失败', icon: 'error' })
}
</script>

<template>
  <view class="container">
    <view class="title">滑块验证码</view>

    <view class="section captcha-section">
      <SliderCaptcha
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
      <text class="desc">滑块验证码采用后端服务模式，需要配置 backend 参数。{{ '\n' }}将滑块拖动至缺口位置完成验证。</text>
    </view>
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

.desc {
  font-size: 26px;
  color: #666;
  line-height: 1.6;
}
</style>
