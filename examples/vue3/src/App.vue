<script setup lang="ts">
import { ref } from 'vue'
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

import '@captcha/vue3/style.css'
import './styles/global.css'

const activeTab = ref('slider')
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

    <Footer />
  </div>
</template>
