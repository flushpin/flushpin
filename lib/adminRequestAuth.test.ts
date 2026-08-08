import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'
import { authorizeAdminRequest, configuredAdminEmails } from './adminRequestAuth'

async function expectDenied(
  request: NextRequest,
  status: number,
  error: string,
) {
  const result = await authorizeAdminRequest(request)
  assert.equal(result.authorized, false)
  if (!result.authorized) {
    assert.equal(result.response.status, status)
    assert.deepEqual(await result.response.json(), { error })
  }
}

async function run() {
  const previousDashboard = process.env.ADMIN_DASHBOARD_ENABLED
  const previousEmails = process.env.ADMIN_EMAILS

  try {
    // Flag off → 404 (route appears nonexistent)
    delete process.env.ADMIN_DASHBOARD_ENABLED
    await expectDenied(
      new NextRequest('https://www.flushpin.com/admin/analytics'),
      404,
      'not_found',
    )

    process.env.ADMIN_DASHBOARD_ENABLED = 'true'

    // No bearer → 401
    await expectDenied(
      new NextRequest('https://www.flushpin.com/admin/analytics'),
      401,
      'authentication_required',
    )

    // Empty allowlist → 503
    process.env.ADMIN_EMAILS = ''
    await expectDenied(
      new NextRequest('https://www.flushpin.com/admin/analytics', {
        headers: { Authorization: 'Bearer test-token-value' },
      }),
      503,
      'admin_auth_not_configured',
    )

    process.env.ADMIN_EMAILS = 'founder@flushpin.com'
    assert.deepEqual([...configuredAdminEmails()], ['founder@flushpin.com'])
    assert.ok(configuredAdminEmails().has('founder@flushpin.com'))
    assert.equal(configuredAdminEmails().has('random@example.com'), false)
  } finally {
    if (previousDashboard == null) delete process.env.ADMIN_DASHBOARD_ENABLED
    else process.env.ADMIN_DASHBOARD_ENABLED = previousDashboard
    if (previousEmails == null) delete process.env.ADMIN_EMAILS
    else process.env.ADMIN_EMAILS = previousEmails
  }
}

run()
  .then(() => console.log('lib/adminRequestAuth.test.ts passed'))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
