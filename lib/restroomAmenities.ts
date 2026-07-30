/**
 * Canonical restroom amenity + availability helpers.
 * Tri-state booleans: true / false / null(unknown). Unknown must never pass positive filters.
 */

export type TriBool = boolean | null

export type RestroomAvailability =
  | 'public_available'
  | 'customer_only'
  | 'no_public_restroom'
  | 'no_restroom_exists'
  | 'temporarily_unavailable'
  | 'unknown'

export const RESTROOM_AVAILABILITY_OPTIONS: ReadonlyArray<{
  id: RestroomAvailability
  label: string
  requiresConfirm: boolean
  confirmMessage?: string
}> = [
  { id: 'public_available', label: 'Public restroom available', requiresConfirm: false },
  { id: 'customer_only', label: 'Customer-only restroom', requiresConfirm: false },
  {
    id: 'no_public_restroom',
    label: 'No public restroom',
    requiresConfirm: true,
    confirmMessage:
      'No public restroom means a restroom may exist, but the public is not allowed to use it. Is that correct?',
  },
  {
    id: 'no_restroom_exists',
    label: 'No physical restroom at this location',
    requiresConfirm: true,
    confirmMessage:
      'No physical restroom at this location means customers cannot access a restroom because the business does not have one on site. Is that correct?',
  },
  { id: 'temporarily_unavailable', label: 'Temporarily unavailable', requiresConfirm: false },
  { id: 'unknown', label: 'Not sure', requiresConfirm: false },
]

/** Report types stored in restroom_reports (no CHECK constraint on prod). */
export const AMENITY_REPORT_TYPES = {
  accessible_yes: 'amenity_accessible_yes',
  accessible_no: 'amenity_accessible_no',
  baby_yes: 'amenity_baby_yes',
  baby_no: 'amenity_baby_no',
} as const

export function toTriBool(value: unknown): TriBool {
  if (value === true) return true
  if (value === false) return false
  return null
}

/** Positive filter: only explicit true passes. Unknown/false fail. */
export function passesPositiveAmenityFilter(value: unknown): boolean {
  return value === true
}

export function filterRestroomsByAmenity<T extends { accessible?: unknown; has_baby_changing?: unknown }>(
  rows: T[],
  filter: 'all' | 'accessible' | 'baby' | string,
): T[] {
  if (filter === 'accessible') return rows.filter((r) => passesPositiveAmenityFilter(r.accessible))
  if (filter === 'baby') return rows.filter((r) => passesPositiveAmenityFilter(r.has_baby_changing))
  return rows
}

export function isRestroomAvailability(value: unknown): value is RestroomAvailability {
  return (
    typeof value === 'string' &&
    RESTROOM_AVAILABILITY_OPTIONS.some((option) => option.id === value)
  )
}

export function availabilityReportType(availability: RestroomAvailability): string {
  return `availability_${availability}`
}

/**
 * Build a DB patch for amenity columns.
 * Omits keys when the caller did not supply a definite boolean (null/undefined = no change).
 */
export function buildAmenityColumnPatch(input: {
  accessible?: boolean | null
  has_baby_changing?: boolean | null
}): { accessible?: boolean; has_baby_changing?: boolean } {
  const patch: { accessible?: boolean; has_baby_changing?: boolean } = {}
  if (typeof input.accessible === 'boolean') patch.accessible = input.accessible
  if (typeof input.has_baby_changing === 'boolean') patch.has_baby_changing = input.has_baby_changing
  return patch
}

export function amenityReportRowsForPatch(
  restroomId: number,
  userId: string,
  patch: { accessible?: boolean; has_baby_changing?: boolean },
): Array<{
  restroom_id: number
  report_type: string
  note: string
  created_by: string
}> {
  const rows: Array<{
    restroom_id: number
    report_type: string
    note: string
    created_by: string
  }> = []
  if (typeof patch.accessible === 'boolean') {
    rows.push({
      restroom_id: restroomId,
      report_type: patch.accessible
        ? AMENITY_REPORT_TYPES.accessible_yes
        : AMENITY_REPORT_TYPES.accessible_no,
      note: patch.accessible ? 'Accessible confirmed' : 'Accessible reported false',
      created_by: userId,
    })
  }
  if (typeof patch.has_baby_changing === 'boolean') {
    rows.push({
      restroom_id: restroomId,
      report_type: patch.has_baby_changing
        ? AMENITY_REPORT_TYPES.baby_yes
        : AMENITY_REPORT_TYPES.baby_no,
      note: patch.has_baby_changing
        ? 'Baby changing confirmed'
        : 'Baby changing reported false',
      created_by: userId,
    })
  }
  return rows
}

/** Discovery rules for availability (product policy, not yet fully enforced in nearby). */
export function discoveryPolicyForAvailability(availability: RestroomAvailability): {
  includeInNormalDiscovery: boolean
  warning: string | null
} {
  switch (availability) {
    case 'no_restroom_exists':
      return {
        includeInNormalDiscovery: false,
        warning: 'Reported: no physical restroom at this location',
      }
    case 'no_public_restroom':
      return {
        includeInNormalDiscovery: false,
        warning: 'Reported: no public restroom access',
      }
    case 'customer_only':
      return { includeInNormalDiscovery: true, warning: 'Customers only' }
    case 'temporarily_unavailable':
      return {
        includeInNormalDiscovery: true,
        warning: 'Temporarily unavailable',
      }
    case 'public_available':
      return { includeInNormalDiscovery: true, warning: null }
    case 'unknown':
    default:
      return { includeInNormalDiscovery: true, warning: null }
  }
}

export function canonicalAmenitiesFromRow(row: {
  accessible?: unknown
  has_baby_changing?: unknown
}): { accessible: TriBool; has_baby_changing: TriBool } {
  return {
    accessible: toTriBool(row.accessible),
    has_baby_changing: toTriBool(row.has_baby_changing),
  }
}
