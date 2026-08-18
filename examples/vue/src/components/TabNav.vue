<script setup lang="ts">
import { useLocale } from '../composables/useLocale'

defineProps<{
  activeTab: string
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', value: string): void
}>()

const { currentLocale, t } = useLocale()

const tabs = [
  { key: 'slider', label: { zh: '滑块验证码', en: 'Slider Captcha' } },
  { key: 'click', label: { zh: '点击验证码', en: 'Click Captcha' } },
  { key: 'popup', label: { zh: '弹窗验证码', en: 'Popup Captcha' } },
  { key: 'backend', label: { zh: '后端验证', en: 'Backend' }, badge: 'v2.1' },
  { key: 'invisible', label: { zh: '智能无感', en: 'Invisible' }, badge: 'v2.1' },
  { key: 'custom', label: { zh: '自定义图片', en: 'Custom Image' } },
  { key: 'accessibility', label: { zh: '无障碍支持', en: 'Accessibility' }, badge: 'v2.2' },
  { key: 'locale', label: { zh: '国际化', en: 'Locale' }, badge: 'v2.0' },
  { key: 'statistics', label: { zh: '统计数据', en: 'Statistics' } },
  { key: 'options', label: { zh: '配置选项', en: 'Options' } },
  { key: 'error', label: { zh: '错误处理', en: 'Error Handling' } },
  { key: 'dark', label: { zh: '暗色模式', en: 'Dark Mode' }, badge: 'v2.3' }
]
</script>

<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="{ active: activeTab === tab.key }"
      @click="emit('update:activeTab', tab.key)"
    >
      {{ currentLocale === 'zh-CN' ? tab.label.zh : tab.label.en }}
      <span v-if="tab.badge" class="new-badge">{{ tab.badge }}</span>
    </button>
  </div>
</template>
