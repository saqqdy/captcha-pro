<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocale } from '../composables/useLocale'

const { currentLocale, t, switchLanguage } = useLocale()

const locales = [
  { code: 'zh-CN', label: '中文' },
  { code: 'zh-TW', label: '繁中' },
  { code: 'en-US', label: 'EN' },
  { code: 'fr-FR', label: 'FR' },
  { code: 'de-DE', label: 'DE' },
  { code: 'es-ES', label: 'ES' },
] as const
const isDark = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('cp-theme')
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (saved === 'dark' || (saved === null && systemDark)) {
    isDark.value = true
    document.documentElement.classList.add('cp-dark')
    document.documentElement.classList.remove('cp-light')
  } else if (saved === 'light') {
    isDark.value = false
    document.documentElement.classList.add('cp-light')
    document.documentElement.classList.remove('cp-dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('cp-dark', 'cp-light')
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('cp-dark', isDark.value)
  document.documentElement.classList.toggle('cp-light', !isDark.value)
  localStorage.setItem('cp-theme', isDark.value ? 'dark' : 'light')
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
        @click="switchLanguage(loc.code)"
      >{{ loc.label }}</button>
    </div>
    <div class="theme-switch">
      <button :class="{ active: isDark }" @click="toggleTheme">
        {{ isDark ? (t('☀️ 浅色模式', '☀️ Light')) : (t('🌙 暗色模式', '🌙 Dark')) }}
      </button>
    </div>
  </header>
</template>
