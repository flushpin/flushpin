'use client'

import { adminTheme, cardStyle } from '../theme'

type Props = {
  visitors7d: number
  newUsers7d: number
  accessViews7d: number
  contributions7d: number
  conversionRate: number | null
  topCountry?: string
}

export default function InvestorSnapshot({
  visitors7d,
  newUsers7d,
  accessViews7d,
  contributions7d,
  conversionRate,
  topCountry,
}: Props) {
  const rows = [
    { label: '7-day visitors', value: visitors7d.toLocaleString() },
    { label: '7-day new members', value: newUsers7d.toLocaleString() },
    { label: '7-day access unlocks', value: accessViews7d.toLocaleString() },
    { label: '7-day community actions', value: contributions7d.toLocaleString() },
    {
      label: 'Offer conversion',
      value: conversionRate != null ? `${conversionRate}%` : '—',
    },
    { label: 'Top country', value: topCountry || '—' },
  ]

  return (
    <section style={{ ...cardStyle({ padding: 24, marginBottom: 28 }), background: '#FFFFFF' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: adminTheme.teal }}>
        INVESTOR-READY
      </div>
      <h2
        style={{
          margin: '8px 0 6px',
          fontFamily: adminTheme.fontDisplay,
          fontSize: 24,
          letterSpacing: '-0.03em',
          color: adminTheme.text,
        }}
      >
        The story in one glance
      </h2>
      <p style={{ margin: '0 0 18px', fontSize: 14, color: adminTheme.textMuted, maxWidth: 640 }}>
        Aggregated traction only — no raw user data, no precise locations, no operational noise.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
        }}
      >
        {rows.map((row) => (
          <div
            key={row.label}
            style={{
              background: adminTheme.bg,
              borderRadius: 16,
              padding: '16px 14px',
              border: `1px solid ${adminTheme.cardBorder}`,
            }}
          >
            <div style={{ fontSize: 12, color: adminTheme.textMuted, fontWeight: 600 }}>{row.label}</div>
            <div
              style={{
                marginTop: 8,
                fontFamily: adminTheme.fontDisplay,
                fontSize: 24,
                fontWeight: 700,
                color: adminTheme.text,
                letterSpacing: '-0.03em',
              }}
            >
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
