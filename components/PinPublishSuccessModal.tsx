'use client'

import { useEffect } from 'react'
import { useLang } from '../lib/LanguageContext'

const TEAL = '#0EB5AB'
const TEAL_DARK = '#067A73'
const AUTO_DISMISS_MS = 2800
const CONFETTI = ['✨', '🎉', '💚', '⭐', '🎊']

type Props = {
  visible: boolean
  pin: string
  onClose: () => void
}

export default function PinPublishSuccessModal({ visible, pin, onClose }: Props) {
  const { t } = useLang()

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onClose, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes fp-heart-pulse {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.22); }
          50% { transform: scale(1); }
          75% { transform: scale(1.12); }
        }
        @keyframes fp-float {
          0%, 100% { transform: translateY(0) scale(0.9); opacity: 0.3; }
          50% { transform: translateY(-18px) scale(1.1); opacity: 1; }
        }
      `}</style>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: `linear-gradient(160deg, ${TEAL} 0%, #0A9E95 50%, ${TEAL_DARK} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px',
        }}
      >
        {CONFETTI.map((emoji, i) => (
          <span
            key={emoji + i}
            style={{
              position: 'absolute',
              fontSize: '28px',
              animation: `fp-float ${1.6 + i * 0.15}s ease-in-out infinite`,
              top: `${12 + i * 5}%`,
              left: i % 2 === 0 ? `${8 + i * 4}%` : undefined,
              right: i % 2 === 1 ? `${8 + i * 3}%` : undefined,
            }}
          >
            {emoji}
          </span>
        ))}

        <div
          onClick={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}
        >
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                background: 'rgba(255,255,255,0.18)',
              }}
            />
            <span
              style={{
                fontSize: '72px',
                lineHeight: 1,
                display: 'inline-block',
                animation: 'fp-heart-pulse 1.4s ease-in-out infinite',
              }}
            >
              ❤️
            </span>
          </div>

          <h2
            style={{
              fontSize: '34px',
              fontWeight: 900,
              color: '#fff',
              margin: '0 0 12px',
              letterSpacing: '-0.5px',
            }}
          >
            {t.pinSuccess.title}
          </h2>
          <p
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.95)',
              margin: '0 0 28px',
              lineHeight: 1.4,
            }}
          >
            {t.pinSuccess.body}
          </p>

          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '22px 24px',
              marginBottom: '18px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            <p
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: TEAL_DARK,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                margin: '0 0 8px',
              }}
            >
              {t.pinSuccess.codeLabel}
            </p>
            <p
              style={{
                fontSize: '48px',
                fontWeight: 900,
                color: '#0B1F1D',
                letterSpacing: '8px',
                margin: 0,
              }}
            >
              {pin}
            </p>
          </div>

          <p
            style={{
              fontSize: '17px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.92)',
              margin: '0 0 32px',
              lineHeight: 1.4,
            }}
          >
            {t.pinSuccess.live.replace('{{pin}}', pin)}
          </p>

          <button
            onClick={onClose}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 48px',
              fontSize: '20px',
              fontWeight: 800,
              color: TEAL,
              cursor: 'pointer',
              minWidth: '200px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            {t.pinSuccess.btn}
          </button>
        </div>
      </div>
    </>
  )
}
