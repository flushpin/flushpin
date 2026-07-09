'use client'

import { useLang } from '../lib/LanguageContext'

function UsFlag() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 10" width="22" height="16" aria-hidden>
      <rect width="19" height="10" fill="#fff" />
      <rect width="19" height="0.77" y="0" fill="#b22234" />
      <rect width="19" height="0.77" y="1.54" fill="#b22234" />
      <rect width="19" height="0.77" y="3.08" fill="#b22234" />
      <rect width="19" height="0.77" y="4.62" fill="#b22234" />
      <rect width="19" height="0.77" y="6.16" fill="#b22234" />
      <rect width="19" height="0.77" y="7.7" fill="#b22234" />
      <rect width="19" height="0.77" y="9.23" fill="#b22234" />
      <rect width="7.6" height="5.38" fill="#3c3b6e" />
      <g fill="#fff">
        <circle cx="0.7" cy="0.62" r="0.17" />
        <circle cx="1.95" cy="0.62" r="0.17" />
        <circle cx="3.2" cy="0.62" r="0.17" />
        <circle cx="4.45" cy="0.62" r="0.17" />
        <circle cx="5.7" cy="0.62" r="0.17" />
        <circle cx="6.95" cy="0.62" r="0.17" />

        <circle cx="1.33" cy="1.24" r="0.17" />
        <circle cx="2.58" cy="1.24" r="0.17" />
        <circle cx="3.83" cy="1.24" r="0.17" />
        <circle cx="5.08" cy="1.24" r="0.17" />
        <circle cx="6.33" cy="1.24" r="0.17" />

        <circle cx="0.7" cy="1.86" r="0.17" />
        <circle cx="1.95" cy="1.86" r="0.17" />
        <circle cx="3.2" cy="1.86" r="0.17" />
        <circle cx="4.45" cy="1.86" r="0.17" />
        <circle cx="5.7" cy="1.86" r="0.17" />
        <circle cx="6.95" cy="1.86" r="0.17" />

        <circle cx="1.33" cy="2.48" r="0.17" />
        <circle cx="2.58" cy="2.48" r="0.17" />
        <circle cx="3.83" cy="2.48" r="0.17" />
        <circle cx="5.08" cy="2.48" r="0.17" />
        <circle cx="6.33" cy="2.48" r="0.17" />

        <circle cx="0.7" cy="3.1" r="0.17" />
        <circle cx="1.95" cy="3.1" r="0.17" />
        <circle cx="3.2" cy="3.1" r="0.17" />
        <circle cx="4.45" cy="3.1" r="0.17" />
        <circle cx="5.7" cy="3.1" r="0.17" />
        <circle cx="6.95" cy="3.1" r="0.17" />

        <circle cx="1.33" cy="3.72" r="0.17" />
        <circle cx="2.58" cy="3.72" r="0.17" />
        <circle cx="3.83" cy="3.72" r="0.17" />
        <circle cx="5.08" cy="3.72" r="0.17" />
        <circle cx="6.33" cy="3.72" r="0.17" />

        <circle cx="0.7" cy="4.34" r="0.17" />
        <circle cx="1.95" cy="4.34" r="0.17" />
        <circle cx="3.2" cy="4.34" r="0.17" />
        <circle cx="4.45" cy="4.34" r="0.17" />
        <circle cx="5.7" cy="4.34" r="0.17" />
        <circle cx="6.95" cy="4.34" r="0.17" />

        <circle cx="1.33" cy="4.96" r="0.17" />
        <circle cx="2.58" cy="4.96" r="0.17" />
        <circle cx="3.83" cy="4.96" r="0.17" />
        <circle cx="5.08" cy="4.96" r="0.17" />
        <circle cx="6.33" cy="4.96" r="0.17" />
      </g>
    </svg>
  )
}

function MxFlag() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 16" width="22" height="16" aria-hidden>
      <rect width="7.33" height="16" fill="#006847" />
      <rect x="7.33" width="7.34" height="16" fill="#fff" />
      <rect x="14.67" width="7.33" height="16" fill="#ce1126" />
      <circle cx="11" cy="8" r="2.1" fill="#c5922e" />
      <ellipse cx="11" cy="8.15" rx="1.35" ry="1.05" fill="#006847" />
    </svg>
  )
}

export default function LanguageToggle({ className = 'fp-lang' }: { className?: string }) {
  const { lang, setLang } = useLang()

  return (
    <>
      <style>{`
        .fp-lang{display:inline-flex;align-items:center;background:#edf5f3;border-radius:12px;padding:3px;gap:2px}
        .fp-lang button{border:0;border-radius:9px;padding:6px 8px;background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;line-height:0;transition:background .15s ease,box-shadow .15s ease}
        .fp-lang button[aria-pressed="true"]{background:#fff;box-shadow:0 1px 4px rgba(7,25,23,.12)}
        .fp-lang button:hover{background:rgba(255,255,255,.72)}
        .fp-lang button:focus-visible{outline:2px solid #0eb5ab;outline-offset:2px}
        .fp-lang svg{display:block;border-radius:2px;box-shadow:0 0 0 1px rgba(7,25,23,.08)}
      `}</style>
      <div className={className} role="group" aria-label="Language">
        <button
          type="button"
          onClick={() => setLang('en')}
          aria-pressed={lang === 'en'}
          aria-label="English (United States)"
          title="English (United States)"
        >
          <UsFlag />
        </button>
        <button
          type="button"
          onClick={() => setLang('es')}
          aria-pressed={lang === 'es'}
          aria-label="Español (México)"
          title="Español (México)"
        >
          <MxFlag />
        </button>
      </div>
    </>
  )
}
