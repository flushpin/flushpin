import type { PlaceProvenance } from './placeIntelligence'

export const TRIP_STOP_CATEGORIES = [
  'restrooms',
  'ev',
  'gas',
  'coffee',
  'restaurants',
  'fast-food',
  'stores',
] as const

export type TripStopCategory = (typeof TRIP_STOP_CATEGORIES)[number]
export type TripStopsMode = 'route' | 'destination'
export type LatLng = { lat: number; lng: number }

export const TRIP_STOP_LIMITS = {
  maxRouteMiles: 600,
  sampleSpacingMeters: 72_000,
  maxSamplePoints: 8,
  corridorMeters: 4_000,
  destinationMaxRadiusMiles: 5,
  maxCandidates: 120,
  maxDisplayedStops: 12,
  clusterMeters: 120,
} as const

export const GOOGLE_TRIP_STOP_TYPES = [
  'gas_station',
  'electric_vehicle_charging_station',
  'cafe',
  'coffee_shop',
  'restaurant',
  'fast_food_restaurant',
  'convenience_store',
  'grocery_store',
  'supermarket',
  'department_store',
] as const

export const TRIP_STOP_EXCLUDED_TYPES = new Set([
  'lodging',
  'hotel',
  'motel',
  'resort_hotel',
  'corporate_office',
  'office',
  'office_building',
  'real_estate_agency',
  'apartment_complex',
  'doctor',
  'dentist',
  'hospital',
  'lawyer',
  'bank',
  'school',
  'university',
  'warehouse',
  'industrial',
  'private_guest_room',
  'premise',
])

const APPROVED_TYPE_TO_CATEGORY: Record<string, TripStopCategory> = {
  public_restroom: 'restrooms',
  public_bathroom: 'restrooms',
  toilets: 'restrooms',
  gas_station: 'gas',
  fuel: 'gas',
  electric_vehicle_charging_station: 'ev',
  charging_station: 'ev',
  cafe: 'coffee',
  coffee_shop: 'coffee',
  restaurant: 'restaurants',
  fast_food_restaurant: 'fast-food',
  fast_food: 'fast-food',
  convenience_store: 'stores',
  grocery_store: 'stores',
  supermarket: 'stores',
  department_store: 'stores',
}

const EXCLUDED_NAME_PATTERNS = [
  /\b(hotel|motel|resort|apartments?|realty|real estate)\b/i,
  /\b(corporate|headquarters|office building|law firm|attorney)\b/i,
  /\b(medical|clinic|dental|dentist|hospital|bank|school|university)\b/i,
  /\b(warehouse|industrial|distribution center)\b/i,
]

export type RestroomConfidence =
  | 'flushpin_verified'
  | 'community_reported'
  | 'place_indicates_restroom'
  | 'restroom_nearby'
  | 'unknown'

export type TripStopCandidate = {
  id: string
  placeId?: string
  restroomId?: number
  name: string
  address: string
  lat: number
  lng: number
  types: string[]
  primaryType?: string
  categories: TripStopCategory[]
  source: 'google' | 'flushpin' | 'ev'
  provenance?: PlaceProvenance[]
  restroomConfidence: RestroomConfidence
  verifiedAt?: string | null
  accessible?: boolean
  openNow?: boolean | null
  rating?: number | null
  userRatingCount?: number | null
  routeDistanceMeters?: number
  distanceAlongRouteMeters?: number
  destinationDistanceMeters?: number
  ev?: {
    stationId: number | string
    network?: string
    connectorTypes?: string[]
    powerKw?: number | null
    chargerCount?: number | null
    operationalStatus?: string | null
    liveAvailability: 'unavailable'
  }
}

export type TripStop = TripStopCandidate & {
  score: number
  scoreExplanation: string
  services: TripStopCategory[]
  clusterMembers: Array<{
    id: string
    name: string
    category: TripStopCategory
    distanceMeters: number
  }>
}

export type TripRoute = {
  distanceMeters: number
  durationSeconds: number
  encodedPolyline: string
  points: LatLng[]
  origin: LatLng & { label: string }
  destination: LatLng & { label: string }
}

export type TripStopsResponse = {
  mode: TripStopsMode
  route?: TripRoute
  anchor?: LatLng & { label: string }
  stops: TripStop[]
  partialWarnings: string[]
  meta: {
    sampledPoints: number
    candidateCount: number
    displayedCount: number
    corridorMeters?: number
    radiusMiles?: number
    internalCoverageSufficient?: boolean
    externalSearchPoints?: number
    mapDisplay: 'maplibre' | 'external_only'
  }
}

function normalizeTypes(candidate: Pick<TripStopCandidate, 'types' | 'primaryType'>): string[] {
  return [...new Set([candidate.primaryType, ...candidate.types].filter(Boolean).map((t) => String(t).toLowerCase()))]
}

export function categoriesForTypes(types: string[]): TripStopCategory[] {
  return [...new Set(types.map((type) => APPROVED_TYPE_TO_CATEGORY[type]).filter(Boolean))]
}

