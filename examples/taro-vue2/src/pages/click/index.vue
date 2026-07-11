<script>
import Taro from '@tarojs/taro'
import { ClickCaptcha } from '@captcha-pro/taro-vue2'

export default {
  name: 'Click',
  components: { ClickCaptcha },
  data() {
    return {
      status: '',
      backend: {
        getCaptcha: 'http://localhost:3001/api/captcha',
        verify: 'http://localhost:3001/api/captcha/verify',
        timeout: 10000,
      },
    }
  },
  methods: {
    onSuccess() {
      this.status = '验证成功'
      Taro.showToast({ title: '验证成功', icon: 'success' })
    },
    onFail() {
      this.status = '验证失败'
      Taro.showToast({ title: '验证失败', icon: 'error' })
    },
    onRefresh() {
      this.status = ''
    },
    onError(err) {
      console.error('captcha error:', err)
      Taro.showToast({ title: '加载失败', icon: 'error' })
    },
  },
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
