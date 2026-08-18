<script setup lang="ts">
import { ref } from 'vue'
import { SliderCaptcha, ClickCaptcha } from '@captcha-pro/vue'
import { useLocale } from '../composables/useLocale'

const { currentLocale, t } = useLocale()

const sliderRef = ref()
const clickRef = ref()

const sliderResult = ref('')
const clickResult = ref('')

const onSliderSuccess = () => {
  sliderResult.value = t('验证成功！', 'Verification successful!')
}

const onClickSuccess = () => {
  clickResult.value = t('验证成功！', 'Verification successful!')
}

const resetAll = () => {
  sliderRef.value?.refresh()
  clickRef.value?.refresh()
  sliderResult.value = ''
  clickResult.value = ''
}
</script>

<template>
  <section class="demo-section">
    <h2>♿ {{ currentLocale === 'zh-CN' ? '无障碍支持演示' : 'Accessibility Demo' }}</h2>

    <div class="info-box">
      <h3>{{ currentLocale === 'zh-CN' ? 'WCAG 2.2 Level AA 合规' : 'WCAG 2.2 Level AA Compliance' }}</h3>
      <ul>
        <li><strong>{{ currentLocale === 'zh-CN' ? '弹窗焦点陷阱' : 'Popup Focus Trap' }} <span class="new-badge">v2.3.0</span>:</strong>
          <ul>
            <li>{{ currentLocale === 'zh-CN' ? '打开弹窗时焦点自动移入关闭按钮' : 'Focus moves to close button when popup opens' }}</li>
            <li><code>Tab</code>/<code>Shift+Tab</code> - {{ currentLocale === 'zh-CN' ? '焦点在弹窗内循环，不会逃逸到页面' : 'Focus cycles within the popup, never escapes to the page' }}</li>
            <li>{{ currentLocale === 'zh-CN' ? '关闭后焦点返回触发元素' : 'Focus returns to the trigger element after closing' }}</li>
          </ul>
        </li>
        <li><strong>{{ currentLocale === 'zh-CN' ? '键盘操作' : 'Keyboard Operation' }}:</strong>
          <ul>
            <li><code>Tab</code> - {{ currentLocale === 'zh-CN' ? '在验证码元素间导航' : 'Navigate between captcha elements' }}</li>
            <li><code>Enter</code> - {{ currentLocale === 'zh-CN' ? '触发刷新按钮' : 'Trigger refresh button' }}</li>
            <li><code>←/→</code> - {{ currentLocale === 'zh-CN' ? '调整滑块位置（滑块验证码）' : 'Adjust slider position (Slider Captcha)' }}</li>
          </ul>
        </li>
        <li><strong>{{ currentLocale === 'zh-CN' ? '屏幕阅读器' : 'Screen Reader' }}:</strong>
          <ul>
            <li>{{ currentLocale === 'zh-CN' ? '所有按钮都有语义化标签' : 'All buttons have semantic labels' }}</li>
            <li>{{ currentLocale === 'zh-CN' ? '成功/失败状态实时播报' : 'Success/Failure status announced in real-time' }}</li>
            <li>{{ currentLocale === 'zh-CN' ? '验证码说明文本可访问' : 'Captcha instructions are accessible' }}</li>
          </ul>
        </li>
        <li><strong>{{ currentLocale === 'zh-CN' ? '触摸目标' : 'Touch Targets' }}:</strong>
          <ul>
            <li>{{ currentLocale === 'zh-CN' ? '刷新按钮触摸区域 44x44 像素' : 'Refresh button touch target 44x44 pixels' }}</li>
            <li>{{ currentLocale === 'zh-CN' ? '点选标记触摸区域 24x24 像素' : 'Click marker touch target 24x24 pixels' }}</li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="demo-grid">
      <div class="demo-item">
        <h3>{{ currentLocale === 'zh-CN' ? '滑块验证码 - 键盘可操作' : 'Slider Captcha - Keyboard Operable' }}</h3>
        <div class="captcha-box">
          <SliderCaptcha
            ref="sliderRef"
            :width="300"
            :height="170"
            :locale="currentLocale"
            @success="onSliderSuccess"
          />
        </div>
        <div v-if="sliderResult" class="result success">{{ sliderResult }}</div>
        <p class="hint">{{ currentLocale === 'zh-CN' ? '提示：使用 Tab 聚焦滑块，用 ←/→ 键调整位置' : 'Tip: Use Tab to focus slider, ←/→ keys to adjust position' }}</p>
      </div>

      <div class="demo-item">
        <h3>{{ currentLocale === 'zh-CN' ? '点选验证码 - 屏幕阅读器友好' : 'Click Captcha - Screen Reader Friendly' }}</h3>
        <div class="captcha-box">
          <ClickCaptcha
            ref="clickRef"
            :width="300"
            :height="170"
            :locale="currentLocale"
            @success="onClickSuccess"
          />
        </div>
        <div v-if="clickResult" class="result success">{{ clickResult }}</div>
        <p class="hint">{{ currentLocale === 'zh-CN' ? '提示：屏幕阅读器会播报点击的字符序号' : 'Tip: Screen reader announces clicked character numbers' }}</p>
      </div>
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" @click="resetAll">{{ currentLocale === 'zh-CN' ? '重置所有' : 'Reset All' }}</button>
    </div>
  </section>
</template>

<style scoped>
.info-box {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-box h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #495057;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
}

.info-box li {
  margin-bottom: 12px;
  line-height: 1.6;
}

.info-box ul ul {
  margin-top: 8px;
}

.info-box code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.demo-item {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.demo-item h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  color: #495057;
}

.captcha-box {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.result {
  text-align: center;
  padding: 12px;
  border-radius: 6px;
  font-weight: 500;
  margin-bottom: 12px;
}

.result.success {
  background: #d4edda;
  color: #155724;
}

.hint {
  text-align: center;
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

@media (prefers-color-scheme: dark) {
  .info-box {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }

  .info-box h3 {
    color: #aaaaaa;
  }

  .info-box code {
    background: #3a3a3a;
  }

  .demo-item {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }

  .demo-item h3 {
    color: #aaaaaa;
  }

  .result.success {
    background: #1e3a1e;
    color: #5cb85c;
  }

  .hint {
    color: #888888;
  }
}
</style>