import { getLocale, setLocale } from '@captcha-pro/vue2'
import { demoT } from '../utils/demoI18n'

export default {
  data() {
    return {
      currentLocale: getLocale()
    }
  },
  methods: {
    t(zh, en) {
      return demoT(this.currentLocale, zh, en)
    },
    switchLanguage(locale) {
      this.currentLocale = locale
      setLocale(locale)
    }
  }
}
