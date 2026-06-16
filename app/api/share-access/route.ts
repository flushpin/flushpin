import { NextRequest, NextResponse } from 'next/server'
import type { AccessEditState } from '@/lib/accessType'
import { persistShareAccess, type ShareAccessTarget } from '@/lib/shareAccessServer'
import { getServiceClient } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const service = getServiceClient()
  if (!service.client) {
    return NextResponse.json({ error: service.error }, { status: service.status })
  }

  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  if (!token) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const { data: authData, error: authError } = await service.client.auth.getUser(token)
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Invalid or expired session — please sign in again' }, { status: 401 })
  }

  let body: { target?: ShareAccessTarget; entry?: AccessEditState }
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

  const result = await persistShareAccess(service.client, authData.user.id, target, entry)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    restroomId: result.restroomId,
    restroom: result.restroom,
  })
}
