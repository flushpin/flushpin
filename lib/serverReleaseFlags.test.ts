import assert from 'node:assert/strict'
import { isTripStopsEnabled } from './serverReleaseFlags'

assert.equal(isTripStopsEnabled({}), false)
assert.equal(isTripStopsEnabled({ TRIP_STOPS_ENABLED: '' }), false)
assert.equal(isTripStopsEnabled({ TRIP_STOPS_ENABLED: 'false' }), false)
assert.equal(isTripStopsEnabled({ TRIP_STOPS_ENABLED: '1' }), false)
assert.equal(isTripStopsEnabled({ TRIP_STOPS_ENABLED: 'TRUE' }), true)
assert.equal(isTripStopsEnabled({ TRIP_STOPS_ENABLED: ' true ' }), true)

console.log('lib/serverReleaseFlags.test.ts passed')
