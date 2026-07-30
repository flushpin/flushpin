import type { SupabaseClient } from '@supabase/supabase-js'
import {
  PLACE_PROVIDER_FIELD_MASKS,
  assessCoverage,
  executeProviderCall,
  getPlaceIntelligenceConfig,
  providerRequestFingerprint,
  selectUncoveredRoutePoints,
  type PlaceIntelligenceConfig,
  type ProviderFeature,
} from './placeIntelligence'
import {
  GOOGLE_TRIP_STOP_TYPES,
  TRIP_STOP_LIMITS,
  categoriesForTypes,
  clusterAndRankTripStops,
  decodeGooglePolyline,
  distanceToRouteMeters,
  haversineMeters,
  isApprovedTripStopCandidate,
  sampleRoutePoints,
  type LatLng,
  type RestroomConfidence,
  type TripRoute,
  type TripStopCandidate,
  type TripStopCategory,
  type TripStopsMode,
  type TripStopsResponse,
} from './tripStops'

type GooglePlace = {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  location?: { latitude?: number; longitude?: number }
  types?: string[]
  primaryType?: string
  rating?: number
  userRatingCount?: number
  currentOpeningHours?: { openNow?: boolean }
}

type PublicRestroomRow = {
  id: number
  external_id?: string | null
  source?: string | null
  name?: string | null
  address?: string | null
  lat?: number | null
  lng?: number | null
  status?: string | null
  verified?: string | boolean | null
  pin_updated_at?: string | null
  accessible?: boolean | null
  access_type?: string | null
  has_code?: boolean | null
}

type EVRow = {
  ocm_id: number | string
  network?: string | null
  lat: number
  lng: number
}

type GeocodedPlace = LatLng & {
  label: string
  source: 'flushpin' | 'google'
  sourceRestroomId?: number
}

export type TripStopsRequest = {
  mode: TripStopsMode
  origin?: string
  destination: string
  radiusMiles?: number
  categories?: TripStopCategory[]
}

type ServerDependencies = {
  fetcher: typeof fetch
  googleApiKey: string
  supabase: SupabaseClient | null
  providerConfig?: PlaceIntelligenceConfig
  sessionKey?: string
}

async function googleRequest<T>(
  deps: Pick<
    ServerDependencies,
    'fetcher' | 'googleApiKey' | 'providerConfig' | 'sessionKey'
  >,
  feature: ProviderFeature,
  url: string,
  fieldMask: string,
  body: unknown,
): Promise<T> {
  const config = deps.providerConfig ?? getPlaceIntelligenceConfig()
  return executeProviderCall({
    provider: 'google',
    feature,
    requestKey: `${feature}:${providerRequestFingerprint({ url, body })}`,
    sessionKey: deps.sessionKey,
    config,
    log: (event) => console.info('[place-intelligence]', JSON.stringify(event)),
    call: async (signal) => {
      const response = await deps.fetcher(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': deps.googleApiKey,
          'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify(body),
        signal,
        cache: 'no-store',
      })

      if (!response.ok) {
        const providerStatus = response.status === 429 ? 'quota_or_rate_limit' : 'provider_error'
        throw new Error(`${providerStatus}:${response.status}`)
      }
      return (await response.json()) as T
    },
  })
}

export async function geocodeTripStopAnchor(
  query: string,
  deps: Pick<
    ServerDependencies,
    'fetcher' | 'googleApiKey' | 'supabase' | 'providerConfig' | 'sessionKey'
  >,
): Promise<GeocodedPlace | null> {
  if (deps.supabase) {
    const { data, error } = await deps.supabase
      .from('restroom_public')
      .select('id,name,address,lat,lng')
      .ilike('name', query.trim())
      .limit(3)
    if (!error) {
      const exact = (data ?? []).find(
        (row) =>
          typeof row.name === 'string' &&
          row.name.trim().localeCompare(query.trim(), undefined, { sensitivity: 'base' }) === 0 &&
          Number.isFinite(row.lat) &&
          Number.isFinite(row.lng),
      )
      if (exact) {
        return {
          lat: exact.lat as number,
          lng: exact.lng as number,
          label: exact.address || exact.name || query,
          source: 'flushpin',
          sourceRestroomId: Number(exact.id),
        }
      }
    }
  }

  const payload = await googleRequest<{ places?: GooglePlace[] }>(
    deps,
    'places_text',
    'https://places.googleapis.com/v1/places:searchText',
    PLACE_PROVIDER_FIELD_MASKS.textResolution,
    { textQuery: query, maxResultCount: 1 },
  )
  const place = payload.places?.[0]
  const lat = place?.location?.latitude
  const lng = place?.location?.longitude
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return {
    lat: lat as number,
    lng: lng as number,
    label: place?.formattedAddress || place?.displayName?.text || query,
    source: 'google',
  }
}

