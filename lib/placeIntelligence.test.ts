import assert from 'node:assert/strict'
import {
  PLACE_PROVIDER_FIELD_MASKS,
  ProviderGuardError,
  assertPlaceIntelligencePinFree,
  assessCoverage,
  dedupeIdentityCandidates,
  executeProviderCall,
  getPlaceIntelligenceConfig,
  providerFieldRetentionPolicy,
  resetProviderGatewayForTests,
  runCoverageAwareFallback,
  selectUncoveredRoutePoints,
  type IdentityCandidate,
} from './placeIntelligence'

const center = { lat: 33.6846, lng: -117.8265 }
const fresh = new Date().toISOString()
const internal = [
  { ...center, verifiedAt: fresh, confidence: 'verified' as const },
  { lat: 33.6847, lng: -117.8265, verifiedAt: fresh, confidence: 'community' as const },
]

const sufficient = assessCoverage(center, internal, {
  minResults: 2,
  minFreshResults: 1,
  maxClosestDistanceMeters: 300,
  maxStaleAgeDays: 90,
})
assert.equal(sufficient.sufficient, true)

const insufficient = assessCoverage(center, internal.slice(0, 1), {
  minResults: 2,
  minFreshResults: 1,
  maxClosestDistanceMeters: 300,
  maxStaleAgeDays: 90,
})
assert.equal(insufficient.sufficient, false)
assert.equal(insufficient.reasons.includes('too_few_results'), true)

const routePoints = [
  center,
  { lat: 34.0, lng: -118.0 },
  { lat: 34.5, lng: -118.4 },
]
const uncovered = selectUncoveredRoutePoints(routePoints, internal, 4_000, 1, 1)
assert.deepEqual(uncovered, [{ lat: 34.5, lng: -118.4 }])

function identity(overrides: Partial<IdentityCandidate> = {}): IdentityCandidate {
  return {
    id: 'flushpin_1',
    name: 'Main Street Coffee',
    address: '100 Main Street, Irvine, CA',
    lat: center.lat,
    lng: center.lng,
    categories: ['coffee'],
    provenance: [{ provider: 'flushpin', ownership: 'flushpin_owned' }],
    ...overrides,
  }
}

const merged = dedupeIdentityCandidates([
  identity(),
  identity({
    id: 'google_1',
    provenance: [
      {
        provider: 'google',
        ownership: 'provider_identifier',
        providerObjectId: 'google-place-1',
      },
    ],
  }),
])
assert.equal(merged.places.length, 1)
assert.equal(merged.matches[0].reason, 'normalized_name_address')

const separateBranches = dedupeIdentityCandidates([
  identity(),
  identity({
    id: 'branch_2',
    address: '900 Main Street, Irvine, CA',
    lat: 33.70,
    lng: -117.84,
  }),
])
assert.equal(separateBranches.places.length, 2)

const anchorAndRecommendation = dedupeIdentityCandidates([
  identity({ kind: 'destination_anchor' }),
  identity({ id: 'recommendation', kind: 'recommendation' }),
])
assert.equal(anchorAndRecommendation.places.length, 2)

assert.equal(PLACE_PROVIDER_FIELD_MASKS.nearby.includes('places.rating'), false)
assert.equal(PLACE_PROVIDER_FIELD_MASKS.textResolution.includes('places.types'), false)
assert.deepEqual(providerFieldRetentionPolicy('google', 'id'), {
  ownership: 'provider_identifier',
  persistence: 'indefinite',
})
assert.deepEqual(providerFieldRetentionPolicy('google', 'lat'), {
  ownership: 'temporary_provider',
  persistence: 'temporary',
  maxAgeDays: 30,
})
assert.equal(providerFieldRetentionPolicy('google', 'displayName').persistence, 'prohibited')
assert.equal(
  providerFieldRetentionPolicy('open_charge_map', 'name').persistence,
  'prohibited',
  'mixed-license sources require record-level license review before persistence',
)
assert.equal(
  providerFieldRetentionPolicy('open_charge_map', 'name', 'CC-BY-4.0').persistence,
  'indefinite',
)
assert.doesNotThrow(() =>
  assertPlaceIntelligencePinFree({
    places: [{ id: 'flushpin_1', hasCode: true }],
    provenance: [{ provider: 'flushpin' }],
  }),
)
assert.throws(() => assertPlaceIntelligencePinFree({ pin: 'redacted-test-value' }), /sensitive/)

