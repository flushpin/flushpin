import assert from 'node:assert/strict'
import { signOutSafely } from './authSignOut'

async function run() {
  const ok = await signOutSafely({
    auth: {
      signOut: async () => ({ error: null }),
    },
  })
  assert.deepEqual(ok, { ok: true })

  const fail = await signOutSafely({
    auth: {
      signOut: async () => ({ error: { message: 'network down' } }),
    },
  })
  assert.deepEqual(fail, { ok: false, message: 'network down' })

  const thrown = await signOutSafely({
    auth: {
      signOut: async () => {
        throw new Error('boom')
      },
    },
  })
  assert.deepEqual(thrown, { ok: false, message: 'boom' })

  console.log('authSignOut.test.ts: ok')
}

void run()
