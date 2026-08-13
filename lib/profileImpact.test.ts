/**
 * Unit tests for Community Impact helpers.
 * Run: npx tsx lib/profileImpact.test.ts
 */
import assert from 'node:assert/strict'
import {
  contributionScore,
  contributionSummaryCopy,
  EMPTY_PROFILE_IMPACT,
  isAccessCodeSubmission,
  isPositiveAmenityReport,
  monthlyActivityTimeline,
  normalizeImpactMetrics,
  resolveCommunityLevel,
} from './profileImpact.ts'

assert.deepEqual(normalizeImpactMetrics(null), EMPTY_PROFILE_IMPACT)
assert.deepEqual(
  normalizeImpactMetrics({ restroomsViewed: Number.NaN, codesContributed: -3 }),
  { ...EMPTY_PROFILE_IMPACT, restroomsViewed: 0, codesContributed: 0 },
)

assert.equal(resolveCommunityLevel(EMPTY_PROFILE_IMPACT).id, 'explorer')
assert.equal(
  resolveCommunityLevel({ ...EMPTY_PROFILE_IMPACT, codesContributed: 1 }).id,
  'helper',
)
assert.equal(
  resolveCommunityLevel({ ...EMPTY_PROFILE_IMPACT, amenitiesConfirmed: 5 }).id,
  'contributor',
)
assert.equal(
  resolveCommunityLevel({ ...EMPTY_PROFILE_IMPACT, communityReports: 15 }).id,
  'guide',
)
assert.equal(
  resolveCommunityLevel({ ...EMPTY_PROFILE_IMPACT, codesVerified: 40 }).id,
  'champion',
)

const active = normalizeImpactMetrics({
  restroomsViewed: 12,
  codesContributed: 4,
  codesVerified: 2,
  amenitiesConfirmed: 7,
  communityReports: 5,
})
assert.equal(contributionScore(active), 4 + 2 + 7 + 5)
const summary = contributionSummaryCopy(active)
assert.ok(summary.length >= 1)
assert.ok(summary.some((line) => /accurate|families|searching/i.test(line)))

const timeline = monthlyActivityTimeline(active)
assert.ok(timeline.some((item) => /Added 4 access codes/.test(item.text)))
assert.ok(timeline.some((item) => /Verified 2 existing codes/.test(item.text)))
assert.ok(timeline.some((item) => /Confirmed 7 amenities/.test(item.text)))

assert.equal(isAccessCodeSubmission({ submitted_pin: '2468', access_type: null }), true)
assert.equal(isAccessCodeSubmission({ submitted_pin: 'open', access_type: 'no_code_needed' }), false)
assert.equal(isAccessCodeSubmission({ submitted_pin: null, access_type: 'keypad_code' }), true)
assert.equal(isPositiveAmenityReport('amenity_baby_yes'), true)
assert.equal(isPositiveAmenityReport('amenity_baby_no'), false)

const emptyTimeline = monthlyActivityTimeline(EMPTY_PROFILE_IMPACT)
assert.equal(emptyTimeline.length, 1)
assert.match(emptyTimeline[0].text, /No activity yet this month/)

console.log('profileImpact.test.ts: ok')
