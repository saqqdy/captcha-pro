<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  PopupCaptcha as PopupCaptchaCore,
  type PopupCaptchaOptions,
  type PopupCaptchaInstance,
} from '@captcha/core'

export interface Props {
  type?: 'slider' | 'click'
  trigger?: string
  modal?: {
    maskClosable?: boolean
    escClosable?: boolean
    showClose?: boolean
    title?: string
  }
  autoClose?: boolean
  closeDelay?: number
  captchaOptions?: Record<string, unknown>
}

const props = withDefaults(defineProps<Props>(), {
  type: 'slider',
  autoClose: true,
  closeDelay: 500,
})

const emit = defineEmits<{
  open: []
  close: []
  success: []
  fail: []
  ready: [instance: PopupCaptchaInstance]
}>()

const popupInstance = ref<PopupCaptchaInstance | null>(null)

const initPopup = () => {
  const options: PopupCaptchaOptions = {
    type: props.type,
    trigger: props.trigger,
    modal: props.modal,
    autoClose: props.autoClose,
    closeDelay: props.closeDelay,
    captchaOptions: props.captchaOptions as any,
    onOpen: () => emit('open'),
    onClose: () => emit('close'),
    onSuccess: () => emit('success'),
    onFail: () => emit('fail'),
  }

  popupInstance.value = new PopupCaptchaCore(options) as PopupCaptchaInstance
  emit('ready', popupInstance.value)
}

const show = () => {
  popupInstance.value?.show()
}

const hide = () => {
  popupInstance.value?.hide()
}

const isVisible = () => {
  return popupInstance.value?.isVisible() ?? false
}

const destroy = () => {
  popupInstance.value?.destroy()
  popupInstance.value = null
}

onMounted(() => {
  initPopup()
})

onUnmounted(() => {
  destroy()
})

defineExpose({
  show,
  hide,
  isVisible,
  getInstance: () => popupInstance.value,
})
</script>

<template>
  <slot />
</template>
