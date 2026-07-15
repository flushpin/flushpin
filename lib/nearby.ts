/**
 * FlushPin nearby core — shared contract for web (Faz 1), edge function (Faz 2), mobile (Faz 3).
 * Do not change response field names without coordinating downstream consumers.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { mapNearbyVerifiedBoolean } from './restroomVerified'

/** ~140m grid cell; actual ground distance varies with latitude. */
export const CELL_SIZE = 0.00125

export const CACHE_TTL_MS = 24 * 60 * 60 * 1000

export const CACHE_STALE_DISTANCE_M = 200

export const NEARBY_RADIUS_TIER1_M = 200

export const NEARBY_RADIUS_TIER2_M = 500

export const NEARBY_RADIUS_TIER3_M = 2000

export const PUBLIC_RESTROOM_RADIUS_M = 2000

export const NEARBY_KEEP_CLOSE_M = 100

export const NEARBY_MAX_TOTAL_RESULTS = 50

/** @deprecated use NEARBY_RADIUS_TIER2_M */
export const NEARBY_RADIUS_PRIMARY_M = NEARBY_RADIUS_TIER2_M

/** @deprecated use NEARBY_RADIUS_TIER3_M */
export const NEARBY_RADIUS_FALLBACK_M = NEARBY_RADIUS_TIER3_M

export const NEARBY_CLOSE_GROUP_M = 30

export const NEARBY_FALLBACK_MIN_COUNT = 8

export const NEARBY_FALLBACK_DISTANCE_M = 300

export const PUBLIC_RESTROOM_TYPES = ['library', 'park', 'toilets'] as const

/** Narrow discovery list — no store/bar/hotel/pharmacy/etc. (product decision). */
export const INCLUDED_TYPES = [
  'restaurant',
  'fast_food_restaurant',
  'cafe',
  'coffee_shop',
  'bakery',
  'convenience_store',
  'grocery_store',
  'supermarket',
  'gas_station',
  'shopping_mall',
  'department_store',
] as const

/** Table A/B types from Places API (New) — exact Set membership only, no substring matching. */
export const ALLOWED_BUSINESS_TYPES = new Set<string>(INCLUDED_TYPES)

/** Generic response types that must not alone qualify a business result. */
export const GENERIC_ONLY_TYPES = new Set([
  'establishment',
  'point_of_interest',
  'food',
  'store',
  'premise',
])

/**
 * Official Places API (New) types that disqualify a business result when present.
 * @see https://developers.google.com/maps/documentation/places/web-service/place-types
 */
export const EXCLUDED_GOOGLE_TYPES = new Set([
  'police',
  'local_government_office',
  'government_office',
  'city_hall',
  'courthouse',
  'fire_station',
  'embassy',
  'post_office',
  'hospital',
  'doctor',
  'dentist',
  'bank',
  'finance',
  'real_estate_agency',
  'insurance_agency',
  'school',
  'university',
  'primary_school',
  'secondary_school',
  'accounting',
  'lawyer',
])

/**
 * Institution name patterns when Google mis-tags a public office as restaurant/store.
 * Complements EXCLUDED_GOOGLE_TYPES; not a substitute for type-based exclusion.
 */
export const GOOGLE_INSTITUTION_NAME_PATTERNS = [
  'police department',
  'police dept',
  ' sheriffs',
  'sheriff office',
  'sheriff\'s office',
  'fire department',
  'fire dept',
  'city hall',
  'courthouse',
  'municipal court',
  'government office',
  'public safety',
  'law enforcement',
  'district attorney',
  'probation office',
  'immigration office',
  'dmv',
  'post office',
  'embassy',
] as const

/**
 * Name blacklist mirrored from get_nearby_restrooms RPC ILIKE filters (verified in Faz 0 review).
 * Applied to Google results only; Supabase public restroom rows are exempt.
 */
export const GOOGLE_NAME_BLACKLIST_PATTERNS = [
  'medical',
  'clinic',
  'dental',
  'dentist',
  'orthodont',
  'physician',
  'hospital',
  'urgent care',
  'chiropract',
  'veterinar',
  'bank',
  'credit union',
  'realty',
  'real estate',
  'realtor',
  'salon',
  'spa',
  'barber',
  'corporate',
  'headquarters',
  ' law firm',
  'attorney',
  'insurance',
  'auto repair',
  'car wash',
  'storage',
  'warehouse',
  ' office',
  'offices',
  'head office',
  'corporate office',
] as const

