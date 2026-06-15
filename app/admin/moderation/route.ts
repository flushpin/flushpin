import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildApprovedRestroomPatch,
  restroomMatchKey,
} from '@/lib/adminModeration'
import { getServiceClient } from '@/lib/supabaseService'

export const dynamic = 'force-dynamic'

type RestroomRow = {
  id: number | string
  name?: string | null
  address?: string | null
  pin?: string | null
  status?: string | null
  created_at?: string | null
  access_type?: string | null
}

type SubmissionRow = {
  id: number
  restroom_id: string
  user_id: string
  submitted_pin: string | null
  access_type: string
  status: string
  source: string | null
  created_at: string
  restroom?: RestroomRow | RestroomRow[] | null
}

async function logAdminAction(
  supabase: SupabaseClient,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, unknown>,
) {
  await supabase.from('admin_logs').insert({
    admin_email: 'admin@flushpin.com',
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  })
}

async function mergeDuplicateRestrooms(supabase: SupabaseClient, keeperId: string | number) {
  const { data: keeper, error } = await supabase.from('restroom').select('*').eq('id', keeperId).single()
  if (error || !keeper?.name || !keeper?.address) return { deleted: 0, keeperId: String(keeperId) }

  const { data: dupes } = await supabase
    .from('restroom')
    .select('id')
    .ilike('name', keeper.name.trim())
    .ilike('address', keeper.address.trim())
    .neq('id', keeperId)

  const duplicateIds = (dupes ?? []).map((row) => row.id)
  if (!duplicateIds.length) return { deleted: 0, keeperId: String(keeperId) }

  for (const dupId of duplicateIds) {
    await supabase.from('pin_submissions').update({ restroom_id: String(keeperId) }).eq('restroom_id', String(dupId))
    await supabase.from('pin_views').update({ restroom_id: keeperId }).eq('restroom_id', dupId)
    await supabase.from('rating').update({ restroom_id: keeperId }).eq('restroom_id', dupId)
    await supabase.from('promotion').update({ restroom_id: keeperId }).eq('restroom_id', dupId)
    await supabase.from('restroom').delete().eq('id', dupId)
  }

  return { deleted: duplicateIds.length, keeperId: String(keeperId) }
}

function groupDuplicateRestrooms(rows: RestroomRow[]) {
  const groups = new Map<string, RestroomRow[]>()
  for (const row of rows) {
    const key = restroomMatchKey(row.name, row.address)
    if (!key) continue
    const list = groups.get(key) ?? []
    list.push(row)
    groups.set(key, list)
  }

  return [...groups.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([key, list]) => ({
      key,
      name: list[0].name,
      address: list[0].address,
      rows: list.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()),
    }))
    .sort((a, b) => b.rows.length - a.rows.length)
    .slice(0, 25)
}

