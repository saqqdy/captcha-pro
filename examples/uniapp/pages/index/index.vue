<template>
  <view class="container">
    <view class="title">验证码示例</view>

    <view class="section">
      <view class="section-title">滑块验证码</view>
      <navigator url="/pages/slider/index" class="btn">打开滑块验证</navigator>
    </view>

    <view class="section">
      <view class="section-title">点击验证码</view>
      <navigator url="/pages/click/index" class="btn">打开点击验证</navigator>
    </view>
  </view>
</template>

<script>
export default {}
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

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
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
