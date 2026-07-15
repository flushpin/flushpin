/**
 * Unit tests for lib/nearby + lib/nearbyClient helpers (no network).
 * Run: npx tsx scripts/test-nearby.ts
 */
import {
  NEARBY_CLOSE_GROUP_M,
  NEARBY_FALLBACK_DISTANCE_M,
  NEARBY_FALLBACK_MIN_COUNT,
  NEARBY_RADIUS_TIER1_M,
  NEARBY_RADIUS_TIER2_M,
  NEARBY_RADIUS_TIER3_M,
  PUBLIC_RESTROOM_RADIUS_M,
  assertNoPinFieldsInResponse,
  auditGooglePlaceFilter,
  cacheCenterTooFar,
  cellKey,
  dedupeNearbyPlaces,
  googleRawToBusinessPlaces,
  haversineDistanceMeters,
  isBlacklistedGoogleName,
  isGoogleDiscoveryOnlyPlace,
  isWithinPublicRestroomRadius,
  mapGoogleRawToCandidate,
  mergeGooglePlaces,
  nearbyResultPriority,
  normalizeGooglePlaceId,
  overlayBooleans,
  parseCachePayload,
  runGoogleNearbySearch,
  shouldFallbackNearby,
  sortNearbyPlaces,
  trimNearbyResults,
  type GoogleRawPlace,
  type NearbyPlaceResult,
} from '../lib/nearby'
import {
  fetchNearbyPlaces,
  getNearbyInFlightKey,
  nearbyCoordKey,
  resetNearbyClientState,
  shouldSkipNearbyRefetch,
  type NearbyClientResult,
} from '../lib/nearbyClient'
import { mapNearbyVerifiedBoolean } from '../lib/restroomVerified'

let passed = 0
let failed = 0

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) {
    passed += 1
    console.log(`  ✓ ${name}`)
  } else {
    failed += 1
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

function mkPlace(id: string, distance_m: number): NearbyPlaceResult {
  return {
    place_id: id,
    name: id,
    address: '',
    lat: 33.6846,
    lng: -117.8265,
    types: ['restaurant'],
    distance_m,
    category_group: 'business_restroom',
    has_code: false,
    verified: false,
    has_gendered_pins: false,
    access_available: false,
    source: 'google',
  }
}

function mkRaw(id: string, lat: number, lng: number, name = 'Neighborhood Cafe'): GoogleRawPlace {
  return {
    id,
    displayName: { text: name },
    formattedAddress: '100 Main St',
    location: { latitude: lat, longitude: lng },
    types: ['restaurant'],
  }
}

function placesNearUser(count: number, offsetM = 20): GoogleRawPlace[] {
  return Array.from({ length: count }, (_, i) => {
    const d = offsetM + i * 5
    const lat = 33.6846 + d / 111_000
    return mkRaw(`ChIJtest${i}`, lat, -117.8265, `Cafe ${i}`)
  })
}

/** Mirrors app/map/page.tsx loadData apply guard for unit tests. */
function simulateMapLoadApply(
  requestId: number,
  activeRequestId: number,
  result: NearbyClientResult,
  prevRestrooms: NearbyPlaceResult[],
): {
  applied: boolean
  restrooms: NearbyPlaceResult[]
  nearbyError: string | null
  nearbyEmpty: boolean
} {
  if (requestId !== activeRequestId) {
    return {
      applied: false,
      restrooms: prevRestrooms,
      nearbyError: null,
      nearbyEmpty: false,
    }
  }
  if (result.status === 'aborted') {
    return {
      applied: false,
      restrooms: prevRestrooms,
      nearbyError: null,
      nearbyEmpty: false,
    }
  }
  if (result.status === 'error') {
    return {
      applied: true,
      restrooms: prevRestrooms,
      nearbyError: result.message,
      nearbyEmpty: false,
    }
  }
  return {
    applied: true,
    restrooms: result.places,
    nearbyError: null,
    nearbyEmpty: result.places.length === 0,
  }
}

function mockGoogleFetch(responses: Record<number, GoogleRawPlace[]>) {
  return async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? '{}'))
    const radius = body.locationRestriction?.circle?.radius as number
    const places = responses[radius] ?? []
    return new Response(JSON.stringify({ places }), { status: 200 })
  }
}

