import type { SupabaseClient } from '@supabase/supabase-js'
import {
  amenityReportRowsForPatch,
  availabilityReportType,
  buildAmenityColumnPatch,
  canonicalAmenitiesFromRow,
  type RestroomAvailability,
  type TriBool,
} from './restroomAmenities'
import { getServiceClient } from './supabaseService'

export type PersistAmenitiesInput = {
  restroomId: string | number
  userId: string
  accessible?: boolean | null
  has_baby_changing?: boolean | null
  availability?: RestroomAvailability | null
}

export type PersistAmenitiesResult =
  | {
      ok: true
      restroomId: string
      accessible: TriBool
      has_baby_changing: TriBool
      availability: RestroomAvailability | null
    }
  | { ok: false; error: string }

function numericRestroomId(restroomId: string | number): number | null {
  const n = typeof restroomId === 'number' ? restroomId : Number(restroomId)
  return Number.isFinite(n) ? n : null
}

async function readCanonicalAmenities(
  db: SupabaseClient,
  restroomId: string | number,
): Promise<{ accessible: TriBool; has_baby_changing: TriBool } | null> {
  const { data, error } = await db
    .from('restroom')
    .select('accessible, has_baby_changing')
    .eq('id', restroomId)
    .maybeSingle()
  if (error || !data) return null
  return canonicalAmenitiesFromRow(data)
}

/**
 * Persist amenity flags after an authenticated user action.
 * Uses service role only for amenity columns + report rows — never reads/writes PIN.
 * Returns values re-read from the database (never optimistic client input alone).
 */
export async function persistRestroomAmenities(
  input: PersistAmenitiesInput,
): Promise<PersistAmenitiesResult> {
  const service = getServiceClient()
  if (!('client' in service) || !service.client) {
    return { ok: false, error: service.error ?? 'Service unavailable' }
  }
  const db = service.client
  const restroomId = String(input.restroomId)
  const numericId = numericRestroomId(restroomId)
  if (numericId == null) {
    return { ok: false, error: 'Invalid restroom id' }
  }

  const patch = buildAmenityColumnPatch({
    accessible: input.accessible,
    has_baby_changing: input.has_baby_changing,
  })

  if (Object.keys(patch).length > 0) {
    const { error: updateError } = await db.from('restroom').update(patch).eq('id', numericId)
    if (updateError) {
      console.error('[persistRestroomAmenities] update failed:', updateError.message)
      return { ok: false, error: 'Could not save amenity information' }
    }

    const reportRows = amenityReportRowsForPatch(numericId, input.userId, patch)
    if (reportRows.length > 0) {
      const { error: reportError } = await db.from('restroom_reports').insert(reportRows)
      if (reportError) {
        // Amenity column write succeeded; report log is best-effort for audit trail.
        console.warn('[persistRestroomAmenities] report insert skipped:', reportError.message)
      }
    }
  }

  const availability: RestroomAvailability | null = input.availability ?? null
  if (availability) {
    const { error: availError } = await db.from('restroom_reports').insert({
      restroom_id: numericId,
      report_type: availabilityReportType(availability),
      note: `Restroom availability: ${availability}`,
      created_by: input.userId,
    })
    if (availError) {
      console.error('[persistRestroomAmenities] availability report failed:', availError.message)
      return { ok: false, error: 'Could not save availability report' }
    }

    // Keep customer_only discoverable via existing access_type when reported.
    if (availability === 'customer_only') {
      const { data: current } = await db
        .from('restroom')
        .select('access_type')
        .eq('id', numericId)
        .maybeSingle()
      const currentType = typeof current?.access_type === 'string' ? current.access_type : ''
      if (currentType && !currentType.includes('customers_only')) {
        const nextType =
          currentType === 'unknown' || currentType === ''
            ? 'customers_only'
            : currentType.startsWith('customers_only')
              ? currentType
              : `customers_only+${currentType}`
        await db.from('restroom').update({ access_type: nextType }).eq('id', numericId)
      } else if (!currentType) {
        await db.from('restroom').update({ access_type: 'customers_only' }).eq('id', numericId)
      }
    }
  }

  const canonical = await readCanonicalAmenities(db, numericId)
  if (!canonical) {
    return { ok: false, error: 'Could not verify saved amenities' }
  }

  return {
    ok: true,
    restroomId,
    accessible: canonical.accessible,
    has_baby_changing: canonical.has_baby_changing,
    availability,
  }
}
