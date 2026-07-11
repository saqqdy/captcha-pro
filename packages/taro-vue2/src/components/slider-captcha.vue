<script>
import {
	createInitialCaptchaState,
	loadCaptcha,
	verifySlider,
	resetCaptcha,
} from '@captcha-pro/mp-shared'
import { fetchCaptcha, verifyCaptcha } from '../request'
import {
	DEFAULT_WIDTH,
	DEFAULT_HEIGHT,
	DEFAULT_SLIDER_WIDTH,
	DEFAULT_SLIDER_HEIGHT,
} from '@captcha-pro/mp-shared'
import Taro from '@tarojs/taro'

export default {
	name: 'SliderCaptcha',

	props: {
		width: { type: Number, default: DEFAULT_WIDTH },
		height: { type: Number, default: DEFAULT_HEIGHT },
		sliderWidth: { type: Number, default: DEFAULT_SLIDER_WIDTH },
		sliderHeight: { type: Number, default: DEFAULT_SLIDER_HEIGHT },
		showRefresh: { type: Boolean, default: true },
		backend: { type: Object, required: true },
	},

	data() {
		return {
			...createInitialCaptchaState(),
			dragging: false,
			touchStartX: 0,
			touchStartSliderX: 0,
		}
	},

	computed: {
		rpxToPx() {
			return rpx => Math.floor((rpx * Taro.getWindowInfo().screenWidth) / 750)
		},
		widthPx() {
			return this.rpxToPx(this.width)
		},
		heightPx() {
			return this.rpxToPx(this.height)
		},
		sliderWidthPx() {
			return this.rpxToPx(this.sliderWidth)
		},
		sliderHeightPx() {
			return this.rpxToPx(this.sliderHeight)
		},
		sliderBarHeight() {
			return this.rpxToPx(80)
		},
		maxX() {
			return this.widthPx - this.sliderWidthPx
		},
	},

	mounted() {
		this.load()
	},

	methods: {
		async load() {
			const state = this._gs()
			await loadCaptcha(
				state,
				this.backend,
				{
					type: 'slider',
					width: this.widthPx,
					height: this.heightPx,
					sliderWidth: this.sliderWidthPx,
					sliderHeight: this.sliderHeightPx,
				},
				fetchCaptcha,
				err => this.$emit('error', err)
			)
			this._as(state)
		},
		async verify() {
			const state = this._gs()
			await verifySlider(
				state,
				this.backend,
				verifyCaptcha,
				d => this.$emit('success', d),
				() => this.$emit('fail'),
				() => {
					this.load()
					this.$emit('refresh')
				},
				e => this.$emit('error', e)
			)
			this._as(state)
		},
		handleTouchStart(e) {
			if (this.status || this.loading) return
			const touch = e.touches[0]
			if (!touch) return
			this.dragging = true
			this.touchStartX = touch.clientX
			this.touchStartSliderX = this.sliderX
		},
		handleTouchMove(e) {
			if (!this.dragging || this.status || this.loading) return
			const touch = e.touches[0]
			if (!touch) return
			const dx = touch.clientX - this.touchStartX
			let newX = this.touchStartSliderX + dx
			newX = Math.max(0, Math.min(newX, this.maxX))
			this.sliderX = newX
		},
		handleTouchEnd() {
			if (!this.dragging) return
			this.dragging = false
			if (this.status || this.loading) return
			this.verify()
		},
		handleRefresh() {
			const s = this._gs()
			resetCaptcha(s)
			this._as(s)
			this.load()
			this.$emit('refresh')
		},
		_gs() {
			return {
				bgImage: this.bgImage,
				sliderImage: this.sliderImage,
				sliderY: this.sliderY,
				sliderX: this.sliderX,
				captchaId: this.captchaId,
				status: this.status,
				loading: this.loading,
				errorMsg: this.errorMsg,
			}
		},
		_as(s) {
			this.bgImage = s.bgImage
			this.sliderImage = s.sliderImage
			this.sliderY = s.sliderY
			this.sliderX = s.sliderX
			this.captchaId = s.captchaId
			this.status = s.status
			this.loading = s.loading
			this.errorMsg = s.errorMsg
		},
	},
}
</script>

