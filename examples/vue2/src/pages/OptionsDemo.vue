<script>
import { ref } from 'vue'
import SliderCaptcha from '@captcha-pro/vue2'
import ClickCaptcha from '@captcha-pro/vue2'

export default {
  name: 'OptionsDemo',
  components: { SliderCaptcha, ClickCaptcha },
  props: {
    locale: {
      type: String,
      default: 'zh-CN'
    }
  },
  setup(props) {
    const configs = ref({
      precision: 5,
      showRefresh: true
    })

    const sliderResult = ref('')
    const clickResult = ref('')

    const t = (zh, en) => props.locale === 'zh-CN' ? zh : en

    const onSliderSuccess = () => {
      sliderResult.value = t('验证成功！', 'Verification successful!')
    }

    const onClickSuccess = () => {
      clickResult.value = t('验证成功！', 'Verification successful!')
    }

    return {
      configs,
      sliderResult,
      clickResult,
      t,
      onSliderSuccess,
      onClickSuccess
    }
  }
}
</script>

<template>
  <section class="demo-section">
    <h2>⚙️ {{ t('配置选项演示', 'Configuration Options Demo') }}</h2>

    <div class="info-box">
      <h3>{{ t('可配置选项', 'Available Options') }}</h3>
      <p>{{ t('通过 props 自定义验证码组件的行为', 'Customize captcha via props') }}</p>
    </div>

    <div class="config-panel">
      <h3>{{ t('配置面板', 'Configuration Panel') }}</h3>
      <div class="config-grid">
        <div class="config-item">
          <label>
            <span class="config-label">{{ t('验证精度', 'Precision') }}</span>
          </label>
          <input type="number" min="1" max="20" step="1" v-model.number="configs.precision" />
        </div>

        <div class="config-item">
          <label>
            <span class="config-label">{{ t('显示刷新按钮', 'Show Refresh') }}</span>
          </label>
          <label class="toggle">
            <input type="checkbox" v-model="configs.showRefresh" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>

    <div class="demo-grid">
      <div class="demo-item">
        <h3>{{ t('滑块验证码', 'Slider Captcha') }}</h3>
        <div class="captcha-box">
          <SliderCaptcha
            :width="300"
            :height="170"
            :precision="configs.precision"
            :show-refresh="configs.showRefresh"
            :locale="locale"
            @success="onSliderSuccess"
          />
        </div>
        <div v-if="sliderResult" class="result success">{{ sliderResult }}</div>
      </div>

      <div class="demo-item">
        <h3>{{ t('点选验证码', 'Click Captcha') }}</h3>
        <div class="captcha-box">
          <ClickCaptcha
            :width="300"
            :height="170"
            :precision="configs.precision"
            :show-refresh="configs.showRefresh"
            :locale="locale"
            @success="onClickSuccess"
          />
        </div>
        <div v-if="clickResult" class="result success">{{ clickResult }}</div>
      </div>
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

.config-panel {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.config-panel h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #495057;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-label {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.config-item input[type="number"] {
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  color: #495057;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
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

  .config-panel {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }

  .config-panel h3 {
    color: #aaaaaa;
  }

  .config-label {
    color: #aaaaaa;
  }

  .config-item input[type="number"] {
    background: #1f1f1f;
    border-color: #3a3a3a;
    color: #aaaaaa;
  }

  .toggle-slider {
    background-color: #3a3a3a;
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
}
</style>
