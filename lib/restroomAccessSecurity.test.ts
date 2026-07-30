import assert from 'node:assert/strict'
import {
  PUBLIC_RESTROOM_ACCESS_FIELDS,
  assertPinFreePayload,
  requestAuthorizedRestroomAccess,
  sensitivePinFieldInPayload,
  stripSensitivePinFields,
  type AccessRpcClient,
} from './restroomAccessSecurity'

// Anonymous map hydration is metadata-only.
assert.equal(PUBLIC_RESTROOM_ACCESS_FIELDS.split(',').map((field) => field.trim()).includes('pin'), false)
assert.equal(PUBLIC_RESTROOM_ACCESS_FIELDS.includes('pin_male'), false)
assert.equal(PUBLIC_RESTROOM_ACCESS_FIELDS.includes('pin_female'), false)

const anonymousMapResponse = {
  places: [
    {
      id: 1,
      name: 'Public Restroom',
      has_code: true,
      access_type: 'keypad_code',
      pin_updated_at: '2026-07-01T00:00:00.000Z',
    },
  ],
}
assert.doesNotThrow(() => assertPinFreePayload(anonymousMapResponse, 'Anonymous map response'))
assert.equal(sensitivePinFieldInPayload(anonymousMapResponse), null)

// Network guards reject every sensitive PIN field, including gendered codes.
assert.throws(() => assertPinFreePayload({ places: [{ pin: '1234' }] }), /pin/)
assert.throws(() => assertPinFreePayload({ places: [{ pin_male: '1234' }] }), /pin_male/)
assert.throws(() => assertPinFreePayload({ places: [{ pin_female: '5678' }] }), /pin_female/)

async function runAuthorizationTests() {
  // Signed-out promo completion cannot call the RPC or reveal a code.
  let signedOutRpcCalls = 0
  const signedOutClient: AccessRpcClient = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
    },
    rpc: async () => {
      signedOutRpcCalls += 1
      return { data: [{ pin: 'should-never-be-returned' }], error: null }
    },
  }
  const signedOut = await requestAuthorizedRestroomAccess(1, signedOutClient)
  assert.deepEqual(signedOut, { status: 'unauthenticated' })
  assert.equal(signedOutRpcCalls, 0)

  // Authenticated, backend-authorized access still returns the RPC result.
  const authorizedClient: AccessRpcClient = {
    auth: {
      getSession: async () => ({ data: { session: { access_token: 'test-session' } } }),
    },
    rpc: async (name, args) => {
      assert.equal(name, 'get_restroom_access_code')
      assert.deepEqual(args, { restroom_id: 7 })
      return { data: [{ pin: '2468' }], error: null }
    },
  }
  assert.deepEqual(await requestAuthorizedRestroomAccess(7, authorizedClient), {
    status: 'success',
    pin: '2468',
  })

  // An authenticated user rejected by the SECURITY DEFINER RPC remains denied.
  const unauthorizedClient: AccessRpcClient = {
    auth: {
      getSession: async () => ({ data: { session: { access_token: 'unauthorized-session' } } }),
    },
    rpc: async () => ({
      data: null,
      error: { message: 'permission denied' },
    }),
  }
  const unauthorized = await requestAuthorizedRestroomAccess(7, unauthorizedClient)
  assert.equal(unauthorized.status, 'denied')
  assert.equal('pin' in unauthorized, false)
}

// PIN fields cannot persist in public list state after authorized or publish flows.
assert.deepEqual(
  stripSensitivePinFields({
    id: 1,
    name: 'Restroom',
    pin: '1234',
    pin_male: '5678',
    pin_female: '9012',
  }),
  { id: 1, name: 'Restroom' },
)

runAuthorizationTests()
  .then(() => console.log('lib/restroomAccessSecurity.test.ts passed'))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