export function isApprovedTripStopCandidate(
  candidate: Pick<TripStopCandidate, 'name' | 'types' | 'primaryType'>,
): boolean {
  const types = normalizeTypes(candidate)
  if (types.some((type) => TRIP_STOP_EXCLUDED_TYPES.has(type))) return false
  if (EXCLUDED_NAME_PATTERNS.some((pattern) => pattern.test(candidate.name))) return false
  return categoriesForTypes(types).length > 0
}

export function decodeGooglePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let result = 0
    let shift = 0
    let byte: number
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20 && index <= encoded.length)
    lat += result & 1 ? ~(result >> 1) : result >> 1

    result = 0
    shift = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20 && index <= encoded.length)
    lng += result & 1 ? ~(result >> 1) : result >> 1

    points.push({ lat: lat / 1e5, lng: lng / 1e5 })
  }

  return points
}

export function haversineMeters(a: LatLng, b: LatLng): number {
  const radius = 6_371_000
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2
  return radius * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function projectMeters(point: LatLng, referenceLat: number): { x: number; y: number } {
  const radians = (referenceLat * Math.PI) / 180
  return {
    x: point.lng * 111_320 * Math.cos(radians),
    y: point.lat * 110_540,
  }
}

export function distanceToRouteMeters(point: LatLng, route: LatLng[]): {
  distanceMeters: number
  distanceAlongRouteMeters: number
} {
  if (route.length === 0) return { distanceMeters: Infinity, distanceAlongRouteMeters: 0 }
  if (route.length === 1) return { distanceMeters: haversineMeters(point, route[0]), distanceAlongRouteMeters: 0 }

  const p = projectMeters(point, point.lat)
  let bestDistance = Infinity
  let bestAlong = 0
  let traversed = 0

  for (let i = 1; i < route.length; i += 1) {
    const a = projectMeters(route[i - 1], point.lat)
    const b = projectMeters(route[i], point.lat)
    const dx = b.x - a.x
    const dy = b.y - a.y
    const lengthSquared = dx * dx + dy * dy
    const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared))
    const nearestX = a.x + t * dx
    const nearestY = a.y + t * dy
    const distance = Math.hypot(p.x - nearestX, p.y - nearestY)
    const segmentLength = haversineMeters(route[i - 1], route[i])
    if (distance < bestDistance) {
      bestDistance = distance
      bestAlong = traversed + segmentLength * t
    }
    traversed += segmentLength
  }

  return { distanceMeters: Math.round(bestDistance), distanceAlongRouteMeters: Math.round(bestAlong) }
}

export function sampleRoutePoints(
  route: LatLng[],
  spacingMeters: number = TRIP_STOP_LIMITS.sampleSpacingMeters,
  maxPoints: number = TRIP_STOP_LIMITS.maxSamplePoints,
): LatLng[] {
  if (route.length <= 2) return route
  const sampled: LatLng[] = [route[0]]
  let distanceSinceSample = 0

  for (let i = 1; i < route.length - 1; i += 1) {
    distanceSinceSample += haversineMeters(route[i - 1], route[i])
    if (distanceSinceSample >= spacingMeters) {
      sampled.push(route[i])
      distanceSinceSample = 0
    }
  }
  sampled.push(route[route.length - 1])

  if (sampled.length <= maxPoints) return sampled
  const reduced: LatLng[] = []
  for (let i = 0; i < maxPoints; i += 1) {
    reduced.push(sampled[Math.round((i * (sampled.length - 1)) / (maxPoints - 1))])
  }
  return reduced
}

export function dedupeCandidates(candidates: TripStopCandidate[]): TripStopCandidate[] {
  const seen = new Map<string, TripStopCandidate>()
  for (const candidate of candidates) {
    const stable =
      candidate.placeId ||
      `${candidate.name.toLowerCase().replace(/\W/g, '')}:${candidate.lat.toFixed(4)}:${candidate.lng.toFixed(4)}`
    const existing = seen.get(stable)
    if (!existing || confidenceWeight(candidate.restroomConfidence) > confidenceWeight(existing.restroomConfidence)) {
      seen.set(stable, candidate)
    }
  }
  return [...seen.values()]
}

function confidenceWeight(confidence: RestroomConfidence): number {
  return {
    flushpin_verified: 100,
    community_reported: 78,
    place_indicates_restroom: 58,
    restroom_nearby: 48,
    unknown: 0,
  }[confidence]
}

export function restroomConfidenceLabel(confidence: RestroomConfidence): string {
  return {
    flushpin_verified: 'FlushPin Verified',
    community_reported: 'Community Reported',
    place_indicates_restroom: 'Place Indicates Restroom',
    restroom_nearby: 'Restroom Nearby',
    unknown: 'Restroom Access Unknown',
  }[confidence]
}

