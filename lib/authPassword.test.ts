import assert from 'node:assert/strict'
import {
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
  validatePasswordConfirmation,
} from './authPassword'

assert.equal(validateNewPassword('').ok, false)
assert.equal(validateNewPassword('   ').ok, false)
assert.equal(validateNewPassword('short').ok, false)
assert.match(
  (validateNewPassword('short') as { ok: false; message: string }).message,
  new RegExp(String(MIN_PASSWORD_LENGTH))
)
assert.equal(validateNewPassword('longenough').ok, true)

assert.equal(validatePasswordConfirmation('longenough', 'different').ok, false)
assert.equal(
  (validatePasswordConfirmation('longenough', 'different') as { ok: false; message: string })
    .message,
  'Passwords do not match.'
)
assert.equal(validatePasswordConfirmation('longenough', 'longenough').ok, true)

console.log('authPassword.test.ts: ok')
