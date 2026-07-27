import { supabase } from './supabase'

/** ~150m in degrees — match same venue without grabbing neighbors. */
const NEAR_DEG = 0.0015

const ACCESS_LOOKUP_FIELDS =
  'id, name, address, score, pin_updated_at, status, verified, accessible, has_baby_changing, access_type, has_code, lat, lng, place_id, pin'

function normalizeVenueName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''`´]/g, "'")
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function namesLikelyMatch(a: string, b: string): boolean {
  const na = normalizeVenueName(a)
  const nb = normalizeVenueName(b)
  if (!na || !nb) return false
  if (na === nb) return true
  if (na.includes(nb) || nb.includes(na)) return true
  return false
}

/** Derive Google/Overture place id from map card fields. */
export function extractPlaceIdFromCard(target: {
  place_id?: unknown
  google_place_id?: unknown
  id?: unknown
}): string | null {
  const direct = target.place_id ?? target.google_place_id
  if (typeof direct === 'string' && direct.trim()) return direct.trim()
  const raw = String(target.id ?? '')
  const stripped = raw.replace(/^(google_|public_)/, '')
  return stripped && stripped !== raw ? stripped : null
}

/**
 * Find an existing restroom row for a discovery / Google map card.
 * Order: place_id exact match → nearby name + coords fallback.
 */
export async function findExistingRestroomId(opts: {
  placeId?: string | null
  name?: string | null
  lat?: number | null
  lng?: number | null
}): Promise<number | null> {
  const placeId = (opts.placeId && String(opts.placeId).trim()) || ''
  if (placeId) {
    const { data, error } = await supabase
      .from('restroom')
      .select('id')
      .eq('place_id', placeId)
      .maybeSingle()
    if (!error && data?.id != null) {
      const id = Number(data.id)
      if (Number.isFinite(id)) return id
    }
  }

  const lat = opts.lat
  const lng = opts.lng
  const name = (opts.name && String(opts.name).trim()) || ''
  if (
    !name ||
    lat == null ||
    lng == null ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return null
  }

  const { data, error } = await supabase
    .from('restroom')
    .select('id, name, lat, lng')
    .gte('lat', lat - NEAR_DEG)
    .lte('lat', lat + NEAR_DEG)
    .gte('lng', lng - NEAR_DEG)
    .lte('lng', lng + NEAR_DEG)
    .limit(25)

  if (error || !data?.length) {
    if (error) console.error('[findRestroom] nearby name lookup error:', error)
    return null
  }

  const match = data.find((row) => namesLikelyMatch(name, row.name ?? ''))
  if (match?.id == null) return null
  const id = Number(match.id)
  return Number.isFinite(id) ? id : null
}

/** Load pin / access_type for a numeric restroom id (public view, then table). */
export async function loadRestroomAccessById(restroomId: number) {
  const { data: pub } = await supabase
    .from('restroom_public')
    .select(ACCESS_LOOKUP_FIELDS)
    .eq('id', restroomId)
    .maybeSingle()
  if (pub) return pub

  const { data: row, error } = await supabase
    .from('restroom')
    .select(ACCESS_LOOKUP_FIELDS)
    .eq('id', restroomId)
    .maybeSingle()
  if (error) {
    console.error('[findRestroom] load by id error:', error)
    return null
  }
  return row
}
