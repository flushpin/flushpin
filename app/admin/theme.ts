import type { CSSProperties } from 'react'

export const adminTheme = {
  bg: '#F7FCFA',
  bgSoft: '#E6F7F2',
  bgHero: 'linear-gradient(135deg, #E8FBF5 0%, #F7FCFA 42%, #FFFFFF 100%)',
  card: '#FFFFFF',
  cardBorder: 'rgba(0, 168, 134, 0.12)',
  teal: '#00A886',
  tealDeep: '#007A62',
  tealMuted: 'rgba(0, 168, 134, 0.10)',
  aqua: '#B8EDE3',
  aquaSoft: '#D8F5EE',
  text: '#142421',
  textMuted: 'rgba(20, 36, 33, 0.52)',
  textSoft: 'rgba(20, 36, 33, 0.72)',
  danger: '#DC2626',
  warning: '#D97706',
  pending: '#7A8683',
  success: '#059669',
  fontBody: 'var(--font-admin-inter), Inter, system-ui, sans-serif',
  fontDisplay: 'var(--font-admin-display), Space Grotesk, Inter, system-ui, sans-serif',
  shadow: '0 10px 40px rgba(0, 122, 98, 0.07)',
  shadowSoft: '0 4px 18px rgba(0, 122, 98, 0.05)',
  radius: 20,
} as const

export type DayCount = { date: string; label: string; count: number }

export type DashboardMetrics = {
  totalRestrooms: number
  totalMembers: number
  newMembersToday: number
  pinViewsToday: number
  totalPinViews: number
  flaggedPending: number
  pinViewsByDay: DayCount[]
  restroomsByDay: DayCount[]
  recentRestrooms: Array<{
    id: number | string
    name: string | null
    address: string | null
    pin: string | null
    created_at: string | null
  }>
  recentAdminLogs: Array<{
    id: number | string
    action: string
    target_type?: string | null
    created_at: string
  }>
}

export type LiveActivityPoint = {
  id: string
  lat: number
  lng: number
  name: string
  address: string
  viewedAt: string
  userId: string
  isRecent: boolean
}

export type LiveActivityPayload = {
  hours: number
  recentMinutes: number
  summary: {
    totalViews: number
    recentViews: number
    uniqueUsers: number
    uniqueVenues: number
  }
  points: LiveActivityPoint[]
  mapAttribution: string
}

export function cardStyle(extra?: CSSProperties): CSSProperties {
  return {
    background: adminTheme.card,
    border: `1px solid ${adminTheme.cardBorder}`,
    borderRadius: adminTheme.radius,
    boxShadow: adminTheme.shadowSoft,
    ...extra,
  }
}

export function btnStyle(variant: 'primary' | 'ghost' | 'danger' | 'quiet' = 'ghost'): CSSProperties {
  if (variant === 'primary') {
    return {
      background: adminTheme.teal,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: 999,
      padding: '10px 18px',
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: adminTheme.fontBody,
      fontSize: 13,
      boxShadow: '0 8px 20px rgba(0, 168, 134, 0.25)',
    }
  }
  if (variant === 'danger') {
    return {
      background: 'transparent',
      color: adminTheme.danger,
      border: '1px solid rgba(220, 38, 38, 0.18)',
      borderRadius: 999,
      padding: '8px 14px',
      cursor: 'pointer',
      fontSize: 12,
      fontFamily: adminTheme.fontBody,
    }
  }
  if (variant === 'quiet') {
    return {
      background: 'transparent',
      color: adminTheme.textMuted,
      border: 'none',
      borderRadius: 999,
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: 13,
      fontFamily: adminTheme.fontBody,
    }
  }
  return {
    background: adminTheme.tealMuted,
    color: adminTheme.tealDeep,
    border: `1px solid ${adminTheme.cardBorder}`,
    borderRadius: 999,
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: adminTheme.fontBody,
    fontWeight: 600,
  }
}

/** Compare last day vs previous day in a series for a simple momentum cue. */
export function seriesDelta(data: DayCount[]): { delta: number; pct: number | null } {
  if (data.length < 2) return { delta: 0, pct: null }
  const latest = data[data.length - 1]?.count ?? 0
  const prev = data[data.length - 2]?.count ?? 0
  const delta = latest - prev
  const pct = prev === 0 ? (latest > 0 ? 100 : null) : Math.round((delta / prev) * 100)
  return { delta, pct }
}

export function sumSeries(data: DayCount[]): number {
  return data.reduce((sum, row) => sum + row.count, 0)
}

export function morningGreeting(now = new Date()): string {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