async function fetchDrivingRoute(
  origin: GeocodedPlace,
  destination: GeocodedPlace,
  deps: Pick<
    ServerDependencies,
    'fetcher' | 'googleApiKey' | 'providerConfig' | 'sessionKey'
  >,
): Promise<TripRoute | null> {
  const payload = await googleRequest<{
    routes?: Array<{ distanceMeters?: number; duration?: string; polyline?: { encodedPolyline?: string } }>
  }>(
    deps,
    'routes',
    'https://routes.googleapis.com/directions/v2:computeRoutes',
    PLACE_PROVIDER_FIELD_MASKS.route,
    {
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_UNAWARE',
      polylineQuality: 'HIGH_QUALITY',
      polylineEncoding: 'ENCODED_POLYLINE',
    },
  )
  const route = payload.routes?.[0]
  const encodedPolyline = route?.polyline?.encodedPolyline
  if (!route?.distanceMeters || !encodedPolyline) return null
  const points = decodeGooglePolyline(encodedPolyline)
  if (points.length < 2) return null
  return {
    distanceMeters: route.distanceMeters,
    durationSeconds: Number.parseInt(route.duration?.replace('s', '') || '0', 10),
    encodedPolyline,
    points,
    origin: { lat: origin.lat, lng: origin.lng, label: origin.label },
    destination: { lat: destination.lat, lng: destination.lng, label: destination.label },
  }
}

async function fetchGoogleNearby(
  center: LatLng,
  radiusMeters: number,
  deps: Pick<
    ServerDependencies,
    'fetcher' | 'googleApiKey' | 'providerConfig' | 'sessionKey'
  >,
): Promise<TripStopCandidate[]> {
  const payload = await googleRequest<{ places?: GooglePlace[] }>(
    deps,
    'places_nearby',
    'https://places.googleapis.com/v1/places:searchNearby',
    PLACE_PROVIDER_FIELD_MASKS.tripNearby,
    {
      includedTypes: [...GOOGLE_TRIP_STOP_TYPES],
      maxResultCount: 20,
      rankPreference: 'DISTANCE',
      locationRestriction: {
        circle: {
          center: { latitude: center.lat, longitude: center.lng },
          radius: radiusMeters,
        },
      },
    },
  )

  return (payload.places ?? []).flatMap((place) => {
    const lat = place.location?.latitude
    const lng = place.location?.longitude
    const id = place.id
    const name = place.displayName?.text?.trim()
    if (!id || !name || !Number.isFinite(lat) || !Number.isFinite(lng)) return []
    const types = [...new Set([place.primaryType, ...(place.types ?? [])].filter(Boolean).map(String))]
    const candidate: TripStopCandidate = {
      id: `google_${id}`,
      placeId: id,
      name,
      address: place.formattedAddress ?? '',
      lat: lat as number,
      lng: lng as number,
      types,
      primaryType: place.primaryType,
      categories: categoriesForTypes(types),
      source: 'google',
      provenance: [
        {
          provider: 'google',
          ownership: 'temporary_provider',
          providerObjectId: id,
        },
      ],
      restroomConfidence: 'unknown',
      openNow: place.currentOpeningHours?.openNow ?? null,
      rating: place.rating ?? null,
      userRatingCount: place.userRatingCount ?? null,
    }
    return isApprovedTripStopCandidate(candidate) ? [candidate] : []
  })
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length)
  let nextIndex = 0
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      try {
        results[index] = { status: 'fulfilled', value: await mapper(items[index]) }
      } catch (reason) {
        results[index] = { status: 'rejected', reason }
      }
    }
  })
  await Promise.all(workers)
  return results
}

function publicRestroomConfidence(row: PublicRestroomRow): RestroomConfidence {
  if (row.status === 'green') return 'flushpin_verified'
  if (
    (typeof row.verified === 'string' && row.verified.trim() && !/unknown|unverified|pending/i.test(row.verified)) ||
    row.has_code ||
    row.access_type
  ) {
    return 'community_reported'
  }
  return 'place_indicates_restroom'
}

