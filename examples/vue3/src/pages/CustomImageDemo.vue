<script setup lang="ts">
import { ref, computed } from 'vue'
import { SliderCaptcha } from '@captcha/vue3'
import { useLocale } from '../composables/useLocale'

const { currentLocale, t } = useLocale()

const images = [
  'https://picsum.photos/seed/captcha1/300/170',
  'https://picsum.photos/seed/captcha2/300/170',
  'https://picsum.photos/seed/captcha3/300/170',
]
const index = ref(0)
const bgImage = computed(() => images[index.value])
const captchaRef = ref()

const changeImage = () => {
  index.value = (index.value + 1) % images.length
}
</script>

<template>
  <section class="demo-section">
    <h2>🖼️ {{ currentLocale === 'zh-CN' ? '自定义图片验证码' : 'Custom Image Captcha' }}</h2>

    <div class="info-box">
      💡 {{ currentLocale === 'zh-CN'
        ? '支持使用自定义背景图片，滑块图片会自动生成。'
        : 'Support custom background images, slider image will be auto-generated.' }}
    </div>

    <div class="captcha-box">
      <SliderCaptcha
        ref="captchaRef"
        :width="320"
        :height="180"
        :bg-image="bgImage"
        :locale="currentLocale"
        @success="() => console.log('Custom captcha success')"
      />
    </div>

    <div class="btn-group">
      <button class="btn btn-primary" @click="changeImage">{{ currentLocale === 'zh-CN' ? '更换图片' : 'Change Image' }}</button>
    </div>

    <p class="image-info">
      {{ currentLocale === 'zh-CN' ? '当前图片' : 'Current image' }}: {{ index + 1 }} / {{ images.length }}
    </p>
  </section>
</template>
