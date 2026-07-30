import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { persistRestroomAmenities } from '@/lib/persistRestroomAmenities'
import {
  isRestroomAvailability,
  RESTROOM_AVAILABILITY_OPTIONS,
  type RestroomAvailability,
} from '@/lib/restroomAmenities'
import { stripSensitivePinFields } from '@/lib/restroomAccessSecurity'

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

function parseOptionalBool(value: unknown): boolean | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value === 'boolean') return value
  return undefined
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
    restroomId?: unknown
    accessible?: unknown
    has_baby_changing?: unknown
    availability?: unknown
    confirmed?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const restroomIdRaw = body.restroomId
  const restroomId =
    typeof restroomIdRaw === 'number'
      ? restroomIdRaw
      : typeof restroomIdRaw === 'string' && /^\d+$/.test(restroomIdRaw)
        ? Number(restroomIdRaw)
        : null
  if (restroomId == null || !Number.isFinite(restroomId)) {
    return NextResponse.json({ error: 'restroomId is required' }, { status: 400 })
  }

  const accessible = parseOptionalBool(body.accessible)
  const hasBaby = parseOptionalBool(body.has_baby_changing)
  if (body.accessible !== undefined && accessible === undefined) {
    return NextResponse.json({ error: 'accessible must be boolean or null' }, { status: 400 })
  }
  if (body.has_baby_changing !== undefined && hasBaby === undefined) {
    return NextResponse.json({ error: 'has_baby_changing must be boolean or null' }, { status: 400 })
  }

  let availability: RestroomAvailability | null = null
  if (body.availability !== undefined && body.availability !== null) {
    if (!isRestroomAvailability(body.availability)) {
      return NextResponse.json({ error: 'Invalid availability value' }, { status: 400 })
    }
    availability = body.availability
    const option = RESTROOM_AVAILABILITY_OPTIONS.find((o) => o.id === availability)
    if (option?.requiresConfirm && body.confirmed !== true) {
      return NextResponse.json(
        {
          error: 'Confirmation required',
          confirmMessage: option.confirmMessage,
        },
        { status: 400 },
      )
    }
  }

  if (
    accessible === undefined &&
    hasBaby === undefined &&
    availability == null
  ) {
    return NextResponse.json({ error: 'No amenity or availability fields provided' }, { status: 400 })
  }

  const result = await persistRestroomAmenities({
    restroomId,
    userId: authData.user.id,
    accessible,
    has_baby_changing: hasBaby,
    availability,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    restroomId: result.restroomId,
    restroom: stripSensitivePinFields({
      id: result.restroomId,
      accessible: result.accessible,
      has_baby_changing: result.has_baby_changing,
      availability: result.availability,
    }),
  })
}