<template>
	<View class="captcha-container">
		<View
			class="captcha-area"
			:style="{ width: `${widthPx}px`, height: `${heightPx}px`, borderRadius: '16rpx' }"
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
				><Text>{{ errorMsg || '加载中...' }}</Text></View
			>
			<Image
				v-if="sliderImage && !loading"
				:src="sliderImage"
				class="slider-block"
				:style="{
					width: `${sliderWidthPx}px`,
					height: `${sliderHeightPx}px`,
					top: `${sliderY}px`,
					left: `${sliderX}px`,
				}"
			/>
			<View v-if="showRefresh && !loading" class="refresh-btn" @tap="handleRefresh"
				><Text class="refresh-icon">⟳</Text></View
			>
			<View v-if="status" class="status-overlay" :class="status">
				<View class="status-icon"
					><Text>{{ status === 'success' ? '✓' : '✕' }}</Text></View
				>
				<Text class="status-text">{{
					status === 'success' ? '验证成功' : '验证失败'
				}}</Text>
			</View>
		</View>
		<View class="slider-bar" :style="{ width: `${widthPx}px`, height: `${sliderBarHeight}px` }">
			<View class="slider-track" :style="{ width: `${sliderX + sliderWidthPx / 2}px` }" />
			<View class="slider-hint"><Text>→ 按住滑块，拖动完成验证</Text></View>
			<View
				class="slider-thumb"
				:style="{
					width: `${sliderWidthPx}px`,
					height: `${sliderBarHeight}px`,
					left: `${sliderX}px`,
				}"
				@touchstart="handleTouchStart"
				@touchmove.stop.prevent="handleTouchMove"
				@touchend="handleTouchEnd"
			>
				<Text class="slider-arrow">→</Text>
			</View>
		</View>
	</View>
</template>

<style>
.captcha-container {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.captcha-area {
	position: relative;
	overflow: hidden;
}
.bg-image {
	display: block;
}
.captcha-loading {
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	font-size: 28rpx;
}
.slider-block {
	position: absolute;
	z-index: 5;
}
.refresh-btn {
	position: absolute;
	top: 16rpx;
	right: 16rpx;
	width: 56rpx;
	height: 56rpx;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
	border: none;
}
.refresh-icon {
	color: #666;
	font-size: 28rpx;
	font-weight: bold;
}
.status-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	background: rgba(255, 255, 255, 0.75);
	z-index: 30;
	animation: fadeIn 0.2s ease;
}
.status-icon {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36rpx;
	color: #fff;
}
.status-overlay.success .status-icon {
	background: rgba(82, 196, 26, 0.85);
}
.status-overlay.fail .status-icon {
	background: rgba(255, 77, 79, 0.85);
}
.status-text {
	font-size: 26rpx;
	font-weight: 500;
	color: #333;
}
.status-overlay.success .status-text {
	color: #389e0d;
}
.status-overlay.fail .status-text {
	color: #cf1322;
}
@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}
.slider-bar {
	position: relative;
	background: #f7f9fa;
	border-radius: 8rpx;
	margin-top: 10rpx;
	user-select: none;
}
.slider-track {
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	pointer-events: none;
	z-index: 1;
	border-radius: 8rpx;
	background: #d1e9ff;
}
.slider-hint {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	pointer-events: none;
	z-index: 1;
	white-space: nowrap;
}
.slider-hint text {
	font-size: 28rpx;
	color: #999;
}
.slider-thumb {
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	border: 2rpx solid #e1e4e8;
	border-radius: 8rpx;
	box-sizing: border-box;
	position: absolute;
	z-index: 3;
}
.slider-arrow {
	color: #1991fa;
	font-size: 36rpx;
	font-weight: bold;
}
</style>
