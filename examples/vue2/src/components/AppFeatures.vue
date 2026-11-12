<script>
export default {
  name: 'AppFeatures',
  props: {
    locale: { type: String, default: 'zh-CN' }
  }
}
</script>

<template>
  <section class="features">
    <h2>{{ t('功能特性', 'Features') }}</h2>
    <div class="feature-grid">
      <div class="feature-item">✓ {{ t('随机滑块形状', 'Random slider shapes') }}</div>
      <div class="feature-item">✓ {{ t('迷惑坑位防机器人', 'Decoy holes anti-bot') }}</div>
      <div class="feature-item">✓ {{ t('渐变背景装饰', 'Gradient background') }}</div>
      <div class="feature-item">✓ {{ t('中文词汇库', 'Chinese vocabulary') }}</div>
      <div class="feature-item">✓ {{ t('弹窗模式', 'Popup mode') }}</div>
      <div class="feature-item">✓ {{ t('后端验证', 'Backend verify') }}</div>
      <div class="feature-item">✓ {{ t('智能无感验证', 'Invisible captcha') }}</div>
      <div class="feature-item">✓ {{ t('多语言支持', 'i18n support') }}</div>
      <div class="feature-item">
        ✓ {{ t('系统暗色模式', 'System dark mode') }}
        <span class="new-badge">v2.3.0</span>
      </div>
      <div class="feature-item">
        ✓ {{ t('弹窗焦点陷阱', 'Popup focus trap') }}
        <span class="new-badge">v2.3.0</span>
      </div>
      <div class="feature-item">
        ✓ {{ t('无障碍(a11y)', 'Accessibility (a11y)') }}
        <span class="new-badge">v2.2.0</span>
      </div>
      <div class="feature-item">
        ✓ {{ t('Native 三端对齐', 'Native alignment') }}
        <span class="new-badge">v2.1.0</span>
      </div>
    </div>
  </section>
</template>
