import type { SupabaseClient } from '@supabase/supabase-js'
import {
  buildAccessPayload,
  normalizeRestroomId,
  type AccessEditState,
} from '@/lib/accessType'

export type ShareAccessTarget = {
  id?: unknown
  name?: string | null
  address?: string | null
  lat?: number | null
  lng?: number | null
  type?: string | null
  source?: string | null
  distance?: number
}

async function findExistingRestroomId(
  supabase: SupabaseClient,
  target: ShareAccessTarget,
): Promise<string | number | null> {
  const name = target.name?.trim()
  const address = target.address?.trim()
  if (name && address) {
    const { data: byAddress } = await supabase
      .from('restroom')
      .select('id')
      .ilike('name', name)
      .ilike('address', address)
      .limit(1)
      .maybeSingle()
    if (byAddress?.id) return byAddress.id
  }

  if (!name || target.lat == null || target.lng == null) return null

  const { data } = await supabase
    .from('restroom')
    .select('id')
    .ilike('name', name)
    .gte('lat', target.lat - 0.0005)
    .lte('lat', target.lat + 0.0005)
    .gte('lng', target.lng - 0.0005)
    .lte('lng', target.lng + 0.0005)
    .limit(1)
    .maybeSingle()

  return data?.id ?? null
}

async function resolveTargetRestroomId(
  supabase: SupabaseClient,
  target: ShareAccessTarget,
): Promise<string | number | null> {
  const directId = normalizeRestroomId(target.id)
  if (directId != null) return directId
  return findExistingRestroomId(supabase, target)
}

export async function persistShareAccess(
  supabase: SupabaseClient,
  userId: string,
  target: ShareAccessTarget,
  entry: AccessEditState,
) {
  const payload = buildAccessPayload(entry)
  const pendingPayload = {
    ...payload,
    status: 'amber',
    verified: `${payload.verified} · Pending review`,
  }

  let restroomId = await resolveTargetRestroomId(supabase, target)

  if (restroomId == null) {
    const insertRow = {
      name: target.name,
      address: target.address,
      lat: target.lat,
      lng: target.lng,
      type: target.type || 'other',
      source: target.source || 'google',
      score: 0,
      stars: 0,
      added_by: userId,
      ...pendingPayload,
    }

    const { data, error } = await supabase
      .from('restroom')
      .insert(insertRow)
      .select('id')
      .maybeSingle()

    if (error) return { ok: false as const, error: error.message }
    if (!data?.id) return { ok: false as const, error: 'Could not create restroom' }
    restroomId = data.id
  } else {
    const { data, error } = await supabase
      .from('restroom')
      .update(pendingPayload)
      .eq('id', restroomId)
      .select('id')

    if (error) return { ok: false as const, error: error.message }
    if (!data?.length) {
      return { ok: false as const, error: 'Restroom not found or update failed' }
    }
  }

  const { error: submissionError } = await supabase.from('pin_submissions').insert({
    restroom_id: String(restroomId),
    user_id: userId,
    submitted_pin: entry.method === 'keypad_code' ? entry.pin.trim() : null,
    access_type: payload.access_type,
    status: 'pending',
    source: 'web',
  })

  if (submissionError) return { ok: false as const, error: submissionError.message }

  return {
    ok: true as const,
    restroomId,
    restroom: { ...target, ...pendingPayload, id: restroomId },
  }
}
