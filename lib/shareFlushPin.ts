import { APP_STORE_URL } from './site'

export const FLUSHPIN_SHARE_URL = 'https://www.flushpin.com'

export type ShareMethod = 'whatsapp' | 'sms' | 'email' | 'copy' | 'native'

export type ShareSurface =
  | 'profile'
  | 'signup_success'
  | 'contribution_success'
  | 'homepage'
  | 'header'

export function isAppleMobileDevice(userAgent = ''): boolean {
  return /iPhone|iPad|iPod/i.test(userAgent)
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function'
}

/** Short body for WhatsApp / SMS / native share. */
export function buildShortShareMessage(options?: {
  includeAppStore?: boolean
  userAgent?: string
}): string {
  const includeAppStore =
    options?.includeAppStore ??
    isAppleMobileDevice(options?.userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : ''))

  const lines = [
    'I found an app that makes finding restrooms much easier.',
    '',
    'FlushPin helps you discover verified restroom locations, accessibility information, baby changing stations and community updates.',
    '',
    'Download it here:',
    FLUSHPIN_SHARE_URL,
  ]

  if (includeAppStore) {
    lines.push('', `Also available on the App Store: ${APP_STORE_URL}`)
  }

  return lines.join('\n')
}

export const EMAIL_SHARE_SUBJECT = 'You should try FlushPin'

export function buildEmailShareBody(): string {
  return [
    'I thought this might be useful for you.',
    '',
    'FlushPin helps travelers, families, caregivers, delivery drivers and everyday explorers quickly find verified restroom information.',
    '',
    FLUSHPIN_SHARE_URL,
  ].join('\n')
}

export function buildWhatsAppShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

/** SMS / iMessage deep link — works on iOS and Android. */
export function buildSmsShareUrl(message: string): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  const isIos = isAppleMobileDevice(ua)
  const encoded = encodeURIComponent(message)
  return isIos ? `sms:&body=${encoded}` : `sms:?body=${encoded}`
}

export function buildEmailShareUrl(subject = EMAIL_SHARE_SUBJECT, body = buildEmailShareBody()): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export async function copyShareLink(): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(FLUSHPIN_SHARE_URL)
      return true
    }
  } catch {
    // fall through
  }

  try {
    const input = document.createElement('textarea')
    input.value = FLUSHPIN_SHARE_URL
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.opacity = '0'
    document.body.appendChild(input)
    input.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(input)
    return ok
  } catch {
    return false
  }
}

export async function nativeShareFlushPin(message: string): Promise<'shared' | 'cancelled' | 'unavailable'> {
  if (!canUseNativeShare()) return 'unavailable'
  try {
    await navigator.share({
      title: 'FlushPin',
      text: message,
      url: FLUSHPIN_SHARE_URL,
    })
    return 'shared'
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
    return 'unavailable'
  }
}
