import assert from 'node:assert/strict'
import {
  MAP_DEFAULT_CENTER,
  requestMapGeolocationOnce,
  resolveMapMountLocation,
} from './mapLocationInit'

function fakeGeolocation(
  impl: (success: PositionCallback, error?: PositionErrorCallback | null) => void,
): Geolocation {
  return {
    getCurrentPosition(success, error) {
      impl(success, error)
    },
    watchPosition() {
      return 0
    },
    clearWatch() {},
  }
}

async function run() {
  // 1. Bare map initialization does not request geolocation
  {
    let geocodeCalls = 0
    const result = await resolveMapMountLocation(
      { lat: null, lng: null, q: '', near: '' },
      {
        resolveSearchLocation: async () => {
          geocodeCalls += 1
          return null
        },
      },
    )
    assert.equal(result.source, 'default')
    assert.equal(result.requestedGeolocation, false)
    assert.equal(result.lat, MAP_DEFAULT_CENTER.lat)
    assert.equal(result.lng, MAP_DEFAULT_CENTER.lng)
    assert.equal(geocodeCalls, 0)
  }

  // 2. Category-only map initialization does not request geolocation
  {
    const result = await resolveMapMountLocation(
      { lat: null, lng: null, q: '', near: '', category: 'gas' },
      { resolveSearchLocation: async () => null },
    )
    assert.equal(result.source, 'default')
    assert.equal(result.requestedGeolocation, false)
  }

  // 3. Valid URL coordinates do not request geolocation
  {
    let geocodeCalls = 0
    const result = await resolveMapMountLocation(
      {
        lat: '37.7749',
        lng: '-122.4194',
        q: '',
        near: 'Your location',
      },
      {
        resolveSearchLocation: async () => {
          geocodeCalls += 1
          return null
        },
      },
    )
    assert.equal(result.source, 'url')
    assert.equal(result.requestedGeolocation, false)
    assert.equal(result.lat, 37.7749)
    assert.equal(result.lng, -122.4194)
    assert.equal(result.label, 'Your location')
    assert.equal(geocodeCalls, 0)
  }

  // 4. Successful q geocoding does not request geolocation
  {
    const result = await resolveMapMountLocation(
      { lat: null, lng: null, q: 'Irvine CA', near: '' },
      {
        resolveSearchLocation: async (q) => ({
          lat: 33.68,
          lng: -117.79,
          label: q,
        }),
      },
    )
    assert.equal(result.source, 'geocode')
    assert.equal(result.requestedGeolocation, false)
    assert.equal(result.lat, 33.68)
    assert.equal(result.lng, -117.79)
  }

  // 5. Failed q geocoding does not automatically request geolocation
  {
    let geocodeCalls = 0
    const result = await resolveMapMountLocation(
      { lat: null, lng: null, q: 'zzzz-unknown-place', near: '' },
      {
        resolveSearchLocation: async () => {
          geocodeCalls += 1
          return null
        },
      },
    )
    assert.equal(geocodeCalls, 1)
    assert.equal(result.source, 'default')
    assert.equal(result.requestedGeolocation, false)
    assert.equal(result.lat, MAP_DEFAULT_CENTER.lat)
  }

  // 6. Explicit “Use My Location” action requests geolocation exactly once
  {
    let calls = 0
    const geo = fakeGeolocation((success) => {
      calls += 1
      success({
        coords: { latitude: 34.1, longitude: -118.2 },
      } as GeolocationPosition)
    })
    let successCount = 0
    const first = requestMapGeolocationOnce(geo, {
      onSuccess: () => {
        successCount += 1
      },
      onError: () => {
        assert.fail('should not error')
      },
    })
    assert.equal(first.requested, true)
    assert.equal(calls, 1)
    assert.equal(successCount, 1)
  }

  // 7. Permission denial does not trigger an automatic retry
  {
    let calls = 0
    const geo = fakeGeolocation((_success, error) => {
      calls += 1
      error?.({
        code: 1,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
        message: 'denied',
      } as GeolocationPositionError)
    })
    let errorCount = 0
    requestMapGeolocationOnce(geo, {
      onSuccess: () => {
        assert.fail('should not succeed')
      },
      onError: () => {
        errorCount += 1
      },
    })
    assert.equal(calls, 1)
    assert.equal(errorCount, 1)
  }

  console.log('lib/mapLocationInit.test.ts passed')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
