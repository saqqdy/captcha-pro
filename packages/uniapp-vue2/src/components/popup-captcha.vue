<script>
import SliderCaptcha from './slider-captcha.vue'
import ClickCaptcha from './click-captcha.vue'

export default {
	name: 'PopupCaptcha',

	components: { SliderCaptcha, ClickCaptcha },

	props: {
		type: { type: String, default: 'slider' },
		title: { type: String, default: '请完成安全验证' },
		maskClosable: { type: Boolean, default: true },
		showClose: { type: Boolean, default: true },
		autoClose: { type: Boolean, default: true },
		closeDelay: { type: Number, default: 500 },
		sliderOptions: { type: Object, default: () => ({}) },
		clickOptions: { type: Object, default: () => ({}) },
		backend: { type: Object, required: true },
	},

	data() {
		return { visible: false }
	},

	methods: {
		show() {
			this.visible = true
			this.$emit('open')
		},
		hide() {
			this.visible = false
			this.$emit('close')
		},
		isVisible() {
			return this.visible
		},
		onMaskTap() {
			if (this.maskClosable) this.hide()
		},
		onSuccess(data) {
			this.$emit('success', data)
			if (this.autoClose) setTimeout(() => this.hide(), this.closeDelay)
		},
		onFail() {
			this.$emit('fail')
		},
		onRefresh() {
			this.$emit('refresh')
		},
	},
}
</script>

<template>
	<view v-if="visible" class="popup-captcha">
		<view class="popup-mask" @tap="onMaskTap" />
		<view class="popup-content">
			<view class="popup-header">
				<text class="popup-title">{{ title }}</text>
				<view v-if="showClose" class="popup-close" @tap="hide"><text>×</text></view>
			</view>
			<view class="popup-body">
				<slider-captcha
					v-if="type === 'slider'"
					v-bind="sliderOptions"
					:backend="backend"
					@success="onSuccess"
					@fail="onFail"
					@refresh="onRefresh"
				/>
				<click-captcha
					v-else
					v-bind="clickOptions"
					:backend="backend"
					@success="onSuccess"
					@fail="onFail"
					@refresh="onRefresh"
				/>
			</view>
		</view>
	</view>
</template>

<style>
.popup-captcha {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
}
.popup-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
}
.popup-content {
	position: relative;
	z-index: 1;
	background: #fff;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
	max-width: 90vw;
}
.popup-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 32rpx;
	border-bottom: 1rpx solid #eee;
}
.popup-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}
.popup-close {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.popup-close text {
	font-size: 40rpx;
	color: #999;
	line-height: 1;
}
.popup-body {
	padding: 32rpx;
}
</style>
