<script>
import { SliderCaptcha, ClickCaptcha } from '@captcha-pro/vue2'

export default {
  name: 'DarkModeDemo',
  components: { SliderCaptcha, ClickCaptcha },
  props: {
    locale: {
      type: String,
      default: 'zh-CN'
    }
  },
  methods: {
    t(zh, en) {
      return this.locale === 'zh-CN' ? zh : en
    }
  }
}
</script>

<template>
  <section class="demo-section">
    <h2>
      {{ t('暗色模式', 'Dark Mode') }}
      <span class="new-badge">v2.3.0</span>
    </h2>

    <div class="info-box">
      <p>
        {{
          t(
            '验证码组件会自动跟随系统暗色主题（prefers-color-scheme: dark），也可以通过页面右上角的开关手动切换。切换后整个页面会进入暗色模式。',
            'The captcha automatically follows the system dark theme (prefers-color-scheme: dark), and you can also toggle it manually via the switch in the page header. The whole page will enter dark mode.'
          )
        }}
      </p>
    </div>

    <div class="captcha-box">
      <SliderCaptcha />
    </div>
    <div class="captcha-box">
      <ClickCaptcha />
    </div>

    <div class="info-box" style="margin-top: 20px; background: #f3e5f5; border-left-color: #9c27b0; color: #6a1b9a;">
      <p>
        <strong>{{ t('已保留', 'Preserved') }}:</strong>
        {{ t(
          '验证码区域渐变 #667eea → #764ba2、点击标记 #1991fa、滑块箭头 #1991fa 在 light/dark 下保持一致，作为品牌识别。',
          'The captcha gradient #667eea → #764ba2, click marker #1991fa and slider arrow #1991fa remain consistent in light/dark as brand identity.'
        ) }}
      </p>
    </div>

    <div class="info-box" style="margin-top: 10px;">
      <p>
        <strong>{{ t('支持范围', 'Supported Platforms') }}:</strong>
        {{ t(
          'Vue / Vue2 / React / HTML、Taro-Vue / Taro-Vue2 / Taro-React / UniApp-Vue / 微信小程序、Flutter、Android（Compose+View）、iOS（SwiftUI+UIKit）。',
          'Vue / Vue2 / React / HTML, Taro-Vue / Taro-Vue2 / Taro-React / UniApp-Vue / WeChat Mini Program, Flutter, Android (Compose+View), iOS (SwiftUI+UIKit).'
        ) }}
      </p>
    </div>
  </section>
</template>
