export type MapMountSearch = {
  lat: string | null
  lng: string | null
  q: string
  near: string
  /** Present on category-only URLs; never supplies a location by itself. */
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
      source: 'needs_location'
      requestedGeolocation: true
    }

/**
 * Resolve where `/map` should load on mount.
 * Does not call the browser geolocation API.
 * Never returns a hardcoded city center for nearby queries.
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
    source: 'needs_location',
    requestedGeolocation: true,
  }
}

export type MapGeolocationHandlers = {
  onSuccess: (lat: number, lng: number) => void
  /** Called once on unsupported API or permission/position error. No automatic retry. */
  onError: () => void
}

/**
 * Explicit geolocation. At most one getCurrentPosition call per invocation.
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
