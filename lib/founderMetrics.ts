/**
 * Server-only FlushPin product metrics for the Founder Analytics Dashboard.
 * Never import this from client components.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { DayCount, MetricValue } from './founderAnalyticsTypes'
import { AMENITY_REPORT_TYPES } from './restroomAmenities'

export type { DayCount, MetricValue }

export type ProductMetrics = {
  today: {
    newRegisteredUsers: number
    signedInActiveUsers: number
    accessViews: number
    communityContributions: number
    restroomSearches: MetricValue
    restroomDetailViews: MetricValue
    appStoreClicks: MetricValue
  }
  trends: {
    newUsers7d: DayCount[]
    newUsers30d: DayCount[]
    accessViews7d: DayCount[]
    accessViews30d: DayCount[]
    contributions7d: DayCount[]
    contributions30d: DayCount[]
  }
  geography: {
    topCities: Array<{ name: string; accessViews: number }>
    topRestrooms: Array<{ name: string; city: string | null; accessViews: number }>
  }
  community: {
    codesAdded: number
    accessRulesAdded: number
    codeChangedReports: number
    accessibilityUpdates: number
    babyChangingUpdates: number
    verifiedContributions: number
  }
  business: {
    offerViews: number
    continueToAccessClicks: number
    qrRedemptions: MetricValue
    conversionRate: number | null
  }
}

const PAGE_SIZE = 1000
const PENDING_EVENTS: MetricValue = {
  value: null,
  status: 'pending',
  note: 'Requires analytics_events (proposed; not applied yet)',
}

function assertServerRuntime(): void {
  if (typeof window !== 'undefined') {
    throw new Error('founderMetrics cannot run in the browser')
  }
}

function startOfLocalDay(d = new Date()): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

function dayKeys(days: number): string[] {
  const keys: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = startOfLocalDay()
    d.setDate(d.getDate() - i)
    keys.push(d.toLocaleDateString('en-CA'))
  }
  return keys
}

function formatChartLabel(ymd: string): string {
  const d = new Date(`${ymd}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function countByDay(timestamps: string[], keys: string[]): DayCount[] {
  const map = Object.fromEntries(keys.map((k) => [k, 0])) as Record<string, number>
  for (const ts of timestamps) {
    const key = new Date(ts).toLocaleDateString('en-CA')
    if (key in map) map[key]++
  }
  return keys.map((date) => ({ date, label: formatChartLabel(date), count: map[date] }))
}

async function paginateSelect<T>(
  fetchPage: (from: number, to: number) => Promise<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = []
  let from = 0
  while (true) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)
    if (!data?.length) break
    rows.push(...data)
    from += data.length
    if (data.length < PAGE_SIZE) break
  }
  return rows
}

async function countAuthUsers(
  supabase: SupabaseClient,
  todayStart: Date,
  since7: Date,
  since30: Date,
) {
  let totalMembers = 0
  let newMembersToday = 0
  const createdAts: string[] = []
  let page = 1

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    for (const user of data.users) {
      totalMembers++
      if (!user.created_at) continue
      const created = new Date(user.created_at)
      if (created >= todayStart) newMembersToday++
      if (created >= since30) createdAts.push(user.created_at)
    }
    if (data.users.length < 1000) break
    page++
  }

  return {
    totalMembers,
    newMembersToday,
    newUsers7d: countByDay(createdAts.filter((ts) => new Date(ts) >= since7), dayKeys(7)),
    newUsers30d: countByDay(createdAts, dayKeys(30)),
  }
}

async function fetchPinViewRows(
  supabase: SupabaseClient,
  since: Date,
): Promise<Array<{ viewed_at: string; user_id: string | null; restroom_id: number | string | null }>> {
  return paginateSelect(async (from, to) => {
    const { data, error } = await supabase
      .from('pin_views')
      .select('viewed_at, user_id, restroom_id')
      .gte('viewed_at', since.toISOString())
      .order('viewed_at', { ascending: true })
      .range(from, to)
    return { data, error }
  })
}

async function fetchSubmissionRows(
  supabase: SupabaseClient,
  since: Date,
): Promise<Array<{ created_at: string; submitted_pin: string | null; access_type: string | null; status: string | null }>> {
  return paginateSelect(async (from, to) => {
    const { data, error } = await supabase
      .from('pin_submissions')
      .select('created_at, submitted_pin, access_type, status')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })
      .range(from, to)
    return { data, error }
  })
}

async function fetchReportRows(
  supabase: SupabaseClient,
  since: Date,
): Promise<Array<{ created_at: string; report_type: string | null }>> {
  return paginateSelect(async (from, to) => {
    const { data, error } = await supabase
      .from('restroom_reports')
      .select('created_at, report_type')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })
      .range(from, to)
    return { data, error }
  })
}

async function fetchFeedbackRows(
  supabase: SupabaseClient,
  since: Date,
): Promise<Array<{ created_at: string }>> {
  return paginateSelect(async (from, to) => {
    const { data, error } = await supabase
      .from('pin_feedback')
      .select('created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })
      .range(from, to)
    return { data, error }
  })
}

async function topCitiesFromPinViews(
  supabase: SupabaseClient,
  pinViews: Array<{ restroom_id: number | string | null }>,
): Promise<Array<{ name: string; accessViews: number }>> {
  const counts = new Map<string, number>()
  for (const row of pinViews) {
    if (row.restroom_id == null) continue
    const id = String(row.restroom_id)
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  const ids = [...counts.keys()].slice(0, 200)
  if (!ids.length) return []

  const { data, error } = await supabase.from('restroom').select('id, city').in('id', ids)
  if (error) throw new Error(error.message)

  const cityCounts = new Map<string, number>()
  for (const room of data ?? []) {
    const city = (room.city as string | null)?.trim() || 'Unknown'
    const views = counts.get(String(room.id)) ?? 0
    cityCounts.set(city, (cityCounts.get(city) ?? 0) + views)
  }

  return [...cityCounts.entries()]
    .map(([name, accessViews]) => ({ name, accessViews }))
    .sort((a, b) => b.accessViews - a.accessViews)
    .slice(0, 10)
}

async function topRestroomsFromPinViews(
  supabase: SupabaseClient,
  pinViews: Array<{ restroom_id: number | string | null }>,
): Promise<Array<{ name: string; city: string | null; accessViews: number }>> {
  const counts = new Map<string, number>()
  for (const row of pinViews) {
    if (row.restroom_id == null) continue
    const id = String(row.restroom_id)
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
  if (!ranked.length) return []

  const { data, error } = await supabase
    .from('restroom')
    .select('id, name, city')
    .in(
      'id',
      ranked.map(([id]) => id),
    )
  if (error) throw new Error(error.message)

  const byId = new Map((data ?? []).map((row) => [String(row.id), row]))
  return ranked.map(([id, accessViews]) => {
    const room = byId.get(id)
    return {
      name: ((room?.name as string | null)?.trim() || `Location ${id}`),
      city: ((room?.city as string | null)?.trim() || null),
      accessViews,
    }
  })
}

export async function collectProductMetrics(supabase: SupabaseClient): Promise<ProductMetrics> {
  assertServerRuntime()

  const todayStart = startOfLocalDay()
  const since7 = startOfLocalDay()
  since7.setDate(since7.getDate() - 6)
  const since30 = startOfLocalDay()
  since30.setDate(since30.getDate() - 29)

  const [
    authStats,
    pinViewsTodayRes,
    pinViewRows30,
    submissionRows30,
    reportRows30,
    feedbackRows30,
    promotionRes,
    verifiedApprovedRes,
  ] = await Promise.all([
    countAuthUsers(supabase, todayStart, since7, since30),
    supabase
      .from('pin_views')
      .select('*', { count: 'exact', head: true })
      .gte('viewed_at', todayStart.toISOString()),
    fetchPinViewRows(supabase, since30),
    fetchSubmissionRows(supabase, since30),
    fetchReportRows(supabase, since30),
    fetchFeedbackRows(supabase, since30),
    supabase.from('promotion').select('views, clicks'),
    supabase
      .from('pin_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),
  ])

  const pinViewsToday = pinViewRows30.filter((r) => new Date(r.viewed_at) >= todayStart)
  const signedInActiveUsers = new Set(
    pinViewsToday.map((r) => r.user_id).filter((id): id is string => Boolean(id)),
  ).size

  const submissionsToday = submissionRows30.filter((r) => new Date(r.created_at) >= todayStart)
  const reportsToday = reportRows30.filter((r) => new Date(r.created_at) >= todayStart)
  const feedbackToday = feedbackRows30.filter((r) => new Date(r.created_at) >= todayStart)
  const communityContributions =
    submissionsToday.length + reportsToday.length + feedbackToday.length

  const contributionTimestamps = [
    ...submissionRows30.map((r) => r.created_at),
    ...reportRows30.map((r) => r.created_at),
    ...feedbackRows30.map((r) => r.created_at),
  ]

  const codesAdded = submissionRows30.filter((r) => Boolean(r.submitted_pin?.trim())).length
  const accessRulesAdded = submissionRows30.filter((r) => Boolean(r.access_type?.trim())).length
  const accessibilityUpdates = reportRows30.filter((r) => {
    const t = r.report_type ?? ''
    return t === AMENITY_REPORT_TYPES.accessible_yes || t === AMENITY_REPORT_TYPES.accessible_no || t.includes('accessible')
  }).length
  const babyChangingUpdates = reportRows30.filter((r) => {
    const t = r.report_type ?? ''
    return t === AMENITY_REPORT_TYPES.baby_yes || t === AMENITY_REPORT_TYPES.baby_no || t.includes('baby')
  }).length

  const offerViews = (promotionRes.data ?? []).reduce((sum, row) => sum + Number(row.views ?? 0), 0)
  const continueToAccessClicks = (promotionRes.data ?? []).reduce(
    (sum, row) => sum + Number(row.clicks ?? 0),
    0,
  )
  const conversionRate =
    offerViews > 0 ? Math.round((continueToAccessClicks / offerViews) * 1000) / 10 : null

  const topCities = await topCitiesFromPinViews(supabase, pinViewRows30)
  const topRestrooms = await topRestroomsFromPinViews(supabase, pinViewRows30)

  void pinViewsTodayRes
  void authStats.totalMembers

  return {
    today: {
      newRegisteredUsers: authStats.newMembersToday,
      signedInActiveUsers,
      accessViews: pinViewsToday.length || (pinViewsTodayRes.count ?? 0),
      communityContributions,
      restroomSearches: PENDING_EVENTS,
      restroomDetailViews: PENDING_EVENTS,
      appStoreClicks: PENDING_EVENTS,
    },
    trends: {
      newUsers7d: authStats.newUsers7d,
      newUsers30d: authStats.newUsers30d,
      accessViews7d: countByDay(
        pinViewRows30.filter((r) => new Date(r.viewed_at) >= since7).map((r) => r.viewed_at),
        dayKeys(7),
      ),
      accessViews30d: countByDay(
        pinViewRows30.map((r) => r.viewed_at),
        dayKeys(30),
      ),
      contributions7d: countByDay(
        contributionTimestamps.filter((ts) => new Date(ts) >= since7),
        dayKeys(7),
      ),
      contributions30d: countByDay(contributionTimestamps, dayKeys(30)),
    },
    geography: { topCities, topRestrooms },
    community: {
      codesAdded,
      accessRulesAdded,
      codeChangedReports: feedbackRows30.length,
      accessibilityUpdates,
      babyChangingUpdates,
      verifiedContributions: verifiedApprovedRes.count ?? 0,
    },
    business: {
      offerViews,
      continueToAccessClicks,
      qrRedemptions: PENDING_EVENTS,
      conversionRate,
    },
  }
}

export function vercelDayToChart(
  rows: Array<{ timestamp: string; visitors: number }>,
  keys: string[],
): DayCount[] {
  const map = Object.fromEntries(keys.map((k) => [k, 0])) as Record<string, number>
  for (const row of rows) {
    if (!row.timestamp) continue
    const key = new Date(row.timestamp).toLocaleDateString('en-CA')
    if (key in map) map[key] = row.visitors
  }
  return keys.map((date) => ({ date, label: formatChartLabel(date), count: map[date] }))
}

export { dayKeys }