export type NearbyCategoryGroup = 'business_restroom' | 'public_restroom'

export type NearbySourceKind = 'google' | 'cache' | 'cache_stale'

/** Stable API contract — Faz 2/3 depend on these fields. brand_name/logo_url intentionally omitted. */
export type NearbyPlaceResult = {
  place_id: string
  name: string
  address: string
  lat: number
  lng: number
  types: string[]
  distance_m: number
  category_group: NearbyCategoryGroup
  has_code: boolean
  verified: boolean
  has_gendered_pins: boolean
  access_available: boolean
  source: string | null
}

export type NearbyApiResponse = {
  cell: string
  cached: boolean
  source: NearbySourceKind
  count: number
  places: NearbyPlaceResult[]
  /** Preview-only diagnostic block when debug=1 is requested. */
  _preview_audit?: NearbyPreviewAudit
}

export type NearbyPreviewAudit = {
  google_tiers_m: number[]
  tiers: Array<{ radius_m: number; raw_count: number; passed_filter_count: number }>
  filtered_out: Array<{ name: string; reason: string | null; raw_types: string[] }>
  lookup?: {
    query: string
    in_raw_google: boolean
    in_final: boolean
    first_tier_m?: number
    filter_reason?: string | null
  }
}

export type GoogleRawPlace = {
  id: string
  displayName?: { text?: string }
  formattedAddress?: string
  location?: { latitude?: number; longitude?: number }
  types?: string[]
  primaryType?: string
}

export type GooglePlaceFilterAudit = {
  name: string
  raw_types: string[]
  primary_type: string | null
  matching_allowed_type: string | null
  excluded_type_hit: string | null
  institution_name_hit: boolean
  blacklist_hit: boolean
  decision: 'included' | 'excluded'
  exclusion_reason: string | null
}

export type CachePayload = {
  center: { lat: number; lng: number }
  places: GoogleRawPlace[]
}

export type RestroomOverlayRow = {
  place_id: string | null
  has_code: boolean | null
  verified: string | null
  status: string | null
  pin_male: string | null
  pin_female: string | null
}

export type PublicRestroomRow = {
  id: number | string
  name: string
  address: string
  lat: number
  lng: number
  type: string | null
  source: string | null
  place_id: string | null
  has_code: boolean | null
  verified: string | null
  status: string | null
  pin_male: string | null
  pin_female: string | null
}

export type NearbyDeps = {
  googleFetch: typeof fetch
  supabase: SupabaseClient | null
  now: () => number
  googleApiKey: string
  onGoogleCall?: (radiusMeters: number) => void
}

let cacheTablesMissingWarned = false

function isCacheTableMissingError(error: { code?: string; message?: string }): boolean {
  if (error.code === 'PGRST205') return true
  const msg = error.message ?? ''
  return msg.includes('google_nearby_cache') || msg.includes('google_places_seen')
}

function warnCacheTablesMissingOnce() {
  if (!cacheTablesMissingWarned) {
    cacheTablesMissingWarned = true
    console.warn('[nearby] cache tables not found — running in degrade mode without DB cache')
  }
}

export type NearbyDevTelemetry = {
  cache_hit: boolean
  google_tier_200m: boolean
  google_tier_500m: boolean
  google_tier_2000m: boolean
  final_count: number
}

/** Development-only request telemetry (no secrets, no PII). */
export function logNearbyDevTelemetry(telemetry: NearbyDevTelemetry): void {
  if (process.env.NODE_ENV === 'production') return
  console.log('[nearby:telemetry]', JSON.stringify(telemetry))
}

export function resetNearbyCacheWarningsForTests() {
  cacheTablesMissingWarned = false
}

export type NearbyRequest = {
  lat: number
  lng: number
  previewAudit?: boolean
  targetName?: string
}

export function normalizeGooglePlaceId(value: string | null | undefined): string | null {
  if (value == null) return null
  let id = value.trim()
  if (!id) return null
  if (id.startsWith('places/')) id = id.slice('places/'.length)
  id = id.trim()
  return id || null
}

