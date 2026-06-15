import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 1000
const DEFAULT_HOURS = 24
const RECENT_MINUTES = 60

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

type RestroomRow = { id: number | string; lat: number | null; lng: number | null; name: string | null; address: string | null }

export async function GET(request: NextRequest) {
  const supabase = getServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' }, { status: 503 })
  }

  const hoursParam = Number(request.nextUrl.searchParams.get('hours'))
  const hours = Number.isFinite(hoursParam) && hoursParam > 0 ? Math.min(hoursParam, 168) : DEFAULT_HOURS
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  const recentCutoff = new Date(Date.now() - RECENT_MINUTES * 60 * 1000)

  try {
    const views: Array<{ id: number; user_id: string | null; restroom_id: string | number; viewed_at: string }> = []
    let from = 0

    while (true) {
      const { data, error } = await supabase
        .from('pin_views')
        .select('id, user_id, restroom_id, viewed_at')
        .gte('viewed_at', since.toISOString())
        .order('viewed_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)

      if (error) throw error
      if (!data?.length) break
      views.push(...data)
      from += data.length
      if (data.length < PAGE_SIZE) break
    }

    const restroomIds = [...new Set(views.map((v) => String(v.restroom_id)))]
    const restroomMap = new Map<string, RestroomRow>()

    for (let i = 0; i < restroomIds.length; i += 200) {
      const chunk = restroomIds.slice(i, i + 200)
      const { data, error } = await supabase
        .from('restroom')
        .select('id, lat, lng, name, address')
        .in('id', chunk)

      if (error) throw error
      for (const row of data ?? []) {
        restroomMap.set(String(row.id), row as RestroomRow)
      }
    }

    const points: Array<{
      id: string
      lat: number
      lng: number
      name: string
      address: string
      viewedAt: string
      userId: string
      isRecent: boolean
    }> = []

    for (const view of views) {
      const restroom = restroomMap.get(String(view.restroom_id))
      if (!restroom?.lat || !restroom?.lng) continue
      points.push({
        id: String(view.id),
        lat: restroom.lat,
        lng: restroom.lng,
        name: restroom.name || 'Unknown venue',
        address: restroom.address || '',
        viewedAt: view.viewed_at,
        userId: view.user_id || 'anonymous',
        isRecent: new Date(view.viewed_at) >= recentCutoff,
      })
    }

    const uniqueUsers = new Set(points.map((p) => p.userId).filter((id) => id !== 'anonymous')).size
    const uniqueVenues = new Set(points.map((p) => `${p.lat},${p.lng}`)).size
    const recentViews = points.filter((p) => p.isRecent).length

    return NextResponse.json({
      hours,
      recentMinutes: RECENT_MINUTES,
      summary: {
        totalViews: points.length,
        recentViews,
        uniqueUsers,
        uniqueVenues,
      },
      points,
      mapAttribution: '© OpenStreetMap contributors',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load live activity'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