console.log('normalizeGooglePlaceId')
assert('places/ prefix stripped', normalizeGooglePlaceId('places/ChIJabc') === 'ChIJabc')
assert('bare id unchanged', normalizeGooglePlaceId('ChIJabc') === 'ChIJabc')

console.log('shouldFallbackNearby')
assert('0 results → fallback', shouldFallbackNearby([]) === true)
assert(
  `${NEARBY_FALLBACK_MIN_COUNT - 1} results → fallback`,
  shouldFallbackNearby(
    Array.from({ length: NEARBY_FALLBACK_MIN_COUNT - 1 }, (_, i) => ({ distance_m: 50 + i })),
  ) === true,
)
assert('closest 450m → fallback', shouldFallbackNearby([{ distance_m: 450 }]) === true)
assert(
  'closest 30m, enough results → no fallback',
  shouldFallbackNearby(
    Array.from({ length: NEARBY_FALLBACK_MIN_COUNT }, () => ({ distance_m: 30 })),
  ) === false,
)

async function runAsyncTests() {
console.log('Google call chain')
{
  const calls: number[] = []
  await runGoogleNearbySearch(33.6846, -117.8265, {
    googleFetch: mockGoogleFetch({
      [NEARBY_RADIUS_TIER1_M]: placesNearUser(NEARBY_FALLBACK_MIN_COUNT, 25),
    }) as typeof fetch,
    googleApiKey: 'test-key',
    onGoogleCall: (r) => calls.push(r),
  })
  assert('200m sufficient → 1 Google call', calls.length === 1 && calls[0] === NEARBY_RADIUS_TIER1_M)
}

{
  const calls: number[] = []
  await runGoogleNearbySearch(33.6846, -117.8265, {
    googleFetch: mockGoogleFetch({
      [NEARBY_RADIUS_TIER1_M]: placesNearUser(3, 25),
      [NEARBY_RADIUS_TIER2_M]: placesNearUser(NEARBY_FALLBACK_MIN_COUNT, 30),
    }) as typeof fetch,
    googleApiKey: 'test-key',
    onGoogleCall: (r) => calls.push(r),
  })
  assert(
    '200m insufficient, 500m sufficient → 2 Google calls',
    calls.length === 2 && calls[0] === NEARBY_RADIUS_TIER1_M && calls[1] === NEARBY_RADIUS_TIER2_M,
  )
}

{
  const calls: number[] = []
  await runGoogleNearbySearch(33.6846, -117.8265, {
    googleFetch: mockGoogleFetch({
      [NEARBY_RADIUS_TIER1_M]: placesNearUser(2, 25),
      [NEARBY_RADIUS_TIER2_M]: placesNearUser(2, 40),
      [NEARBY_RADIUS_TIER3_M]: placesNearUser(NEARBY_FALLBACK_MIN_COUNT, 50),
    }) as typeof fetch,
    googleApiKey: 'test-key',
    onGoogleCall: (r) => calls.push(r),
  })
  assert(
    '200m + 500m insufficient → 3 Google calls',
    calls.length === 3 &&
      calls[0] === NEARBY_RADIUS_TIER1_M &&
      calls[1] === NEARBY_RADIUS_TIER2_M &&
      calls[2] === NEARBY_RADIUS_TIER3_M,
  )
}

console.log('nearbyClient dedupe + skip refetch')
resetNearbyClientState()
let networkCalls = 0
const originalFetch = globalThis.fetch
globalThis.fetch = (async () => {
  networkCalls += 1
  await new Promise((r) => setTimeout(r, 20))
  return new Response(
    JSON.stringify({ places: [mkPlace('ChIJnet', 10)], count: 1, cached: false, source: 'google', cell: 'x' }),
    { status: 200 },
  )
}) as typeof fetch

{
  networkCalls = 0
  resetNearbyClientState()
  const [a, b] = await Promise.all([
    fetchNearbyPlaces(33.6846, -117.8265),
    fetchNearbyPlaces(33.6846, -117.8265),
  ])
  assert('same coordinate concurrent → single network call', networkCalls === 1)
  assert('both promises succeed', a.status === 'success' && b.status === 'success')
  assert('in-flight cleared', getNearbyInFlightKey() === null)
}

{
  resetNearbyClientState()
  networkCalls = 0
  await fetchNearbyPlaces(33.6846, -117.8265)
  networkCalls = 0
  const cached = await fetchNearbyPlaces(33.6846, -117.8265)
  assert('within 50m and 30s → skip refetch', networkCalls === 0 && cached.status === 'success' && cached.fromCache === true)
}

{
  resetNearbyClientState()
  networkCalls = 0
  await fetchNearbyPlaces(33.6846, -117.8265)
  networkCalls = 0
  const forced = await fetchNearbyPlaces(33.6846, -117.8266, { force: true })
  assert('force refresh bypasses skip cache', networkCalls === 1 && forced.status === 'success')
}

globalThis.fetch = (async () => {
  return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429 })
}) as typeof fetch

