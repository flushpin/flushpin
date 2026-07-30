export type MapAccessIntent = 'view' | 'share' | 'update' | 'correct'

export type MapDiscoveryContext = {
  lat: number
  lng: number
  q?: string
  filter?: string
  category?: string | null
}

/** Strict numeric restroom id — rejects google_*, public_*, and other non-numeric ids. */
export function isCanonicalRestroomId(id: unknown): boolean {
  if (typeof id === 'number') return Number.isFinite(id) && id > 0
  if (typeof id === 'string') return /^\d+$/.test(id.trim())
  return false
}

export function toCanonicalRestroomId(id: unknown): number | null {
  if (!isCanonicalRestroomId(id)) return null
  const n = typeof id === 'number' ? id : Number(String(id).trim())
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Derive Google/Overture place id from map card fields (pure). */
export function extractPlaceIdForNavigation(target: {
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

export function buildMapReturnParams(ctx: MapDiscoveryContext): URLSearchParams {
  const params = new URLSearchParams()
  params.set('from', 'map')
  if (Number.isFinite(ctx.lat)) params.set('lat', String(ctx.lat))
  if (Number.isFinite(ctx.lng)) params.set('lng', String(ctx.lng))
  const q = (ctx.q ?? '').trim()
  if (q) params.set('q', q)
  const filter = (ctx.filter ?? '').trim()
  if (filter && filter !== 'all') params.set('filter', filter)
  const category = (ctx.category ?? '').trim()
  if (category) params.set('category', category)
  return params
}

export function buildMapHrefFromDetailParams(searchParams: {
  get: (key: string) => string | null
}): string {
  const params = new URLSearchParams()
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const q = searchParams.get('q')
  const filter = searchParams.get('filter')
  const category = searchParams.get('category')
  if (lat) params.set('lat', lat)
  if (lng) params.set('lng', lng)
  if (q) params.set('q', q)
  if (filter) params.set('filter', filter)
  if (category) params.set('category', category)
  const qs = params.toString()
  return qs ? `/map?${qs}` : '/map'
}

export function buildRestroomDetailHref(
  restroomId: number,
  opts: {
    intent?: MapAccessIntent
    discovery: MapDiscoveryContext
  },
): string {
  if (!isCanonicalRestroomId(restroomId)) {
    throw new Error('buildRestroomDetailHref requires a canonical numeric id')
  }
  const params = buildMapReturnParams(opts.discovery)
  if (opts.intent && opts.intent !== 'view') {
    params.set('intent', opts.intent)
  }
  return `/restroom/${restroomId}?${params.toString()}`
}

export type EnsureRestroomFn = (target: {
  id?: unknown
  name?: string | null
  address?: string | null
  lat?: number | null
  lng?: number | null
  type?: string | null
  source?: string | null
  place_id?: unknown
  google_place_id?: unknown
}) => Promise<number | null>

export type FindExistingRestroomFn = (opts: {
  placeId?: string | null
  name?: string | null
  lat?: number | null
  lng?: number | null
}) => Promise<number | null>

/**
 * Resolve a map card to a canonical numeric restroom id.
 * Never returns google_* / public_* string ids.
 */
export async function resolveCanonicalRestroomId(
  target: Record<string, unknown>,
  deps: {
    findExisting: FindExistingRestroomFn
    ensureRestroom?: EnsureRestroomFn
  },
): Promise<number | null> {
  const direct = toCanonicalRestroomId(target.id)
  if (direct != null) return direct

  const placeId = extractPlaceIdForNavigation(target)
  const name = typeof target.name === 'string' ? target.name : null
  const lat = typeof target.lat === 'number' ? target.lat : Number(target.lat)
  const lng = typeof target.lng === 'number' ? target.lng : Number(target.lng)

  const found = await deps.findExisting({
    placeId,
    name,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  })
  if (found != null) return found

  if (!deps.ensureRestroom) return null
  return deps.ensureRestroom({
    id: target.id,
    name,
    address: typeof target.address === 'string' ? target.address : null,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    type: typeof target.type === 'string' ? target.type : null,
    source: typeof target.source === 'string' ? target.source : null,
    place_id: target.place_id,
    google_place_id: target.google_place_id,
  })
}

export function parseMapAccessIntent(raw: string | null | undefined): MapAccessIntent | null {
  if (raw === 'share' || raw === 'add') return 'share'
  if (raw === 'update' || raw === 'correct') return raw
  if (raw === 'view') return 'view'
  return null
}
