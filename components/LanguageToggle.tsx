'use client'

import { useLang } from '../lib/LanguageContext'

export default function LanguageToggle({ className = 'fp-lang' }: { className?: string }) {
  const { lang, setLang } = useLang()

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setLang('en')}
        style={{ background: lang === 'en' ? '#fff' : 'transparent' }}
        aria-pressed={lang === 'en'}
      >
        US
      </button>
      <button
        type="button"
        onClick={() => setLang('es')}
        style={{ background: lang === 'es' ? '#fff' : 'transparent' }}
        aria-pressed={lang === 'es'}
      >
        ES
      </button>
    </div>
  )
}