async function runAsyncTests() {
  let providerCalls = 0
  const skipped = await runCoverageAwareFallback({
    internalResults: ['internal'],
    coverage: sufficient,
    providerEnabled: true,
    fetchProvider: async () => {
      providerCalls += 1
      return ['provider']
    },
  })
  assert.deepEqual(skipped.results, ['internal'])
  assert.equal(providerCalls, 0)

  const fallback = await runCoverageAwareFallback({
    internalResults: ['internal'],
    coverage: insufficient,
    providerEnabled: true,
    fetchProvider: async () => {
      providerCalls += 1
      return ['provider']
    },
  })
  assert.deepEqual(fallback.results, ['internal', 'provider'])
  assert.equal(providerCalls, 1)

  const disabled = await runCoverageAwareFallback({
    internalResults: ['internal'],
    coverage: insufficient,
    providerEnabled: false,
    fetchProvider: async () => {
      providerCalls += 1
      return ['provider']
    },
  })
  assert.deepEqual(disabled.results, ['internal'])
  assert.equal(providerCalls, 1)

  const failed = await runCoverageAwareFallback({
    internalResults: ['internal'],
    coverage: insufficient,
    providerEnabled: true,
    fetchProvider: async () => {
      throw new Error('provider unavailable')
    },
  })
  assert.deepEqual(failed.results, ['internal'])
  assert.equal(failed.providerFailed, true)

  resetProviderGatewayForTests()
  const config = getPlaceIntelligenceConfig({
    EXTERNAL_PLACE_FALLBACK_ENABLED: 'true',
    GOOGLE_PLACES_ENABLED: 'true',
    GOOGLE_ROUTES_ENABLED: 'true',
    DAILY_GOOGLE_REQUEST_BUDGET: '2',
    MAX_GOOGLE_CALLS_PER_SESSION: '1',
    EXTERNAL_PROVIDER_TIMEOUT_MS: '5000',
  })
  let sharedCalls = 0
  let release: (() => void) | undefined
  const wait = new Promise<void>((resolve) => {
    release = resolve
  })
  const options = {
    provider: 'google' as const,
    feature: 'places_nearby' as const,
    requestKey: 'same-request',
    sessionKey: 'session-a',
    config,
    call: async () => {
      sharedCalls += 1
      await wait
      return ['shared']
    },
  }
  const first = executeProviderCall(options)
  const second = executeProviderCall(options)
  release?.()
  assert.deepEqual(await first, ['shared'])
  assert.deepEqual(await second, ['shared'])
  assert.equal(sharedCalls, 1)

  await assert.rejects(
    () =>
      executeProviderCall({
        ...options,
        requestKey: 'second-request',
        call: async () => ['second'],
      }),
    (error: unknown) =>
      error instanceof ProviderGuardError && error.code === 'session_budget_exceeded',
  )

  resetProviderGatewayForTests()
  const oneCallBudget = getPlaceIntelligenceConfig({
    DAILY_GOOGLE_REQUEST_BUDGET: '1',
    MAX_GOOGLE_CALLS_PER_SESSION: '5',
  })
  await executeProviderCall({
    provider: 'google',
    feature: 'places_text',
    requestKey: 'budget-1',
    config: oneCallBudget,
    call: async () => ['ok'],
  })
  await assert.rejects(
    () =>
      executeProviderCall({
        provider: 'google',
        feature: 'places_text',
        requestKey: 'budget-2',
        config: oneCallBudget,
        call: async () => ['blocked'],
      }),
    (error: unknown) =>
      error instanceof ProviderGuardError && error.code === 'daily_budget_exceeded',
  )
}

runAsyncTests()
  .then(() => console.log('lib/placeIntelligence.test.ts passed'))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
