<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Taro from '@tarojs/taro'

const isDark = ref(false)

onMounted(() => {
  try {
    const saved = Taro.getStorageSync('cp-theme')
    const systemDark = Taro.getSystemInfoSync().theme === 'dark'
    isDark.value = saved === 'dark' || (saved !== 'light' && systemDark)
  } catch (e) {
    // ignore
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  try {
    Taro.setStorageSync('cp-theme', isDark.value ? 'dark' : 'light')
  } catch (e) {
    // ignore
  }
}

const themeClass = computed(() => isDark.value ? 'cp-dark' : 'cp-light')
</script>

<template>
  <view class="index" :class="themeClass">
    <view class="title">Captcha Pro</view>
    <view class="subtitle">Taro + Vue 3 示例</view>

    <view class="theme-switch">
      <button @click="toggleTheme">
        {{ isDark ? '☀️ 浅色模式' : '🌙 暗色模式' }}
      </button>
    </view>

    <view class="features">
      <view class="features-title">v2.x 功能特性</view>
      <view class="feature-item">✓ 系统暗色模式 <text class="badge">v2.3.0</text></view>
      <view class="feature-item">✓ 弹窗焦点陷阱 <text class="badge">v2.3.0</text></view>
      <view class="feature-item">✓ 无障碍(a11y) <text class="badge">v2.2.0</text></view>
      <view class="feature-item">✓ Native 三端对齐 <text class="badge">v2.1.0</text></view>
      <view class="feature-item">✓ 后端验证</view>
      <view class="feature-item">✓ 智能无感验证</view>
      <view class="feature-item">✓ 多语言支持</view>
    </view>

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
  min-height: 100vh;
  padding: 40px 30px;
  background: #f5f5f5;
}

.title {
  font-size: 48px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 16px;
  color: #333;
}

.subtitle {
  font-size: 28px;
  color: #999;
  text-align: center;
  margin-bottom: 40px;
}

.theme-switch {
  margin-bottom: 30px;
  text-align: center;
}

.theme-switch button {
  padding: 16px 32px;
  border: none;
  border-radius: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 28px;
  line-height: 1.5;
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
  color: #333;
}

.card-desc {
  display: block;
  font-size: 26px;
  color: #666;
}

.features {
  margin-bottom: 30px;
  padding: 30px;
  background: #fff;
  border-radius: 16px;
}

.features-title {
  font-size: 30px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.feature-item {
  font-size: 26px;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 20px;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 10px;
}

/* Dark mode */
.index.cp-dark {
  background: #1a1a1a;
}

.index.cp-dark .title {
  color: #fff;
}

.index.cp-dark .subtitle {
  color: #aaaaaa;
}

.index.cp-dark .card,
.index.cp-dark .features {
  background: #2a2a2a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.index.cp-dark .card-title,
.index.cp-dark .features-title {
  color: #eeeeee;
}

.index.cp-dark .card-desc,
.index.cp-dark .feature-item {
  color: #aaaaaa;
}
</style>
