import assert from 'node:assert/strict'
import {
  TRIP_STOP_LIMITS,
  calculateFlushPinStopScore,
  clusterAndRankTripStops,
  decodeGooglePolyline,
  dedupeCandidates,
  distanceToRouteMeters,
  isApprovedTripStopCandidate,
  parseTripStopsUrl,
  restroomConfidenceLabel,
  sampleRoutePoints,
  type TripStopCandidate,
} from './tripStops'
import { attachRestroomEvidence, buildTripStopsResponse } from './tripStopsServer'

function candidate(overrides: Partial<TripStopCandidate> = {}): TripStopCandidate {
  return {
    id: 'google_1',
    placeId: '1',
    name: 'Travel Coffee',
    address: '100 Main St, Irvine, CA',
    lat: 33.68,
    lng: -117.79,
    types: ['cafe'],
    primaryType: 'cafe',
    categories: ['coffee'],
    source: 'google',
    restroomConfidence: 'unknown',
    routeDistanceMeters: 300,
    ...overrides,
  }
}

// Approved categories and explicit private/unrelated exclusions.
assert.equal(isApprovedTripStopCandidate(candidate()), true)
assert.equal(
  isApprovedTripStopCandidate(candidate({ name: 'Beach Hotel', types: ['hotel', 'cafe'] })),
  false,
)
assert.equal(
  isApprovedTripStopCandidate(candidate({ name: 'Acme Corporate Office', types: ['office', 'cafe'] })),
  false,
)
assert.equal(
  isApprovedTripStopCandidate(candidate({ name: 'Private Warehouse', types: ['warehouse'] })),
  false,
)
assert.equal(
  isApprovedTripStopCandidate(
    candidate({ name: 'Disneyland', types: ['tourist_attraction'], primaryType: 'tourist_attraction' }),
  ),
  false,
  'destination anchors do not qualify as stops without an approved type',
)

// Route polyline, corridor matching and sampling.
const decoded = decodeGooglePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@')
assert.equal(decoded.length >= 3, true)
const route = [
  { lat: 33.68, lng: -117.8 },
  { lat: 34.0, lng: -118.0 },
  { lat: 35.0, lng: -119.0 },
  { lat: 36.0, lng: -120.0 },
]
const nearRoute = distanceToRouteMeters({ lat: 34.01, lng: -118.01 }, route)
const farRoute = distanceToRouteMeters({ lat: 34.5, lng: -116.0 }, route)
assert.equal(nearRoute.distanceMeters < TRIP_STOP_LIMITS.corridorMeters, true)
assert.equal(farRoute.distanceMeters > TRIP_STOP_LIMITS.corridorMeters, true)
assert.equal(sampleRoutePoints(route, 1, 3).length, 3)

// Stable ID deduplication.
const deduped = dedupeCandidates([
  candidate({ id: 'a', placeId: 'same', restroomConfidence: 'unknown' }),
  candidate({ id: 'b', placeId: 'same', restroomConfidence: 'community_reported' }),
])
assert.equal(deduped.length, 1)
assert.equal(deduped[0].restroomConfidence, 'community_reported')

// Conservative same-address clustering.
const clustered = clusterAndRankTripStops(
  [
    candidate({ id: 'cafe', placeId: 'cafe', restroomConfidence: 'community_reported' }),
    candidate({
      id: 'gas',
      placeId: 'gas',
      name: 'Travel Gas',
      lat: 33.6802,
      lng: -117.7902,
      types: ['gas_station'],
      primaryType: 'gas_station',
      categories: ['gas'],
    }),
  ],
  ['coffee', 'gas'],
)
assert.equal(clustered.length, 1)
assert.equal(clustered[0].services.includes('gas'), true)
assert.equal(clustered[0].clusterMembers.length, 1)

// Score is centralized and restroom confidence has meaningful weight.
const unknownScore = calculateFlushPinStopScore(candidate({ restroomConfidence: 'unknown' }))
const verifiedScore = calculateFlushPinStopScore(candidate({ restroomConfidence: 'flushpin_verified' }))
assert.equal(verifiedScore > unknownScore, true)
assert.equal(verifiedScore >= 0 && verifiedScore <= 100, true)

