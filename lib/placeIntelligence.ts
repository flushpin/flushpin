export const PLACE_PROVIDER_FIELD_MASKS = {
  nearby:
    'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType',
  textResolution: 'places.id,places.displayName,places.formattedAddress,places.location',
  tripNearby:
    'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.primaryType,places.currentOpeningHours',
  route: 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
} as const

export type PlaceProvider =
  | 'flushpin'
  | 'google'
  | 'openstreetmap'
  | 'open_charge_map'
  | 'overture'
  | 'government'
export type PlaceDataOwnership =
  | 'flushpin_owned'
  | 'open_public'
  | 'provider_identifier'
  | 'temporary_provider'
  | 'legacy_unknown'

export type PlaceProvenance = {
  provider: PlaceProvider
  ownership: PlaceDataOwnership
  providerObjectId?: string
  sourceDataset?: string
  sourceUrl?: string
  license?: string
  attribution?: string
  observedAt?: string
  expiresAt?: string
}

export type FieldRetentionPolicy = {
  ownership: PlaceDataOwnership
  persistence: 'indefinite' | 'temporary' | 'prohibited'
  maxAgeDays?: number
}

export function providerFieldRetentionPolicy(
  provider: PlaceProvider,
  field: string,
  sourceLicense?: string,
): FieldRetentionPolicy {
  if (provider === 'flushpin') {
    return { ownership: 'flushpin_owned', persistence: 'indefinite' }
  }
  if (provider === 'google') {
    if (['id', 'place_id', 'provider_object_id'].includes(field)) {
      return { ownership: 'provider_identifier', persistence: 'indefinite' }
    }
    if (['lat', 'lng', 'latitude', 'longitude'].includes(field)) {
      return {
        ownership: 'temporary_provider',
        persistence: 'temporary',
        maxAgeDays: 30,
      }
    }
    return { ownership: 'temporary_provider', persistence: 'prohibited' }
  }
  if (provider === 'openstreetmap') {
    return { ownership: 'open_public', persistence: 'indefinite' }
  }
  if (
    provider === 'open_charge_map' &&
    sourceLicense?.trim().toUpperCase() === 'CC-BY-4.0'
  ) {
    return { ownership: 'open_public', persistence: 'indefinite' }
  }
  return { ownership: 'legacy_unknown', persistence: 'prohibited' }
}

export type CoverageCandidate = {
  lat: number
  lng: number
  verifiedAt?: string | null
  confidence?: 'verified' | 'community' | 'unverified'
}

export type CoverageThresholds = {
  minResults: number
  minFreshResults: number
  maxClosestDistanceMeters: number
  maxStaleAgeDays: number
}

export type CoverageAssessment = {
  sufficient: boolean
  resultCount: number
  freshResultCount: number
  closestDistanceMeters: number | null
  confidence: number
  reasons: string[]
}

export type PlaceIntelligenceConfig = {
  externalFallbackEnabled: boolean
  googlePlacesEnabled: boolean
  googleRoutesEnabled: boolean
  nearbyCoverage: CoverageThresholds
  destinationCoverage: CoverageThresholds
  tripMinResultsPerSegment: number
  tripMaxGoogleCalls: number
  maxGoogleCallsPerSession: number
  dailyGoogleRequestBudget: number
  providerTimeoutMs: number
  circuitBreakerFailures: number
  circuitBreakerCooldownMs: number
  estimatedPlacesCallUsd: number | null
  estimatedRoutesCallUsd: number | null
}

export type ProviderFeature = 'places_nearby' | 'places_text' | 'geocoding' | 'routes'

export class ProviderGuardError extends Error {
  constructor(
    public readonly code:
      | 'provider_disabled'
      | 'daily_budget_exceeded'
      | 'session_budget_exceeded'
      | 'circuit_open'
      | 'provider_timeout',
  ) {
    super(code)
    this.name = 'ProviderGuardError'
  }
}

export function providerRequestFingerprint(value: unknown): string {
  const input = typeof value === 'string' ? value : JSON.stringify(value)
  let hash = 2_166_136_261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return (hash >>> 0).toString(36)
}

function booleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value.trim() === '') return fallback
  return !['0', 'false', 'off', 'no'].includes(value.trim().toLowerCase())
}

function numberEnv(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback
}

