import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

export async function GET() {
  const service = getServiceClient()
  if (!service.client) {
    return NextResponse.json({ error: service.error }, { status: service.status })
  }

  const [{ data: claims, error: claimsError }, { data: optouts, error: optoutsError }] = await Promise.all([
    service.client
      .from('business_claim_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200),
    service.client
      .from('optout_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  if (claimsError) {
    return NextResponse.json({ error: claimsError.message }, { status: 500 })
  }
  if (optoutsError) {
    return NextResponse.json({ error: optoutsError.message }, { status: 500 })
  }

  const pendingClaims = (claims ?? []).filter((r) => r.status === 'pending')
  const pendingOptouts = (optouts ?? []).filter((r) => r.status === 'pending')
  const removalRequests = (claims ?? []).filter((r) => r.request_type === 'removal')

  return NextResponse.json({
    claims: claims ?? [],
    optouts: optouts ?? [],
    summary: {
      pendingClaims: pendingClaims.length,
      pendingOptouts: pendingOptouts.length,
      removalRequests: removalRequests.length,
      totalPending: pendingClaims.length + pendingOptouts.length,
    },
  })
}

export async function POST(request: NextRequest) {
  const service = getServiceClient()
  if (!service.client) {
    return NextResponse.json({ error: service.error }, { status: service.status })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const table = String(body.table ?? '')
  const id = body.id
  const status = String(body.status ?? '')

  if (!id || !status) {
    return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
  }

  if (table === 'business_claim_requests') {
    if (!['reviewed', 'resolved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    const { error } = await service.client.from('business_claim_requests').update({ status }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await service.client.from('admin_logs').insert({
      admin_email: 'admin@flushpin.com',
      action: 'business_claim_status',
      target_type: 'business_claim_requests',
      target_id: String(id),
      details: { status },
    })
    return NextResponse.json({ ok: true })
  }

  if (table === 'optout_requests') {
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    const { error } = await service.client.from('optout_requests').update({ status }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown table' }, { status: 400 })
}