export function isGooglePlaceIdForJoin(value: string | null | undefined): boolean {
  const id = normalizeGooglePlaceId(value)
  if (!id) return false
  if (id.startsWith('osm:')) return false
  return id.startsWith('ChIJ') || id.startsWith('Eh') || id.startsWith('Ei')
}

export function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function cellKey(lat: number, lng: number): string {
  return `${Math.floor(lat / CELL_SIZE)}_${Math.floor(lng / CELL_SIZE)}`
}

export function parseCoordinates(
  latRaw: string | null,
  lngRaw: string | null,
): { lat: number; lng: number } | { error: string } {
  if (latRaw == null || lngRaw == null) return { error: 'Missing coordinates' }
  const lat = Number(latRaw)
  const lng = Number(lngRaw)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { error: 'Invalid coordinates' }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return { error: 'Coordinates out of range' }
  return { lat, lng }
}

export function hasGenderedPins(row: {
  pin_male?: string | null
  pin_female?: string | null
}): boolean {
  const male = row.pin_male?.trim()
  const female = row.pin_female?.trim()
  return !!(male || female)
}

export function overlayBooleans(row: RestroomOverlayRow | null | undefined): {
  has_code: boolean
  verified: boolean
  has_gendered_pins: boolean
  access_available: boolean
} {
  if (!row) {
    return {
      has_code: false,
      verified: false,
      has_gendered_pins: false,
      access_available: false,
    }
  }
  const has_code = row.has_code === true
  const verified = mapNearbyVerifiedBoolean(row)
  const has_gendered_pins = hasGenderedPins(row)
  const access_available = has_code || verified
  return { has_code, verified, has_gendered_pins, access_available }
}

export function isBlacklistedGoogleName(name: string): boolean {
  const lower = name.toLowerCase()
  return GOOGLE_NAME_BLACKLIST_PATTERNS.some((p) => lower.includes(p))
}

export function isInstitutionExcludedGoogleName(name: string): boolean {
  const lower = name.toLowerCase()
  return GOOGLE_INSTITUTION_NAME_PATTERNS.some((p) => lower.includes(p))
}

export function collectGooglePlaceTypeTokens(
  types: string[] | undefined,
  primaryType?: string | null,
): string[] {
  const tokens = new Set<string>()
  for (const t of types ?? []) {
    if (t) tokens.add(t)
  }
  if (primaryType) tokens.add(primaryType)
  return [...tokens]
}

export function findExcludedGoogleType(
  types: string[] | undefined,
  primaryType?: string | null,
): string | null {
  for (const t of collectGooglePlaceTypeTokens(types, primaryType)) {
    if (EXCLUDED_GOOGLE_TYPES.has(t)) return t
  }
  return null
}

export function getMatchingAllowedBusinessType(types: string[] | undefined): string | null {
  if (!types?.length) return null
  for (const t of types) {
    if (ALLOWED_BUSINESS_TYPES.has(t)) return t
  }
  return null
}

export function googlePlaceMatchesIncludedTypes(types: string[] | undefined): boolean {
  return getMatchingAllowedBusinessType(types) != null
}

export function auditGooglePlaceFilter(
  place: Pick<GoogleRawPlace, 'displayName' | 'types' | 'primaryType'>,
): GooglePlaceFilterAudit {
  const name = place.displayName?.text?.trim() ?? ''
  const rawTypes = place.types ?? []
  const primaryType = place.primaryType ?? null
  const excludedTypeHit = findExcludedGoogleType(rawTypes, primaryType)
  const institutionHit = name ? isInstitutionExcludedGoogleName(name) : false
  const blacklistHit = name ? isBlacklistedGoogleName(name) : false
  const matchingAllowed = getMatchingAllowedBusinessType(rawTypes)

  let decision: GooglePlaceFilterAudit['decision'] = 'included'
  let exclusionReason: string | null = null

  if (excludedTypeHit) {
    decision = 'excluded'
    exclusionReason = `excluded_type:${excludedTypeHit}`
  } else if (institutionHit) {
    decision = 'excluded'
    exclusionReason = 'institution_name'
  } else if (blacklistHit) {
    decision = 'excluded'
    exclusionReason = 'name_blacklist'
  } else if (!matchingAllowed) {
    decision = 'excluded'
    exclusionReason = 'no_allowed_business_type'
  }

  return {
    name,
    raw_types: rawTypes,
    primary_type: primaryType,
    matching_allowed_type: matchingAllowed,
    excluded_type_hit: excludedTypeHit,
    institution_name_hit: institutionHit,
    blacklist_hit: blacklistHit,
    decision,
    exclusion_reason: exclusionReason,
  }
}

