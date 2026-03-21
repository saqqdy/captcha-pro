<template>
  <header>
    <h1>
      🔐 Captcha Pro
      <span class="version-badge">v1.1.0</span>
    </h1>
    <p class="subtitle">
      {{ currentLocale === 'zh-CN' ? '轻量级行为验证码库' : 'Lightweight Behavioral Captcha Library' }}
    </p>
    <div class="lang-switch">
      <button :class="{ active: currentLocale === 'zh-CN' }" @click="$emit('switch', 'zh-CN')">中文</button>
      <button :class="{ active: currentLocale === 'en-US' }" @click="$emit('switch', 'en-US')">English</button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    currentLocale: { type: String, default: 'zh-CN' }
  },
  emits: ['switch']
}
</script>
