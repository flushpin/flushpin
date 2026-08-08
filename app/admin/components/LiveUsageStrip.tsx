'use client'

import { adminTheme, cardStyle } from '../theme'

type Props = {
  accessViews: number
  signedInActives: number
  contributions: number
  topCity?: string
}

export default function LiveUsageStrip({
  accessViews,
  signedInActives,
  contributions,
  topCity,
}: Props) {
  const items = [
    { label: 'People unlocking access', value: accessViews.toLocaleString() },
    { label: 'Signed-in explorers', value: signedInActives.toLocaleString() },
    { label: 'Community helps today', value: contributions.toLocaleString() },
    { label: 'Hottest venue city', value: topCity || '—' },
  ]

  return (
    <div
      style={{
        ...cardStyle({
          padding: 0,
          overflow: 'hidden',
          marginBottom: 22,
          background: `linear-gradient(90deg, ${adminTheme.tealDeep} 0%, ${adminTheme.teal} 55%, #12C4A0 100%)`,
          border: 'none',
          color: '#FFFFFF',
        }),
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 0,
        }}
        className="live-usage-grid"
      >
        {items.map((item, index) => (
          <div
            key={item.label}
            style={{
              padding: '20px 18px',
              borderLeft: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.18)',
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.82, fontWeight: 600 }}>{item.label}</div>
            <div
              style={{
                marginTop: 8,
                fontFamily: adminTheme.fontDisplay,
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '-0.03em',
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .live-usage-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .live-usage-grid > div:nth-child(3),
          .live-usage-grid > div:nth-child(4) {
            border-top: 1px solid rgba(255,255,255,0.18);
          }
        }
        @media (max-width: 520px) {
          .live-usage-grid {
            grid-template-columns: 1fr !important;
          }
          .live-usage-grid > div {
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.18);
          }
          .live-usage-grid > div:first-child {
            border-top: none !important;
          }
        }
      `}</style>
    </div>
  )
}
