<script>
import { computed } from 'vue'
import { SliderCaptcha, ClickCaptcha, t as translate } from '@captcha-pro/vue2'
import { demoT } from '../utils/demoI18n'

export default {
  name: 'LocaleDemo',
  components: { SliderCaptcha, ClickCaptcha },
  props: {
    locale: {
      type: String,
      default: 'zh-CN'
    }
  },
  emits: ['switch'],
  setup(props, { emit }) {
    const currentLocale = computed(() => props.locale)

    const locales = [
      { code: 'zh-CN', label: '简体中文' },
      { code: 'zh-TW', label: '繁體中文' },
      { code: 'en-US', label: 'English' },
      { code: 'fr-FR', label: 'Français' },
      { code: 'de-DE', label: 'Deutsch' },
      { code: 'es-ES', label: 'Español' }
    ]

    const messageKeys = [
      'refresh',
      'slider.slide',
      'slider.success',
      'slider.fail',
      'click.prompt',
      'click.success',
      'click.fail',
      'popup.title',
      'popup.close',
      'errors.network',
      'errors.expired',
      'errors.invalid',
      'errors.notFound',
      'errors.fetchFailed'
    ]

    const switchLocale = (locale) => {
      emit('switch', locale)
    }

    return {
      currentLocale,
      locales,
      messageKeys,
      switchLocale,
      translate
    }
  }
}
</script>

<template>
  <section class="demo-section">
    <h2>🌐 {{ t('国际化演示', 'Internationalization Demo') }}</h2>

    <div class="locale-switcher">
      <button
        v-for="loc in locales"
        :key="loc.code"
        :class="{ active: currentLocale === loc.code }"
        @click="switchLocale(loc.code)"
      >
        {{ loc.label }}
      </button>
    </div>

    <div class="i18n-table">
      <h3>{{ t('支持的语言 Key', 'Supported i18n Keys') }}</h3>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th v-for="loc in locales" :key="loc.code">{{ loc.code }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="key in messageKeys" :key="key">
            <td><code>{{ key }}</code></td>
            <td v-for="loc in locales" :key="loc.code">{{ translate(key, loc.code) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="demo-grid">
      <div class="demo-item">
        <h3>{{ t('滑块验证码', 'Slider Captcha') }}</h3>
        <div class="captcha-box">
          <SliderCaptcha
            :width="300"
            :height="170"
            :locale="currentLocale"
            @success="() => {}"
          />
        </div>
      </div>

      <div class="demo-item">
        <h3>{{ t('点选验证码', 'Click Captcha') }}</h3>
        <div class="captcha-box">
          <ClickCaptcha
            :width="300"
            :height="170"
            :locale="currentLocale"
            @success="() => {}"
          />
        </div>
      </div>
    </div>

    <div class="code-example">
      <h3>{{ t('代码示例', 'Code Example') }}</h3>
      <pre><code>import { setLocale, getLocale } from '@captcha-pro/vue2'

// 设置语言（6 种内置语言）
setLocale('fr-FR')  // zh-CN / zh-TW / en-US / fr-FR / de-DE / es-ES

// 获取当前语言
const locale = getLocale()

// 在组件中使用
&lt;SliderCaptcha :locale="locale" /&gt;</code></pre>
    </div>
  </section>
</template>

<style scoped>
.locale-switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  justify-content: center;
}

.locale-switcher button {
  padding: 12px 24px;
  border: 2px solid #e9ecef;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
}

.locale-switcher button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-color: transparent;
}

.i18n-table {
  margin-bottom: 32px;
  overflow-x: auto;
}

.i18n-table h3 {
  margin-bottom: 16px;
  color: #495057;
}

.i18n-table table {
  width: 100%;
  min-width: 900px;
  table-layout: fixed;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.i18n-table th,
.i18n-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  overflow-wrap: break-word;
}

.i18n-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.i18n-table code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
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
  color: #495057;
}

.captcha-box {
  display: flex;
  justify-content: center;
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

html.cp-dark .locale-switcher button {
  background: #2a2a2a;
  border-color: #3a3a3a;
  color: #aaaaaa;
}

html.cp-dark .locale-switcher button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

html.cp-dark .i18n-table h3 {
  color: #aaaaaa;
}

html.cp-dark .i18n-table table {
  background: #2a2a2a;
}

html.cp-dark .i18n-table th {
  background: #1f1f1f;
  color: #aaaaaa;
}

html.cp-dark .i18n-table th,
html.cp-dark .i18n-table td {
  border-bottom-color: #3a3a3a;
}

html.cp-dark .i18n-table code {
  background: #3a3a3a;
}

html.cp-dark .demo-item {
  background: #2a2a2a;
  border-color: #3a3a3a;
}

html.cp-dark .demo-item h3 {
  color: #aaaaaa;
}
</style>
