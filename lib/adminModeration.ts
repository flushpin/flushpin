export function normalizeRestroomName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
}

export function normalizeRestroomAddress(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

export function restroomMatchKey(name?: string | null, address?: string | null): string | null {
  const n = name?.trim()
  const a = address?.trim()
  if (!n || !a) return null
  return `${normalizeRestroomName(n)}|${normalizeRestroomAddress(a)}`
}

export function buildApprovedVerifiedLabel(accessType: string): string {
  const parts: string[] = []
  if (accessType.includes('customers_only')) parts.push('Customers only')
  if (accessType.includes('keypad_code') || accessType === 'keypad_code') parts.push('Has access code')
  else if (accessType.includes('no_code_needed') || accessType === 'no_code_needed') parts.push('Open — no code')
  else if (accessType.includes('ask_staff') || accessType === 'ask_staff') parts.push('Ask staff for key')
  else if (accessType === 'locked') parts.push('Locked / unavailable')
  else if (accessType === 'customers_only') parts.push('Customers only')
  else parts.push('Access info shared')

  const stamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${parts.join(' · ')} · Updated ${stamp}`
}

export function resolveApprovedPin(accessType: string, submittedPin: string | null): string | null {
  const type = accessType.toLowerCase()
  if (type.includes('keypad_code') || type === 'keypad_code') {
    const pin = submittedPin?.trim()
    return pin || null
  }
  if (type.includes('no_code_needed') || type === 'no_code_needed') return 'open'
  return null
}

export function buildApprovedRestroomPatch(accessType: string, submittedPin: string | null) {
  const now = new Date().toISOString()
  const verified = buildApprovedVerifiedLabel(accessType)
  return {
    access_type: accessType,
    pin: resolveApprovedPin(accessType, submittedPin),
    pin_updated_at: now,
    last_verified_at: now,
    verified,
    verified_note: verified,
    status: 'green',
    status_note: null,
  }
}