function publicRowToCandidate(row: PublicRestroomRow): TripStopCandidate | null {
  const hasEvidence =
    row.status === 'green' ||
    row.has_code === true ||
    (typeof row.access_type === 'string' &&
      !['', 'unknown', 'pin'].includes(row.access_type.trim().toLowerCase())) ||
    (typeof row.verified === 'string' &&
      row.verified.trim() !== '' &&
      !/unknown|unverified|pending|not yet verified/i.test(row.verified))
  if (
    !hasEvidence ||
    row.id == null ||
    !Number.isFinite(row.lat) ||
    !Number.isFinite(row.lng) ||
    !row.name?.trim()
  ) {
    return null
  }
  return {
    id: `flushpin_${row.id}`,
    placeId:
      row.source && row.external_id
        ? row.source === 'google'
          ? row.external_id
          : `${row.source}:${row.external_id}`
        : undefined,
    restroomId: row.id,
    name: row.name.trim(),
    address: row.address ?? '',
    lat: row.lat as number,
    lng: row.lng as number,
    types: ['public_restroom'],
    primaryType: 'public_restroom',
    categories: ['restrooms'],
    source: 'flushpin',
    provenance: [
      {
        provider:
          row.source === 'google'
            ? 'google'
            : row.source === 'openstreetmap' || row.source === 'osm'
              ? 'openstreetmap'
              : row.source === 'overture'
                ? 'overture'
              : 'flushpin',
        ownership:
          row.source === 'google'
            ? 'legacy_unknown'
            : row.source === 'openstreetmap' || row.source === 'osm'
              ? 'open_public'
              : row.source == null || row.source === 'manual'
                ? 'flushpin_owned'
                : 'legacy_unknown',
        providerObjectId: row.external_id ?? undefined,
        sourceDataset: row.source ?? undefined,
      },
    ],
    restroomConfidence: publicRestroomConfidence(row),
    verifiedAt: row.pin_updated_at,
    accessible: row.accessible ?? false,
  }
}

async function fetchPublicRestroomsNearPoints(
  points: LatLng[],
  radiusMeters: number,
  supabase: SupabaseClient | null,
): Promise<TripStopCandidate[]> {
  if (!supabase) return []
  const radiusLat = radiusMeters / 110_540
  const results = await mapWithConcurrency(points, 3, async (point) => {
    const radiusLng = radiusMeters / (111_320 * Math.max(0.2, Math.cos((point.lat * Math.PI) / 180)))
    const { data, error } = await supabase
      .from('restroom_public')
      .select('id,external_id,source,name,address,lat,lng,status,verified,pin_updated_at,accessible,access_type,has_code')
      .gte('lat', point.lat - radiusLat)
      .lte('lat', point.lat + radiusLat)
      .gte('lng', point.lng - radiusLng)
      .lte('lng', point.lng + radiusLng)
      .limit(100)
    if (error) throw error
    return (data ?? []) as PublicRestroomRow[]
  })
  return results.flatMap((result) =>
    result.status === 'fulfilled'
      ? result.value.map(publicRowToCandidate).filter((item): item is TripStopCandidate => !!item)
      : [],
  )
}

async function fetchEVStationsNearPoints(
  points: LatLng[],
  radiusMeters: number,
  supabase: SupabaseClient | null,
): Promise<TripStopCandidate[]> {
  if (!supabase) return []
  const radiusLat = radiusMeters / 110_540
  const results = await mapWithConcurrency(points, 3, async (point) => {
    const radiusLng = radiusMeters / (111_320 * Math.max(0.2, Math.cos((point.lat * Math.PI) / 180)))
    const { data, error } = await supabase
      .from('ev_stations')
      .select('ocm_id,network,lat,lng')
      .eq('is_operational', true)
      .gte('lat', point.lat - radiusLat)
      .lte('lat', point.lat + radiusLat)
      .gte('lng', point.lng - radiusLng)
      .lte('lng', point.lng + radiusLng)
      .limit(200)
    if (error) throw error
    return (data ?? []) as EVRow[]
  })
  return results.flatMap((result) =>
    result.status === 'fulfilled'
      ? result.value.map((row): TripStopCandidate => ({
          id: `ev_${row.ocm_id}`,
          name: row.network ? `${row.network} charging` : 'EV charging station',
          address: '',
          lat: row.lat,
          lng: row.lng,
          types: ['electric_vehicle_charging_station'],
          primaryType: 'electric_vehicle_charging_station',
          categories: ['ev'],
          source: 'ev',
          provenance: [
            {
              provider: 'open_charge_map',
              ownership: 'legacy_unknown',
              providerObjectId: String(row.ocm_id),
              sourceDataset: 'Open Charge Map',
            },
          ],
          restroomConfidence: 'unknown',
          ev: {
            stationId: row.ocm_id,
            network: row.network ?? undefined,
            liveAvailability: 'unavailable',
          },
        }))
      : [],
  )
}

