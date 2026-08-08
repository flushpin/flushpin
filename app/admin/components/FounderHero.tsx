'use client'

import { adminTheme, cardStyle, morningGreeting } from '../theme'

type Props = {
  healthScore: number
  healthLabel: string
  headline: string
  subline: string
  liveAccessViews: number
  investorMode: boolean
  updatedAt?: string
}

export default function FounderHero({
  healthScore,
  healthLabel,
  headline,
  subline,
  liveAccessViews,
  investorMode,
  updatedAt,
}: Props) {
  const greeting = morningGreeting()

  return (
    <section
      style={{
        ...cardStyle({
          padding: '28px 28px 24px',
          marginBottom: 22,
          background: adminTheme.bgHero,
          boxShadow: adminTheme.shadow,
          overflow: 'hidden',
          position: 'relative',
        }),
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 'auto -8% -40% auto',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,168,134,0.18) 0%, transparent 70%)',
        }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.5fr) minmax(180px, 0.7fr)',
          gap: 24,
          alignItems: 'center',
        }}
        className="founder-hero-grid"
      >
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.72)',
              border: `1px solid ${adminTheme.cardBorder}`,
              borderRadius: 999,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              color: adminTheme.tealDeep,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: adminTheme.teal,
                boxShadow: '0 0 0 4px rgba(0,168,134,0.18)',
              }}
            />
            Live product pulse · {liveAccessViews.toLocaleString()} access views today
            {investorMode ? ' · Investor view' : ''}
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: adminTheme.fontDisplay,
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: adminTheme.text,
              lineHeight: 1.05,
            }}
          >
            {greeting}. {headline}
          </h1>
          <p
            style={{
              margin: '12px 0 0',
              maxWidth: 540,
              fontSize: 16,
              lineHeight: 1.55,
              color: adminTheme.textSoft,
            }}
          >
            {subline}
          </p>
          {updatedAt ? (
            <div style={{ marginTop: 14, fontSize: 12, color: adminTheme.textMuted }}>
              Synced {new Date(updatedAt).toLocaleString()}
            </div>
          ) : null}
        </div>

        <div
          style={{
            ...cardStyle({
              padding: 22,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.88)',
              position: 'relative',
            }),
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: adminTheme.textMuted }}>
            PRODUCT HEALTH
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: adminTheme.fontDisplay,
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: '-0.05em',
              color: adminTheme.teal,
              lineHeight: 1,
            }}
          >
            {healthScore}
          </div>
          <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: adminTheme.tealDeep }}>
            {healthLabel}
          </div>
          <div
            style={{
              marginTop: 14,
              height: 8,
              borderRadius: 999,
              background: adminTheme.aquaSoft,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(8, healthScore))}%`,
                height: '100%',
                borderRadius: 999,
                background: `linear-gradient(90deg, ${adminTheme.teal} 0%, #34D399 100%)`,
              }}
            />
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .founder-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
