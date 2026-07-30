export const A2HS_DISMISSED_KEY = 'flushpin-a2hs-dismissed'

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/i.test(navigator.userAgent)
}

/** iOS Safari (not Chrome/Firefox/Edge wrappers). */
export function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return isIos() && /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua)
}

export function wasInstallDismissed(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(A2HS_DISMISSED_KEY) === '1'
}

export function markInstallDismissed(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(A2HS_DISMISSED_KEY, '1')
}

export function canOfferPwaInstall(hasDeferredPrompt: boolean): boolean {
  if (isStandalone() || wasInstallDismissed()) return false
  if (hasDeferredPrompt) return true
  if (isIosSafari()) return true
  return false
}
