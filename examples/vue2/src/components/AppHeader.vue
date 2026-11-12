<script>
export default {
  name: 'AppHeader',
  props: {
    currentLocale: { type: String, default: 'zh-CN' }
  },
  emits: ['switch'],
  data() {
    return {
      isDark: false,
      locales: [
        { code: 'zh-CN', label: '中文' },
        { code: 'zh-TW', label: '繁中' },
        { code: 'en-US', label: 'EN' },
        { code: 'fr-FR', label: 'FR' },
        { code: 'de-DE', label: 'DE' },
        { code: 'es-ES', label: 'ES' }
      ]
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
      <span class="version-badge">v2.4.0</span>
    </h1>
    <p class="subtitle">
      {{ t('轻量级行为验证码库', 'Lightweight Behavioral Captcha Library') }}
    </p>
    <div class="lang-switch">
      <button
        v-for="loc in locales"
        :key="loc.code"
        :class="{ active: currentLocale === loc.code }"
        @click="$emit('switch', loc.code)"
      >{{ loc.label }}</button>
    </div>
    <div class="theme-switch">
      <button :class="{ active: isDark }" @click="toggleTheme">
        {{ isDark ? (t('☀️ 浅色模式', '☀️ Light')) : (t('🌙 暗色模式', '🌙 Dark')) }}
      </button>
    </div>
  </header>
</template>
