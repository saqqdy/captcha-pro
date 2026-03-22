<template>
  <view class="container">
    <view class="title">点击验证码</view>

    <view class="section">
      <click-captcha
        :width="300"
        :height="170"
        :count="3"
        :show-refresh="true"
        @success="onSuccess"
        @fail="onFail"
      />
    </view>

    <view class="section" v-if="status">
      <text>验证结果: {{ status }}</text>
    </view>
  </view>
</template>

<script>
import { ClickCaptcha } from '@captcha/mp/uniapp'

export default {
  components: {
    ClickCaptcha
  },
  data() {
    return {
      status: ''
    }
  },
  methods: {
    onSuccess() {
      this.status = '验证成功'
      uni.showToast({ title: '验证成功', icon: 'success' })
    },
    onFail() {
      this.status = '验证失败'
      uni.showToast({ title: '验证失败', icon: 'error' })
    }
  }
}
</script>

<style>
.container {
  padding: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  text-align: center;
}

.section {
  margin-bottom: 40rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.btn {
  background: #1677ff;
  color: #fff;
  border-radius: 8rpx;
  padding: 20rpx;
  text-align: center;
  font-size: 28rpx;
}
</style>
