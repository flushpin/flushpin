import assert from 'node:assert/strict'
import {
  amenityReportRowsForPatch,
  availabilityReportType,
  buildAmenityColumnPatch,
  canonicalAmenitiesFromRow,
  discoveryPolicyForAvailability,
  filterRestroomsByAmenity,
  isRestroomAvailability,
  passesPositiveAmenityFilter,
  toTriBool,
} from './restroomAmenities'

assert.equal(toTriBool(true), true)
assert.equal(toTriBool(false), false)
assert.equal(toTriBool(null), null)
assert.equal(toTriBool(undefined), null)
assert.equal(toTriBool('yes'), null)

assert.equal(passesPositiveAmenityFilter(true), true)
assert.equal(passesPositiveAmenityFilter(false), false)
assert.equal(passesPositiveAmenityFilter(null), false)
assert.equal(passesPositiveAmenityFilter(undefined), false)

{
  const rows = [
    { id: 1, accessible: true, has_baby_changing: false },
    { id: 2, accessible: false, has_baby_changing: true },
    { id: 3, accessible: null, has_baby_changing: null },
    { id: 4, accessible: true, has_baby_changing: true },
  ]
  assert.deepEqual(
    filterRestroomsByAmenity(rows, 'accessible').map((r) => r.id),
    [1, 4],
  )
  assert.deepEqual(
    filterRestroomsByAmenity(rows, 'baby').map((r) => r.id),
    [2, 4],
  )
  assert.equal(filterRestroomsByAmenity(rows, 'all').length, 4)
}

assert.deepEqual(buildAmenityColumnPatch({}), {})
assert.deepEqual(buildAmenityColumnPatch({ accessible: null, has_baby_changing: null }), {})
assert.deepEqual(buildAmenityColumnPatch({ accessible: true, has_baby_changing: false }), {
  accessible: true,
  has_baby_changing: false,
})

{
  const reports = amenityReportRowsForPatch(11, 'user-1', {
    accessible: true,
    has_baby_changing: true,
  })
  assert.equal(reports.length, 2)
  assert.ok(reports.every((r) => r.restroom_id === 11 && r.created_by === 'user-1'))
  assert.ok(reports.some((r) => r.report_type.includes('accessible')))
  assert.ok(reports.some((r) => r.report_type.includes('baby')))
}

assert.equal(isRestroomAvailability('no_restroom_exists'), true)
assert.equal(isRestroomAvailability('no_public_restroom'), true)
assert.equal(isRestroomAvailability('customer_only'), true)
assert.equal(isRestroomAvailability('no_restroom'), false)
assert.notEqual(
  availabilityReportType('no_restroom_exists'),
  availabilityReportType('no_public_restroom'),
)

{
  const none = discoveryPolicyForAvailability('no_restroom_exists')
  const noPublic = discoveryPolicyForAvailability('no_public_restroom')
  const customer = discoveryPolicyForAvailability('customer_only')
  assert.equal(none.includeInNormalDiscovery, false)
  assert.equal(noPublic.includeInNormalDiscovery, false)
  assert.equal(customer.includeInNormalDiscovery, true)
  assert.ok(customer.warning)
  assert.notEqual(none.warning, noPublic.warning)
}

assert.deepEqual(
  canonicalAmenitiesFromRow({ accessible: true, has_baby_changing: false }),
  { accessible: true, has_baby_changing: false },
)
assert.deepEqual(
  canonicalAmenitiesFromRow({ accessible: null, has_baby_changing: undefined }),
  { accessible: null, has_baby_changing: null },
)

// Success UI must never treat unknown as a positive amenity hit
assert.equal(passesPositiveAmenityFilter(canonicalAmenitiesFromRow({}).accessible), false)

console.log('restroomAmenities.test.ts: ok')
