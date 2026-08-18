<script setup lang="ts">
import { ref, computed } from 'vue'
import { SliderCaptcha, ClickCaptcha } from '@captcha-pro/vue'

const currentLocale = ref('zh-CN')
const t = computed(() => (zh: string, en: string) => currentLocale.value === 'zh-CN' ? zh : en)

const sliderRef = ref()
const clickRef = ref()

const sliderResult = ref('')
const clickResult = ref('')
const sliderError = ref('')
const clickError = ref('')

const onSliderSuccess = () => {
  sliderResult.value = t('验证成功！', 'Verification successful!')
  sliderError.value = ''
}

const onSliderFail = () => {
  sliderError.value = t('验证失败，请重试', 'Verification failed, please retry')
  sliderResult.value = ''
}

const onClickSuccess = () => {
  clickResult.value = t('验证成功！', 'Verification successful!')
  clickError.value = ''
}

const onClickFail = () => {
  clickError.value = t('验证失败，请重试', 'Verification failed, please retry')
  clickResult.value = ''
}

const resetAll = () => {
  sliderRef.value?.refresh()
  clickRef.value?.refresh()
  sliderResult.value = ''
  clickResult.value = ''
  sliderError.value = ''
  clickError.value = ''
}
</script>

<template>
  <section class="demo-section">
    <h2>❌ {{ t('错误处理演示', 'Error Handling Demo') }}</h2>

    <div class="info-box">
      <h3>{{ t('错误事件', 'Error Events') }}</h3>
      <p>{{ t('监听 @fail 事件处理验证失败情况', 'Listen to @fail event to handle verification failures') }}</p>
      <ul>
        <li><code>@success</code> - {{ t('验证成功回调', 'Verification success callback') }}</li>
        <li><code>@fail</code> - {{ t('验证失败回调', 'Verification failure callback') }}</li>
        <li><code>refresh()</code> - {{ t('通过 ref 调用 refresh() 方法重置', 'Reset by calling refresh() method via ref') }}</li>
      </ul>
    </div>

    <div class="demo-grid">
      <div class="demo-item">
        <h3>{{ t('滑块验证码错误处理', 'Slider Captcha Error Handling') }}</h3>
        <div class="captcha-box">
          <SliderCaptcha
            ref="sliderRef"
            :width="300"
            :height="170"
            :locale="currentLocale"
            @success="onSliderSuccess"
            @fail="onSliderFail"
          />
        </div>
        <div v-if="sliderResult" class="result success">{{ sliderResult }}</div>
        <div v-if="sliderError" class="result error">{{ sliderError }}</div>
        <p class="hint">{{ t('提示：故意拖错位置触发失败', 'Tip: Drag to wrong position to trigger failure') }}</p>
      </div>

      <div class="demo-item">
        <h3>{{ t('点选验证码错误处理', 'Click Captcha Error Handling') }}</h3>
        <div class="captcha-box">
          <ClickCaptcha
            ref="clickRef"
            :width="300"
            :height="170"
            :locale="currentLocale"
            @success="onClickSuccess"
            @fail="onClickFail"
          />
        </div>
        <div v-if="clickResult" class="result success">{{ clickResult }}</div>
        <div v-if="clickError" class="result error">{{ clickError }}</div>
        <p class="hint">{{ t('提示：点击错误顺序触发失败', 'Tip: Click wrong sequence to trigger failure') }}</p>
      </div>
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" @click="resetAll">{{ t('重置所有', 'Reset All') }}</button>
    </div>

    <div class="code-example">
      <h3>{{ t('代码示例', 'Code Example') }}</h3>
      <pre><code>&lt;SliderCaptcha
  ref="captchaRef"
  @success="onSuccess"
  @fail="onFail"
/&gt;

const onSuccess = () => {
  console.log('验证成功')
}

const onFail = () => {
  console.log('验证失败')
  // 可选：自动重置
  captchaRef.value?.refresh()
}</code></pre>
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
  margin-bottom: 12px;
  color: #495057;
}

.info-box p {
  margin-bottom: 12px;
  color: #6c757d;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
}

.info-box li {
  margin-bottom: 8px;
  line-height: 1.6;
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

.result.error {
  background: #f8d7da;
  color: #721c24;
}

.hint {
  text-align: center;
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

.code-example {
  background: #2d2d2d;
  border-radius: 8px;
  padding: 20px;
}

.code-example h3 {
  color: #fff;
  margin-top: 0;
  margin-bottom: 12px;
}

.code-example pre {
  margin: 0;
  color: #f8f8f2;
}

.code-example code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
}

@media (prefers-color-scheme: dark) {
  .info-box {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }

  .info-box h3 {
    color: #aaaaaa;
  }

  .info-box p {
    color: #888888;
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

  .result.error {
    background: #3a1e1e;
    color: #e57373;
  }

  .hint {
    color: #888888;
  }
}
</style>
