import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 30
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
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !key) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 503 })
  }

  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  let body: { restroom_id?: string | number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const restroomId = Number(body.restroom_id)
  if (!Number.isSafeInteger(restroomId) || restroomId <= 0) {
    return NextResponse.json({ error: 'restroom_id required' }, { status: 400 })
  }

  let authenticatedUserId: string | null = null
  const authorization = request.headers.get('authorization') ?? ''
  const tokenMatch = /^Bearer ([^\s]+)$/.exec(authorization)
  if (tokenMatch) {
    const token = tokenMatch[1]
    if (token.length > 4096) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
    const authClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data, error } = await authClient.auth.getUser(token)
    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
    authenticatedUserId = data.user.id
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error } = await supabase.from('pin_views').insert({
    restroom_id: restroomId,
    user_id: authenticatedUserId,
    viewed_at: new Date().toISOString(),
  })

  if (error) {
    console.error('[pin-view] insert failed')
    return NextResponse.json({ error: 'Unable to record view' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
