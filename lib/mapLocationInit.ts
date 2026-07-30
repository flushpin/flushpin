/** Default map center when no URL coords / geocode / user location. */
export const MAP_DEFAULT_CENTER = {
  lat: 33.6846,
  lng: -117.7892,
  label: 'Irvine, CA',
} as const

export type MapMountSearch = {
  lat: string | null
  lng: string | null
  q: string
  near: string
  /** Present on category-only URLs; never triggers geolocation by itself. */
  category?: string | null
}

export type MapMountLocation =
  | {
      source: 'url'
      lat: number
      lng: number
      label?: string
      requestedGeolocation: false
    }
  | {
      source: 'geocode'
      lat: number
      lng: number
      label: string
      requestedGeolocation: false
    }
  | {
      source: 'default'
      lat: number
      lng: number
      label: string
      requestedGeolocation: false
    }

/**
 * Resolve where `/map` should load on mount.
 * Never requests browser geolocation — that stays user-gesture only.
 */
export async function resolveMapMountLocation(
  search: MapMountSearch,
  deps: {
    resolveSearchLocation: (
      q: string,
    ) => Promise<{ lat: number; lng: number; label: string } | null>
  },
): Promise<MapMountLocation> {
  if (search.lat && search.lng) {
    const lat = Number.parseFloat(search.lat)
    const lng = Number.parseFloat(search.lng)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return {
        source: 'url',
        lat,
        lng,
        label: search.near.trim() ? search.near : undefined,
        requestedGeolocation: false,
      }
    }
  }

  const q = search.q.trim()
  if (q) {
    const located = await deps.resolveSearchLocation(q)
    if (located) {
      return {
        source: 'geocode',
        lat: located.lat,
        lng: located.lng,
        label: located.label,
        requestedGeolocation: false,
      }
    }
  }

  return {
    source: 'default',
    lat: MAP_DEFAULT_CENTER.lat,
    lng: MAP_DEFAULT_CENTER.lng,
    label: MAP_DEFAULT_CENTER.label,
    requestedGeolocation: false,
  }
}

export type MapGeolocationHandlers = {
  onSuccess: (lat: number, lng: number) => void
  /** Called once on unsupported API or permission/position error. No automatic retry. */
  onError: () => void
}

/**
 * Explicit user-gesture geolocation. At most one getCurrentPosition call per invocation.
 * Permission denial invokes onError once and does not retry.
 */
export function requestMapGeolocationOnce(
  geolocation: Geolocation | null | undefined,
  handlers: MapGeolocationHandlers,
  options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10_000,
    maximumAge: 0,
  },
): { requested: boolean } {
  if (!geolocation?.getCurrentPosition) {
    handlers.onError()
    return { requested: false }
  }

  let settled = false
  geolocation.getCurrentPosition(
    (pos) => {
      if (settled) return
      settled = true
      handlers.onSuccess(pos.coords.latitude, pos.coords.longitude)
    },
    () => {
      if (settled) return
      settled = true
      handlers.onError()
    },
    options,
  )
  return { requested: true }
}
