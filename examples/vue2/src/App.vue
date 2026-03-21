<template>
  <div class="container">
    <AppHeader :current-locale="currentLocale" @switch="switchLanguage" />
    <AppFeatures :locale="currentLocale" />
    <TabNav :active-tab.sync="activeTab" :locale="currentLocale" />

    <SliderDemo v-show="activeTab === 'slider'" :locale="currentLocale" />
    <ClickDemo v-show="activeTab === 'click'" :locale="currentLocale" />
    <PopupDemo v-show="activeTab === 'popup'" :locale="currentLocale" />
    <BackendDemo v-show="activeTab === 'backend'" :locale="currentLocale" />
    <InvisibleDemo v-show="activeTab === 'invisible'" :locale="currentLocale" />
    <CustomImageDemo v-show="activeTab === 'custom'" :locale="currentLocale" />

    <AppFooter />
  </div>
</template>

<script>
import { setLocale, getLocale } from '@captcha/vue2'
import '@captcha/vue2/style.css'
import './styles/global.css'

import AppHeader from './components/AppHeader.vue'
import AppFeatures from './components/AppFeatures.vue'
import TabNav from './components/TabNav.vue'
import AppFooter from './components/AppFooter.vue'

import SliderDemo from './pages/SliderDemo.vue'
import ClickDemo from './pages/ClickDemo.vue'
import PopupDemo from './pages/PopupDemo.vue'
import BackendDemo from './pages/BackendDemo.vue'
import InvisibleDemo from './pages/InvisibleDemo.vue'
import CustomImageDemo from './pages/CustomImageDemo.vue'

export default {
  name: 'App',
  components: {
    AppHeader,
    AppFeatures,
    TabNav,
    AppFooter,
    SliderDemo,
    ClickDemo,
    PopupDemo,
    BackendDemo,
    InvisibleDemo,
    CustomImageDemo
  },
  data() {
    return {
      currentLocale: getLocale(),
      activeTab: 'slider'
    }
  },
  methods: {
    switchLanguage(locale) {
      this.currentLocale = locale
      setLocale(locale)
    }
  }
}
</script>
