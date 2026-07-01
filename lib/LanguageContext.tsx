'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { translations, Lang } from './translations'

const LanguageContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: typeof translations.en
}>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('flushpin_lang') as Lang
    if (saved === 'es' || saved === 'en') setLangState(saved)
    else {
      const browser = navigator.language.toLowerCase()
      if (browser.startsWith('es')) setLangState('es')
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'es' ? 'es-MX' : 'en'
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('flushpin_lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
