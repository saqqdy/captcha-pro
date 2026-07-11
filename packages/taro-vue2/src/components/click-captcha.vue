<script>
import { createInitialCaptchaState, verifyClick, resetCaptcha } from '@captcha-pro/mp-shared'
import { fetchCaptcha, verifyCaptcha } from '../request'
import { DEFAULT_WIDTH, DEFAULT_HEIGHT, DEFAULT_CLICK_COUNT } from '@captcha-pro/mp-shared'
import Taro from '@tarojs/taro'

export default {
	name: 'ClickCaptcha',

	props: {
		width: { type: Number, default: DEFAULT_WIDTH },
		height: { type: Number, default: DEFAULT_HEIGHT },
		showRefresh: { type: Boolean, default: true },
		backend: { type: Object, required: true },
	},

	data() {
		return {
			...createInitialCaptchaState(),
			clickTexts: [],
			clickCharImages: [],
			clickMarkers: [],
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
	},

	mounted() {
		this.load()
	},

	methods: {
		async load() {
			const state = this._gs()
			this.clickMarkers = []
			this.clickTexts = []
			this.clickCharImages = []

			state.loading = true
			state.errorMsg = ''
			state.status = ''
			state.sliderX = 0

			try {
				const res = await fetchCaptcha(this.backend, {
					type: 'click',
					width: this.widthPx,
					height: this.heightPx,
				})
				if (!res.success || !res.data)
					throw new Error(res.message || 'Failed to get captcha')
				state.captchaId = res.data.captchaId
				state.bgImage = res.data.bgImage
				state.sliderImage = res.data.sliderImage ?? ''
				state.sliderY = res.data.sliderY ?? 0
				this.clickTexts = res.data.clickTexts ?? []
				this.clickCharImages = res.data.clickCharImages ?? []
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err))
				state.errorMsg = error.message
				this.$emit('error', error)
			} finally {
				state.loading = false
			}

			this._as(state)
		},
		onAreaTap(e) {
			if (this.status || this.loading) return
			const max = this.clickTexts.length || DEFAULT_CLICK_COUNT
			if (this.clickMarkers.length >= max) return
			// Capture touch coordinates synchronously — mini-program event objects
			// may be recycled before the async boundingClientRect callback runs.
			const touch = (e.touches && e.touches[0]) || e.detail
			if (!touch) return
			const clientX = touch.clientX ?? touch.x ?? 0
			const clientY = touch.clientY ?? touch.y ?? 0
			// Note: no `.in(this)` — in Taro 3 + Vue 2 `this` is the Vue instance,
			// not the Taro component instance, which makes the query silently fail.
			const query = Taro.createSelectorQuery()
			query
				.select('.captcha-area')
				.boundingClientRect(rect => {
					if (!rect) return
					const x = clientX - rect.left
					const y = clientY - rect.top
					const nm = [...this.clickMarkers, { x, y, index: this.clickMarkers.length + 1 }]
					this.clickMarkers = nm
					if (nm.length >= max) setTimeout(() => this.verify(), 200)
				})
				.exec()
		},
		async verify() {
			const pts = this.clickMarkers.map(m => ({ x: m.x, y: m.y }))
			const state = this._gs()
			await verifyClick(
				state,
				this.backend,
				pts,
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
		handleRefresh() {
			const s = this._gs()
			resetCaptcha(s)
			this._as(s)
			this.clickMarkers = []
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
			@tap="onAreaTap"
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
			<View
				v-for="(m, i) in clickMarkers"
				:key="i"
				class="click-marker"
				:style="{ left: `${m.x}px`, top: `${m.y}px` }"
				><Text class="marker-text">{{ m.index }}</Text></View
			>
			<View v-if="showRefresh && !loading" class="refresh-btn" @tap.stop="handleRefresh"
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
		<View class="prompt-bar" :style="{ width: `${widthPx}px` }">
			<Text class="prompt-text">请依次点击：</Text>
			<View class="prompt-chars">
				<template v-if="clickCharImages.length > 0">
					<View v-for="(img, i) in clickCharImages" :key="`img${i}`" class="char-item"
						><Image :src="img" class="char-img" mode="aspectFit"
					/></View>
				</template>
				<template v-else>
					<View v-for="(t, i) in clickTexts" :key="`txt${i}`" class="char-item"
						><Text class="char-text">{{ t }}</Text></View
					>
				</template>
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
.click-marker {
	position: absolute;
	width: 48rpx;
	height: 48rpx;
	background: #1991fa;
	border: 3rpx solid #fff;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transform: translate(-50%, -50%);
	z-index: 5;
}
.marker-text {
	font-size: 32rpx;
	color: #fff;
	font-weight: bold;
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
.prompt-bar {
	display: flex;
	align-items: center;
	padding: 20rpx 24rpx;
	background: #f7f9fa;
	border-radius: 16rpx;
	margin-top: 24rpx;
	border: 2rpx solid #e8e8e8;
	box-sizing: border-box;
}
.prompt-text {
	font-size: 28rpx;
	color: #666;
	white-space: nowrap;
	margin-right: 16rpx;
}
.prompt-chars {
	display: flex;
	gap: 12rpx;
}
.char-item {
	width: 56rpx;
	height: 56rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.3);
}
.char-text {
	font-size: 32rpx;
	color: #fff;
	font-weight: 500;
}
.char-img {
	width: 100%;
	height: 100%;
}
</style>
