import assert from 'node:assert/strict'
import { haversineMeters, matchNearbyEV, type EVStation } from './nearbyEV'

const origin = { id: 'business', lat: 33.6846, lng: -117.7892 }
const about150mNorth = 33.6846 + (150 / 111_320)
const about500mNorth = 33.6846 + (500 / 111_320)

const nearStation: EVStation = {
  stationId: 1,
  operatorName: 'ChargePoint',
  latitude: about150mNorth,
  longitude: origin.lng,
}
const closerStation: EVStation = {
  stationId: 2,
  operatorName: 'EVgo',
  latitude: origin.lat + (80 / 111_320),
  longitude: origin.lng,
}
const farStation: EVStation = {
  stationId: 3,
  latitude: about500mNorth,
  longitude: origin.lng,
}

assert.ok(Math.abs(haversineMeters(origin.lat, origin.lng, about150mNorth, origin.lng) - 150) < 2)

assert.deepEqual(matchNearbyEV([origin], []), [{
  ...origin,
  hasNearbyEVCharging: false,
}])

const matched = matchNearbyEV([origin], [nearStation, closerStation, farStation])
assert.equal(matched[0].hasNearbyEVCharging, true)
assert.equal(matched[0].nearbyEV?.stationId, 2)
assert.ok((matched[0].nearbyEV?.distanceMeters ?? 0) < 100)

const outside = matchNearbyEV([origin], [farStation])
assert.equal(outside[0].hasNearbyEVCharging, false)

