<script>
export default {
  name: 'AppHeader',
  props: {
    currentLocale: { type: String, default: 'zh-CN' }
  },
  emits: ['switch'],
  data() {
    return {
      isDark: false
    }
  },
  mounted() {
    const saved = localStorage.getItem('cp-theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (saved === 'dark' || (saved === null && systemDark)) {
      this.isDark = true
      document.documentElement.classList.add('cp-dark')
      document.documentElement.classList.remove('cp-light')
    } else if (saved === 'light') {
      this.isDark = false
      document.documentElement.classList.add('cp-light')
      document.documentElement.classList.remove('cp-dark')
    } else {
      this.isDark = false
      document.documentElement.classList.remove('cp-dark', 'cp-light')
    }
  },
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark
      document.documentElement.classList.toggle('cp-dark', this.isDark)
      document.documentElement.classList.toggle('cp-light', !this.isDark)
      localStorage.setItem('cp-theme', this.isDark ? 'dark' : 'light')
    }
  }
}
</script>

<template>
  <header>
    <h1>
      🔐 Captcha Pro
      <span class="version-badge">v2.3.0</span>
    </h1>
    <p class="subtitle">
      {{ currentLocale === 'zh-CN' ? '轻量级行为验证码库' : 'Lightweight Behavioral Captcha Library' }}
    </p>
    <div class="lang-switch">
      <button :class="{ active: currentLocale === 'zh-CN' }" @click="$emit('switch', 'zh-CN')">中文</button>
      <button :class="{ active: currentLocale === 'en-US' }" @click="$emit('switch', 'en-US')">English</button>
    </div>
    <div class="theme-switch">
      <button :class="{ active: isDark }" @click="toggleTheme">
        {{ isDark ? (currentLocale === 'zh-CN' ? '☀️ 浅色模式' : '☀️ Light') : (currentLocale === 'zh-CN' ? '🌙 暗色模式' : '🌙 Dark') }}
      </button>
    </div>
  </header>
</template>
