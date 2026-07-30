import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'
import { authorizeAdminRequest } from './adminRequestAuth'

async function run() {
  const previous = process.env.ADMIN_DASHBOARD_ENABLED
  delete process.env.ADMIN_DASHBOARD_ENABLED
  try {
    const result = await authorizeAdminRequest(
      new NextRequest('https://www.flushpin.com/admin/data'),
    )
    assert.equal(result.authorized, false)
    if (!result.authorized) {
      assert.equal(result.response.status, 404)
      assert.deepEqual(await result.response.json(), { error: 'not_found' })
    }
  } finally {
    if (previous == null) delete process.env.ADMIN_DASHBOARD_ENABLED
    else process.env.ADMIN_DASHBOARD_ENABLED = previous
  }
}

run()
  .then(() => console.log('lib/adminRequestAuth.test.ts passed'))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
