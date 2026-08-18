<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Header from './components/Header.vue'
import Features from './components/Features.vue'
import TabNav from './components/TabNav.vue'
import Footer from './components/Footer.vue'

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

import '@captcha-pro/vue/style.css'
import './styles/global.css'

const activeTab = ref('slider')

onMounted(() => {
  const saved = localStorage.getItem('cp-theme')
  if (saved === 'dark' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('cp-dark')
  }
})
</script>

<template>
  <div class="container">
    <Header />
    <Features />

    <TabNav v-model:active-tab="activeTab" />

    <SliderDemo v-show="activeTab === 'slider'" />
    <ClickDemo v-show="activeTab === 'click'" />
    <PopupDemo v-show="activeTab === 'popup'" />
    <BackendDemo v-show="activeTab === 'backend'" />
    <InvisibleDemo v-show="activeTab === 'invisible'" />
    <CustomImageDemo v-show="activeTab === 'custom'" />
    <AccessibilityDemo v-show="activeTab === 'accessibility'" />
    <LocaleDemo v-show="activeTab === 'locale'" />
    <StatisticsDemo v-show="activeTab === 'statistics'" />
    <OptionsDemo v-show="activeTab === 'options'" />
    <ErrorDemo v-show="activeTab === 'error'" />
    <DarkModeDemo v-show="activeTab === 'dark'" />

    <Footer />
  </div>
</template>
