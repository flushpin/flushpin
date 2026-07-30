import type { MapCategorySlug } from './mapCategories'

export type GeoResult =
  | { ok: true; lat: number; lng: number }
  | { ok: false; reason: 'unsupported' | 'denied' | 'timeout' | 'error' }

export function requestUserLocation(timeoutMs = 10000): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ ok: false, reason: 'unsupported' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          ok: true,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) resolve({ ok: false, reason: 'denied' })
        else if (err.code === err.TIMEOUT) resolve({ ok: false, reason: 'timeout' })
        else resolve({ ok: false, reason: 'error' })
      },
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    )
  })
}

export function buildMapSearchUrl(opts: {
  lat?: number
  lng?: number
  near?: string
  q?: string
  category?: MapCategorySlug | null
}): string {
  const params = new URLSearchParams()
  if (opts.q?.trim()) params.set('q', opts.q.trim())
  if (opts.lat != null && opts.lng != null && Number.isFinite(opts.lat) && Number.isFinite(opts.lng)) {
    params.set('lat', String(opts.lat))
    params.set('lng', String(opts.lng))
  }
  if (opts.near?.trim()) params.set('near', opts.near.trim())
  if (opts.category) params.set('category', opts.category)
  const qs = params.toString()
  return qs ? `/map?${qs}` : '/map'
}

export type HomeCategoryShortcut = {
  slug: MapCategorySlug | null
  label: string
  ariaLabel: string
}

export const HOME_CATEGORY_SHORTCUTS: HomeCategoryShortcut[] = [
  { slug: 'gas', label: 'Gas Stations', ariaLabel: 'Gas stations' },
  { slug: 'coffee', label: 'Cafés', ariaLabel: 'Cafés and coffee shops' },
  { slug: 'grocery', label: 'Stores', ariaLabel: 'Stores and grocery' },
  { slug: 'restaurant', label: 'Restaurants', ariaLabel: 'Restaurants' },
  { slug: 'fast-food', label: 'Fast Food', ariaLabel: 'Fast food' },
  { slug: 'public', label: 'Public Restrooms', ariaLabel: 'Public restrooms' },
]
