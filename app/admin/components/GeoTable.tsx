'use client'

import { adminTheme, cardStyle } from '../theme'

type Row = {
  label: string
  primary: number
  secondary?: number
}

type Props = {
  title: string
  primaryHeader: string
  secondaryHeader?: string
  rows: Row[]
  emptyLabel?: string
}

export default function GeoTable({
  title,
  primaryHeader,
  secondaryHeader,
  rows,
  emptyLabel = 'No data yet',
}: Props) {
  return (
    <div style={{ ...cardStyle(), padding: 20, overflow: 'hidden' }}>
      <h3
        style={{
          margin: '0 0 14px',
          fontFamily: adminTheme.fontDisplay,
          fontSize: 16,
          fontWeight: 700,
          color: adminTheme.text,
        }}
      >
        {title}
      </h3>
      {!rows.length ? (
        <div style={{ color: adminTheme.textMuted, fontSize: 14, padding: '24px 0' }}>{emptyLabel}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: adminTheme.fontBody }}>
            <thead>
              <tr style={{ textAlign: 'left', color: adminTheme.textMuted, fontSize: 12 }}>
                <th style={{ padding: '8px 0', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '8px 0', fontWeight: 600 }}>{primaryHeader}</th>
                {secondaryHeader ? (
                  <th style={{ padding: '8px 0', fontWeight: 600 }}>{secondaryHeader}</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} style={{ borderTop: `1px solid ${adminTheme.cardBorder}` }}>
                  <td style={{ padding: '10px 0', color: adminTheme.text, fontWeight: 600 }}>{row.label}</td>
                  <td style={{ padding: '10px 0', color: adminTheme.tealDeep }}>
                    {row.primary.toLocaleString()}
                  </td>
                  {secondaryHeader ? (
                    <td style={{ padding: '10px 0', color: adminTheme.textSoft }}>
                      {(row.secondary ?? 0).toLocaleString()}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
