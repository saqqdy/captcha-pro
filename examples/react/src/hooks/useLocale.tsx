import { getLocale, setLocale } from '@captcha-pro/react'
import { createContext, type ReactElement, type ReactNode, useCallback, useContext, useState } from 'react'

type Locale = 'zh-CN' | 'en-US'

interface LocaleContextValue {
  currentLocale: Locale
  t: (zh: string, en: string) => string
  switchLanguage: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider(props: { children: ReactNode }): ReactElement {
  const [currentLocale, setCurrentLocale] = useState<Locale>(getLocale() as Locale)

  const t = useCallback((zh: string, en: string): string => {
    return currentLocale === 'zh-CN' ? zh : en
  }, [currentLocale])

  const switchLanguage = useCallback((locale: Locale): void => {
    setCurrentLocale(locale)
    setLocale(locale)
  }, [])

  return (
    <LocaleContext.Provider value={{ currentLocale, t, switchLanguage }}>
      {props.children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}