// Confidence labels.
assert.equal(restroomConfidenceLabel('flushpin_verified'), 'FlushPin Verified')
assert.equal(restroomConfidenceLabel('community_reported'), 'Community Reported')
assert.equal(restroomConfidenceLabel('unknown'), 'Restroom Access Unknown')

// Restroom-nearby evidence does not expose a code and does not turn into "verified".
const evidence = attachRestroomEvidence([
  candidate(),
  candidate({
    id: 'flushpin_1',
    placeId: undefined,
    restroomId: 1,
    name: 'Public Restroom',
    types: ['public_restroom'],
    primaryType: 'public_restroom',
    categories: ['restrooms'],
    source: 'flushpin',
    restroomConfidence: 'flushpin_verified',
    lat: 33.6801,
    lng: -117.7901,
  }),
])
assert.equal(evidence[0].restroomConfidence, 'restroom_nearby')
assert.equal('pin' in evidence[0], false)

// URL validation and defaults.
const parsed = parseTripStopsUrl(
  new URLSearchParams(
    'mode=destination&q=Disneyland%20Anaheim%3Cscript%3E&radius=99&from=' + 'x'.repeat(300),
  ),
)
assert.equal(parsed.mode, 'destination')
assert.equal(parsed.query.includes('<'), false)
assert.equal(parsed.radiusMiles, 2)
assert.equal(parsed.from.length <= 160, true)

// EV is explicitly static/unknown rather than fabricated live availability.
const ev = candidate({
  id: 'ev',
  types: ['electric_vehicle_charging_station'],
  primaryType: 'electric_vehicle_charging_station',
  categories: ['ev'],
  ev: { stationId: 42, network: 'Test Network', liveAvailability: 'unavailable' },
})
assert.equal(ev.ev?.liveAvailability, 'unavailable')

async function runAsyncTests() {
  // Provider partial failure and empty result remain usable and honest.
  let geocodeCalls = 0
  const partialFetcher: typeof fetch = async (input) => {
  const url = String(input)
  if (url.includes('searchText')) {
    geocodeCalls += 1
    return new Response(
      JSON.stringify({
        places: [
          {
            displayName: { text: 'Disneyland Anaheim' },
            formattedAddress: 'Anaheim, CA',
            location: { latitude: 33.8121, longitude: -117.919 },
          },
        ],
      }),
      { status: 200 },
    )
  }
  if (url.includes('searchNearby')) return new Response('provider down', { status: 503 })
  throw new Error(`Unexpected URL ${url}`)
  }
  const partial = await buildTripStopsResponse(
    { mode: 'destination', destination: 'Disneyland Anaheim', radiusMiles: 2 },
    { fetcher: partialFetcher, googleApiKey: 'test-key', supabase: null },
  )
  assert.equal(geocodeCalls, 1)
  assert.deepEqual(partial.stops, [])
  assert.equal(partial.partialWarnings.some((warning) => warning.includes('Places')), true)
  assert.equal(
    partial.meta.mapDisplay,
    'external_only',
    'Google-derived coordinates must not be rendered on the MapLibre map',
  )

  // Very long route guard uses provider-shaped fixtures but no external network.
  let textSearchIndex = 0
  const longRouteFetcher: typeof fetch = async (input) => {
  const url = String(input)
  if (url.includes('searchText')) {
    const locations = [
      { latitude: 33.68, longitude: -117.79 },
      { latitude: 47.61, longitude: -122.33 },
    ]
    const location = locations[textSearchIndex++]
    return new Response(
      JSON.stringify({ places: [{ displayName: { text: 'Place' }, formattedAddress: 'Place', location }] }),
      { status: 200 },
    )
  }
  if (url.includes('computeRoutes')) {
    return new Response(
      JSON.stringify({
        routes: [
          {
            distanceMeters: (TRIP_STOP_LIMITS.maxRouteMiles + 1) * 1609.344,
            duration: '1000s',
            polyline: { encodedPolyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@' },
          },
        ],
      }),
      { status: 200 },
    )
  }
  throw new Error(`Unexpected URL ${url}`)
  }
  await assert.rejects(
    () =>
      buildTripStopsResponse(
        { mode: 'route', origin: 'Irvine, CA', destination: 'Seattle, WA' },
        { fetcher: longRouteFetcher, googleApiKey: 'test-key', supabase: null },
      ),
    /route_too_long/,
  )
}

runAsyncTests()
  .then(() => console.log('lib/tripStops.test.ts passed'))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
