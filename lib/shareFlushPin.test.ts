import assert from 'node:assert/strict'
import { APP_STORE_URL } from './site'
import {
  buildEmailShareBody,
  buildEmailShareUrl,
  buildShortShareMessage,
  buildSmsShareUrl,
  buildWhatsAppShareUrl,
  EMAIL_SHARE_SUBJECT,
  FLUSHPIN_SHARE_URL,
  isAppleMobileDevice,
} from './shareFlushPin'

assert.equal(FLUSHPIN_SHARE_URL, 'https://www.flushpin.com')
assert.equal(EMAIL_SHARE_SUBJECT, 'You should try FlushPin')

const short = buildShortShareMessage({ includeAppStore: false })
assert.match(short, /finding restrooms much easier/)
assert.match(short, /verified restroom locations/)
assert.ok(short.includes(FLUSHPIN_SHARE_URL))
assert.doesNotMatch(short, /App Store/)

const withStore = buildShortShareMessage({ includeAppStore: true })
assert.match(withStore, /App Store/)
assert.ok(withStore.includes(APP_STORE_URL))

const emailBody = buildEmailShareBody()
assert.match(emailBody, /I thought this might be useful/)
assert.match(emailBody, /travelers, families, caregivers/)
assert.ok(emailBody.includes(FLUSHPIN_SHARE_URL))

assert.match(buildWhatsAppShareUrl(short), /^https:\/\/wa\.me\/\?text=/)
assert.match(buildEmailShareUrl(), /^mailto:\?subject=/)
assert.match(buildSmsShareUrl(short), /^sms:/)
assert.ok(isAppleMobileDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'))
assert.equal(isAppleMobileDevice('Mozilla/5.0 (Linux; Android 14)'), false)

console.log('shareFlushPin.test.ts: ok')