export function attachRestroomEvidence(candidates: TripStopCandidate[]): TripStopCandidate[] {
  const restrooms = candidates.filter((candidate) => candidate.source === 'flushpin')
  return candidates.map((candidate) => {
    if (candidate.source === 'flushpin') return candidate
    const nearby = restrooms
      .map((restroom) => ({ restroom, distance: haversineMeters(candidate, restroom) }))
      .filter(({ distance }) => distance <= 200)
      .sort((a, b) => a.distance - b.distance)[0]
    if (!nearby) return candidate
    return {
      ...candidate,
      restroomConfidence:
        nearby.restroom.restroomConfidence === 'flushpin_verified'
          ? 'restroom_nearby'
          : nearby.restroom.restroomConfidence,
      categories: [...new Set<TripStopCategory>(['restrooms', ...candidate.categories])],
    }
  })
}

async function configuredSupabase(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function getTripStopsDependencies(): Promise<ServerDependencies | { error: string }> {
  const providerConfig = getPlaceIntelligenceConfig()
  const googleApiKey = process.env.GOOGLE_MAPS_KEY?.trim() ?? ''
  if (
    (providerConfig.googleRoutesEnabled ||
      (providerConfig.externalFallbackEnabled && providerConfig.googlePlacesEnabled)) &&
    !googleApiKey
  ) {
    return { error: 'GOOGLE_MAPS_KEY is not configured' }
  }
  return {
    fetcher: fetch,
    googleApiKey,
    supabase: await configuredSupabase(),
    providerConfig,
  }
}

function providerWarning(reason: unknown, provider: string): string {
  const message = reason instanceof Error ? reason.message : String(reason)
  if (message.includes('quota_or_rate_limit')) return `${provider} quota or rate limit reached.`
  return `${provider} data is temporarily unavailable.`
}

export async function buildTripStopsResponse(
  request: TripStopsRequest,
  deps: ServerDependencies,
): Promise<TripStopsResponse> {
  const selectedCategories =
    request.categories?.filter((category) => category !== 'restrooms') ?? ['ev', 'gas', 'coffee', 'restaurants', 'fast-food', 'stores']
  const partialWarnings: string[] = []
  const providerConfig = deps.providerConfig ?? getPlaceIntelligenceConfig()

  if (request.mode === 'destination') {
    const anchor = await geocodeTripStopAnchor(request.destination, deps)
    if (!anchor) throw new Error('destination_not_found')
    const radiusMiles = Math.min(
      TRIP_STOP_LIMITS.destinationMaxRadiusMiles,
      Math.max(0.5, request.radiusMiles ?? 2),
    )
    const radiusMeters = radiusMiles * 1609.344
    const [restroomResult, evResult] = await Promise.allSettled([
      fetchPublicRestroomsNearPoints([anchor], radiusMeters, deps.supabase),
      fetchEVStationsNearPoints([anchor], radiusMeters, deps.supabase),
    ])
    if (restroomResult.status === 'rejected') partialWarnings.push('FlushPin restroom data is temporarily unavailable.')
    if (evResult.status === 'rejected') partialWarnings.push('Charging data is temporarily unavailable.')
    const internalCandidates = [
      ...(restroomResult.status === 'fulfilled' ? restroomResult.value : []),
      ...(evResult.status === 'fulfilled' ? evResult.value : []),
    ].filter((candidate) => candidate.restroomId !== anchor.sourceRestroomId)
    const coverage = assessCoverage(
      anchor,
      internalCandidates.filter((candidate) => candidate.source === 'flushpin'),
      providerConfig.destinationCoverage,
    )
    let googleCandidates: TripStopCandidate[] = []
    const providerAllowed =
      providerConfig.externalFallbackEnabled && providerConfig.googlePlacesEnabled
    if (!coverage.sufficient && providerAllowed) {
      try {
        googleCandidates = await fetchGoogleNearby(anchor, radiusMeters, deps)
      } catch (error) {
        partialWarnings.push(providerWarning(error, 'Places'))
      }
    }
    const candidates = attachRestroomEvidence([
      ...internalCandidates,
      ...googleCandidates,
    ])
      .map((candidate) => ({ ...candidate, destinationDistanceMeters: Math.round(haversineMeters(anchor, candidate)) }))
      .filter((candidate) => (candidate.destinationDistanceMeters ?? Infinity) <= radiusMeters)

    const stops = clusterAndRankTripStops(candidates, selectedCategories)
    return {
      mode: 'destination',
      anchor: { lat: anchor.lat, lng: anchor.lng, label: anchor.label },
      stops,
      partialWarnings,
      meta: {
        sampledPoints: 1,
        candidateCount: candidates.length,
        displayedCount: stops.length,
        radiusMiles,
        internalCoverageSufficient: coverage.sufficient,
        externalSearchPoints: googleCandidates.length > 0 ? 1 : 0,
        mapDisplay:
          anchor.source === 'google' || googleCandidates.length > 0
            ? 'external_only'
            : 'maplibre',
      },
    }
  }

  if (!request.origin) throw new Error('origin_required')
  const [origin, destination] = await Promise.all([
    geocodeTripStopAnchor(request.origin, deps),
    geocodeTripStopAnchor(request.destination, deps),
  ])
  if (!origin) throw new Error('origin_not_found')
  if (!destination) throw new Error('destination_not_found')
  if (haversineMeters(origin, destination) < 500) throw new Error('same_origin_destination')

  const route = await fetchDrivingRoute(origin, destination, deps)
  if (!route) throw new Error('route_not_found')
  if (route.distanceMeters > TRIP_STOP_LIMITS.maxRouteMiles * 1609.344) throw new Error('route_too_long')

  const samplePoints = sampleRoutePoints(route.points)
  const [restroomResult, evResult] = await Promise.allSettled([
    fetchPublicRestroomsNearPoints(samplePoints, TRIP_STOP_LIMITS.corridorMeters, deps.supabase),
    fetchEVStationsNearPoints(samplePoints, TRIP_STOP_LIMITS.corridorMeters, deps.supabase),
  ])
  if (restroomResult.status === 'rejected') partialWarnings.push('FlushPin restroom data is temporarily unavailable.')
  if (evResult.status === 'rejected') partialWarnings.push('Charging data is temporarily unavailable.')
  const internalCandidates = [
    ...(restroomResult.status === 'fulfilled' ? restroomResult.value : []),
    ...(evResult.status === 'fulfilled' ? evResult.value : []),
  ].filter(
    (candidate) =>
      candidate.restroomId !== origin.sourceRestroomId &&
      candidate.restroomId !== destination.sourceRestroomId,
  )
  const externalSearchPoints =
    providerConfig.externalFallbackEnabled && providerConfig.googlePlacesEnabled
      ? selectUncoveredRoutePoints(
          samplePoints,
          internalCandidates.filter((candidate) => candidate.source === 'flushpin'),
          TRIP_STOP_LIMITS.corridorMeters,
          providerConfig.tripMinResultsPerSegment,
          providerConfig.tripMaxGoogleCalls,
        )
      : []
  const googleSettled = await mapWithConcurrency(externalSearchPoints, 2, (point) =>
    fetchGoogleNearby(point, TRIP_STOP_LIMITS.corridorMeters, deps),
  )
  const googleCandidates = googleSettled.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : [],
  )
  if (googleSettled.some((result) => result.status === 'rejected')) {
    partialWarnings.push('Some route areas could not be checked for places.')
  }

  const candidates = attachRestroomEvidence([
    ...internalCandidates,
    ...googleCandidates,
  ])
    .map((candidate) => {
      const routeDistance = distanceToRouteMeters(candidate, route.points)
      return {
        ...candidate,
        routeDistanceMeters: routeDistance.distanceMeters,
        distanceAlongRouteMeters: routeDistance.distanceAlongRouteMeters,
      }
    })
    .filter((candidate) => (candidate.routeDistanceMeters ?? Infinity) <= TRIP_STOP_LIMITS.corridorMeters)

  const stops = clusterAndRankTripStops(candidates, selectedCategories)
  return {
    mode: 'route',
    route,
    stops,
    partialWarnings,
    meta: {
      sampledPoints: samplePoints.length,
      candidateCount: candidates.length,
      displayedCount: stops.length,
      corridorMeters: TRIP_STOP_LIMITS.corridorMeters,
      internalCoverageSufficient: externalSearchPoints.length === 0,
      externalSearchPoints: externalSearchPoints.length,
      mapDisplay: 'external_only',
    },
  }
}
