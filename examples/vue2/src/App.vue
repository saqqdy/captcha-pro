<script>
import { setLocale, getLocale } from '@captcha-pro/vue2'
import '@captcha-pro/vue2/style.css'
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
import AccessibilityDemo from './pages/AccessibilityDemo.vue'
import LocaleDemo from './pages/LocaleDemo.vue'
import StatisticsDemo from './pages/StatisticsDemo.vue'
import OptionsDemo from './pages/OptionsDemo.vue'
import ErrorDemo from './pages/ErrorDemo.vue'
import DarkModeDemo from './pages/DarkModeDemo.vue'

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
    CustomImageDemo,
    AccessibilityDemo,
    LocaleDemo,
    StatisticsDemo,
    OptionsDemo,
    ErrorDemo,
    DarkModeDemo
  },
  data() {
    return {
      currentLocale: getLocale(),
      activeTab: 'slider'
    }
  },
  mounted() {
    const saved = localStorage.getItem('cp-theme')
    if (saved === 'dark' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('cp-dark')
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
    <AccessibilityDemo v-show="activeTab === 'accessibility'" :locale="currentLocale" />
    <LocaleDemo v-show="activeTab === 'locale'" :locale="currentLocale" />
    <StatisticsDemo v-show="activeTab === 'statistics'" :locale="currentLocale" />
    <OptionsDemo v-show="activeTab === 'options'" :locale="currentLocale" />
    <ErrorDemo v-show="activeTab === 'error'" :locale="currentLocale" />
    <DarkModeDemo v-show="activeTab === 'dark'" :locale="currentLocale" />

    <AppFooter />
  </div>
</template>
