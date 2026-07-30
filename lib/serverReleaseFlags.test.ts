import assert from 'node:assert/strict'
import {
  isAdminDashboardEnabled,
  isTripStopsEnabled,
} from './serverReleaseFlags'

assert.equal(isTripStopsEnabled({}), false)
assert.equal(isTripStopsEnabled({ TRIP_STOPS_ENABLED: '' }), false)
assert.equal(isTripStopsEnabled({ TRIP_STOPS_ENABLED: 'false' }), false)
assert.equal(isTripStopsEnabled({ TRIP_STOPS_ENABLED: '1' }), false)
assert.equal(isTripStopsEnabled({ TRIP_STOPS_ENABLED: 'TRUE' }), true)
assert.equal(isTripStopsEnabled({ TRIP_STOPS_ENABLED: ' true ' }), true)

assert.equal(isAdminDashboardEnabled({}), false)
assert.equal(isAdminDashboardEnabled({ ADMIN_DASHBOARD_ENABLED: 'true' }), true)

console.log('lib/serverReleaseFlags.test.ts passed')