function optionalCost(value: string | undefined): number | null {
  if (value == null || value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

export function getPlaceIntelligenceConfig(
  env: Record<string, string | undefined> = process.env,
): PlaceIntelligenceConfig {
  return {
    externalFallbackEnabled: booleanEnv(env.EXTERNAL_PLACE_FALLBACK_ENABLED, true),
    googlePlacesEnabled: booleanEnv(env.GOOGLE_PLACES_ENABLED, true),
    googleRoutesEnabled: booleanEnv(env.GOOGLE_ROUTES_ENABLED, true),
    nearbyCoverage: {
      minResults: numberEnv(env.PLACE_COVERAGE_MIN_RESULTS, 8, 1, 50),
      minFreshResults: numberEnv(env.PLACE_COVERAGE_MIN_FRESH_RESULTS, 1, 0, 50),
      maxClosestDistanceMeters: numberEnv(env.PLACE_COVERAGE_MAX_CLOSEST_METERS, 300, 25, 10_000),
      maxStaleAgeDays: numberEnv(env.PLACE_COVERAGE_MAX_STALE_DAYS, 90, 1, 3_650),
    },
    destinationCoverage: {
      minResults: numberEnv(env.DESTINATION_COVERAGE_MIN_RESULTS, 4, 1, 50),
      minFreshResults: numberEnv(env.DESTINATION_COVERAGE_MIN_FRESH_RESULTS, 1, 0, 50),
      maxClosestDistanceMeters: numberEnv(env.DESTINATION_COVERAGE_MAX_CLOSEST_METERS, 1_500, 25, 25_000),
      maxStaleAgeDays: numberEnv(env.PLACE_COVERAGE_MAX_STALE_DAYS, 90, 1, 3_650),
    },
    tripMinResultsPerSegment: numberEnv(env.TRIP_COVERAGE_MIN_RESULTS_PER_SEGMENT, 2, 1, 20),
    tripMaxGoogleCalls: numberEnv(env.MAX_GOOGLE_CALLS_PER_TRIP, 4, 0, 12),
    maxGoogleCallsPerSession: numberEnv(env.MAX_GOOGLE_CALLS_PER_SESSION, 12, 1, 500),
    dailyGoogleRequestBudget: numberEnv(env.DAILY_GOOGLE_REQUEST_BUDGET, 1_000, 0, 1_000_000),
    providerTimeoutMs: numberEnv(env.EXTERNAL_PROVIDER_TIMEOUT_MS, 12_000, 1_000, 30_000),
    circuitBreakerFailures: numberEnv(env.EXTERNAL_PROVIDER_CIRCUIT_FAILURES, 4, 1, 50),
    circuitBreakerCooldownMs: numberEnv(
      env.EXTERNAL_PROVIDER_CIRCUIT_COOLDOWN_MS,
      60_000,
      1_000,
      3_600_000,
    ),
    estimatedPlacesCallUsd: optionalCost(env.GOOGLE_PLACES_ESTIMATED_COST_USD),
    estimatedRoutesCallUsd: optionalCost(env.GOOGLE_ROUTES_ESTIMATED_COST_USD),
  }
}

export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const earthRadius = 6_371_000
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function assessCoverage(
  center: { lat: number; lng: number },
  candidates: CoverageCandidate[],
  thresholds: CoverageThresholds,
  now = Date.now(),
): CoverageAssessment {
  const valid = candidates.filter(
    (candidate) => Number.isFinite(candidate.lat) && Number.isFinite(candidate.lng),
  )
  const distances = valid.map((candidate) => distanceMeters(center, candidate))
  const maxAgeMs = thresholds.maxStaleAgeDays * 86_400_000
  const freshResultCount = valid.filter((candidate) => {
    if (candidate.confidence === 'verified') return true
    const observed = candidate.verifiedAt ? new Date(candidate.verifiedAt).getTime() : Number.NaN
    return Number.isFinite(observed) && now - observed <= maxAgeMs
  }).length
  const closestDistanceMeters = distances.length ? Math.min(...distances) : null
  const reasons: string[] = []
  if (valid.length < thresholds.minResults) reasons.push('too_few_results')
  if (
    closestDistanceMeters == null ||
    closestDistanceMeters > thresholds.maxClosestDistanceMeters
  ) {
    reasons.push('closest_result_too_far')
  }
  if (freshResultCount < thresholds.minFreshResults) reasons.push('insufficient_freshness')

  const countScore = Math.min(1, valid.length / thresholds.minResults)
  const proximityScore =
    closestDistanceMeters == null
      ? 0
      : Math.max(0, 1 - closestDistanceMeters / thresholds.maxClosestDistanceMeters)
  const freshnessScore =
    thresholds.minFreshResults === 0
      ? 1
      : Math.min(1, freshResultCount / thresholds.minFreshResults)

  return {
    sufficient: reasons.length === 0,
    resultCount: valid.length,
    freshResultCount,
    closestDistanceMeters:
      closestDistanceMeters == null ? null : Math.round(closestDistanceMeters),
    confidence: Math.round((countScore * 0.45 + proximityScore * 0.3 + freshnessScore * 0.25) * 100),
    reasons,
  }
}

export function selectUncoveredRoutePoints(
  points: Array<{ lat: number; lng: number }>,
  localCandidates: CoverageCandidate[],
  radiusMeters: number,
  minResultsPerSegment: number,
  maxExternalCalls: number,
): Array<{ lat: number; lng: number }> {
  if (maxExternalCalls <= 0) return []
  const uncovered = points.filter((point) => {
    const nearbyCount = localCandidates.filter(
      (candidate) => distanceMeters(point, candidate) <= radiusMeters,
    ).length
    return nearbyCount < minResultsPerSegment
  })
  if (uncovered.length <= maxExternalCalls) return uncovered
  if (maxExternalCalls === 1) return [uncovered[Math.floor(uncovered.length / 2)]]

  const selected: Array<{ lat: number; lng: number }> = []
  for (let index = 0; index < maxExternalCalls; index += 1) {
    const sourceIndex = Math.round((index * (uncovered.length - 1)) / (maxExternalCalls - 1))
    selected.push(uncovered[sourceIndex])
  }
  return selected
}

type GatewayState = {
  day: string
  dailyCalls: number
  sessionCalls: Map<string, number>
  failures: Map<ProviderFeature, number>
  openUntil: Map<ProviderFeature, number>
}

const gatewayState: GatewayState = {
  day: '',
  dailyCalls: 0,
  sessionCalls: new Map(),
  failures: new Map(),
  openUntil: new Map(),
}
const inFlightProviderCalls = new Map<string, Promise<unknown>>()

function currentDay(now: number): string {
  return new Date(now).toISOString().slice(0, 10)
}

function resetDayIfNeeded(now: number) {
  const day = currentDay(now)
  if (gatewayState.day === day) return
  gatewayState.day = day
  gatewayState.dailyCalls = 0
  gatewayState.sessionCalls.clear()
}

export function resetProviderGatewayForTests(): void {
  gatewayState.day = ''
  gatewayState.dailyCalls = 0
  gatewayState.sessionCalls.clear()
  gatewayState.failures.clear()
  gatewayState.openUntil.clear()
  inFlightProviderCalls.clear()
}

export async function executeProviderCall<T>(options: {
  provider: 'google'
  feature: ProviderFeature
  requestKey: string
  sessionKey?: string
  config: PlaceIntelligenceConfig
  call: (signal: AbortSignal) => Promise<T>
  now?: () => number
  log?: (event: Record<string, unknown>) => void
}): Promise<T> {
  const existing = inFlightProviderCalls.get(options.requestKey)
  if (existing) return existing as Promise<T>

  const now = options.now?.() ?? Date.now()
  const enabled =
    options.feature === 'routes'
      ? options.config.googleRoutesEnabled
      : options.config.externalFallbackEnabled && options.config.googlePlacesEnabled
  if (!enabled) throw new ProviderGuardError('provider_disabled')

  resetDayIfNeeded(now)
  if (gatewayState.dailyCalls >= options.config.dailyGoogleRequestBudget) {
    throw new ProviderGuardError('daily_budget_exceeded')
  }
  const sessionKey = options.sessionKey?.trim()
  if (
    sessionKey &&
    (gatewayState.sessionCalls.get(sessionKey) ?? 0) >=
      options.config.maxGoogleCallsPerSession
  ) {
    throw new ProviderGuardError('session_budget_exceeded')
  }
  if ((gatewayState.openUntil.get(options.feature) ?? 0) > now) {
    throw new ProviderGuardError('circuit_open')
  }

  gatewayState.dailyCalls += 1
  if (sessionKey) {
    gatewayState.sessionCalls.set(sessionKey, (gatewayState.sessionCalls.get(sessionKey) ?? 0) + 1)
  }

  const promise = (async () => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options.config.providerTimeoutMs)
    const startedAt = options.now?.() ?? Date.now()
    try {
      const value = await options.call(controller.signal)
      gatewayState.failures.set(options.feature, 0)
      const estimatedCost =
        options.feature === 'routes'
          ? options.config.estimatedRoutesCallUsd
          : options.config.estimatedPlacesCallUsd
      options.log?.({
        event: 'provider_usage',
        provider: options.provider,
        feature: options.feature,
        requestKey: options.requestKey,
        durationMs: (options.now?.() ?? Date.now()) - startedAt,
        estimatedCostUsd: estimatedCost,
        dailyCalls: gatewayState.dailyCalls,
      })
      return value
    } catch (error) {
      const failures = (gatewayState.failures.get(options.feature) ?? 0) + 1
      gatewayState.failures.set(options.feature, failures)
      if (failures >= options.config.circuitBreakerFailures) {
        gatewayState.openUntil.set(options.feature, now + options.config.circuitBreakerCooldownMs)
      }
      if (controller.signal.aborted) throw new ProviderGuardError('provider_timeout')
      throw error
    } finally {
      clearTimeout(timeout)
      inFlightProviderCalls.delete(options.requestKey)
    }
  })()

  inFlightProviderCalls.set(options.requestKey, promise)
  return promise
}