{
  resetNearbyClientState()
  const err = await fetchNearbyPlaces(33.7, -117.83, { force: true })
  assert(
    '429 maps to rate_limited message',
    err.status === 'error' && err.code === 'rate_limited' && err.message.includes('Please wait'),
  )
}

globalThis.fetch = originalFetch
resetNearbyClientState()
}

console.log('map load guard (stale + error vs empty)')
{
  const existing = [mkPlace('ChIJkeep', 10)]
  const stale = simulateMapLoadApply(
    1,
    2,
    { status: 'success', places: [mkPlace('ChIJnew', 5)], isEmpty: false, fromCache: false },
    existing,
  )
  assert('stale response does not overwrite list', !stale.applied && stale.restrooms.length === 1)
}

{
  const existing = [mkPlace('ChIJkeep', 10)]
  const rateLimited = simulateMapLoadApply(
    2,
    2,
    {
      status: 'error',
      httpStatus: 429,
      code: 'rate_limited',
      message: 'Please wait a moment and try again.',
    },
    existing,
  )
  assert('429 keeps existing list', rateLimited.restrooms.length === 1 && rateLimited.nearbyError !== null)
  assert('429 is not empty state', rateLimited.nearbyEmpty === false)
}

{
  const emptyOk = simulateMapLoadApply(
    1,
    1,
    { status: 'success', places: [], isEmpty: true, fromCache: false },
    [mkPlace('ChIJold', 10)],
  )
  assert('HTTP success empty replaces list', emptyOk.restrooms.length === 0 && emptyOk.nearbyEmpty === true)
  assert('HTTP success empty has no error banner', emptyOk.nearbyError === null)
}

{
  const serverErr = simulateMapLoadApply(
    1,
    1,
    {
      status: 'error',
      httpStatus: 500,
      code: 'server_configuration_error',
      message: 'Unable to load nearby locations right now. Please try again later.',
    },
    [mkPlace('ChIJkeep', 10)],
  )
  assert('HTTP error is not empty state', serverErr.nearbyEmpty === false && serverErr.nearbyError !== null)
  assert('500 keeps existing list', serverErr.restrooms.length === 1)
}

console.log('merge dedupe across tiers')
const dupMerged = mergeGooglePlaces(
  [mkRaw('places/ChIJdup', 33.6846, -117.8265)],
  [mkRaw('ChIJdup', 33.6846, -117.8265), mkRaw('ChIJother', 33.6847, -117.8265)],
)
assert('duplicate place across queries → single raw entry', dupMerged.length === 2)

console.log('public restroom radius')
assert('1999m included', isWithinPublicRestroomRadius(1999) === true)
assert('2001m excluded', isWithinPublicRestroomRadius(2001) === false)
assert('radius constant is 2000m', PUBLIC_RESTROOM_RADIUS_M === 2000)

console.log('trimNearbyResults keeps <=100m')
const trimmed = trimNearbyResults([
  mkPlace('close1', 30),
  mkPlace('close2', 80),
  ...Array.from({ length: 60 }, (_, i) => mkPlace(`far${i}`, 500 + i)),
])
assert('100m results never dropped', trimmed.filter((p) => p.distance_m <= 100).length === 2)
assert('total trimmed to max', trimmed.length <= 50)

void NEARBY_CLOSE_GROUP_M
void NEARBY_FALLBACK_DISTANCE_M
void googleRawToBusinessPlaces
void dedupeNearbyPlaces
void cellKey
void cacheCenterTooFar
void parseCachePayload
void haversineDistanceMeters
void isBlacklistedGoogleName
void nearbyCoordKey
void shouldSkipNearbyRefetch

