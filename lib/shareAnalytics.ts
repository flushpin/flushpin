'use client'

import { track } from '@vercel/analytics'
import type { ShareMethod, ShareSurface } from './shareFlushPin'

export function trackShareOpened(surface: ShareSurface): void {
  try {
    track('share_opened', { surface })
  } catch {
    // Analytics must never break the product UI.
  }
}

export function trackShareCompleted(method: ShareMethod, surface: ShareSurface): void {
  try {
    track('share_completed', { method, surface })
    track(`share_${method}`, { surface })
  } catch {
    // Analytics must never break the product UI.
  }
}

export function trackCopyLink(surface: ShareSurface): void {
  trackShareCompleted('copy', surface)
}
