import type { ReactElement } from 'react'
import { useState } from 'react'
import { Show } from "solid-js";
import { Features } from './components/Features'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { TabNav } from './components/TabNav'

import { LocaleProvider } from './hooks/useLocale'
import { BackendDemo } from './pages/BackendDemo'
import { ClickDemo } from './pages/ClickDemo'
import { CustomImageDemo } from './pages/CustomImageDemo'
import { InvisibleDemo } from './pages/InvisibleDemo'
import { PopupDemo } from './pages/PopupDemo'

import { SliderDemo } from './pages/SliderDemo'

import './styles/global.css'

type TabType = 'slider' | 'click' | 'popup' | 'backend' | 'invisible' | 'custom'

export default function App(): ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('slider')

  return (
    <LocaleProvider>
      <div class="container">
        <Header />
        <Features />
        <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

        <Show when={activeTab === 'slider'}><SliderDemo /></Show>
        <Show when={activeTab === 'click'}><ClickDemo /></Show>
        <Show when={activeTab === 'popup'}><PopupDemo /></Show>
        <Show when={activeTab === 'backend'}><BackendDemo /></Show>
        <Show when={activeTab === 'invisible'}><InvisibleDemo /></Show>
        <Show when={activeTab === 'custom'}><CustomImageDemo /></Show>

        <Footer />
      </div>
    </LocaleProvider>
  )
}
