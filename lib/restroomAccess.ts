export interface AccessDisplay {
  label: string
  hint: string
  icon: 'lock' | 'open' | 'staff' | 'cart' | 'restricted' | 'question'
  hasRevealableCode: boolean
}

export function accessDisplay(type: string | null | undefined, hasCode?: boolean | null): AccessDisplay {
  switch (type) {
    case 'keypad_code':
      return { label: 'Code required', hint: 'Enter the keypad code to get in.', icon: 'lock', hasRevealableCode: true }
    case 'no_code_needed':
      return { label: 'Open access', hint: 'No code needed — just walk in.', icon: 'open', hasRevealableCode: false }
    case 'ask_staff':
      return { label: 'Ask staff', hint: 'Staff will unlock it or share the code.', icon: 'staff', hasRevealableCode: false }
    case 'customers_only':
      return { label: 'Customers only', hint: 'A purchase is usually required.', icon: 'cart', hasRevealableCode: false }
    case 'locked':
      return { label: 'Locked', hint: 'Restricted access — may not be usable.', icon: 'restricted', hasRevealableCode: false }
    default:
      return {
        label: 'Access unconfirmed',
        hint: hasCode ? 'A code may be on file — reveal to check.' : 'No access info confirmed yet.',
        icon: 'question',
        hasRevealableCode: !!hasCode,
      }
  }
}

export function directionsLinks(lat: number, lng: number, name: string) {
  const q = encodeURIComponent(name)
  return {
    apple: `https://maps.apple.com/?daddr=${lat},${lng}&q=${q}`,
    google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  }
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}
