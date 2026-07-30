import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'
import {
  handleTripStopsPost,
  type TripStopsHandlerDependencies,
} from './route'

async function run() {
  let dependencyCalls = 0
  let providerCalls = 0

  const dependencies = {
    enabled: () => false,
    getDependencies: async () => {
      dependencyCalls += 1
      throw new Error('Disabled endpoint must not initialize dependencies')
    },
    buildResponse: async () => {
      providerCalls += 1
      throw new Error('Disabled endpoint must not build a provider response')
    },
  } satisfies TripStopsHandlerDependencies

  const request = new NextRequest('https://www.flushpin.com/api/trip-stops', {
    method: 'POST',
    body: JSON.stringify({
      mode: 'route',
      origin: 'Irvine, CA',
      destination: 'San Francisco, CA',
    }),
  })
  const response = await handleTripStopsPost(request, dependencies)
  const body = await response.json()

  assert.equal(response.status, 404)
  assert.deepEqual(body, { error: 'not_found' })
  assert.equal(dependencyCalls, 0)
  assert.equal(providerCalls, 0)
  assert.match(response.headers.get('cache-control') ?? '', /no-store/)
}

run()
  .then(() => console.log('app/api/trip-stops/route.test.ts passed'))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