export function nearbyResultPriority(place: NearbyPlaceResult): number {
  if (place.verified) return 0
  if (place.has_code) return 1
  if (place.category_group === 'public_restroom') return 2
  return 3
}

export function isGoogleDiscoveryOnlyPlace(place: Pick<NearbyPlaceResult, 'category_group' | 'source' | 'has_code' | 'verified' | 'access_available'>): boolean {
  return (
    place.category_group === 'business_restroom' &&
    place.source === 'google' &&
    !place.has_code &&
    !place.verified &&
    !place.access_available
  )
}

export function shouldFallbackNearby(
  places: Array<{ distance_m: number }>,
): boolean {
  if (places.length === 0) return true
  if (places.length < NEARBY_FALLBACK_MIN_COUNT) return true
  const closest = Math.min(...places.map((p) => p.distance_m))
  return closest > NEARBY_FALLBACK_DISTANCE_M
}

export function parseCachePayload(raw: unknown): CachePayload | null {
  if (Array.isArray(raw)) {
    return null
  }
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const center = obj.center as { lat?: number; lng?: number } | undefined
  const places = obj.places
  if (
    !center ||
    typeof center.lat !== 'number' ||
    typeof center.lng !== 'number' ||
    !Array.isArray(places)
  ) {
    return null
  }
  return { center: { lat: center.lat, lng: center.lng }, places: places as GoogleRawPlace[] }
}

export function cacheCenterTooFar(
  userLat: number,
  userLng: number,
  center: { lat: number; lng: number },
): boolean {
  return haversineDistanceMeters(userLat, userLng, center.lat, center.lng) > CACHE_STALE_DISTANCE_M
}

export function mergeGooglePlaces(...groups: GoogleRawPlace[][]): GoogleRawPlace[] {
  const seen = new Set<string>()
  const merged: GoogleRawPlace[] = []
  for (const group of groups) {
    for (const place of group) {
      const id = normalizeGooglePlaceId(place.id)
      if (!id || seen.has(id)) continue
      seen.add(id)
      merged.push(place)
    }
  }
  return merged
}

export function trimNearbyResults(places: NearbyPlaceResult[]): NearbyPlaceResult[] {
  const sorted = sortNearbyPlaces(places)
  const close = sorted.filter((p) => p.distance_m <= NEARBY_KEEP_CLOSE_M)
  const far = sorted.filter((p) => p.distance_m > NEARBY_KEEP_CLOSE_M)
  const farSlots = Math.max(NEARBY_MAX_TOTAL_RESULTS - close.length, 0)
  return [...close, ...far.slice(0, farSlots)]
}

export function isWithinPublicRestroomRadius(distanceM: number): boolean {
  return distanceM <= PUBLIC_RESTROOM_RADIUS_M
}

export function mapGoogleRawToCandidate(
  place: GoogleRawPlace,
  userLat: number,
  userLng: number,
): NearbyPlaceResult | null {
  const place_id = normalizeGooglePlaceId(place.id)
  const lat = place.location?.latitude
  const lng = place.location?.longitude
  const name = place.displayName?.text?.trim()
  if (!place_id || lat == null || lng == null || !name) return null

  const audit = auditGooglePlaceFilter(place)
  if (audit.decision === 'excluded') return null

  return {
    place_id,
    name,
    address: place.formattedAddress?.trim() || '',
    lat,
    lng,
    types: place.types ?? [],
    distance_m: haversineDistanceMeters(userLat, userLng, lat, lng),
    category_group: 'business_restroom',
    has_code: false,
    verified: false,
    has_gendered_pins: false,
    access_available: false,
    source: 'google',
  }
}