export function calculateFlushPinStopScore(candidate: TripStopCandidate): number {
  const restroom = confidenceWeight(candidate.restroomConfidence)
  const deviation = candidate.routeDistanceMeters ?? candidate.destinationDistanceMeters ?? 0
  const routeConvenience = Math.max(0, 100 - (deviation / TRIP_STOP_LIMITS.corridorMeters) * 100)
  const ev = candidate.categories.includes('ev') || candidate.ev ? 100 : 0
  const serviceKinds = new Set(candidate.categories.filter((category) => category !== 'restrooms' && category !== 'ev'))
  const services = Math.min(100, serviceKinds.size * 25)
  const placeQuality =
    Math.min(60, Math.max(0, ((candidate.rating ?? 0) - 3) * 30)) +
    Math.min(40, Math.log10((candidate.userRatingCount ?? 0) + 1) * 15)
  const verifiedAt = candidate.verifiedAt ? new Date(candidate.verifiedAt).getTime() : Number.NaN
  const verificationAgeDays = Number.isFinite(verifiedAt)
    ? Math.max(0, (Date.now() - verifiedAt) / 86_400_000)
    : Infinity
  const freshness =
    verificationAgeDays <= 7 ? 100 : verificationAgeDays <= 30 ? 75 : verificationAgeDays <= 90 ? 40 : 0
  const freshnessAndQuality = freshness * 0.6 + placeQuality * 0.4

  return Math.round(
    Math.max(
      0,
      Math.min(
        100,
        restroom * 0.35 +
          routeConvenience * 0.25 +
          ev * 0.15 +
          services * 0.15 +
          freshnessAndQuality * 0.1,
      ),
    ),
  )
}

function sameClusterArea(a: TripStopCandidate, b: TripStopCandidate): boolean {
  if (haversineMeters(a, b) > TRIP_STOP_LIMITS.clusterMeters) return false
  const normalize = (address: string) =>
    address
      .toLowerCase()
      .replace(/\b(suite|unit|#)\s*\w+/g, '')
      .split(',')[0]
      .replace(/\W/g, '')
  const aAddress = normalize(a.address)
  const bAddress = normalize(b.address)
  return !!aAddress && !!bAddress && (aAddress === bAddress || aAddress.includes(bAddress) || bAddress.includes(aAddress))
}

export function clusterAndRankTripStops(
  candidates: TripStopCandidate[],
  selectedCategories: TripStopCategory[],
): TripStop[] {
  const allowed = new Set<TripStopCategory>(['restrooms', ...selectedCategories])
  const filtered = dedupeCandidates(candidates)
    .filter(isApprovedTripStopCandidate)
    .filter((candidate) => candidate.categories.some((category) => allowed.has(category)))
    .slice(0, TRIP_STOP_LIMITS.maxCandidates)

  const used = new Set<string>()
  const stops: TripStop[] = []

  for (const candidate of filtered) {
    if (used.has(candidate.id)) continue
    used.add(candidate.id)
    const nearby = filtered.filter(
      (other) => other.id !== candidate.id && !used.has(other.id) && sameClusterArea(candidate, other),
    )
    for (const member of nearby) used.add(member.id)

    const group = [candidate, ...nearby]
    const primary = [...group].sort(
      (a, b) =>
        confidenceWeight(b.restroomConfidence) - confidenceWeight(a.restroomConfidence) ||
        calculateFlushPinStopScore(b) - calculateFlushPinStopScore(a),
    )[0]
    const services = [...new Set(group.flatMap((item) => item.categories))]
    const merged: TripStopCandidate = {
      ...primary,
      categories: services,
      restroomConfidence: group
        .map((item) => item.restroomConfidence)
        .sort((a, b) => confidenceWeight(b) - confidenceWeight(a))[0],
      ev: group.find((item) => item.ev)?.ev,
    }

    stops.push({
      ...merged,
      score: calculateFlushPinStopScore(merged),
      scoreExplanation: 'Based on restroom confidence, route convenience, charging, and nearby services.',
      services,
      clusterMembers: nearby.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.categories[0],
        distanceMeters: Math.round(haversineMeters(primary, item)),
      })),
    })
  }

  return stops
    .sort(
      (a, b) =>
        b.score - a.score ||
        (a.distanceAlongRouteMeters ?? a.destinationDistanceMeters ?? Infinity) -
          (b.distanceAlongRouteMeters ?? b.destinationDistanceMeters ?? Infinity),
    )
    .slice(0, TRIP_STOP_LIMITS.maxDisplayedStops)
}

export type TripStopsUrlState = {
  mode: TripStopsMode
  from: string
  to: string
  query: string
  radiusMiles: 0.5 | 1 | 2 | 5
}

function cleanUrlText(value: string | null, maxLength = 160): string {
  return (value ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, maxLength)
}

export function parseTripStopsUrl(search: URLSearchParams): TripStopsUrlState {
  const mode = search.get('mode') === 'destination' ? 'destination' : 'route'
  const radiusValue = Number(search.get('radius'))
  const radiusMiles: 0.5 | 1 | 2 | 5 = [0.5, 1, 2, 5].includes(radiusValue)
    ? (radiusValue as 0.5 | 1 | 2 | 5)
    : 2
  return {
    mode,
    from: cleanUrlText(search.get('from')),
    to: cleanUrlText(search.get('to')),
    query: cleanUrlText(search.get('q')),
    radiusMiles,
  }
}