async function main() {
await runAsyncTests()

console.log('PIN safety')
const overlay = overlayBooleans({
  place_id: 'ChIJx',
  has_code: true,
  verified: 'Not yet verified',
  status: 'red',
  pin_male: '1234',
  pin_female: null,
})
assert('overlay has no pin fields', !('pin' in overlay) && !('pin_male' in overlay))
try {
  assertNoPinFieldsInResponse({ places: [{ place_id: 'x', has_code: true }] })
  assert('response pin-free', true)
} catch {
  assert('response pin-free', false)
}

console.log('verified mapping')
assert('green → true', mapNearbyVerifiedBoolean({ status: 'green' }) === true)
assert(
  'Not yet verified → false',
  mapNearbyVerifiedBoolean({ verified: 'Not yet verified', status: 'red' }) === false,
)

console.log('sortNearbyPlaces 30m group')
const sorted = sortNearbyPlaces([mkPlace('far', 500), mkPlace('close', 25), mkPlace('mid', 100)])
assert('30m group first', sorted[0].place_id === 'close')

console.log('blacklist')
assert('bank filtered', mapGoogleRawToCandidate({
  id: 'ChIJbank',
  displayName: { text: 'First National Bank' },
  formattedAddress: '1 Main',
  location: { latitude: 1, longitude: 2 },
  types: ['restaurant'],
}, 1, 2) === null)

console.log('Google business type filters')
{
  const policeAudit = auditGooglePlaceFilter({
    displayName: { text: 'Bonds Irvine Police Department' },
    types: ['restaurant', 'food', 'point_of_interest', 'establishment'],
  })
  assert('police department excluded by institution name', policeAudit.decision === 'excluded')
  assert('police matched restaurant type but still excluded', policeAudit.matching_allowed_type === 'restaurant')
  assert(
    'police exclusion reason is institution',
    mapGoogleRawToCandidate({
      id: 'ChIJpolice',
      displayName: { text: 'Bonds Irvine Police Department' },
      formattedAddress: '3851 Alton Pkwy',
      location: { latitude: 33.6846, longitude: -117.8265 },
      types: ['restaurant', 'food', 'point_of_interest', 'establishment'],
    }, 33.6846, -117.8265) === null,
  )

  const bakeryAudit = auditGooglePlaceFilter({
    displayName: { text: 'Health choice' },
    types: ['bakery', 'food_store', 'store', 'food', 'point_of_interest', 'establishment'],
  })
  assert('bakery allowed via exact type match', bakeryAudit.decision === 'included')
  assert('bakery match reason', bakeryAudit.matching_allowed_type === 'bakery')

  const excludedTypeAudit = auditGooglePlaceFilter({
    displayName: { text: 'City Hall Cafe' },
    types: ['restaurant', 'city_hall', 'establishment'],
  })
  assert('city_hall excluded type blocks result', excludedTypeAudit.decision === 'excluded')
  assert('excluded type recorded', excludedTypeAudit.excluded_type_hit === 'city_hall')

  assert(
    'generic-only types do not qualify',
    mapGoogleRawToCandidate({
      id: 'ChIJgeneric',
      displayName: { text: 'Mystery POI' },
      formattedAddress: '1 Main',
      location: { latitude: 1, longitude: 2 },
      types: ['establishment', 'point_of_interest', 'food'],
    }, 1, 2) === null,
  )
}

console.log('nearby priority sort')
{
  const ranked = sortNearbyPlaces([
    { ...mkPlace('google-far', 25), verified: false, has_code: false, category_group: 'business_restroom' },
    { ...mkPlace('verified-close', 28), verified: true, has_code: false, category_group: 'business_restroom' },
    { ...mkPlace('public-close', 20), verified: false, has_code: false, category_group: 'public_restroom' },
  ])
  assert('verified wins within close band', ranked[0].place_id === 'verified-close')
  assert('public restroom before google discovery in band', ranked[1].place_id === 'public-close')
}

void nearbyResultPriority
void isGoogleDiscoveryOnlyPlace

console.log('\n---')
console.log(`Passed: ${passed}, Failed: ${failed}`)
process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
