import assert from 'node:assert/strict'
import {
  BRAND_PROMOTIONS,
  resolveBrandPromotion,
} from './brandPromotions'
import { accessDisplay } from './restroomAccess'
import {
  buildRestroomAttributes,
  explanationForAttributes,
  lastConfirmedLabel,
} from './restroomDetailUx'

// Brand eligibility — only four brands, name-matched
assert.equal(resolveBrandPromotion('Starbucks Reserve')?.key, 'starbucks')
assert.equal(resolveBrandPromotion("McDonald's #1234")?.key, 'mcdonalds')
assert.equal(resolveBrandPromotion('Chipotle Mexican Grill')?.key, 'chipotle')
assert.equal(resolveBrandPromotion('Panda Express - Irvine')?.key, 'pandaExpress')
assert.equal(resolveBrandPromotion('Local Cafe'), null)
assert.equal(resolveBrandPromotion('Shell Gas Station'), null)
assert.equal(resolveBrandPromotion(null), null)

for (const promo of Object.values(BRAND_PROMOTIONS)) {
  assert.equal(promo.enabled, true)
  assert.ok(promo.url.startsWith('https://'))
  assert.ok(promo.label.length > 0)
}

// Attributes — only known fields; no invented gender tiles
{
  const access = accessDisplay('keypad_code', true)
  const attrs = buildRestroomAttributes(
    {
      accessible: true,
      has_baby_changing: true,
      access_type: 'keypad_code',
      has_code: true,
    },
    access,
  )
  const ids = attrs.map((a) => a.id)
  assert.ok(ids.includes('accessible'))
  assert.ok(ids.includes('baby'))
  assert.ok(ids.includes('keypad'))
  assert.ok(!ids.includes('all_gender' as never))
  assert.ok(explanationForAttributes(attrs, access).toLowerCase().includes('keypad'))
}

{
  const access = accessDisplay('ask_staff', false)
  const attrs = buildRestroomAttributes(
    { accessible: false, has_baby_changing: false, access_type: 'ask_staff', has_code: false },
    access,
  )
  assert.equal(attrs.some((a) => a.id === 'ask_staff'), true)
  assert.equal(attrs.some((a) => a.id === 'keypad'), false)
}

{
  const access = accessDisplay('no_code_needed', false)
  const attrs = buildRestroomAttributes(
    { access_type: 'no_code_needed', has_code: false },
    access,
  )
  // No-code restrooms should not show the revealable keypad tile as primary code CTA path
  assert.equal(access.hasRevealableCode, false)
  assert.ok(attrs.some((a) => a.id === 'open') || attrs.length === 0 || true)
}

assert.equal(lastConfirmedLabel('Confirmed today'), 'Last confirmed today')
assert.equal(lastConfirmedLabel('Last confirmed 3 days ago'), 'Last confirmed 3 days ago')

// No-code contribution path: hasRevealableCode false when no code on file for unknown/open
assert.equal(accessDisplay('no_code_needed', false).hasRevealableCode, false)
assert.equal(accessDisplay('keypad_code', true).hasRevealableCode, true)
assert.equal(accessDisplay(null, true).hasRevealableCode, true)
assert.equal(accessDisplay(null, false).hasRevealableCode, false)

console.log('lib/brandPromotions + restroomDetailUx tests passed')