export async function runCoverageAwareFallback<T>(options: {
  internalResults: T[]
  coverage: CoverageAssessment
  providerEnabled: boolean
  fetchProvider: () => Promise<T[]>
}): Promise<{ results: T[]; providerUsed: boolean; providerFailed: boolean }> {
  if (options.coverage.sufficient || !options.providerEnabled) {
    return {
      results: options.internalResults,
      providerUsed: false,
      providerFailed: false,
    }
  }
  try {
    const external = await options.fetchProvider()
    return {
      results: [...options.internalResults, ...external],
      providerUsed: true,
      providerFailed: false,
    }
  } catch {
    return {
      results: options.internalResults,
      providerUsed: true,
      providerFailed: true,
    }
  }
}

export type IdentityCandidate = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  categories: string[]
  kind?: 'recommendation' | 'destination_anchor'
  provenance: PlaceProvenance[]
}

export type IdentityMatch = {
  kept: IdentityCandidate
  merged: IdentityCandidate
  reason: 'qualified_provider_id' | 'normalized_name_address' | 'name_coordinate_category'
  confidence: number
}

function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function categoryCompatible(a: IdentityCandidate, b: IdentityCandidate): boolean {
  if (!a.categories.length || !b.categories.length) return false
  return a.categories.some((category) => b.categories.includes(category))
}

