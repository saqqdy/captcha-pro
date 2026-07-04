<script>
export default {
  name: 'ClickCaptcha',
  props: {
    width: { type: Number, default: 300 },
    height: { type: Number, default: 170 },
    showRefresh: { type: Boolean, default: true },
    backend: { type: Object, required: true },
  },
  data() {
    return {
      bgImage: '',
      captchaId: '',
      clickTexts: [],
      clickCharImages: [],
      clickMarkers: [],
      status: '',
      loading: true,
      errorMsg: '',
    }
  },
  mounted() { this.loadCaptcha() },
  methods: {
    async loadCaptcha() {
      this.loading = true; this.errorMsg = ''; this.status = ''; this.clickMarkers = []; this.clickTexts = []; this.clickCharImages = []
      try {
        const res = await this._fetch('getCaptcha', { type: 'click', width: this.width, height: this.height })
        if (!res.success || !res.data) throw new Error(res.message || 'Failed to get captcha')
        this.bgImage = res.data.bgImage; this.captchaId = res.data.captchaId
        this.clickTexts = res.data.clickTexts || []; this.clickCharImages = res.data.clickCharImages || []
      } catch (err) { this.errorMsg = err.message || 'Network error'; this.$emit('error', err) } finally { this.loading = false }
    },
    onAreaTap(e) {
      if (this.status || this.loading) return
      if (this.clickMarkers.length >= this.clickTexts.length) return
      const query = uni.createSelectorQuery().in(this)
      query.select('.captcha-area').boundingClientRect((rect) => {
        if (!rect) return
        const touch = e.detail
        const clientX = touch.clientX ?? touch.x ?? 0
        const clientY = touch.clientY ?? touch.y ?? 0
        const x = clientX - rect.left
        const y = clientY - rect.top
        const newMarkers = [...this.clickMarkers, { x, y, index: this.clickMarkers.length + 1 }]
        this.clickMarkers = newMarkers
        if (newMarkers.length >= this.clickTexts.length) setTimeout(() => this.verify(), 200)
      }).exec()
    },
    async verify() {
      if (this.status || this.loading || !this.captchaId) return; this.loading = true
      try {
        const pts = this.clickMarkers.map(m => ({ x: m.x, y: m.y }))
        const res = await this._fetch('verify', { captchaId: this.captchaId, type: 'click', target: pts })
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
    <view class="captcha-area" :style="{ width: `${width}px`, height: `${height}px`, borderRadius: '8rpx' }" @tap="onAreaTap">
      <image v-if="bgImage" :src="bgImage" mode="aspectFill" class="bg-image" :style="{ width: `${width}px`, height: `${height}px` }" />
      <view v-else class="captcha-loading" :style="{ width: `${width}px`, height: `${height}px` }"><text>{{ errorMsg || '加载中...' }}</text></view>
      <view v-for="(m, i) in clickMarkers" :key="i" class="click-marker" :style="{ left: `${m.x}px`, top: `${m.y}px` }"><text class="marker-text">{{ m.index }}</text></view>
      <view v-if="showRefresh && !loading" class="refresh-btn" @tap.stop="handleRefresh"><text class="refresh-icon">⟳</text></view>
      <view v-if="status" class="status-overlay" :class="status">
        <view class="status-icon"><text>{{ status === 'success' ? '✓' : '✕' }}</text></view>
        <text class="status-text">{{ status === 'success' ? '验证成功' : '验证失败' }}</text>
      </view>
    </view>
    <view class="prompt-bar" :style="{ width: `${width}px` }">
      <text class="prompt-text">请依次点击：</text>
      <view class="prompt-chars">
        <template v-if="clickCharImages.length > 0">
          <view v-for="(img, i) in clickCharImages" :key="`img${i}`" class="char-item"><image :src="img" class="char-img" mode="aspectFit" /></view>
        </template>
        <template v-else>
          <view v-for="(t, i) in clickTexts" :key="`txt${i}`" class="char-item"><text class="char-text">{{ t }}</text></view>
        </template>
      </view>
    </view>
  </view>
</template>

<style scoped>
.captcha-container { position: relative; display: flex; flex-direction: column; align-items: center; }
.captcha-area { position: relative; overflow: hidden; }
.bg-image { display: block; }
.captcha-loading { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-size: 28rpx; }
.click-marker { position: absolute; width: 48rpx; height: 48rpx; background: #1991fa; border: 3rpx solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: translate(-50%,-50%); z-index: 5; }
.marker-text { font-size: 32rpx; color: #fff; font-weight: bold; }
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
.prompt-bar { display: flex; align-items: center; padding: 20rpx 24rpx; background: #f7f9fa; border-radius: 16rpx; margin-top: 24rpx; border: 2rpx solid #e8e8e8; box-sizing: border-box; }
.prompt-text { font-size: 28rpx; color: #666; white-space: nowrap; margin-right: 16rpx; }
.prompt-chars { display: flex; gap: 12rpx; }
.char-item { width: 56rpx; height: 56rpx; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8rpx; display: flex; align-items: center; justify-content: center; box-shadow: 0 2rpx 8rpx rgba(102,126,234,0.3); }
.char-text { font-size: 32rpx; color: #fff; font-weight: 500; }
.char-img { width: 100%; height: 100%; }
</style>
