<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import {
  SliderCaptcha as SliderCaptchaCore,
  type SliderCaptchaOptions,
  type SliderCaptchaInstance,
  type CaptchaData,
  type CaptchaStatistics,
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
const status = ref<'' | 'success' | 'fail'>('')
const isLoading = ref(true)

const statusText = computed(() => {
  if (status.value === 'success') return props.locale === 'zh-CN' ? '验证成功' : 'Success'
  if (status.value === 'fail') return props.locale === 'zh-CN' ? '验证失败' : 'Failed'
  return ''
})

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
    onSuccess: () => {
      status.value = 'success'
      emit('success')
    },
    onFail: () => {
      status.value = 'fail'
      emit('fail')
    },
    onRefresh: () => {
      status.value = ''
      emit('refresh')
    },
  }

  captchaInstance.value = new SliderCaptchaCore(options) as SliderCaptchaInstance
  isLoading.value = false
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
    <div v-if="status" class="captcha-status" :class="status">
      {{ statusText }}
    </div>
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

.captcha-status {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  z-index: 10;
}

.captcha-status.success {
  background: rgba(82, 196, 26, 0.9);
}

.captcha-status.fail {
  background: rgba(245, 34, 45, 0.9);
}
</style>
