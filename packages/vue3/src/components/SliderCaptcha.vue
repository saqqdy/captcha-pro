<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  SliderCaptcha as SliderCaptchaCore,
  type SliderCaptchaOptions,
  type SliderCaptchaInstance,
  type CaptchaData,
  type CaptchaStatistics,
  type BackendVerifyOptions,
} from '@captcha/core'

export interface Props {
  width?: number
  height?: number
  bgImage?: string
  sliderImage?: string
  sliderWidth?: number
  sliderHeight?: number
  precision?: number
  showRefresh?: boolean
  verifyMode?: 'frontend' | 'backend'
  locale?: 'zh-CN' | 'en-US'
  secretKey?: string
  backendVerify?: BackendVerifyOptions
}

const props = withDefaults(defineProps<Props>(), {
  width: 300,
  height: 170,
  sliderWidth: 42,
  sliderHeight: 42,
  precision: 5,
  showRefresh: true,
  verifyMode: 'frontend',
})

const emit = defineEmits<{
  success: []
  fail: []
  refresh: []
  ready: [instance: SliderCaptchaInstance]
}>()

const containerRef = ref<HTMLElement | null>(null)
const captchaInstance = ref<SliderCaptchaInstance | null>(null)

const initCaptcha = () => {
  if (!containerRef.value) return

  const options: SliderCaptchaOptions = {
    el: containerRef.value,
    width: props.width,
    height: props.height,
    bgImage: props.bgImage,
    sliderImage: props.sliderImage,
    sliderWidth: props.sliderWidth,
    sliderHeight: props.sliderHeight,
    precision: props.precision,
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

  captchaInstance.value = new SliderCaptchaCore(options) as SliderCaptchaInstance
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
  () => [props.bgImage, props.sliderImage],
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
