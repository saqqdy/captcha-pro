<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="{ active: activeTab === tab.key }"
      @click="$emit('update:active-tab', tab.key)"
    >
      {{ locale === 'zh-CN' ? tab.label.zh : tab.label.en }}
      <span v-if="tab.badge" class="new-badge">{{ tab.badge }}</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'TabNav',
  props: {
    activeTab: { type: String, default: 'slider' },
    locale: { type: String, default: 'zh-CN' }
  },
  emits: ['update:activeTab'],
  data() {
    return {
      tabs: [
        { key: 'slider', label: { zh: '滑块验证码', en: 'Slider Captcha' } },
        { key: 'click', label: { zh: '点击验证码', en: 'Click Captcha' } },
        { key: 'popup', label: { zh: '弹窗验证码', en: 'Popup Captcha' } },
        { key: 'backend', label: { zh: '后端验证', en: 'Backend' }, badge: 'NEW' },
        { key: 'invisible', label: { zh: '智能无感', en: 'Invisible' }, badge: 'NEW' },
        { key: 'custom', label: { zh: '自定义图片', en: 'Custom Image' } },
      ]
    }
  }
}
</script>
