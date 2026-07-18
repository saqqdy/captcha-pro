<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  type ClickCaptchaInstance,
  type BackendVerifyOptions,
} from '@captcha-pro/core'
import { useClickCaptcha, type UseClickCaptchaOptions } from '../composables/useClickCaptcha'

export interface Props {
  width?: number
  height?: number
  bgImage?: string
  count?: number
  showRefresh?: boolean
  verifyMode?: 'frontend' | 'backend'
  locale?: 'zh-CN' | 'en-US'
  secretKey?: string
  backendVerify?: BackendVerifyOptions
}

const props = withDefaults(defineProps<Props>(), {
  width: 300,
  height: 170,
  count: 3,
  showRefresh: true,
  verifyMode: 'frontend',
})

const emit = defineEmits<{
  success: []
  fail: []
  refresh: []
  ready: [instance: ClickCaptchaInstance]
}>()

const containerRef = ref<HTMLElement | null>(null)

const { instance, isReady, refresh, getData, getStatistics, destroy } = useClickCaptcha({
  el: () => containerRef.value ?? undefined,
  width: props.width,
  height: props.height,
  bgImage: props.bgImage,
  count: props.count,
  showRefresh: props.showRefresh,
  verifyMode: props.verifyMode,
  locale: props.locale,
  secretKey: props.secretKey,
  backendVerify: props.backendVerify,
  onSuccess: () => emit('success'),
  onFail: () => emit('fail'),
  onRefresh: () => emit('refresh'),
})

watch(isReady, (ready) => {
  if (ready && instance.value) {
    emit('ready', instance.value)
  }
})

defineExpose({
  refresh,
  getData,
  getStatistics,
  getInstance: () => instance.value,
})
</script>

<template>
  <div class="captcha-vue3-wrapper">
    <div ref="containerRef" class="captcha-container" />
  </div>
</template>

<style scoped>
.captcha-vue3-wrapper {
  position: relative;
  display: inline-block;
}

.captcha-container {
  position: relative;
}
</style>
