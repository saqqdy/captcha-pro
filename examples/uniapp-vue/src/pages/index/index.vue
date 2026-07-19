<script setup lang="ts">
</script>

<template>
  <view class="index">
    <view class="title">Captcha Pro</view>
    <view class="subtitle">uni-app + Vue 3 示例</view>
    <navigator url="/pages/slider/index" class="card">
      <text class="card-title">滑块验证码</text>
      <text class="card-desc">拖动滑块至缺口位置完成验证</text>
    </navigator>
    <navigator url="/pages/click/index" class="card">
      <text class="card-title">点击验证码</text>
      <text class="card-desc">按提示依次点击图中对应位置</text>
    </navigator>
    <navigator url="/pages/popup/index" class="card">
      <text class="card-title">弹窗验证码</text>
      <text class="card-desc">弹窗方式展示滑块或点击验证</text>
    </navigator>
  </view>
</template>

<style lang="scss">
.index {
  padding: 40rpx 30rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #999;
  text-align: center;
  margin-bottom: 60rpx;
}

.card {
  display: block;
  padding: 40rpx;
  margin-bottom: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.card-title {
  display: block;
  font-size: 34rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.card-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
}
</style>
