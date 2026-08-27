<script setup lang="ts">
import { ref, computed } from 'vue'
import { Text, View } from '@tarojs/components'
import { DEFAULT_LOCALE, getLocaleMessage, type PopupCaptchaProps } from '@captcha-pro/mp-shared'
import ClickCaptcha from './click-captcha.vue'
import SliderCaptcha from './slider-captcha.vue'
import '../styles/captcha.scss'

const props = withDefaults(defineProps<PopupCaptchaProps>(), {
	type: 'slider',
	title: '',
	maskClosable: true,
	showClose: true,
	autoClose: true,
	closeDelay: 500,
	locale: DEFAULT_LOCALE,
	sliderOptions: () => ({}),
	clickOptions: () => ({}),
})

const displayTitle = computed(() => props.title || getLocaleMessage(props.locale, 'popup_title'))
const t = (key: string) => getLocaleMessage(props.locale, key)

const visible = ref(false)

const show = () => {
	visible.value = true
	props.onOpen?.()
}
const hide = () => {
	visible.value = false
	props.onClose?.()
}

const handleMaskClick = () => {
	if (props.maskClosable) hide()
}

const handleSuccess = (data?: { verifiedAt: number }) => {
	props.onSuccess?.(data)
	if (props.autoClose) setTimeout(hide, props.closeDelay)
}

defineExpose({ show, hide, isVisible: () => visible.value })
</script>

<template>
  <View
    v-if="visible"
    class="popup-captcha"
    role="dialog"
    aria-modal="true"
    :aria-label="displayTitle"
    :style="{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }"
  >
    <View
      class="popup-mask"
      role="button"
      :aria-label="t('popup_close')"
      @tap="handleMaskClick"
    />

    <View class="popup-content">
      <View class="popup-header">
        <Text class="popup-title">{{ displayTitle }}</Text>
        <View
          v-if="showClose"
          class="popup-close"
          role="button"
          :aria-label="t('popup_close')"
          @tap="hide"
        >
          <Text>×</Text>
        </View>
      </View>

      <View class="popup-body">
        <SliderCaptcha
          v-if="type === 'slider'"
          v-bind="sliderOptions"
          :backend="backend"
          :locale="locale"
          :on-success="handleSuccess"
          :on-fail="onFail"
          :on-refresh="onRefresh"
        />
        <ClickCaptcha
          v-else
          v-bind="clickOptions"
          :backend="backend"
          :locale="locale"
          :on-success="handleSuccess"
          :on-fail="onFail"
          :on-refresh="onRefresh"
        />
      </View>
    </View>
  </View>
</template>
