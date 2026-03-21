<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  ClickCaptcha as ClickCaptchaCore,
  type ClickCaptchaOptions,
  type ClickCaptchaInstance,
  type CaptchaData,
  type CaptchaStatistics,
  type BackendVerifyOptions,
} from '@captcha/core'

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
const captchaInstance = ref<ClickCaptchaInstance | null>(null)

const initCaptcha = () => {
  if (!containerRef.value) return

  const options: ClickCaptchaOptions = {
    el: containerRef.value,
    width: props.width,
    height: props.height,
    bgImage: props.bgImage,
    count: props.count,
    showRefresh: props.showRefresh,
    verifyMode: props.verifyMode,
    locale: props.locale,
    security: props.secretKey ? { secretKey: props.secretKey } : undefined,
    backendVerify: props.backendVerify,
    onSuccess: () => {
      emit('success')
    },
    onFail: () => {
      emit('fail')
    },
    onRefresh: () => {
      emit('refresh')
    },
  }

  captchaInstance.value = new ClickCaptchaCore(options) as ClickCaptchaInstance
  emit('ready', captchaInstance.value)
}

const refresh = () => {
  captchaInstance.value?.refresh()
}

const getData = (): CaptchaData => {
  return captchaInstance.value?.getData() as CaptchaData
}

const getStatistics = (): CaptchaStatistics => {
  return captchaInstance.value?.getStatistics() as CaptchaStatistics
}

const destroy = () => {
  captchaInstance.value?.destroy()
  captchaInstance.value = null
}

watch(
  () => props.bgImage,
  () => {
    refresh()
  }
)

onMounted(() => {
  initCaptcha()
})

onUnmounted(() => {
  destroy()
})

defineExpose({
  refresh,
  getData,
  getStatistics,
  getInstance: () => captchaInstance.value,
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
