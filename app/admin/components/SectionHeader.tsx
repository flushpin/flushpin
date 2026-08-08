'use client'

import type { ReactNode } from 'react'
import { adminTheme } from '../theme'

type Props = {
  eyebrow: string
  title: string
  description?: string
  action?: ReactNode
}

export default function SectionHeader({ eyebrow, title, description, action }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 16,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: adminTheme.teal,
            marginBottom: 6,
          }}
        >
          {eyebrow}
        </div>
        <h2
          style={{
            margin: 0,
            fontFamily: adminTheme.fontDisplay,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: adminTheme.text,
          }}
        >
          {title}
        </h2>
        {description ? (
          <p style={{ margin: '6px 0 0', fontSize: 14, color: adminTheme.textMuted, maxWidth: 560 }}>
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
