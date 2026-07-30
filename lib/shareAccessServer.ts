import type { AccessEditState } from '@/lib/accessType'
import {
  buildPublishAccessInput,
  createUserSupabaseClient,
  publishRestroomAccess,
  type PublishTarget,
} from '@/lib/publishAccess'
import { persistRestroomAmenities } from '@/lib/persistRestroomAmenities'
import { stripSensitivePinFields } from '@/lib/restroomAccessSecurity'

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

function toPublishTarget(target: ShareAccessTarget): PublishTarget {
  return {
    id: (target.id ?? '') as number | string,
    source: target.source ?? undefined,
    name: target.name ?? '',
    address: target.address ?? '',
    lat: target.lat ?? 0,
    lng: target.lng ?? 0,
    type: target.type ?? undefined,
  }
}

export async function persistShareAccess(
  accessToken: string,
  userId: string,
  target: ShareAccessTarget,
  entry: AccessEditState,
  locale = 'en-US',
) {
  const db = createUserSupabaseClient(accessToken)
  const publishInput = buildPublishAccessInput(
    entry.customersOnly,
    entry.method,
    entry.pin,
    entry.accessible,
    entry.hasBabyChanging,
  )

  const result = await publishRestroomAccess(
    toPublishTarget(target),
    publishInput,
    null,
    userId,
    locale,
    db,
  )

  if (!result.ok || !result.payload || !result.restroomId) {
    return { ok: false as const, error: result.error ?? 'Save failed' }
  }

  // Production apply_restroom_access does not accept amenity params.
  // Only write amenities when the client explicitly included baby-changing
  // (map edit form). Code-only submits omit hasBabyChanging and must not
  // overwrite existing amenity columns with coerced false values.
  if (typeof entry.hasBabyChanging === 'boolean') {
    const amenities = await persistRestroomAmenities({
      restroomId: result.restroomId,
      userId,
      accessible: entry.accessible,
      has_baby_changing: entry.hasBabyChanging,
    })

    if (!amenities.ok) {
      return { ok: false as const, error: amenities.error }
    }

    return {
      ok: true as const,
      restroomId: result.restroomId,
      restroom: stripSensitivePinFields({
        ...target,
        ...result.payload,
        id: result.restroomId,
        accessible: amenities.accessible,
        has_baby_changing: amenities.has_baby_changing,
      }),
    }
  }

  return {
    ok: true as const,
    restroomId: result.restroomId,
    restroom: stripSensitivePinFields({
      ...target,
      ...result.payload,
      id: result.restroomId,
    }),
  }
}