export async function GET() {
  const service = getServiceClient()
  if (!service.client) {
    return NextResponse.json({ error: service.error }, { status: service.status })
  }
  const supabase = service.client

  const [{ data: pendingSubmissions, error: pendingError }, { data: recentRestrooms, error: recentError }] =
    await Promise.all([
      supabase
        .from('pin_submissions')
        .select('id, restroom_id, user_id, submitted_pin, access_type, status, source, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('restroom')
        .select('id, name, address, pin, status, access_type, created_at')
        .not('name', 'is', null)
        .not('address', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5000),
    ])

  if (pendingError) {
    return NextResponse.json({ error: pendingError.message }, { status: 500 })
  }
  if (recentError) {
    return NextResponse.json({ error: recentError.message }, { status: 500 })
  }

  const submissionRestroomIds = [
    ...new Set((pendingSubmissions ?? []).map((row) => row.restroom_id).filter(Boolean)),
  ]
  const restroomMap = new Map<string, RestroomRow>()

  if (submissionRestroomIds.length > 0) {
    const restroomIdsForQuery = submissionRestroomIds.map((id) => {
      const numericId = Number(id)
      return Number.isFinite(numericId) ? numericId : id
    })

    const { data: linkedRestrooms, error: linkedRestroomsError } = await supabase
      .from('restroom')
      .select('id, name, address, pin, status, access_type, created_at')
      .in('id', restroomIdsForQuery)

    if (linkedRestroomsError) {
      return NextResponse.json({ error: linkedRestroomsError.message }, { status: 500 })
    }

    for (const row of linkedRestrooms ?? []) {
      restroomMap.set(String(row.id), row)
    }
  }

  const normalizedPending = (pendingSubmissions ?? []).map((row: SubmissionRow) => ({
    ...row,
    restroom: restroomMap.get(String(row.restroom_id)) ?? null,
  }))

  const duplicateGroups = groupDuplicateRestrooms(recentRestrooms ?? [])

  return NextResponse.json({
    pendingSubmissions: normalizedPending,
    duplicateGroups,
    summary: {
      pendingCount: normalizedPending.length,
      duplicateGroupCount: duplicateGroups.length,
    },
  })
}

export async function POST(request: NextRequest) {
  const service = getServiceClient()
  if (!service.client) {
    return NextResponse.json({ error: service.error }, { status: service.status })
  }
  const supabase = service.client

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const action = String(body.action ?? '')

  try {
    if (action === 'approve_submission') {
      const submissionId = Number(body.submissionId)
      if (!Number.isFinite(submissionId)) {
        return NextResponse.json({ error: 'submissionId is required' }, { status: 400 })
      }

      const { data: submission, error: fetchError } = await supabase
        .from('pin_submissions')
        .select('id, restroom_id, submitted_pin, access_type, status')
        .eq('id', submissionId)
        .single()

      if (fetchError || !submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
      }
      if (submission.status !== 'pending') {
        return NextResponse.json({ error: 'Submission is not pending' }, { status: 409 })
      }

      const patch = buildApprovedRestroomPatch(submission.access_type, submission.submitted_pin)
      const { error: updateError } = await supabase
        .from('restroom')
        .update(patch)
        .eq('id', submission.restroom_id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      await supabase.from('pin_submissions').update({ status: 'approved' }).eq('id', submissionId)

      await supabase
        .from('pin_submissions')
        .update({ status: 'rejected' })
        .eq('restroom_id', submission.restroom_id)
        .eq('status', 'pending')
        .neq('id', submissionId)

      const dedupe = await mergeDuplicateRestrooms(supabase, submission.restroom_id)

      await logAdminAction(supabase, 'approve_submission', 'pin_submission', String(submissionId), {
        restroom_id: submission.restroom_id,
        dedupe,
      })

      return NextResponse.json({ ok: true, restroomId: dedupe.keeperId, dedupeDeleted: dedupe.deleted })
    }

    if (action === 'reject_submission') {
      const submissionId = Number(body.submissionId)
      if (!Number.isFinite(submissionId)) {
        return NextResponse.json({ error: 'submissionId is required' }, { status: 400 })
      }

      const { error } = await supabase.from('pin_submissions').update({ status: 'rejected' }).eq('id', submissionId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await logAdminAction(supabase, 'reject_submission', 'pin_submission', String(submissionId), {})
      return NextResponse.json({ ok: true })
    }

    if (action === 'approve_restroom') {
      const restroomId = String(body.restroomId ?? '')
      if (!restroomId) {
        return NextResponse.json({ error: 'restroomId is required' }, { status: 400 })
      }

      const { data: restroom, error: fetchError } = await supabase
        .from('restroom')
        .select('id, access_type, pin')
        .eq('id', restroomId)
        .single()

      if (fetchError || !restroom) {
        return NextResponse.json({ error: 'Restroom not found' }, { status: 404 })
      }

      const patch = buildApprovedRestroomPatch(
        restroom.access_type || 'unknown',
        typeof restroom.pin === 'string' ? restroom.pin : null,
      )

      const { error: updateError } = await supabase.from('restroom').update(patch).eq('id', restroomId)
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

      const dedupe = await mergeDuplicateRestrooms(supabase, restroomId)
      await logAdminAction(supabase, 'approve_restroom', 'restroom', restroomId, { dedupe })
      return NextResponse.json({ ok: true, restroomId: dedupe.keeperId, dedupeDeleted: dedupe.deleted })
    }

    if (action === 'dedupe_restroom') {
      const keeperId = String(body.keeperId ?? '')
      if (!keeperId) {
        return NextResponse.json({ error: 'keeperId is required' }, { status: 400 })
      }

      const dedupe = await mergeDuplicateRestrooms(supabase, keeperId)
      await logAdminAction(supabase, 'dedupe_restroom', 'restroom', keeperId, dedupe)
      return NextResponse.json({ ok: true, ...dedupe })
    }

    if (action === 'delete_restroom') {
      const restroomId = String(body.restroomId ?? '')
      if (!restroomId) {
        return NextResponse.json({ error: 'restroomId is required' }, { status: 400 })
      }

      const { error } = await supabase.from('restroom').delete().eq('id', restroomId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      await logAdminAction(supabase, 'delete_restroom', 'restroom', restroomId, {})
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Moderation action failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
