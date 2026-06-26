import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  const service = getServiceClient()
  if (!service.client) {
    return NextResponse.json({ error: service.error }, { status: service.status })
  }

  let body: { id?: string | number; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { id, status } = body
  if (id == null || !status) {
    return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
  }
  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { error } = await service.client
    .from('flagged_content')
    .update({
      status,
      reviewed_by: 'admin',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await service.client.from('admin_logs').insert({
    admin_email: 'hello@flushpin.com',
    action: `flagged_${status}`,
    target_type: 'flagged_content',
    target_id: String(id),
    details: {},
  })

  return NextResponse.json({ ok: true })
}
