<script setup lang="ts">
import { Image, MovableArea, MovableView, Text, View } from '@tarojs/components'
import { useSliderCaptcha } from '../composables/useSliderCaptcha'
import { getLocaleMessage, DEFAULT_LOCALE, type SliderCaptchaProps } from '@captcha-pro/mp-shared'
import '../styles/captcha.scss'

const props = withDefaults(defineProps<SliderCaptchaProps>(), {
	width: 650,
	height: 380,
	sliderWidth: 80,
	sliderHeight: 80,
	showRefresh: true,
	locale: DEFAULT_LOCALE,
})

const t = (key: string) => getLocaleMessage(props.locale, key)

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
} = useSliderCaptcha(props.backend, {
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
  <View class="captcha-container">
    <View
      class="captcha-area"
      :style="{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        borderRadius: '16rpx',
      }"
      role="region"
      :aria-label="t('slider_hint')"
    >
      <Image
        v-if="bgImage"
        :src="bgImage"
        mode="aspectFill"
        class="bg-image"
        :style="{ width: `${widthPx}px`, height: `${heightPx}px` }"
      />
      <View
        v-else
        class="captcha-loading"
        :style="{ width: `${widthPx}px`, height: `${heightPx}px` }"
      >
        <Text>{{ errorMsg || t('loading') }}</Text>
      </View>

      <Image
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

      <View v-if="showRefresh && !loading" class="refresh-btn" role="button" :aria-label="t('refresh')" @tap="refresh">
        <Text class="refresh-icon">⟳</Text>
      </View>

      <View v-if="status" class="status-overlay" :class="status" aria-live="polite" aria-atomic="true">
        <View class="status-icon"><Text>{{ status === 'success' ? '✓' : '✕' }}</Text></View>
        <Text class="status-text">{{ status === 'success' ? t('slider_success') : t('slider_fail') }}</Text>
      </View>
    </View>

    <View class="slider-bar" :style="{ width: `${widthPx}px`, height: `${sliderBarHeight}px` }">
      <View class="slider-track" />
      <View class="slider-hint"><Text>{{ t('slider_hint') }}</Text></View>
      <MovableArea
        class="slider-area"
        :style="{ width: `${widthPx}px`, height: `${sliderBarHeight}px` }"
      >
        <MovableView
          class="slider-thumb"
          direction="horizontal"
          :x="sliderX"
          :damping="40"
          role="slider"
          :aria-label="t('slider_hint')"
          :aria-valuemin="0"
          :aria-valuemax="widthPx - actualSliderWidth"
          :aria-valuenow="sliderX"
          @change="(e: any) => handleSliderChange(e.detail.x)"
          @touchend="handleSliderEnd"
          :style="{ width: `${actualSliderWidth}px`, height: `${sliderBarHeight}px` }"
        >
          <Text class="slider-arrow">→</Text>
        </MovableView>
      </MovableArea>
    </View>
  </View>
</template>
