import type { AccessEditState } from '@/lib/accessType'
import {
  buildPublishAccessInput,
  createUserSupabaseClient,
  publishRestroomAccess,
  type PublishTarget,
} from '@/lib/publishAccess'

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

  return {
    ok: true as const,
    restroomId: result.restroomId,
    restroom: {
      ...target,
      ...result.payload,
      id: result.restroomId,
    },
  }
}
