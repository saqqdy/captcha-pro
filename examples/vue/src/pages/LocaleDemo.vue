<script setup lang="ts">
import { ref, computed } from 'vue'
import { SliderCaptcha, ClickCaptcha, setLocale, getLocale } from '@captcha-pro/vue'

const currentLocale = ref(getLocale())

const locales = [
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en-US', label: 'English' }
]

const i18nKeys = [
  { key: 'slider_hint', zh: '向右拖动滑块填满缺口', en: 'Drag the slider to fill the gap' },
  { key: 'click_prompt', zh: '请依次点击', en: 'Please click in order' },
  { key: 'loading', zh: '加载中...', en: 'Loading...' },
  { key: 'refresh', zh: '刷新', en: 'Refresh' },
  { key: 'success', zh: '验证成功', en: 'Verification successful' },
  { key: 'fail', zh: '验证失败', en: 'Verification failed' },
  { key: 'popup_title', zh: '安全验证', en: 'Security Verification' },
  { key: 'popup_close', zh: '关闭', en: 'Close' }
]

const switchLocale = (locale: string) => {
  currentLocale.value = locale
  setLocale(locale)
}

const t = computed(() => (zh: string, en: string) => currentLocale.value === 'zh-CN' ? zh : en)
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
            <th>简体中文</th>
            <th>English</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in i18nKeys" :key="item.key">
            <td><code>{{ item.key }}</code></td>
            <td>{{ item.zh }}</td>
            <td>{{ item.en }}</td>
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
      <pre><code>import { setLocale, getLocale } from '@captcha-pro/vue'

// 设置语言
setLocale('en-US')  // 或 'zh-CN'

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
}

.i18n-table h3 {
  margin-bottom: 16px;
  color: #495057;
}

.i18n-table table {
  width: 100%;
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

@media (prefers-color-scheme: dark) {
  .locale-switcher button {
    background: #2a2a2a;
    border-color: #3a3a3a;
    color: #aaaaaa;
  }

  .locale-switcher button.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }

  .i18n-table h3 {
    color: #aaaaaa;
  }

  .i18n-table table {
    background: #2a2a2a;
  }

  .i18n-table th {
    background: #1f1f1f;
    color: #aaaaaa;
  }

  .i18n-table code {
    background: #3a3a3a;
  }

  .demo-item {
    background: #2a2a2a;
    border-color: #3a3a3a;
  }

  .demo-item h3 {
    color: #aaaaaa;
  }
}
</style>