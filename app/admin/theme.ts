export const adminTheme = {
  bg: '#0B1F1D',
  card: '#132E2B',
  cardBorder: 'rgba(14, 181, 171, 0.15)',
  teal: '#0EB5AB',
  tealMuted: 'rgba(14, 181, 171, 0.12)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.55)',
  textSoft: 'rgba(255, 255, 255, 0.75)',
  danger: '#F87171',
  warning: '#FBBF24',
  fontBody: "'Inter', system-ui, sans-serif",
  fontDisplay: "'Space Grotesk', 'Inter', system-ui, sans-serif",
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

export type AdminMember = {
  id: string
  email: string | null
  fullName: string | null
  provider: string | null
  createdAt: string | null
  lastSignInAt: string | null
  emailConfirmed: boolean
  bannedUntil: string | null
  isBanned: boolean
  isProtected: boolean
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
