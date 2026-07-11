<script>
export default {
  name: 'Index'
}
</script>

<template>
  <view class="index">
    <view class="title">Captcha Pro</view>
    <view class="subtitle">Taro + Vue 2 示例</view>
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
      <text class="card-desc">弹窗形式调用滑块/点击验证</text>
    </navigator>
  </view>
</template>

<style lang="scss">
.index {
  padding: 40px 30px;
}

.title {
  font-size: 48px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 16px;
}

.subtitle {
  font-size: 28px;
  color: #999;
  text-align: center;
  margin-bottom: 60px;
}

.card {
  display: block;
  padding: 40px;
  margin-bottom: 30px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-title {
  display: block;
  font-size: 34px;
  font-weight: bold;
  margin-bottom: 12px;
}

.card-desc {
  display: block;
  font-size: 26px;
  color: #666;
}
</style>
