<script setup lang="ts">
import { useSliderCaptcha } from '../composables/useSliderCaptcha'
import '../styles/captcha.scss'

const props = defineProps({
	width: { type: Number, default: 650 },
	height: { type: Number, default: 380 },
	sliderWidth: { type: Number, default: 80 },
	sliderHeight: { type: Number, default: 80 },
	showRefresh: { type: Boolean, default: true },
	backend: { type: Object, required: true },
	onSuccess: { type: Function, default: undefined },
	onFail: { type: Function, default: undefined },
	onRefresh: { type: Function, default: undefined },
	onError: { type: Function, default: undefined },
})

const {
	bgImage,
	sliderImage,
	sliderY,
	sliderX,
	captchaId,
	status,
	loading,
	errorMsg,
	refresh,
	handleSliderChange,
	handleSliderEnd,
	rpxToPx,
	widthPx,
	heightPx,
} = useSliderCaptcha(props.backend as any, {
	width: props.width,
	height: props.height,
	sliderWidth: props.sliderWidth,
	sliderHeight: props.sliderHeight,
	onSuccess: props.onSuccess,
	onFail: props.onFail,
	onRefresh: props.onRefresh,
	onError: props.onError,
})

const actualSliderWidth = rpxToPx(props.sliderWidth)
const sliderBarHeight = rpxToPx(80)

defineExpose({ refresh })
</script>

<template>
  <view class="captcha-container">
    <view
      class="captcha-area"
      :style="{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        borderRadius: '16rpx',
      }"
    >
      <image
        v-if="bgImage"
        :src="bgImage"
        mode="aspectFill"
        class="bg-image"
        :style="{ width: `${widthPx}px`, height: `${heightPx}px` }"
      />
      <view
        v-else
        class="captcha-loading"
        :style="{ width: `${widthPx}px`, height: `${heightPx}px` }"
      >
        <text>{{ errorMsg || '加载中...' }}</text>
      </view>

      <image
        v-if="sliderImage && !loading"
        :src="sliderImage"
        class="slider-block"
        :style="{
          width: `${rpxToPx(sliderWidth)}px`,
          height: `${rpxToPx(sliderHeight)}px`,
          top: `${sliderY}px`,
          left: `${sliderX}px`,
        }"
      />

      <view v-if="showRefresh && !loading" class="refresh-btn" @tap="refresh">
        <text class="refresh-icon">⟳</text>
      </view>

      <view v-if="status" class="status-overlay" :class="status">
        <view class="status-icon"><text>{{ status === 'success' ? '✓' : '✕' }}</text></view>
        <text class="status-text">{{ status === 'success' ? '验证成功' : '验证失败' }}</text>
      </view>
    </view>

    <view class="slider-bar" :style="{ width: `${widthPx}px`, height: `${sliderBarHeight}px` }">
      <view class="slider-track" />
      <view class="slider-hint"><text>→ 按住滑块，拖动完成验证</text></view>
      <movable-area
        class="slider-area"
        :style="{ width: `${widthPx}px`, height: `${sliderBarHeight}px` }"
      >
        <movable-view
          class="slider-thumb"
          direction="horizontal"
          :x="sliderX"
          :damping="40"
          @change="(e: any) => handleSliderChange(e.detail.x)"
          @touchend="handleSliderEnd"
          :style="{ width: `${actualSliderWidth}px`, height: `${sliderBarHeight}px` }"
        >
          <text class="slider-arrow">→</text>
        </movable-view>
      </movable-area>
    </view>
  </view>
</template>
