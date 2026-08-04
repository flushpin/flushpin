'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'
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

const LANG_KEY = 'flushpin_lang'
const listeners = new Set<() => void>()

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => {
    listeners.delete(onStoreChange)
  }
}

function readLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'es' || saved === 'en') return saved
    if (navigator.language.toLowerCase().startsWith('es')) return 'es'
  } catch {
    /* ignore */
  }
  return 'en'
}

function getServerSnapshot(): Lang {
  return 'en'
}

function emitLangChange() {
  listeners.forEach((listener) => listener())
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, getServerSnapshot)

  useEffect(() => {
    document.documentElement.lang = lang === 'es' ? 'es-MX' : 'en'
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    try {
      localStorage.setItem(LANG_KEY, l)
    } catch {
      /* ignore */
    }
    emitLangChange()
  }, [])

  const value = useMemo(
    () => ({ lang, setLang, t: translations[lang] }),
    [lang, setLang],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
