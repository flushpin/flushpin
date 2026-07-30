import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ensureCanonicalRestroomId } from '@/lib/ensureRestroom'
import { createUserSupabaseClient } from '@/lib/publishAccess'
import { toCanonicalRestroomId } from '@/lib/mapRestroomNavigation'

export const dynamic = 'force-dynamic'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20
const requestLog = new Map<string, number[]>()

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

function rateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (requestLog.get(key) ?? []).filter(
    (timestamp) => timestamp > now - RATE_LIMIT_WINDOW_MS,
  )
  if (recent.length >= RATE_LIMIT_MAX) {
    requestLog.set(key, recent)
    return true
  }
  recent.push(now)
  requestLog.set(key, recent)
  return false
}

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.json({ error: 'Supabase is not configured on the server.' }, { status: 503 })
  }

  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await authClient.auth.getUser(token)
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Invalid or expired session — please sign in again' }, { status: 401 })
  }

  let body: {
    id?: unknown
    name?: string
    address?: string
    lat?: number
    lng?: number
    type?: string
    source?: string
    place_id?: string
    google_place_id?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const lat = typeof body.lat === 'number' ? body.lat : Number(body.lat)
  const lng = typeof body.lng === 'number' ? body.lng : Number(body.lng)
  if (!name || name.length > 160 || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'name, lat, and lng are required' }, { status: 400 })
  }

  try {
    const db = createUserSupabaseClient(token)
    const restroomId = await ensureCanonicalRestroomId(
      db,
      {
        id: body.id,
        name,
        address: typeof body.address === 'string' ? body.address : '',
        lat,
        lng,
        type: typeof body.type === 'string' ? body.type : 'other',
        source: typeof body.source === 'string' ? body.source : 'google',
        place_id: body.place_id,
        google_place_id: body.google_place_id,
      },
      authData.user.id,
    )

    const canonical = toCanonicalRestroomId(restroomId)
    if (canonical == null) {
      return NextResponse.json({ error: 'Unable to resolve restroom' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, restroomId: canonical })
  } catch (err) {
    console.error('[ensure-restroom] failed:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'Unable to resolve restroom' }, { status: 500 })
  }
}
