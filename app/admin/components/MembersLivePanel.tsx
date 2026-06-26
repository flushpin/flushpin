'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { adminTheme } from '../theme'

type MemberRow = {
  id: string
  email: string | null
  created_at: string | null
  provider: string
}

type MembersPayload = {
  totalMembers: number
  joinedToday: number
  members: MemberRow[]
  loadedAt: string
  error?: string
}

function cardStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: adminTheme.card,
    border: `1px solid ${adminTheme.cardBorder}`,
    borderRadius: 16,
    ...extra,
  }
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—'
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function providerLabel(provider: string) {
  const value = provider.toLowerCase()
  if (value.includes('google')) return 'google'
  if (value.includes('apple')) return 'apple'
  return 'email'
}

export default function MembersLivePanel() {
  const [totalMembers, setTotalMembers] = useState(0)
  const [joinedToday, setJoinedToday] = useState(0)
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(0)
  const countAnimRef = useRef<number | null>(null)

  const animateCount = useCallback((target: number) => {
    if (countAnimRef.current != null) {
      cancelAnimationFrame(countAnimRef.current)
    }
    const start = displayCount
    const delta = target - start
    if (delta === 0) return
    const started = performance.now()
    const duration = 420

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration)
      const eased = 1 - (1 - progress) ** 3
      setDisplayCount(Math.round(start + delta * eased))
      if (progress < 1) {
        countAnimRef.current = requestAnimationFrame(tick)
      } else {
        countAnimRef.current = null
      }
    }

    countAnimRef.current = requestAnimationFrame(tick)
  }, [displayCount])

  const applyPayload = useCallback((payload: MembersPayload, highlightNewest = false) => {
    setTotalMembers(payload.totalMembers)
    setJoinedToday(payload.joinedToday)
    setMembers(payload.members)
    animateCount(payload.totalMembers)
    if (highlightNewest && payload.members[0]?.id) {
      setHighlightId(payload.members[0].id)
      window.setTimeout(() => setHighlightId(null), 3200)
    }
  }, [animateCount])

  const loadMembers = useCallback(async (highlightNewest = false) => {
    try {
      const res = await fetch('/admin/users')
      const json = (await res.json().catch(() => null)) as MembersPayload | null
      if (!res.ok || !json) {
        setError(json?.error || `Members unavailable (HTTP ${res.status})`)
        return
      }
      setError(null)
      applyPayload(json, highlightNewest)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }, [applyPayload])

  useEffect(() => {
    loadMembers(false)
    const interval = window.setInterval(() => loadMembers(false), 60_000)
    return () => window.clearInterval(interval)
  }, [loadMembers])

  useEffect(() => () => {
    if (countAnimRef.current != null) cancelAnimationFrame(countAnimRef.current)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section style={{ ...cardStyle(), padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                fontFamily: adminTheme.fontDisplay,
                fontSize: 56,
                fontWeight: 800,
                color: adminTheme.teal,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                transition: 'transform 0.25s ease',
              }}
            >
              {displayCount.toLocaleString()}
            </div>
            <div style={{ fontFamily: adminTheme.fontDisplay, fontSize: 22, fontWeight: 700, color: adminTheme.textSoft, marginTop: 8 }}>
              Members
            </div>
            <div style={{ fontSize: 14, color: adminTheme.textMuted, marginTop: 10, fontWeight: 600 }}>
              ↑ {joinedToday.toLocaleString()} joined today
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadMembers(false)}
            disabled={loading}
            style={{
              background: adminTheme.tealMuted,
              color: adminTheme.teal,
              border: `1px solid ${adminTheme.cardBorder}`,
              borderRadius: 10,
              padding: '10px 16px',
              cursor: loading ? 'wait' : 'pointer',
              fontFamily: adminTheme.fontBody,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {error ? (
          <div
            style={{
              marginTop: 18,
              background: 'rgba(248, 113, 113, 0.12)',
              border: '1px solid rgba(248, 113, 113, 0.35)',
              borderRadius: 12,
              padding: 12,
              color: adminTheme.danger,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}
      </section>

      <section style={{ ...cardStyle(), padding: 20, overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 14px', fontFamily: adminTheme.fontDisplay, fontSize: 16, fontWeight: 700 }}>
          Latest members
        </h3>
        {loading && members.length === 0 ? (
          <div style={{ color: adminTheme.textMuted, fontSize: 13 }}>Loading members…</div>
        ) : members.length === 0 ? (
          <div style={{ color: adminTheme.textMuted, fontSize: 13 }}>No members yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: adminTheme.textMuted, textAlign: 'left' }}>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>#</th>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Joined</th>
                <th style={{ padding: '8px 6px', fontWeight: 600 }}>Provider</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => {
                const isHighlighted = highlightId === member.id
                return (
                  <tr
                    key={member.id}
                    style={{
                      borderTop: `1px solid ${adminTheme.cardBorder}`,
                      background: isHighlighted ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                      transition: 'background 0.45s ease',
                    }}
                  >
                    <td style={{ padding: '12px 6px', color: adminTheme.textMuted, fontWeight: 700 }}>{index + 1}</td>
                    <td style={{ padding: '12px 6px', color: adminTheme.teal, fontWeight: 600 }}>{member.email || '—'}</td>
                    <td style={{ padding: '12px 6px', color: adminTheme.textMuted, whiteSpace: 'nowrap' }}>
                      {relativeTime(member.created_at)}
                    </td>
                    <td style={{ padding: '12px 6px', color: adminTheme.textSoft, textTransform: 'lowercase' }}>
                      {providerLabel(member.provider)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ ...cardStyle(), padding: 18 }}>
        <div style={{ color: adminTheme.textMuted, fontSize: 12, lineHeight: 1.6 }}>
          Member list refreshes automatically every 60 seconds from Supabase Auth via <code style={{ color: adminTheme.teal }}>/admin/users</code>.
        </div>
      </section>
    </div>
  )
}
