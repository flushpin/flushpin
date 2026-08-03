import assert from 'node:assert/strict'
import {
  cleanAuthParamsFromUrl,
  getPasswordResetRedirectUrl,
  isPasswordRecoveryEvent,
  isRecoveryHash,
  isRecoverySearch,
} from './authRecovery'

assert.equal(getPasswordResetRedirectUrl('https://www.flushpin.com'), 'https://www.flushpin.com/signup')
assert.equal(getPasswordResetRedirectUrl('https://www.flushpin.com/'), 'https://www.flushpin.com/signup')
assert.equal(getPasswordResetRedirectUrl('http://127.0.0.1:3010'), 'http://127.0.0.1:3010/signup')

assert.equal(isPasswordRecoveryEvent('PASSWORD_RECOVERY'), true)
assert.equal(isPasswordRecoveryEvent('SIGNED_IN'), false)

assert.equal(isRecoveryHash('#access_token=abc&type=recovery&refresh_token=xyz'), true)
assert.equal(isRecoveryHash('#access_token=abc&type=signup'), false)
assert.equal(isRecoveryHash(''), false)

assert.equal(isRecoverySearch('?type=recovery'), true)
assert.equal(isRecoverySearch('?code=abc123'), false)
assert.equal(isRecoverySearch(''), false)

assert.equal(
  cleanAuthParamsFromUrl('https://www.flushpin.com/signup?code=abc&type=recovery#access_token=x'),
  '/signup'
)
assert.equal(
  cleanAuthParamsFromUrl('http://localhost:3000/signup?foo=1&code=abc'),
  '/signup?foo=1'
)

console.log('authRecovery.test.ts: ok')
