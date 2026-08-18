<script>
import { ref } from 'vue'
import SliderCaptcha from '@captcha-pro/vue2'
import ClickCaptcha from '@captcha-pro/vue2'

export default {
  name: 'ErrorDemo',
  components: { SliderCaptcha, ClickCaptcha },
  props: {
    locale: {
      type: String,
      default: 'zh-CN'
    }
  },
  setup(props) {
    const sliderRef = ref(null)
    const clickRef = ref(null)
    const sliderResult = ref('')
    const clickResult = ref('')
    const sliderError = ref('')
    const clickError = ref('')

    const t = (zh, en) => props.locale === 'zh-CN' ? zh : en

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

    return {
      sliderRef,
      clickRef,
      sliderResult,
      clickResult,
      sliderError,
      clickError,
      t,
      onSliderSuccess,
      onSliderFail,
      onClickSuccess,
      onClickFail,
      resetAll
    }
  }
}
</script>

<template>
  <section class="demo-section">
    <h2>❌ {{ t('错误处理演示', 'Error Handling Demo') }}</h2>

    <div class="info-box">
      <h3>{{ t('错误事件', 'Error Events') }}</h3>
      <p>{{ t('监听 @fail 事件处理验证失败情况', 'Listen to @fail event to handle failures') }}</p>
    </div>

    <div class="demo-grid">
      <div class="demo-item">
        <h3>{{ t('滑块验证码错误处理', 'Slider Captcha Error') }}</h3>
        <div class="captcha-box">
          <SliderCaptcha
            ref="sliderRef"
            :width="300"
            :height="170"
            :locale="locale"
            @success="onSliderSuccess"
            @fail="onSliderFail"
          />
        </div>
        <div v-if="sliderResult" class="result success">{{ sliderResult }}</div>
        <div v-if="sliderError" class="result error">{{ sliderError }}</div>
      </div>

      <div class="demo-item">
        <h3>{{ t('点选验证码错误处理', 'Click Captcha Error') }}</h3>
        <div class="captcha-box">
          <ClickCaptcha
            ref="clickRef"
            :width="300"
            :height="170"
            :locale="locale"
            @success="onClickSuccess"
            @fail="onClickFail"
          />
        </div>
        <div v-if="clickResult" class="result success">{{ clickResult }}</div>
        <div v-if="clickError" class="result error">{{ clickError }}</div>
      </div>
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" @click="resetAll">{{ t('重置所有', 'Reset All') }}</button>
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
  margin: 0;
  color: #6c757d;
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
}
</style>
