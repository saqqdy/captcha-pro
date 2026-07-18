<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  type SliderCaptchaInstance,
  type BackendVerifyOptions,
} from '@captcha-pro/core'
import { useSliderCaptcha, type UseSliderCaptchaOptions } from '../composables/useSliderCaptcha'

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

const { instance, isReady, refresh, getData, getStatistics, destroy } = useSliderCaptcha({
  el: () => containerRef.value ?? undefined,
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
