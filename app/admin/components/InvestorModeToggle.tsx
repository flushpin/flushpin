'use client'

import { adminTheme } from '../theme'

type Props = {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export default function InvestorModeToggle({ enabled, onChange }: Props) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        userSelect: 'none',
        fontFamily: adminTheme.fontBody,
        fontSize: 13,
        color: enabled ? adminTheme.tealDeep : adminTheme.textSoft,
        background: enabled ? adminTheme.tealMuted : 'rgba(255,255,255,0.7)',
        border: `1px solid ${adminTheme.cardBorder}`,
        borderRadius: 999,
        padding: '8px 14px',
        fontWeight: 600,
      }}
    >
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: adminTheme.teal, width: 15, height: 15 }}
      />
      Investor view
    </label>
  )
}
