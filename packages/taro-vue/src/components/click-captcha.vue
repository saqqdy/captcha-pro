<script setup lang="ts">
import { Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useClickCaptcha } from '../composables/useClickCaptcha'
import type { ClickCaptchaProps } from '@captcha-pro/mp-shared'
import { DEFAULT_CLICK_COUNT } from '@captcha-pro/mp-shared'
import '../styles/captcha.scss'

const props = withDefaults(defineProps<ClickCaptchaProps>(), {
	width: 650,
	height: 380,
	showRefresh: true,
})

const {
	bgImage,
	status,
	loading,
	errorMsg,
	clickPoints,
	clickTexts,
	clickCharImages,
	setClickTexts,
	setClickCharImages,
	refresh,
	addClickPoint,
	verify,
	rpxToPx,
	widthPx,
	heightPx,
} = useClickCaptcha(props.backend, {
	width: props.width,
	height: props.height,
	onSuccess: props.onSuccess,
	onFail: props.onFail,
	onRefresh: props.onRefresh,
	onError: props.onError,
})

const handleClick = (e: any) => {
	if (status.value || loading.value) return
	const maxClicks = clickTexts.value.length || DEFAULT_CLICK_COUNT
	if (clickPoints.value.length >= maxClicks) return

	const touch = e.touches?.[0] || e.detail
	if (!touch) return

	const query = Taro.createSelectorQuery()
	query.select('.captcha-area').boundingClientRect((rect: any) => {
		if (!rect) return
		const x = touch.clientX - rect.left
		const y = touch.clientY - rect.top
		addClickPoint({ x, y })
		if (clickPoints.value.length >= maxClicks) {
			setTimeout(verify, 200)
		}
	}).exec()
}

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
      @click="handleClick"
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
        <Text>{{ errorMsg || '加载中...' }}</Text>
      </View>

      <View
        v-for="(marker, idx) in clickPoints"
        :key="idx"
        class="click-marker"
        :style="{ left: `${marker.x}px`, top: `${marker.y}px` }"
      >
        <Text class="marker-text">{{ idx + 1 }}</Text>
      </View>

      <View v-if="showRefresh && !loading" class="refresh-btn" @click.stop="refresh">
        <Text class="refresh-icon">⟳</Text>
      </View>

      <View v-if="status" class="status-overlay" :class="status">
        <View class="status-icon"><Text>{{ status === 'success' ? '✓' : '✕' }}</Text></View>
        <Text class="status-text">{{ status === 'success' ? '验证成功' : '验证失败' }}</Text>
      </View>
    </View>

    <View class="prompt-bar" :style="{ width: `${widthPx}px` }">
      <Text class="prompt-text">请依次点击：</Text>
      <View class="prompt-chars">
        <template v-if="clickCharImages.length > 0">
          <View v-for="(img, i) in clickCharImages" :key="`img${i}`" class="char-item">
            <Image :src="img" class="char-img" mode="aspectFit" />
          </View>
        </template>
        <template v-else>
          <View v-for="(char, i) in clickTexts" :key="`txt${i}`" class="char-item">
            <Text class="char-text">{{ char }}</Text>
          </View>
        </template>
      </View>
    </View>
  </View>
</template>
