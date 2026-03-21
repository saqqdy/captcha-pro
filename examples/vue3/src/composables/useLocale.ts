import { ref } from 'vue'
import { setLocale, getLocale } from '@captcha/vue3'

const currentLocale = ref<'zh-CN' | 'en-US'>(getLocale() as 'zh-CN' | 'en-US')

export function useLocale() {
  const t = (zh: string, en: string) => (currentLocale.value === 'zh-CN' ? zh : en)

  const switchLanguage = (locale: 'zh-CN' | 'en-US') => {
    currentLocale.value = locale
    setLocale(locale)
  }

  return {
    currentLocale,
    t,
    switchLanguage
  }
}
