import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 1000

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function parseTodayStart(searchParams: URLSearchParams): Date {
  const raw = searchParams.get('todayStart')
  if (raw) {
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) return d
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function last7DayKeys(): string[] {
  const keys: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    keys.push(d.toLocaleDateString('en-CA'))
  }
  return keys
}

function formatChartLabel(ymd: string): string {
  const d = new Date(`${ymd}T12:00:00`)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function emptyDaySeries() {
  return last7DayKeys().map((date) => ({ date, label: formatChartLabel(date), count: 0 }))
}

function countByDay(rows: { ts: string }[], dayKeys: string[]) {
  const map = Object.fromEntries(dayKeys.map((k) => [k, 0])) as Record<string, number>
  for (const row of rows) {
    const key = new Date(row.ts).toLocaleDateString('en-CA')
    if (key in map) map[key]++
  }
  return dayKeys.map((date) => ({ date, label: formatChartLabel(date), count: map[date] }))
}

async function countAuthUsers(todayStart: Date) {
  const supabase = getServiceClient()
  if (!supabase) return { totalMembers: 0, newMembersToday: 0 }

  let totalMembers = 0
  let newMembersToday = 0
  let page = 1

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    for (const user of data.users) {
      totalMembers++
      if (user.created_at && new Date(user.created_at) >= todayStart) newMembersToday++
    }
    if (data.users.length < 1000) break
    page++
  }

  return { totalMembers, newMembersToday }
}

async function fetchPinViewsSince(since: Date) {
  const supabase = getServiceClient()!
  const rows: { ts: string }[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('pin_views')
      .select('viewed_at')
      .gte('viewed_at', since.toISOString())
      .order('viewed_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw error
    if (!data?.length) break

    for (const row of data) {
      if (row.viewed_at) rows.push({ ts: row.viewed_at })
    }

    from += data.length
    if (data.length < PAGE_SIZE) break
  }

  return rows
}

async function fetchRestroomCreatedSince(since: Date) {
  const supabase = getServiceClient()!
  const rows: { ts: string }[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('restroom')
      .select('created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw error
    if (!data?.length) break

    for (const row of data) {
      if (row.created_at) rows.push({ ts: row.created_at })
    }

    from += data.length
    if (data.length < PAGE_SIZE) break
  }

  return rows
}

export async function GET(request: NextRequest) {
  const supabase = getServiceClient()
  if (!supabase) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' },
      { status: 503 },
    )
  }

  const todayStart = parseTodayStart(request.nextUrl.searchParams)
  const dayKeys = last7DayKeys()
  const weekStart = new Date(`${dayKeys[0]}T00:00:00`)

  try {
    const [
      authStats,
      totalRestroomsRes,
      pinViewsTodayRes,
      totalPinViewsRes,
      flaggedRes,
      recentRestroomsRes,
      recentLogsRes,
      pinViewRows,
      restroomRows,
    ] = await Promise.all([
      countAuthUsers(todayStart),
      supabase.from('restroom').select('*', { count: 'exact', head: true }),
      supabase.from('pin_views').select('*', { count: 'exact', head: true }).gte('viewed_at', todayStart.toISOString()),
      supabase.from('pin_views').select('*', { count: 'exact', head: true }),
      supabase.from('flagged_content').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase
        .from('restroom')
        .select('id, name, address, pin, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(10),
      fetchPinViewsSince(weekStart),
      fetchRestroomCreatedSince(weekStart),
    ])

    return NextResponse.json({
      totalRestrooms: totalRestroomsRes.count ?? 0,
      totalMembers: authStats.totalMembers,
      newMembersToday: authStats.newMembersToday,
      pinViewsToday: pinViewsTodayRes.count ?? 0,
      totalPinViews: totalPinViewsRes.count ?? 0,
      flaggedPending: flaggedRes.count ?? 0,
      pinViewsByDay: countByDay(pinViewRows, dayKeys),
      restroomsByDay: countByDay(restroomRows, dayKeys),
      recentRestrooms: recentRestroomsRes.data ?? [],
      recentAdminLogs: recentLogsRes.data ?? [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load admin dashboard data'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
