<script setup lang="ts">
import { ref } from 'vue'
import { Text, View } from '@tarojs/components'
import type { PopupCaptchaProps } from '@captcha-pro/mp-shared'
import ClickCaptcha from './click-captcha.vue'
import SliderCaptcha from './slider-captcha.vue'
import '../styles/captcha.scss'

const props = withDefaults(defineProps<PopupCaptchaProps>(), {
	type: 'slider',
	title: '安全验证',
	maskClosable: true,
	showClose: true,
	autoClose: true,
	closeDelay: 500,
	sliderOptions: () => ({}),
	clickOptions: () => ({}),
})

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
    :style="{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }"
  >
    <View
      class="popup-mask"
      :style="{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
      }"
      @tap="handleMaskClick"
    />

    <View
      class="popup-content"
      :style="{
        position: 'relative', zIndex: 1, background: '#fff',
        borderRadius: '24rpx', overflow: 'hidden',
        boxShadow: '0 8rpx 32rpx rgba(0, 0, 0, 0.2)', maxWidth: '90vw',
      }"
    >
      <View
        class="popup-header"
        :style="{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24rpx 32rpx', borderBottom: '1rpx solid #eee',
        }"
      >
        <Text :style="{ fontSize: '32rpx', fontWeight: '600', color: '#333' }">{{ title }}</Text>
        <View
          v-if="showClose"
          class="popup-close"
          :style="{
            width: '48rpx', height: '48rpx',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }"
          @tap="hide"
        >
          <Text :style="{ fontSize: '40rpx', color: '#999', lineHeight: 1 }">×</Text>
        </View>
      </View>

      <View class="popup-body" :style="{ padding: '32rpx' }">
        <SliderCaptcha
          v-if="type === 'slider'"
          v-bind="sliderOptions"
          :backend="backend"
          :on-success="handleSuccess"
          :on-fail="onFail"
          :on-refresh="onRefresh"
        />
        <ClickCaptcha
          v-else
          v-bind="clickOptions"
          :backend="backend"
          :on-success="handleSuccess"
          :on-fail="onFail"
          :on-refresh="onRefresh"
        />
      </View>
    </View>
  </View>
</template>
