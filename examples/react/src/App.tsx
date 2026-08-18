import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { Features } from './components/Features'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { TabNav } from './components/TabNav'

import { LocaleProvider } from './hooks/useLocale'
import AccessibilityDemo from './pages/AccessibilityDemo'
import { BackendDemo } from './pages/BackendDemo'
import { ClickDemo } from './pages/ClickDemo'
import { CustomImageDemo } from './pages/CustomImageDemo'
import { DarkModeDemo } from './pages/DarkModeDemo'

import ErrorDemo from './pages/ErrorDemo'
import { InvisibleDemo } from './pages/InvisibleDemo'
import LocaleDemo from './pages/LocaleDemo'
import OptionsDemo from './pages/OptionsDemo'
import { PopupDemo } from './pages/PopupDemo'
import { SliderDemo } from './pages/SliderDemo'
import StatisticsDemo from './pages/StatisticsDemo'

import './styles/global.css'

type TabType = 'slider' | 'click' | 'popup' | 'backend' | 'invisible' | 'custom' | 'accessibility' | 'locale' | 'statistics' | 'options' | 'error' | 'dark'

export default function App(): ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('slider')

  useEffect(() => {
    const saved = localStorage.getItem('cp-theme')
    if (saved === 'dark' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('cp-dark')
    }
  }, [])

  return (
    <LocaleProvider>
      <div className="container">
        <Header />
        <Features />
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'slider' && <SliderDemo />}
        {activeTab === 'click' && <ClickDemo />}
        {activeTab === 'popup' && <PopupDemo />}
        {activeTab === 'backend' && <BackendDemo />}
        {activeTab === 'invisible' && <InvisibleDemo />}
        {activeTab === 'custom' && <CustomImageDemo />}
        {activeTab === 'accessibility' && <AccessibilityDemo />}
        {activeTab === 'locale' && <LocaleDemo />}
        {activeTab === 'statistics' && <StatisticsDemo />}
      {activeTab === 'options' && <OptionsDemo />}
      {activeTab === 'error' && <ErrorDemo />}
      {activeTab === 'dark' && <DarkModeDemo />}

      <Footer />
      </div>
    </LocaleProvider>
  )
}
