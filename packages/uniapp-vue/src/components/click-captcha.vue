<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import { useClickCaptcha } from '../composables/useClickCaptcha'
import { DEFAULT_CLICK_COUNT } from '@captcha-pro/mp-shared'
import '../styles/captcha.scss'

const props = defineProps({
	width: { type: Number, default: 650 },
	height: { type: Number, default: 380 },
	showRefresh: { type: Boolean, default: true },
	backend: { type: Object, required: true },
	onSuccess: { type: Function, default: undefined },
	onFail: { type: Function, default: undefined },
	onRefresh: { type: Function, default: undefined },
	onError: { type: Function, default: undefined },
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
} = useClickCaptcha(props.backend as any, {
	width: props.width,
	height: props.height,
	onSuccess: props.onSuccess,
	onFail: props.onFail,
	onRefresh: props.onRefresh,
	onError: props.onError,
})

// Capture component instance during setup — getCurrentInstance() returns null inside event handlers
const instance = getCurrentInstance()

const handleClick = (e: any) => {
	if (status.value || loading.value) return
	const maxClicks = clickTexts.value.length || DEFAULT_CLICK_COUNT
	if (clickPoints.value.length >= maxClicks) return

	// UniApp tap event: e.detail has { x, y } (page-relative coords)
	// Web DOM events have { clientX, clientY } — handle both
	const touchX = e.detail.x ?? e.detail.clientX
	const touchY = e.detail.y ?? e.detail.clientY
	if (touchX == null || touchY == null) return

	const query = uni.createSelectorQuery().in(instance)
	query.select('.captcha-area').boundingClientRect((rect: any) => {
		if (!rect) return
		const x = touchX - rect.left
		const y = touchY - rect.top
		addClickPoint({ x, y })
		if (clickPoints.value.length >= maxClicks) {
			setTimeout(verify, 200)
		}
	}).exec()
}

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
      @tap="handleClick"
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

      <view
        v-for="(marker, idx) in clickPoints"
        :key="idx"
        class="click-marker"
        :style="{ left: `${marker.x}px`, top: `${marker.y}px` }"
      >
        <text class="marker-text">{{ idx + 1 }}</text>
      </view>

      <view v-if="showRefresh && !loading" class="refresh-btn" @tap.stop="refresh">
        <text class="refresh-icon">⟳</text>
      </view>

      <view v-if="status" class="status-overlay" :class="status">
        <view class="status-icon"><text>{{ status === 'success' ? '✓' : '✕' }}</text></view>
        <text class="status-text">{{ status === 'success' ? '验证成功' : '验证失败' }}</text>
      </view>
    </view>

    <view class="prompt-bar" :style="{ width: `${widthPx}px` }">
      <text class="prompt-text">请依次点击：</text>
      <view class="prompt-chars">
        <template v-if="clickCharImages.length > 0">
          <view v-for="(img, i) in clickCharImages" :key="`img${i}`" class="char-item">
            <image :src="img" class="char-img" mode="aspectFit" />
          </view>
        </template>
        <template v-else>
          <view v-for="(char, i) in clickTexts" :key="`txt${i}`" class="char-item">
            <text class="char-text">{{ char }}</text>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>
