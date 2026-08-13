/**
 * Community Impact Dashboard — pure helpers for profile metrics, level, copy, timeline.
 */

export type ProfileImpactMetrics = {
  restroomsViewed: number
  codesContributed: number
  codesVerified: number
  amenitiesConfirmed: number
  communityReports: number
}

export type CommunityLevelId =
  | 'explorer'
  | 'helper'
  | 'contributor'
  | 'guide'
  | 'champion'

export type CommunityLevel = {
  id: CommunityLevelId
  label: string
  blurb: string
}

export type TimelineItem = {
  id: string
  text: string
}

export const EMPTY_PROFILE_IMPACT: ProfileImpactMetrics = {
  restroomsViewed: 0,
  codesContributed: 0,
  codesVerified: 0,
  amenitiesConfirmed: 0,
  communityReports: 0,
}

function safeCount(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n)
  if (!Number.isFinite(v) || v < 0) return 0
  return Math.floor(v)
}

export function normalizeImpactMetrics(
  partial?: Partial<ProfileImpactMetrics> | null,
): ProfileImpactMetrics {
  return {
    restroomsViewed: safeCount(partial?.restroomsViewed),
    codesContributed: safeCount(partial?.codesContributed),
    codesVerified: safeCount(partial?.codesVerified),
    amenitiesConfirmed: safeCount(partial?.amenitiesConfirmed),
    communityReports: safeCount(partial?.communityReports),
  }
}

/** Lifetime-style contribution score for community level (views do not inflate rank). */
export function contributionScore(metrics: ProfileImpactMetrics): number {
  const m = normalizeImpactMetrics(metrics)
  return (
    m.codesContributed +
    m.codesVerified +
    m.amenitiesConfirmed +
    m.communityReports
  )
}

export function resolveCommunityLevel(metrics: ProfileImpactMetrics): CommunityLevel {
  const score = contributionScore(metrics)
  if (score >= 40) {
    return {
      id: 'champion',
      label: 'Community Champion',
      blurb: 'Your updates help a lot of people find restrooms with less stress.',
    }
  }
  if (score >= 15) {
    return {
      id: 'guide',
      label: 'Guide',
      blurb: 'Neighbors rely on the access details you keep fresh.',
    }
  }
  if (score >= 5) {
    return {
      id: 'contributor',
      label: 'Contributor',
      blurb: 'You’re actively improving FlushPin for travelers and families.',
    }
  }
  if (score >= 1) {
    return {
      id: 'helper',
      label: 'Helper',
      blurb: 'Every confirmation makes the next visit easier for someone else.',
    }
  }
  return {
    id: 'explorer',
    label: 'Explorer',
    blurb: 'Start by confirming a code or amenity — small helps add up fast.',
  }
}

export function contributionSummaryCopy(metrics: ProfileImpactMetrics): string[] {
  const m = normalizeImpactMetrics(metrics)
  const lines: string[] = []

  if (contributionScore(m) === 0 && m.restroomsViewed === 0) {
    return [
      'Your impact starts with one visit or one update.',
      'When you confirm a code or amenity, other people spend less time searching.',
    ]
  }

  if (m.codesContributed > 0 || m.codesVerified > 0) {
    lines.push("You've helped keep restroom access information accurate.")
  }
  if (m.amenitiesConfirmed > 0) {
    lines.push("You've improved access for travelers and families.")
  }
  if (m.communityReports > 0 || m.restroomsViewed > 0) {
    lines.push('Thanks to your updates, other people spent less time searching.')
  }

  if (lines.length === 0) {
    lines.push("You've explored FlushPin — confirming a detail next will help someone soon.")
  }

  return lines.slice(0, 3)
}

export function monthlyActivityTimeline(metrics: ProfileImpactMetrics): TimelineItem[] {
  const m = normalizeImpactMetrics(metrics)
  const items: TimelineItem[] = []

  if (m.codesContributed > 0) {
    items.push({
      id: 'codes',
      text:
        m.codesContributed === 1
          ? 'Added 1 access code'
          : `Added ${m.codesContributed} access codes`,
    })
  }
  if (m.codesVerified > 0) {
    items.push({
      id: 'verified',
      text:
        m.codesVerified === 1
          ? 'Verified 1 existing code'
          : `Verified ${m.codesVerified} existing codes`,
    })
  }
  if (m.amenitiesConfirmed > 0) {
    items.push({
      id: 'amenities',
      text:
        m.amenitiesConfirmed === 1
          ? 'Confirmed 1 amenity'
          : `Confirmed ${m.amenitiesConfirmed} amenities`,
    })
  }
  if (m.communityReports > 0) {
    items.push({
      id: 'reports',
      text:
        m.communityReports === 1
          ? 'Helped update 1 location'
          : `Helped update ${m.communityReports} locations`,
    })
  }
  if (m.restroomsViewed > 0) {
    items.push({
      id: 'views',
      text:
        m.restroomsViewed === 1
          ? 'Viewed 1 restroom'
          : `Viewed ${m.restroomsViewed} restrooms`,
    })
  }

  if (items.length === 0) {
    items.push({
      id: 'empty',
      text: 'No activity yet this month — your next confirmation will show up here',
    })
  }

  return items
}

export function startOfUtcMonth(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
}

export function isAccessCodeSubmission(row: {
  submitted_pin?: string | null
  access_type?: string | null
}): boolean {
  const pin = row.submitted_pin == null ? '' : String(row.submitted_pin).trim()
  if (pin && pin.toLowerCase() !== 'open') return true
  const access = row.access_type == null ? '' : String(row.access_type).trim()
  return access === 'keypad_code'
}

export function isPositiveAmenityReport(reportType: string | null | undefined): boolean {
  const t = reportType == null ? '' : String(reportType)
  return t === 'amenity_accessible_yes' || t === 'amenity_baby_yes'
}

export const FUTURE_METRIC_PLACEHOLDERS = [
  'Favorite restrooms',
  'Businesses helped',
  'QR scans',
  'Reward points',
  'Community ranking',
  'Countries visited',
  'Road trips completed',
] as const
