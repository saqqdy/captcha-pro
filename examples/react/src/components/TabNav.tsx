import { useLocale } from '../hooks/useLocale'

type TabType = 'slider' | 'click' | 'popup' | 'backend' | 'invisible' | 'custom'

interface TabNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const { currentLocale, t } = useLocale()

  const tabs: { key: TabType; label: { zh: string; en: string }; badge?: string }[] = [
    { key: 'slider', label: { zh: '滑块验证码', en: 'Slider Captcha' } },
    { key: 'click', label: { zh: '点击验证码', en: 'Click Captcha' } },
    { key: 'popup', label: { zh: '弹窗验证码', en: 'Popup Captcha' } },
    { key: 'backend', label: { zh: '后端验证', en: 'Backend' }, badge: 'NEW' },
    { key: 'invisible', label: { zh: '智能无感', en: 'Invisible' }, badge: 'NEW' },
    { key: 'custom', label: { zh: '自定义图片', en: 'Custom Image' } },
  ]

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={activeTab === tab.key ? 'active' : ''}
          onClick={() => onTabChange(tab.key)}
        >
          {currentLocale === 'zh-CN' ? tab.label.zh : tab.label.en}
          {tab.badge && <span className="new-badge">{tab.badge}</span>}
        </button>
      ))}
    </div>
  )
}
