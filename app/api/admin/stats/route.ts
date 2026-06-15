import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function parseTodayStart(searchParams: URLSearchParams): string {
  const raw = searchParams.get('todayStart')
  if (raw) {
    const d = new Date(raw)
    if (!Number.isNaN(d.getTime())) return d.toISOString()
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.toISOString()
}

async function countAuthUsers(todayStart: string) {
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
      if (user.created_at && new Date(user.created_at) >= new Date(todayStart)) {
        newMembersToday++
      }
    }

    if (data.users.length < 1000) break
    page++
  }

  return { totalMembers, newMembersToday }
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

  try {
    const [{ totalMembers, newMembersToday }, pinViewsTodayRes, totalPinViewsRes, recentLogsRes] =
      await Promise.all([
        countAuthUsers(todayStart),
        supabase
          .from('pin_views')
          .select('*', { count: 'exact', head: true })
          .gte('viewed_at', todayStart),
        supabase.from('pin_views').select('*', { count: 'exact', head: true }),
        supabase
          .from('admin_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
      ])

    const pinViewsToday = pinViewsTodayRes.error ? 0 : (pinViewsTodayRes.count ?? 0)
    const totalPinViews = totalPinViewsRes.error ? 0 : (totalPinViewsRes.count ?? 0)
    const recentAdminLogs = recentLogsRes.error ? [] : (recentLogsRes.data ?? [])

    return NextResponse.json({
      totalMembers,
      newMembersToday,
      pinViewsToday,
      totalPinViews,
      recentAdminLogs,
      warnings: [
        pinViewsTodayRes.error ? `pin_views: ${pinViewsTodayRes.error.message}` : null,
        totalPinViewsRes.error ? `pin_views total: ${totalPinViewsRes.error.message}` : null,
        recentLogsRes.error ? `admin_logs: ${recentLogsRes.error.message}` : null,
      ].filter(Boolean),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load admin stats'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
