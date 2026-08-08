'use client'

import { adminTheme, btnStyle, cardStyle } from '../theme'

type Props = {
  email?: string | null
  onSignOut: () => void
}

export default function AccessDenied({ email, onSignOut }: Props) {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ ...cardStyle(), padding: 32, maxWidth: 460, width: '100%', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: adminTheme.fontDisplay,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: adminTheme.teal,
            marginBottom: 12,
          }}
        >
          FLUSHPIN
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: adminTheme.fontDisplay,
            fontSize: 28,
            letterSpacing: '-0.03em',
            color: adminTheme.text,
          }}
        >
          Access Denied
        </h1>
        <p style={{ margin: '12px 0 0', fontSize: 15, lineHeight: 1.55, color: adminTheme.textSoft }}>
          You are signed in{email ? ` as ${email}` : ''}, but this account is not authorized to open the
          Founder Dashboard.
        </p>
        <p style={{ margin: '10px 0 0', fontSize: 13, color: adminTheme.textMuted }}>
          Only allowlisted founder accounts can view FlushPin usage data.
        </p>
        <button
          type="button"
          onClick={onSignOut}
          style={{ ...btnStyle('primary'), marginTop: 22, width: '100%' }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
