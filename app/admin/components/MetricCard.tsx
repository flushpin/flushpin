'use client'

import { adminTheme, cardStyle } from '../theme'
import type { MetricValue } from '@/lib/founderAnalyticsTypes'

type Props = {
  label: string
  metric?: MetricValue
  value?: number | null
  hint?: string
  accent?: boolean
  deltaPct?: number | null
  suffix?: string
}

function formatValue(value: number | null | undefined, suffix?: string): string {
  if (value == null || Number.isNaN(value)) return '—'
  const formatted = value.toLocaleString()
  return suffix ? `${formatted}${suffix}` : formatted
}

export default function MetricCard({
  label,
  metric,
  value,
  hint,
  accent = false,
  deltaPct,
  suffix,
}: Props) {
  const status = metric?.status ?? 'ready'
  const display =
    metric != null
      ? status === 'ready'
        ? formatValue(metric.value, suffix)
        : '—'
      : formatValue(value, suffix)
  const note =
    metric?.status === 'pending'
      ? 'Tracking coming soon'
      : metric?.status === 'unavailable'
        ? 'Connect traffic analytics to unlock'
        : metric?.note ?? hint

  return (
    <div
      style={{
        ...cardStyle({
          padding: accent ? '22px 22px 18px' : '18px 18px 16px',
          minHeight: accent ? 140 : 118,
          background: accent
            ? `linear-gradient(160deg, ${adminTheme.aquaSoft} 0%, #FFFFFF 55%)`
            : adminTheme.card,
          boxShadow: accent ? adminTheme.shadow : adminTheme.shadowSoft,
          position: 'relative',
          overflow: 'hidden',
        }),
      }}
    >
      {accent ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -40,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(0, 168, 134, 0.12)',
          }}
        />
      ) : null}
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: adminTheme.textMuted,
          marginBottom: 12,
          fontFamily: adminTheme.fontBody,
          position: 'relative',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: adminTheme.fontDisplay,
          fontSize: accent ? 40 : 30,
          fontWeight: 700,
          color: status === 'pending' ? adminTheme.pending : adminTheme.text,
          lineHeight: 1,
          position: 'relative',
          letterSpacing: '-0.03em',
        }}
      >
        {display}
      </div>
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          position: 'relative',
          minHeight: 18,
        }}
      >
        {typeof deltaPct === 'number' ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: deltaPct >= 0 ? adminTheme.success : adminTheme.danger,
              background: deltaPct >= 0 ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
              borderRadius: 999,
              padding: '2px 8px',
            }}
          >
            {deltaPct >= 0 ? '+' : ''}
            {deltaPct}% vs yesterday
          </span>
        ) : null}
        {note ? (
          <span style={{ fontSize: 12, color: adminTheme.textMuted, lineHeight: 1.35 }}>{note}</span>
        ) : null}
      </div>
    </div>
  )
}
