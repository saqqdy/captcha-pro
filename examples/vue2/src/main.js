import Vue from 'vue'
import App from './App.vue'
import { demoT } from './utils/demoI18n'

Vue.mixin({
  methods: {
    t(zh, en) {
      return demoT(this.locale || this.currentLocale || 'zh-CN', zh, en)
    }
  }
})

new Vue({
  render: h => h(App)
}).$mount('#app')
