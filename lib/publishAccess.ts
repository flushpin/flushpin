import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { supabase as browserSupabase } from './supabase'
import {
  encodeAccessType,
  formatUpdatedAt,
  normalizeAccessType,
  normalizeRestroomId,
  type AccessMethod,
  type AccessType,
} from './accessType'
import { getVerifiedDisplayLabel } from './restroomVerified'

export type PublishTarget = {
  id: number | string
  source?: string
  google_place_id?: string | null
  name: string
  address: string
  lat: number
  lng: number
  type?: string
}

export type PublishAccessInput = {
  accessType: string
  cleanedPin: string | null
  accessible?: boolean
  customersOnly?: boolean
  method?: AccessMethod
}

export type AccessUpdatePayload = {
  access_type: string
  pin: string | null
  pin_updated_at: string
  status: string
  verified: string
  accessible?: boolean
}

const RESTROOM_ACCESS_FIELDS =
  'id, access_type, pin, pin_updated_at, status, verified, name, address, accessible'

function eqRestroomId(restroomId: string | number) {
  return normalizeRestroomId(restroomId) ?? restroomId
}

const VERIFIED_LABELS: Record<AccessType, string> = {
  keypad_code: 'Access code shared',
  no_code_needed: 'Open access',
  ask_staff: 'Ask staff',
  customers_only: 'Customers only',
  locked: 'Locked',
  unknown: 'Access info shared',
}

function needsPin(accessType: string): boolean {
  return accessType === 'keypad_code' || accessType === 'customers_only+keypad_code'
}

function extractPlaceId(target: PublishTarget): string | null {
  if (target.google_place_id) return target.google_place_id
  if (typeof target.id === 'string' && target.id.startsWith('google_')) {
    return target.id.slice('google_'.length)
  }
  return null
}

function buildVerifiedLabel(type: AccessType, _locale: string, at = new Date()): string {
  const iso = at.toISOString()
  return `${VERIFIED_LABELS[type]} · Updated ${formatUpdatedAt(iso)}`
}

export function createUserSupabaseClient(accessToken: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Supabase is not configured on the server')
  }
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** DB columns for direct update fallback — does not write legacy verified TEXT. */
export function buildAccessDbUpdate(
  accessType: string,
  cleanedPin: string | null,
  locale: string,
  accessible?: boolean,
): Record<string, unknown> {
  const now = new Date().toISOString()
  const simple = normalizeAccessType(accessType.split('+').pop()) ?? 'unknown'
  const pin = needsPin(accessType)
    ? cleanedPin
    : accessType.includes('no_code_needed') || simple === 'no_code_needed'
      ? 'open'
      : null

  return {
    access_type: accessType,
    pin,
    accessible: accessible ?? false,
    pin_updated_at: now,
    status: 'green',
    verified_note: buildVerifiedLabel(simple, locale, new Date(now)),
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
    accessible?: boolean | null
  },
  fallbackType: string,
): AccessUpdatePayload {
  return {
    access_type: row.access_type ?? fallbackType,
    pin: row.pin ?? null,
    pin_updated_at: row.pin_updated_at ?? new Date().toISOString(),
    status: row.status ?? 'green',
    verified: getVerifiedDisplayLabel(row),
    accessible: row.accessible ?? false,
  }
}

async function fetchRestroomAccessRow(db: SupabaseClient, restroomId: string) {
  const { data, error } = await db
    .from('restroom')
    .select(RESTROOM_ACCESS_FIELDS)
    .eq('id', eqRestroomId(restroomId))
    .maybeSingle()

  if (error) {
    console.warn('[publishAccess] fetchRestroomAccessRow skipped:', error.message)
    return null
  }
  return data
}

