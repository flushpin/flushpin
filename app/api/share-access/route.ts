import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { AccessEditState } from '@/lib/accessType'
import { persistShareAccess, type ShareAccessTarget } from '@/lib/shareAccessServer'

export const dynamic = 'force-dynamic'

const ACCESS_METHODS = new Set(['keypad_code', 'no_code_needed', 'ask_staff', 'locked'])
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
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

  let body: { target?: ShareAccessTarget; entry?: AccessEditState; locale?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const target = body.target
  const entry = body.entry
  if (
    !target?.name ||
    typeof target.name !== 'string' ||
    target.name.trim().length > 160 ||
    (target.address != null &&
      (typeof target.address !== 'string' || target.address.length > 300)) ||
    !entry?.method ||
    !ACCESS_METHODS.has(entry.method) ||
    typeof entry.customersOnly !== 'boolean' ||
    typeof entry.accessible !== 'boolean' ||
    typeof entry.pin !== 'string' ||
    entry.pin.length > 64
  ) {
    return NextResponse.json({ error: 'target and entry are required' }, { status: 400 })
  }

  if (entry.method === 'keypad_code' && !entry.pin?.trim()) {
    return NextResponse.json({ error: 'Access code is required' }, { status: 400 })
  }

  const result = await persistShareAccess(
    token,
    authData.user.id,
    target,
    entry,
    body.locale ?? 'en-US',
  )
  if (!result.ok) {
    console.error('[share-access] update failed')
    return NextResponse.json({ error: 'Unable to save access information' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    restroomId: result.restroomId,
    restroom: result.restroom,
  })
}
