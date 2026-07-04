<script>
export default {
  name: 'SliderCaptcha',
  props: {
    width: { type: Number, default: 300 },
    height: { type: Number, default: 170 },
    sliderWidth: { type: Number, default: 42 },
    sliderHeight: { type: Number, default: 42 },
    showRefresh: { type: Boolean, default: true },
    backend: { type: Object, required: true },
  },
  data() {
    return {
      bgImage: '',
      sliderImage: '',
      sliderY: 0,
      sliderX: 0,
      captchaId: '',
      status: '',
      loading: true,
      errorMsg: '',
      startX: 0,
      isDragging: false,
    }
  },
  mounted() { this.loadCaptcha() },
  methods: {
    async loadCaptcha() {
      this.loading = true; this.errorMsg = ''; this.status = ''; this.sliderX = 0
      try {
        const res = await this._fetch('getCaptcha', { type: 'slider', width: this.width, height: this.height, sliderWidth: this.sliderWidth, sliderHeight: this.sliderHeight })
        if (!res.success || !res.data) throw new Error(res.message || 'Failed to get captcha')
        this.bgImage = res.data.bgImage; this.sliderImage = res.data.sliderImage || ''; this.sliderY = res.data.sliderY || 0; this.captchaId = res.data.captchaId
      } catch (err) { this.errorMsg = err.message || 'Network error'; this.$emit('error', err) } finally { this.loading = false }
    },
    onTouchStart(e) { if (this.status || this.loading) return; this.isDragging = true; this.startX = e.touches[0].clientX - this.sliderX },
    onTouchMove(e) { if (!this.isDragging) return; this.sliderX = Math.max(0, Math.min(e.touches[0].clientX - this.startX, this.width - this.sliderWidth)) },
    async onTouchEnd() { if (!this.isDragging) return; this.isDragging = false; await this.verify() },
    async verify() {
      if (this.status || this.loading || !this.captchaId) return; this.loading = true
      try {
        const res = await this._fetch('verify', { captchaId: this.captchaId, type: 'slider', target: [this.sliderX] })
        if (res.success) { this.status = 'success'; this.$emit('success', res.data) }
        else { this.status = 'fail'; this.$emit('fail'); setTimeout(() => this.loadCaptcha(), 800) }
      } catch (err) { this.$emit('error', err); this.status = 'fail'; setTimeout(() => this.loadCaptcha(), 800) } finally { this.loading = false }
    },
    handleRefresh() { this.loadCaptcha(); this.$emit('refresh') },
    _fetch(apiKey, data) {
      const config = this.backend; const fn = config[apiKey]
      if (typeof fn === 'function') return Promise.resolve(fn(data))
      const isGet = apiKey === 'getCaptcha'
      const qs = isGet ? '?' + Object.entries(data).filter(([, v]) => v != null).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&') : ''
      return new Promise((resolve, reject) => {
        uni.request({ url: `${fn}${qs}`, method: isGet ? 'GET' : 'POST', data: isGet ? undefined : data, header: { 'Content-Type': 'application/json', ...(config.headers || {}) }, timeout: config.timeout || 10000, success: r => resolve(r.data), fail: reject })
      })
    },
  },
}
</script>

<template>
  <view class="captcha-container" :style="{ width: `${width}px` }">
    <view class="captcha-area" :style="{ width: `${width}px`, height: `${height}px`, borderRadius: '8rpx' }">
      <image v-if="bgImage" :src="bgImage" mode="aspectFill" class="bg-image" :style="{ width: `${width}px`, height: `${height}px` }" />
      <view v-else class="captcha-loading" :style="{ width: `${width}px`, height: `${height}px` }"><text>{{ errorMsg || '加载中...' }}</text></view>
      <image v-if="sliderImage && !loading" :src="sliderImage" class="slider-block" :style="{ width: `${sliderWidth}px`, height: `${sliderHeight}px`, top: `${sliderY}px`, left: `${sliderX}px` }" />
      <view v-if="showRefresh && !loading" class="refresh-btn" @tap="handleRefresh"><text class="refresh-icon">⟳</text></view>
      <view v-if="status" class="status-overlay" :class="status">
        <view class="status-icon"><text>{{ status === 'success' ? '✓' : '✕' }}</text></view>
        <text class="status-text">{{ status === 'success' ? '验证成功' : '验证失败' }}</text>
      </view>
    </view>
    <view class="slider-bar" :style="{ width: `${width}px`, height: '40px' }">
      <view class="slider-progress" :style="{ width: `${sliderX + sliderWidth}px` }" />
      <view class="slider-hint"><text>→ 按住滑块，拖动完成验证</text></view>
      <view class="slider-thumb" :style="{ left: `${sliderX}px` }" @touchstart="onTouchStart" @touchmove.stop.prevent="onTouchMove" @touchend="onTouchEnd">
        <text class="slider-arrow">→</text>
      </view>
    </view>
  </view>
</template>

<style scoped>
.captcha-container { position: relative; display: flex; flex-direction: column; align-items: center; }
.captcha-area { position: relative; overflow: hidden; }
.bg-image { display: block; }
.captcha-loading { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-size: 28rpx; }
.slider-block { position: absolute; z-index: 5; }
.refresh-btn { position: absolute; top: 16rpx; right: 16rpx; width: 56rpx; height: 56rpx; background: rgba(255,255,255,0.9); border-radius: 8rpx; display: flex; align-items: center; justify-content: center; z-index: 10; border: none; }
.refresh-icon { color: #666; font-size: 28rpx; font-weight: bold; }
.status-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16rpx; background: rgba(255,255,255,0.75); z-index: 30; animation: fadeIn .2s ease; }
.status-icon { width: 64rpx; height: 64rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36rpx; color: #fff; }
.status-overlay.success .status-icon { background: rgba(82,196,26,0.85); }
.status-overlay.fail .status-icon { background: rgba(255,77,79,0.85); }
.status-text { font-size: 26rpx; font-weight: 500; letter-spacing: 1rpx; color: #333; }
.status-overlay.success .status-text { color: #389e0d; }
.status-overlay.fail .status-text { color: #cf1322; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
.slider-bar { position: relative; background: #f7f9fa; border-radius: 8rpx; margin-top: 10rpx; user-select: none; }
.slider-progress { position: absolute; left: 0; top: 0; height: 100%; border: 2rpx solid #f7f9fa; background: #f7f9fa; pointer-events: none; z-index: 1; border-radius: 8rpx; transition: border-color .2s ease, background-color .2s ease; }
.slider-hint { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); pointer-events: none; z-index: 1; white-space: nowrap; }
.slider-hint text { font-size: 28rpx; color: #999; }
.slider-thumb { position: absolute; top: 2rpx; width: 36px; height: 36px; background: #fff; border: 2rpx solid #e1e4e8; border-radius: 8rpx; display: flex; align-items: center; justify-content: center; transition: background .2s ease; z-index: 2; }
.slider-thumb:active { background: #f5f5f5; }
.slider-arrow { color: #1991fa; font-size: 36rpx; font-weight: bold; }
</style>
