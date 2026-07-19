<script setup lang="ts">
import { ref } from 'vue'
import ClickCaptcha from './click-captcha.vue'
import SliderCaptcha from './slider-captcha.vue'
import '../styles/captcha.scss'

const props = defineProps({
	type: { type: String as () => 'slider' | 'click', default: 'slider' },
	title: { type: String, default: '安全验证' },
	maskClosable: { type: Boolean, default: true },
	showClose: { type: Boolean, default: true },
	autoClose: { type: Boolean, default: true },
	closeDelay: { type: Number, default: 500 },
	sliderOptions: { type: Object, default: () => ({}) },
	clickOptions: { type: Object, default: () => ({}) },
	backend: { type: Object, required: true },
	onSuccess: { type: Function, default: undefined },
	onFail: { type: Function, default: undefined },
	onOpen: { type: Function, default: undefined },
	onClose: { type: Function, default: undefined },
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
  <view
    v-if="visible"
    class="popup-captcha"
    :style="{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }"
  >
    <view
      class="popup-mask"
      :style="{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
      }"
      @tap="handleMaskClick"
    />

    <view
      class="popup-content"
      :style="{
        position: 'relative', zIndex: 1, background: '#fff',
        borderRadius: '24rpx', overflow: 'hidden',
        boxShadow: '0 8rpx 32rpx rgba(0, 0, 0, 0.2)', maxWidth: '90vw',
      }"
    >
      <view
        class="popup-header"
        :style="{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24rpx 32rpx', borderBottom: '1rpx solid #eee',
        }"
      >
        <text :style="{ fontSize: '32rpx', fontWeight: '600', color: '#333' }">{{ title }}</text>
        <view
          v-if="showClose"
          class="popup-close"
          :style="{
            width: '48rpx', height: '48rpx',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }"
          @tap="hide"
        >
          <text :style="{ fontSize: '40rpx', color: '#999', lineHeight: 1 }">×</text>
        </view>
      </view>

      <view class="popup-body" :style="{ padding: '32rpx' }">
        <slider-captcha
          v-if="type === 'slider'"
          v-bind="sliderOptions"
          :backend="backend"
          :on-success="handleSuccess"
          :on-fail="onFail"
          :on-refresh="undefined"
        />
        <click-captcha
          v-else
          v-bind="clickOptions"
          :backend="backend"
          :on-success="handleSuccess"
          :on-fail="onFail"
          :on-refresh="undefined"
        />
      </view>
    </view>
  </view>
</template>
