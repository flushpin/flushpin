/** Display/read helpers for restroom verification fields (Phase A — mobile-safe). */

export type RestroomVerifiedFields = {
  verified?: string | boolean | null
  verified_note?: string | null
  status_note?: string | null
}

/** Human-readable verification label for web UI. */
export function getVerifiedDisplayLabel(row: RestroomVerifiedFields): string {
  const note = row.verified_note?.trim()
  if (note) return note

  const statusNote = row.status_note?.trim()
  if (statusNote) return statusNote

  const legacy = row.verified
  if (typeof legacy === 'string' && legacy.trim()) return legacy.trim()

  return ''
}

const PLACEHOLDER_VERIFIED_LABELS = new Set([
  'not yet verified',
  'access info unknown',
  'unknown',
  'unverified',
  'pending',
])

/** Nearby API boolean — primary signal is status green; placeholder labels are false. */
export function mapNearbyVerifiedBoolean(
  row: RestroomVerifiedFields & { status?: string | null },
): boolean {
  if (row.status === 'green') return true
  const label = getVerifiedDisplayLabel(row).toLowerCase()
  if (!label) return false
  if (PLACEHOLDER_VERIFIED_LABELS.has(label)) return false
  return false
}

/** Whether listing should be treated as community-verified in web UI. */
export function isRestroomVerified(row: RestroomVerifiedFields & { status?: string | null }): boolean {
  if (row.status === 'green') return true
  return getVerifiedDisplayLabel(row).length > 0
}
