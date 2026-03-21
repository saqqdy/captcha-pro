import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { setLocale, getLocale } from '@captcha/react'

type Locale = 'zh-CN' | 'en-US'

interface LocaleContextValue {
  currentLocale: Locale
  t: (zh: string, en: string) => string
  switchLanguage: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [currentLocale, setCurrentLocale] = useState<Locale>(getLocale() as Locale)

  const t = useCallback((zh: string, en: string) => {
    return currentLocale === 'zh-CN' ? zh : en
  }, [currentLocale])

  const switchLanguage = useCallback((locale: Locale) => {
    setCurrentLocale(locale)
    setLocale(locale)
  }, [])

  return (
    <LocaleContext.Provider value={{ currentLocale, t, switchLanguage }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}
