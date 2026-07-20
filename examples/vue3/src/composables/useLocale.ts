import type { Ref } from 'vue'
import { getLocale, setLocale } from '@captcha-pro/vue3'
import { ref } from 'vue'

const currentLocale = ref<'zh-CN' | 'en-US'>(getLocale() as 'zh-CN' | 'en-US')

export function useLocale(): {
  currentLocale: Ref<'zh-CN' | 'en-US'>
  t: (zh: string, en: string) => string
  switchLanguage: (locale: 'zh-CN' | 'en-US') => void
} {
  const t = (zh: string, en: string): string => (currentLocale.value === 'zh-CN' ? zh : en)

  const switchLanguage = (locale: 'zh-CN' | 'en-US'): void => {
    currentLocale.value = locale
    setLocale(locale)
  }

  return {
    currentLocale,
    t,
    switchLanguage
  }
}
