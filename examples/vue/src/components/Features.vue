<script setup lang="ts">
import { useLocale } from '../composables/useLocale'

const { currentLocale, t } = useLocale()
</script>

<template>
  <section class="features">
    <h2>{{ currentLocale === 'zh-CN' ? '功能特性' : 'Features' }}</h2>
    <div class="feature-grid">
      <div class="feature-item">✓ {{ currentLocale === 'zh-CN' ? '随机滑块形状' : 'Random slider shapes' }}</div>
      <div class="feature-item">✓ {{ currentLocale === 'zh-CN' ? '迷惑坑位防机器人' : 'Decoy holes anti-bot' }}</div>
      <div class="feature-item">✓ {{ currentLocale === 'zh-CN' ? '渐变背景装饰' : 'Gradient background' }}</div>
      <div class="feature-item">✓ {{ currentLocale === 'zh-CN' ? '中文词汇库' : 'Chinese vocabulary' }}</div>
      <div class="feature-item">✓ {{ currentLocale === 'zh-CN' ? '弹窗模式' : 'Popup mode' }}</div>
      <div class="feature-item">✓ {{ currentLocale === 'zh-CN' ? '后端验证' : 'Backend verify' }}</div>
      <div class="feature-item">✓ {{ currentLocale === 'zh-CN' ? '智能无感验证' : 'Invisible captcha' }}</div>
      <div class="feature-item">✓ {{ currentLocale === 'zh-CN' ? '多语言支持' : 'i18n support' }}</div>
      <div class="feature-item">
        ✓ {{ currentLocale === 'zh-CN' ? '系统暗色模式' : 'System dark mode' }}
        <span class="new-badge">v2.3.0</span>
      </div>
      <div class="feature-item">
        ✓ {{ currentLocale === 'zh-CN' ? '弹窗焦点陷阱' : 'Popup focus trap' }}
        <span class="new-badge">v2.3.0</span>
      </div>
      <div class="feature-item">
        ✓ {{ currentLocale === 'zh-CN' ? '无障碍(a11y)' : 'Accessibility (a11y)' }}
        <span class="new-badge">v2.2.0</span>
      </div>
      <div class="feature-item">
        ✓ {{ currentLocale === 'zh-CN' ? 'Native 三端对齐' : 'Native alignment' }}
        <span class="new-badge">v2.1.0</span>
      </div>
    </div>
  </section>
</template>
