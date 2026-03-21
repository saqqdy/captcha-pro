import { setLocale, getLocale } from '@captcha/vue2'

export default {
  data() {
    return {
      currentLocale: getLocale()
    }
  },
  methods: {
    t(zh, en) {
      return this.currentLocale === 'zh-CN' ? zh : en
    },
    switchLanguage(locale) {
      this.currentLocale = locale
      setLocale(locale)
    }
  }
}
