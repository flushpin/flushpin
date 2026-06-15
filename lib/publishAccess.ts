import { supabase } from './supabase'
import { formatUpdatedAt, normalizeAccessType, type AccessType } from './accessType'
import { getVerifiedDisplayLabel } from './restroomVerified'

export type PublishTarget = {
  id: number | string
  source?: string
  name: string
  address: string
  lat: number
  lng: number
  type?: string
}

export type AccessUpdatePayload = {
  access_type: AccessType
  pin: string | null
  pin_updated_at: string
  status: string
  verified: string
}

const RESTROOM_ACCESS_FIELDS =
  'id, access_type, pin, pin_updated_at, status, verified, verified_note, status_note, last_verified_at, name, address, score, accessible, lat, lng'

const VERIFIED_LABELS: Record<AccessType, string> = {
  keypad_code: 'Access code shared',
  no_code_needed: 'Open access',
  ask_staff: 'Ask staff',
  customers_only: 'Customers only',
  locked: 'Locked',
  unknown: 'Access info shared',
}

function buildVerifiedLabel(type: AccessType, locale: string, at = new Date()): string {
  const iso = at.toISOString()
  return `${VERIFIED_LABELS[type]} · Updated ${formatUpdatedAt(iso, locale)}`
}

/** DB columns for web direct update — does not write legacy verified TEXT. */
export function buildAccessDbUpdate(
  type: AccessType,
  cleanedPin: string | null,
  locale: string,
): Record<string, unknown> {
  const now = new Date().toISOString()
  const pin =
    type === 'keypad_code'
      ? cleanedPin
      : type === 'no_code_needed'
        ? 'open'
        : null

  return {
    access_type: type,
    pin,
    pin_updated_at: now,
    status: 'green',
    verified_note: buildVerifiedLabel(type, locale, new Date(now)),
    last_verified_at: now,
  }
}

export function buildAccessPayload(
  type: AccessType,
  cleanedPin: string | null,
  locale: string,
): AccessUpdatePayload {
  const now = new Date().toISOString()
  const pin =
    type === 'keypad_code'
      ? cleanedPin
      : type === 'no_code_needed'
        ? 'open'
        : null

  return {
    access_type: type,
    pin,
    pin_updated_at: now,
    status: 'green',
    verified: buildVerifiedLabel(type, locale, new Date(now)),
  }
}

function toAccessPayload(
  row: {
    access_type?: string | null
    pin?: string | null
    pin_updated_at?: string | null
    status?: string | null
    verified?: string | null
    verified_note?: string | null
    status_note?: string | null
  },
  fallbackType: AccessType,
): AccessUpdatePayload {
  return {
    access_type: normalizeAccessType(row.access_type) ?? fallbackType,
    pin: row.pin ?? null,
    pin_updated_at: row.pin_updated_at ?? new Date().toISOString(),
    status: row.status ?? 'green',
    verified: getVerifiedDisplayLabel(row),
  }
}

export async function fetchRestroomAccessRow(restroomId: string) {
  const { data, error } = await supabase
    .from('restroom')
    .select(RESTROOM_ACCESS_FIELDS)
    .eq('id', restroomId)
    .single()

  if (error) return null
  return data
}

export async function resolveRestroomId(
  target: PublishTarget,
  userId?: string | null,
): Promise<string | null> {
  if (target.source === 'google') {
    const { data: existing } = await supabase
      .from('restroom')
      .select('id')
      .eq('name', target.name)
      .eq('address', target.address)
      .maybeSingle()

    if (existing) return String(existing.id)

    const { data: created, error: createError } = await supabase
      .from('restroom')
      .insert({
        name: target.name,
        address: target.address,
        lat: target.lat,
        lng: target.lng,
        type: target.type || 'other',
        added_by: userId,
      })
      .select('id')
      .single()

    if (createError || !created) return null
    return String(created.id)
  }

  return String(target.id)
}

async function publishViaRpc(
  restroomId: string,
  type: AccessType,
  cleanedPin: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc('apply_restroom_access', {
    p_restroom_id: restroomId,
    p_access_type: type,
    p_submitted_pin: type === 'keypad_code' ? cleanedPin : null,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

async function publishViaDirectUpdate(
  restroomId: string,
  type: AccessType,
  cleanedPin: string | null,
  userId: string,
  locale: string,
): Promise<{ ok: boolean; error?: string }> {
  const payload = buildAccessDbUpdate(type, cleanedPin, locale)

  const { data: updatedRows, error: updateError } = await supabase
    .from('restroom')
    .update(payload)
    .eq('id', restroomId)
    .select('id')

  if (updateError || !updatedRows?.length) {
    return { ok: false, error: updateError?.message ?? 'Update blocked or restroom not found' }
  }

  await supabase.from('pin_submissions').insert({
    restroom_id: restroomId,
    user_id: userId,
    submitted_pin: type === 'keypad_code' ? cleanedPin : null,
    access_type: type,
    status: 'approved',
  })

  return { ok: true }
}

export async function publishRestroomAccess(
  target: PublishTarget,
  type: AccessType,
  cleanedPin: string | null,
  userId: string | null,
  locale: string,
): Promise<{ ok: boolean; restroomId: string | null; payload?: AccessUpdatePayload; error?: string }> {
  const restroomId = await resolveRestroomId(target, userId)
  if (!restroomId) {
    return { ok: false, restroomId: null, error: 'Could not resolve restroom' }
  }

  if (!userId) {
    return { ok: false, restroomId, error: 'Not authenticated' }
  }

  const rpcResult = await publishViaRpc(restroomId, type, cleanedPin)
  if (!rpcResult.ok) {
    const fallback = await publishViaDirectUpdate(restroomId, type, cleanedPin, userId, locale)
    if (!fallback.ok) {
      return { ok: false, restroomId, error: fallback.error ?? rpcResult.error }
    }
  }

  const fresh = await fetchRestroomAccessRow(restroomId)
  const payload = fresh ? toAccessPayload(fresh, type) : buildAccessPayload(type, cleanedPin, locale)
  return { ok: true, restroomId, payload }
}
