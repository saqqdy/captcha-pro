import type { Ref } from 'vue'
import { getLocale, setLocale } from '@captcha-pro/vue'
import { ref } from 'vue'
import { demoT } from '../utils/demoI18n'

const currentLocale = ref<'zh-CN' | 'zh-TW' | 'en-US' | 'fr-FR' | 'de-DE' | 'es-ES'>(getLocale() as 'zh-CN' | 'zh-TW' | 'en-US' | 'fr-FR' | 'de-DE' | 'es-ES')

export function useLocale(): {
  currentLocale: Ref<'zh-CN' | 'zh-TW' | 'en-US' | 'fr-FR' | 'de-DE' | 'es-ES'>
  t: (zh: string, en: string) => string
  switchLanguage: (locale: 'zh-CN' | 'zh-TW' | 'en-US' | 'fr-FR' | 'de-DE' | 'es-ES') => void
} {
  const t = (zh: string, en: string): string => demoT(currentLocale.value, zh, en)

  const switchLanguage = (locale: 'zh-CN' | 'zh-TW' | 'en-US' | 'fr-FR' | 'de-DE' | 'es-ES'): void => {
    currentLocale.value = locale
    setLocale(locale)
  }

  return {
    currentLocale,
    t,
    switchLanguage
  }
}
