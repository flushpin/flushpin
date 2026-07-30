import type { AccessDisplay } from './restroomAccess'

export type RestroomAttributeId =
  | 'accessible'
  | 'baby'
  | 'keypad'
  | 'ask_staff'
  | 'customer_only'
  | 'key_required'
  | 'open'

export type RestroomAttribute = {
  id: RestroomAttributeId
  label: string
  short: string
}

export type RestroomAttributeInput = {
  accessible?: boolean | null
  has_baby_changing?: boolean | null
  access_type?: string | null
  has_code?: boolean | null
}

/**
 * Build known attribute tiles only — never invent unknown amenities.
 */
export function buildRestroomAttributes(
  input: RestroomAttributeInput,
  access: AccessDisplay,
): RestroomAttribute[] {
  const tiles: RestroomAttribute[] = []
  const type = (input.access_type ?? '').toLowerCase()

  if (input.accessible) {
    tiles.push({
      id: 'accessible',
      label: 'Accessible',
      short: 'Accessibility features reported.',
    })
  }
  if (input.has_baby_changing) {
    tiles.push({
      id: 'baby',
      label: 'Baby Change',
      short: 'Baby changing station reported.',
    })
  }
  if (type.includes('customers_only')) {
    tiles.push({
      id: 'customer_only',
      label: 'Customer-only',
      short: 'A purchase is usually required.',
    })
  }
  if (access.hasRevealableCode || type.includes('keypad')) {
    tiles.push({
      id: 'keypad',
      label: 'Keypad',
      short: 'Code entry on the door keypad.',
    })
  } else if (type.includes('ask_staff') || type === 'key') {
    tiles.push({
      id: 'ask_staff',
      label: 'Ask staff',
      short: 'Staff unlocks or shares the code.',
    })
  } else if (type.includes('no_code') || type === 'open' || type === 'public') {
    tiles.push({
      id: 'open',
      label: 'Open access',
      short: 'No code needed — just walk in.',
    })
  }

  return tiles
}

export function explanationForAttributes(
  attributes: RestroomAttribute[],
  access: AccessDisplay,
): string {
  const ids = new Set(attributes.map((a) => a.id))
  if (ids.has('keypad')) {
    return 'Enter the code on the door keypad. Please lock the door after use.'
  }
  if (ids.has('ask_staff')) {
    return 'Ask a team member for access. Be polite — they may unlock it or share a code.'
  }
  if (ids.has('open')) {
    return 'This restroom is reported as open access — no keypad code needed.'
  }
  return access.hint
}

export function lastConfirmedLabel(detail: string): string {
  // confidence.detail is already like "Confirmed today" / "Last confirmed 3 days ago"
  if (/^confirmed /i.test(detail)) return detail.replace(/^confirmed /i, 'Last confirmed ')
  if (/^last confirmed /i.test(detail)) return detail
  return detail
}
