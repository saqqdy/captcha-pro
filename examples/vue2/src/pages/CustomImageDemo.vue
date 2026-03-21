<template>
  <section class="demo-section">
    <h2>🖼️ {{ locale === 'zh-CN' ? '自定义图片验证码' : 'Custom Image Captcha' }}</h2>

    <div class="info-box">
      💡 {{ locale === 'zh-CN' ? '支持使用自定义背景图片。' : 'Support custom background images.' }}
    </div>

    <div class="captcha-box">
      <SliderCaptcha
        ref="captchaRef"
        :width="320"
        :height="180"
        :bg-image="bgImage"
        :locale="locale"
        @success="() => console.log('Custom captcha success')"
      />
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" @click="changeImage">{{ locale === 'zh-CN' ? '更换图片' : 'Change Image' }}</button>
    </div>
  </section>
</template>

<script>
import { SliderCaptcha } from '@captcha/vue2'

const images = [
  'https://picsum.photos/seed/captcha1/300/170',
  'https://picsum.photos/seed/captcha2/300/170',
  'https://picsum.photos/seed/captcha3/300/170',
]

export default {
  name: 'CustomImageDemo',
  components: { SliderCaptcha },
  props: {
    locale: { type: String, default: 'zh-CN' }
  },
  data() {
    return { index: 0 }
  },
  computed: {
    bgImage() {
      return images[this.index]
    }
  },
  methods: {
    changeImage() {
      this.index = (this.index + 1) % images.length
    }
  }
}
</script>
