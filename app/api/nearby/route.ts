import { NextRequest, NextResponse } from 'next/server'
import { buildNearbyResponse, parseCoordinates } from '../../../lib/nearby'
import { getServiceClient } from '../../../lib/supabaseService'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 6
const requestLog = new Map<string, number[]>()

function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') || 'unknown'
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const hits = (requestLog.get(key) || []).filter((t) => t > windowStart)
  if (hits.length >= RATE_LIMIT_MAX) {
    requestLog.set(key, hits)
    return true
  }
  hits.push(now)
  requestLog.set(key, hits)
  return false
}

export async function GET(request: NextRequest) {
  const clientKey = getClientKey(request)
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  const { searchParams } = new URL(request.url)
  const coords = parseCoordinates(searchParams.get('lat'), searchParams.get('lng'))
  if ('error' in coords) {
    return NextResponse.json({ error: coords.error }, { status: 400 })
  }

  const googleApiKey = process.env.GOOGLE_MAPS_KEY
  if (!googleApiKey?.trim()) {
    console.error('[nearby] GOOGLE_MAPS_KEY is not configured')
    return NextResponse.json({ error: 'server_configuration_error' }, { status: 500 })
  }

  const service = getServiceClient()
  const supabase = 'client' in service ? (service.client ?? null) : null
  if ('error' in service) {
    console.warn('[nearby] service role unavailable — restroom overlay/cache disabled:', service.error)
  }

  try {
    const previewAudit =
      process.env.VERCEL_ENV === 'preview' && searchParams.get('debug') === '1'
    const targetName = searchParams.get('target')

    const response = await buildNearbyResponse(
      {
        lat: coords.lat,
        lng: coords.lng,
        previewAudit,
        targetName: targetName ?? undefined,
      },
      {
        googleFetch: fetch,
        supabase,
        now: () => Date.now(),
        googleApiKey: googleApiKey.trim(),
      },
    )
    return NextResponse.json(response)
  } catch (err) {
    console.error('[nearby] request failed:', err)
    return NextResponse.json({ error: 'places_unavailable' }, { status: 502 })
  }
}
