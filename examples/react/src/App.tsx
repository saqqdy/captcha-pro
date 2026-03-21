import { useState } from 'react'
import { Header } from './components/Header'
import { Features } from './components/Features'
import { TabNav } from './components/TabNav'
import { Footer } from './components/Footer'

import { SliderDemo } from './pages/SliderDemo'
import { ClickDemo } from './pages/ClickDemo'
import { PopupDemo } from './pages/PopupDemo'
import { BackendDemo } from './pages/BackendDemo'
import { InvisibleDemo } from './pages/InvisibleDemo'
import { CustomImageDemo } from './pages/CustomImageDemo'

import { LocaleProvider } from './hooks/useLocale'

import './styles/global.css'

type TabType = 'slider' | 'click' | 'popup' | 'backend' | 'invisible' | 'custom'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('slider')

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

        <Footer />
      </div>
    </LocaleProvider>
  )
}