export async function resolveRestroomId(
  db: SupabaseClient,
  target: PublishTarget,
  userId?: string | null,
): Promise<string | null> {
  const numericId =
    typeof target.id === 'number'
      ? target.id
      : typeof target.id === 'string' && /^\d+$/.test(target.id)
        ? Number(target.id)
        : null

  if (numericId != null && !Number.isNaN(numericId)) {
    return String(numericId)
  }

  const isGoogle =
    target.source === 'google' ||
    (typeof target.id === 'string' && target.id.startsWith('google_'))

  if (!isGoogle) {
    return target.id != null ? String(target.id) : null
  }

  const placeId = extractPlaceId(target)
  const { data: ensuredId, error: ensureError } = await db.rpc('ensure_restroom_for_publish', {
    p_name: target.name,
    p_address: target.address,
    p_lat: target.lat,
    p_lng: target.lng,
    p_type: target.type || 'other',
    p_place_id: placeId,
  })

  if (!ensureError && ensuredId) {
    return String(ensuredId)
  }

  const { data: existing } = await db
    .from('restroom')
    .select('id')
    .ilike('name', target.name)
    .gte('lat', target.lat - 0.0005)
    .lte('lat', target.lat + 0.0005)
    .gte('lng', target.lng - 0.0005)
    .lte('lng', target.lng + 0.0005)
    .order('pin_updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.id != null) return String(existing.id)

  const { data: created, error: createError } = await db
    .from('restroom')
    .insert({
      name: target.name,
      address: target.address,
      lat: target.lat,
      lng: target.lng,
      type: target.type || 'other',
      source: 'google',
      place_id: placeId,
      added_by: userId,
    })
    .select('id')
    .maybeSingle()

  if (createError) {
    console.error('[publishAccess] restroom insert failed:', createError.message)
    return null
  }
  if (!created?.id) {
    return null
  }

  return String(created.id)
}

function simplifyAccessTypeForLegacyRpc(accessType: string): string {
  if (accessType === 'customers_only+keypad_code') return 'keypad_code'
  if (accessType === 'customers_only+no_code_needed') return 'customers_only'
  if (accessType === 'customers_only+ask_staff') return 'ask_staff'
  return accessType
}

async function publishViaRpc(
  db: SupabaseClient,
  restroomId: string,
  accessType: string,
  cleanedPin: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const rpcType = simplifyAccessTypeForLegacyRpc(accessType)
  const { error } = await db.rpc('apply_restroom_access', {
    p_restroom_id: restroomId,
    p_access_type: rpcType,
    p_submitted_pin: needsPin(accessType) ? cleanedPin : null,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

function buildOptimisticPayload(
  input: PublishAccessInput,
): AccessUpdatePayload {
  return {
    access_type: input.accessType,
    pin: needsPin(input.accessType)
      ? input.cleanedPin
      : input.accessType.includes('no_code_needed')
        ? 'open'
        : null,
    pin_updated_at: new Date().toISOString(),
    status: 'green',
    verified: 'Access info shared',
    accessible: input.accessible ?? false,
  }
}

export function buildPublishAccessInput(
  customersOnly: boolean,
  method: AccessMethod,
  pin: string,
  accessible: boolean,
): PublishAccessInput {
  const accessType = encodeAccessType(method === 'locked' ? false : customersOnly, method)
  const cleanedPin = method === 'keypad_code' ? pin.trim() || null : null
  return { accessType, cleanedPin, accessible, customersOnly, method }
}

export async function publishRestroomAccess(
  target: PublishTarget,
  typeOrInput: AccessType | PublishAccessInput,
  cleanedPinArg: string | null,
  userId: string | null,
  locale: string,
  db: SupabaseClient = browserSupabase,
): Promise<{ ok: boolean; restroomId: string | null; payload?: AccessUpdatePayload; error?: string }> {
  const input: PublishAccessInput =
    typeof typeOrInput === 'string'
      ? { accessType: typeOrInput, cleanedPin: cleanedPinArg }
      : typeOrInput

  const restroomId = await resolveRestroomId(db, target, userId)
  if (!restroomId) {
    return { ok: false, restroomId: null, error: 'Could not resolve restroom' }
  }

  if (!userId) {
    return { ok: false, restroomId, error: 'Not authenticated' }
  }

  const rpcResult = await publishViaRpc(db, restroomId, input.accessType, input.cleanedPin)
  if (!rpcResult.ok) {
    return { ok: false, restroomId, error: rpcResult.error ?? 'Publish failed' }
  }

  const fresh = await fetchRestroomAccessRow(db, restroomId)
  const payload = fresh ? toAccessPayload(fresh, input.accessType) : buildOptimisticPayload(input)

  return { ok: true, restroomId, payload }
}
