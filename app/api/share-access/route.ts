import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { AccessEditState } from '@/lib/accessType'
import { persistShareAccess, type ShareAccessTarget } from '@/lib/shareAccessServer'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.json({ error: 'Supabase is not configured on the server.' }, { status: 503 })
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
  if (!target?.name || !entry?.method) {
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
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    restroomId: result.restroomId,
    restroom: result.restroom,
  })
}
