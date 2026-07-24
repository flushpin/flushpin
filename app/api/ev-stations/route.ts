import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const MAX_RADIUS_KM = 40
const MAX_ROWS = 2000

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = Number(searchParams.get('lat'))
  const lng = Number(searchParams.get('lng'))
  const radiusKm = Math.min(Number(searchParams.get('radiusKm')) || 20, MAX_RADIUS_KM)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ stations: [], error: 'lat/lng required' }, { status: 400 })
  }

  const dLat = radiusKm / 111
  const dLng = radiusKm / (111 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01))

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false },
    })

    const { data, error } = await supabase
      .from('ev_stations')
      .select('ocm_id, network, lat, lng')
      .eq('is_operational', true)
      .gte('lat', lat - dLat)
      .lte('lat', lat + dLat)
      .gte('lng', lng - dLng)
      .lte('lng', lng + dLng)
      .limit(MAX_ROWS)

    if (error) {
      console.error('[ev-stations]', error.message)
      return NextResponse.json({ stations: [] }, { status: 200 })
    }

    const stations = (data ?? []).map((r) => ({
      stationId: r.ocm_id,
      operatorName: r.network ?? undefined,
      latitude: r.lat,
      longitude: r.lng,
    }))

    return NextResponse.json(
      { stations, count: stations.length },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    )
  } catch (e) {
    console.error('[ev-stations] fail:', e)
    return NextResponse.json({ stations: [] }, { status: 200 })
  }
}