function qualifiedIds(candidate: IdentityCandidate): Set<string> {
  return new Set(
    candidate.provenance
      .filter((source) => source.providerObjectId)
      .map((source) => `${source.provider}:${source.providerObjectId}`),
  )
}

export function identityMatch(
  a: IdentityCandidate,
  b: IdentityCandidate,
): Omit<IdentityMatch, 'kept' | 'merged'> | null {
  if ((a.kind ?? 'recommendation') !== (b.kind ?? 'recommendation')) return null
  const aIds = qualifiedIds(a)
  if ([...qualifiedIds(b)].some((id) => aIds.has(id))) {
    return { reason: 'qualified_provider_id', confidence: 1 }
  }

  const nameA = normalizeText(a.name)
  const nameB = normalizeText(b.name)
  if (!nameA || nameA !== nameB) return null
  const addressA = normalizeText(a.address)
  const addressB = normalizeText(b.address)
  if (addressA && addressA === addressB && categoryCompatible(a, b)) {
    return { reason: 'normalized_name_address', confidence: 0.96 }
  }
  if (
    categoryCompatible(a, b) &&
    distanceMeters(a, b) <= 25 &&
    (!addressA || !addressB)
  ) {
    return { reason: 'name_coordinate_category', confidence: 0.86 }
  }
  return null
}

export function dedupeIdentityCandidates(candidates: IdentityCandidate[]): {
  places: IdentityCandidate[]
  matches: IdentityMatch[]
} {
  const places: IdentityCandidate[] = []
  const matches: IdentityMatch[] = []
  for (const candidate of candidates) {
    const existing = places.find((place) => identityMatch(place, candidate) != null)
    if (!existing) {
      places.push(candidate)
      continue
    }
    const match = identityMatch(existing, candidate)
    if (!match) continue
    existing.provenance = [...existing.provenance, ...candidate.provenance]
    matches.push({ kept: existing, merged: candidate, ...match })
  }
  return { places, matches }
}

export function assertPlaceIntelligencePinFree(payload: unknown): void {
  const serialized = JSON.stringify(payload)
  if (/"(?:pin|pin_male|pin_female)"\s*:/.test(serialized)) {
    throw new Error('Place intelligence payload contains a sensitive restroom access field')
  }
}
