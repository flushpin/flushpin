import type { SupabaseClient } from '@supabase/supabase-js'
import { extractPlaceIdFromCard } from '@/lib/findRestroom'
import { resolveRestroomId, type PublishTarget } from '@/lib/publishAccess'
import { toCanonicalRestroomId } from '@/lib/mapRestroomNavigation'

export type EnsureRestroomTarget = {
  id?: unknown
  name?: string | null
  address?: string | null
  lat?: number | null
  lng?: number | null
  type?: string | null
  source?: string | null
  place_id?: unknown
  google_place_id?: unknown
}

/**
 * Find or create a numeric restroom row for a map discovery card.
 * Forces the google ensure path so public_* / google_* ids are never returned as-is.
 */
export async function ensureCanonicalRestroomId(
  db: SupabaseClient,
  target: EnsureRestroomTarget,
  userId: string,
): Promise<number | null> {
  const direct = toCanonicalRestroomId(target.id)
  if (direct != null) return direct

  const placeId = extractPlaceIdFromCard(target)
  if (placeId) {
    const { data, error } = await db
      .from('restroom')
      .select('id')
      .eq('place_id', placeId)
      .maybeSingle()
    if (!error && data?.id != null) {
      const id = toCanonicalRestroomId(data.id)
      if (id != null) return id
    }
  }

  const name = typeof target.name === 'string' ? target.name.trim() : ''
  const lat = typeof target.lat === 'number' ? target.lat : Number(target.lat)
  const lng = typeof target.lng === 'number' ? target.lng : Number(target.lng)
  if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  // Normalize to a google_* target so resolveRestroomId uses ensure_restroom_for_publish.
  const publishTarget: PublishTarget = {
    id: placeId ? `google_${placeId}` : `google_pending_${lat}_${lng}`,
    source: 'google',
    google_place_id: placeId,
    name,
    address: typeof target.address === 'string' ? target.address : '',
    lat,
    lng,
    type: typeof target.type === 'string' ? target.type : 'other',
  }

  const resolved = await resolveRestroomId(db, publishTarget, userId)
  return toCanonicalRestroomId(resolved)
}