export function sortNearbyPlaces(places: NearbyPlaceResult[]): NearbyPlaceResult[] {
  return [...places].sort((a, b) => {
    const bandA = Math.floor(a.distance_m / NEARBY_CLOSE_GROUP_M)
    const bandB = Math.floor(b.distance_m / NEARBY_CLOSE_GROUP_M)
    if (bandA !== bandB) return bandA - bandB

    const pri = nearbyResultPriority(a) - nearbyResultPriority(b)
    if (pri !== 0) return pri

    return a.distance_m - b.distance_m
  })
}

export function dedupeNearbyPlaces(places: NearbyPlaceResult[]): NearbyPlaceResult[] {
  const seen = new Set<string>()
  const out: NearbyPlaceResult[] = []
  for (const p of places) {
    const key = p.place_id
    if (seen.has(key)) continue
    seen.add(key)
    out.push(p)
  }
  return out
}

export function assertNoPinFieldsInResponse(payload: unknown): void {
  const json = JSON.stringify(payload)
  if (/"pin(_male|_female)?"\s*:/.test(json)) {
    throw new Error('Nearby response must not contain pin fields')
  }
}

const GOOGLE_FIELD_MASK =
  'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType'

export async function fetchGoogleSearchNearby(
  lat: number,
  lng: number,
  radiusMeters: number,
  deps: Pick<NearbyDeps, 'googleFetch' | 'googleApiKey' | 'onGoogleCall'>,
): Promise<GoogleRawPlace[]> {
  deps.onGoogleCall?.(radiusMeters)
  const res = await deps.googleFetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': deps.googleApiKey,
      'X-Goog-FieldMask': GOOGLE_FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes: [...INCLUDED_TYPES],
      maxResultCount: 20,
      rankPreference: 'DISTANCE',
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radiusMeters,
        },
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Google Places searchNearby failed (${res.status}): ${text.slice(0, 200)}`)
  }

  const data = (await res.json()) as { places?: GoogleRawPlace[] }
  return data.places ?? []
}

export async function readNearbyCache(
  supabase: SupabaseClient,
  key: string,
  now: number,
  options?: { allowStale?: boolean },
): Promise<{ payload: CachePayload; fetchedAt: number } | null> {
  const { data, error } = await supabase
    .from('google_nearby_cache')
    .select('cell_key, payload, fetched_at')
    .eq('cell_key', key)
    .maybeSingle()

  if (error) {
    if (isCacheTableMissingError(error)) {
      warnCacheTablesMissingOnce()
    } else {
      console.error('[nearby] cache read error:', error.message)
    }
    return null
  }
  if (!data?.payload || !data.fetched_at) return null

  const fetchedAt = new Date(data.fetched_at as string).getTime()
  if (!Number.isFinite(fetchedAt)) return null
  if (!options?.allowStale && now - fetchedAt > CACHE_TTL_MS) return null

  const payload = parseCachePayload(data.payload)
  if (!payload) {
    console.warn('[nearby] legacy cache payload ignored for cell', key)
    return null
  }

  return { payload, fetchedAt }
}

export async function writeNearbyCache(
  supabase: SupabaseClient,
  key: string,
  payload: CachePayload,
  now: number,
): Promise<void> {
  const { error } = await supabase.from('google_nearby_cache').upsert({
    cell_key: key,
    payload,
    fetched_at: new Date(now).toISOString(),
  })
  if (error) {
    if (isCacheTableMissingError(error)) {
      warnCacheTablesMissingOnce()
    } else {
      console.error('[nearby] cache write error:', error.message)
    }
  }
}

export async function upsertPlacesSeen(
  supabase: SupabaseClient,
  placeIds: string[],
  now: number,
): Promise<void> {
  if (!placeIds.length) return
  const iso = new Date(now).toISOString()

  for (const place_id of placeIds) {
    const { data: existing, error: readError } = await supabase
      .from('google_places_seen')
      .select('place_id')
      .eq('place_id', place_id)
      .maybeSingle()

    if (readError) {
      if (isCacheTableMissingError(readError)) {
        warnCacheTablesMissingOnce()
        return
      }
      console.error('[nearby] places_seen read error:', readError.message)
      continue
    }

    if (existing) {
      const { error } = await supabase
        .from('google_places_seen')
        .update({ last_seen: iso })
        .eq('place_id', place_id)
      if (error) console.error('[nearby] places_seen update error:', error.message)
    } else {
      const { error } = await supabase.from('google_places_seen').insert({
        place_id,
        first_seen: iso,
        last_seen: iso,
      })
      if (error) console.error('[nearby] places_seen insert error:', error.message)
    }
  }
}

export async function fetchRestroomOverlay(
  supabase: SupabaseClient,
  googlePlaceIds: string[],
): Promise<Map<string, RestroomOverlayRow>> {
  const map = new Map<string, RestroomOverlayRow>()
  const ids = googlePlaceIds.filter(isGooglePlaceIdForJoin)
  if (!ids.length) return map

  const { data, error } = await supabase
    .from('restroom')
    .select('place_id, has_code, verified, status, pin_male, pin_female')
    .in('place_id', ids)

  if (error) {
    console.error('[nearby] restroom metadata unavailable:', error.message)
    return map
  }

  for (const row of (data ?? []) as RestroomOverlayRow[]) {
    const pid = normalizeGooglePlaceId(row.place_id)
    if (pid) map.set(pid, row)
  }
  return map
}

function bboxDeltas(lat: number, radiusMeters: number) {
  const miles = radiusMeters / 1609.34
  const latDelta = miles / 69
  const lngDelta = miles / (69 * Math.cos((lat * Math.PI) / 180))
  return { latDelta, lngDelta }
}

export async function fetchPublicRestrooms(
  supabase: SupabaseClient,
  userLat: number,
  userLng: number,
  radiusMeters: number,
): Promise<PublicRestroomRow[]> {
  const { latDelta, lngDelta } = bboxDeltas(userLat, radiusMeters)

  const { data, error } = await supabase
    .from('restroom')
    .select(
      'id, name, address, lat, lng, type, source, place_id, has_code, verified, status, pin_male, pin_female',
    )
    .in('type', [...PUBLIC_RESTROOM_TYPES])
    .or('opt_out.is.null,opt_out.eq.false')
    .gte('lat', userLat - latDelta)
    .lte('lat', userLat + latDelta)
    .gte('lng', userLng - lngDelta)
    .lte('lng', userLng + lngDelta)
    .limit(200)

  if (error) {
    console.error('[nearby] public restroom query error:', error.message)
    return []
  }

  return ((data ?? []) as PublicRestroomRow[]).filter(
    (r) =>
      haversineDistanceMeters(userLat, userLng, r.lat, r.lng) <= radiusMeters &&
      PUBLIC_RESTROOM_TYPES.includes(r.type as (typeof PUBLIC_RESTROOM_TYPES)[number]),
  )
}

export function mapPublicRestroomRow(
  row: PublicRestroomRow,
  userLat: number,
  userLng: number,
): NearbyPlaceResult {
  const booleans = overlayBooleans(row)
  const place_id =
    normalizeGooglePlaceId(row.place_id) ?? String(row.id)

  return {
    place_id,
    name: row.name,
    address: row.address ?? '',
    lat: row.lat,
    lng: row.lng,
    types: row.type ? [row.type] : [],
    distance_m: haversineDistanceMeters(userLat, userLng, row.lat, row.lng),
    category_group: 'public_restroom',
    ...booleans,
    source: row.source ?? 'supabase',
  }
}

export function applyOverlayToBusinessPlaces(
  places: NearbyPlaceResult[],
  overlay: Map<string, RestroomOverlayRow>,
): NearbyPlaceResult[] {
  return places.map((p) => {
    if (p.category_group !== 'business_restroom') return p
    const row = overlay.get(p.place_id)
    const booleans = overlayBooleans(row)
    return { ...p, ...booleans }
  })
}

export function googleRawToBusinessPlaces(
  rawPlaces: GoogleRawPlace[],
  userLat: number,
  userLng: number,
): NearbyPlaceResult[] {
  return rawPlaces
    .map((p) => mapGoogleRawToCandidate(p, userLat, userLng))
    .filter((p): p is NearbyPlaceResult => p != null)
}

export async function runGoogleNearbySearch(
  userLat: number,
  userLng: number,
  deps: Pick<NearbyDeps, 'googleFetch' | 'googleApiKey' | 'onGoogleCall'>,
  audit?: {
    tiers: Array<{ radius_m: number; raw_count: number; passed_filter_count: number }>
    raw_names_by_tier: Array<{ radius_m: number; names: string[] }>
  },
): Promise<GoogleRawPlace[]> {
  const recordTier = (radiusM: number, raw: GoogleRawPlace[]) => {
    if (!audit) return
    audit.tiers.push({
      radius_m: radiusM,
      raw_count: raw.length,
      passed_filter_count: googleRawToBusinessPlaces(raw, userLat, userLng).length,
    })
    audit.raw_names_by_tier.push({
      radius_m: radiusM,
      names: raw.map((p) => p.displayName?.text?.trim() || '').filter(Boolean),
    })
  }

  const tier1 = await fetchGoogleSearchNearby(
    userLat,
    userLng,
    NEARBY_RADIUS_TIER1_M,
    deps,
  )
  recordTier(NEARBY_RADIUS_TIER1_M, tier1)
  let merged = tier1
  let candidates = googleRawToBusinessPlaces(merged, userLat, userLng)

  if (shouldFallbackNearby(candidates)) {
    const tier2 = await fetchGoogleSearchNearby(
      userLat,
      userLng,
      NEARBY_RADIUS_TIER2_M,
      deps,
    )
    recordTier(NEARBY_RADIUS_TIER2_M, tier2)
    merged = mergeGooglePlaces(tier1, tier2)
    candidates = googleRawToBusinessPlaces(merged, userLat, userLng)

    if (shouldFallbackNearby(candidates)) {
      const tier3 = await fetchGoogleSearchNearby(
        userLat,
        userLng,
        NEARBY_RADIUS_TIER3_M,
        deps,
      )
      recordTier(NEARBY_RADIUS_TIER3_M, tier3)
      merged = mergeGooglePlaces(tier1, tier2, tier3)
    }
  }

  return merged
}

export async function buildNearbyResponse(
  request: NearbyRequest,
  deps: NearbyDeps,
): Promise<NearbyApiResponse> {
  const { lat, lng } = request
  const cell = cellKey(lat, lng)
  const now = deps.now()
  let cacheAvailable = true
  let cached = false
  let source: NearbySourceKind = 'google'
  let rawGoogle: GoogleRawPlace[] = []
  let cacheCenter: { lat: number; lng: number } | null = null
  const googleTiersUsed = new Set<number>()
  let tierAudit: {
    tiers: Array<{ radius_m: number; raw_count: number; passed_filter_count: number }>
    raw_names_by_tier: Array<{ radius_m: number; names: string[] }>
  } | null = null

  if (deps.supabase) {
    try {
      const cachedEntry = await readNearbyCache(deps.supabase, cell, now)
      if (cachedEntry) {
        cacheCenter = cachedEntry.payload.center
        const staleCenter = cacheCenterTooFar(lat, lng, cachedEntry.payload.center)
        if (!staleCenter) {
          rawGoogle = cachedEntry.payload.places
          cached = true
          source = 'cache'
        }
      }
    } catch (err) {
      cacheAvailable = false
      console.warn('[nearby] cache unavailable — degrade mode', err)
    }
  } else {
    cacheAvailable = false
    console.warn('[nearby] cache unavailable — no supabase client')
  }

  if (!cached) {
    try {
      tierAudit = request.previewAudit
        ? { tiers: [], raw_names_by_tier: [] }
        : null
      rawGoogle = await runGoogleNearbySearch(lat, lng, {
        ...deps,
        onGoogleCall: (radiusM) => {
          googleTiersUsed.add(radiusM)
          deps.onGoogleCall?.(radiusM)
        },
      }, tierAudit ?? undefined)
      source = 'google'

      if (deps.supabase && cacheAvailable) {
        await writeNearbyCache(
          deps.supabase,
          cell,
          { center: { lat, lng }, places: rawGoogle },
          now,
        )
        cacheCenter = { lat, lng }
        const ids = rawGoogle
          .map((p) => normalizeGooglePlaceId(p.id))
          .filter((id): id is string => !!id)
        await upsertPlacesSeen(deps.supabase, ids, now)
      }
    } catch (googleErr) {
      console.error('[nearby] Google fetch failed:', googleErr)
      if (deps.supabase && cacheAvailable) {
        const stale = await readNearbyCache(deps.supabase, cell, now, { allowStale: true })
        if (stale) {
          rawGoogle = stale.payload.places
          cacheCenter = stale.payload.center
          cached = true
          source = 'cache_stale'
        } else {
          throw googleErr
        }
      } else {
        throw googleErr
      }
    }
  }

  let businessPlaces = googleRawToBusinessPlaces(rawGoogle, lat, lng)

  if (
    source === 'cache_stale' ||
    (cacheCenter != null && cacheCenterTooFar(lat, lng, cacheCenter))
  ) {
    businessPlaces = businessPlaces.map((p) => ({
      ...p,
      distance_m: haversineDistanceMeters(lat, lng, p.lat, p.lng),
    }))
  }

  const googleIds = businessPlaces.map((p) => p.place_id)
  const overlay =
    deps.supabase != null
      ? await fetchRestroomOverlay(deps.supabase, googleIds)
      : new Map<string, RestroomOverlayRow>()

  businessPlaces = applyOverlayToBusinessPlaces(businessPlaces, overlay)

  const publicRows =
    deps.supabase != null
      ? await fetchPublicRestrooms(deps.supabase, lat, lng, PUBLIC_RESTROOM_RADIUS_M)
      : []

  const publicPlaces = publicRows.map((row) => mapPublicRestroomRow(row, lat, lng))

  const businessIds = new Set(businessPlaces.map((p) => p.place_id))
  const merged = trimNearbyResults(
    sortNearbyPlaces(
      dedupeNearbyPlaces([
        ...businessPlaces,
        ...publicPlaces.filter((p) => !businessIds.has(p.place_id)),
      ]),
    ),
  )

  const response: NearbyApiResponse = {
    cell,
    cached,
    source,
    count: merged.length,
    places: merged,
  }

  assertNoPinFieldsInResponse(response)

  if (request.previewAudit) {
    const filteredOut: NearbyPreviewAudit['filtered_out'] = []
    for (const raw of rawGoogle) {
      const placeAudit = auditGooglePlaceFilter(raw)
      if (placeAudit.decision === 'excluded') {
        filteredOut.push({
          name: placeAudit.name,
          reason: placeAudit.exclusion_reason,
          raw_types: placeAudit.raw_types,
        })
      }
    }

    let lookup: NearbyPreviewAudit['lookup']
    if (request.targetName?.trim()) {
      const query = request.targetName.trim().toLowerCase()
      const inFinal = merged.some((p) => p.name.toLowerCase().includes(query))
      const rawMatch = rawGoogle.find((p) =>
        (p.displayName?.text ?? '').toLowerCase().includes(query),
      )
      let firstTier: number | undefined
      if (tierAudit) {
        for (const tier of tierAudit.raw_names_by_tier) {
          if (tier.names.some((n) => n.toLowerCase().includes(query))) {
            firstTier = tier.radius_m
            break
          }
        }
      }
      lookup = {
        query: request.targetName.trim(),
        in_raw_google: !!rawMatch,
        in_final: inFinal,
        first_tier_m: firstTier,
        filter_reason: rawMatch ? auditGooglePlaceFilter(rawMatch).exclusion_reason : 'not_in_google_raw',
      }
    }

    response._preview_audit = {
      google_tiers_m: [...googleTiersUsed],
      tiers: tierAudit?.tiers ?? [],
      filtered_out: filteredOut.slice(0, 25),
      lookup,
    }
  }

  logNearbyDevTelemetry({
    cache_hit: cached,
    google_tier_200m: googleTiersUsed.has(NEARBY_RADIUS_TIER1_M),
    google_tier_500m: googleTiersUsed.has(NEARBY_RADIUS_TIER2_M),
    google_tier_2000m: googleTiersUsed.has(NEARBY_RADIUS_TIER3_M),
    final_count: merged.length,
  })

  return response
}
