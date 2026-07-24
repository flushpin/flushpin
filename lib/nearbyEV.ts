export type EVStation = {
  stationId: number | string
  operatorName?: string
  latitude: number
  longitude: number
}

export type NearbyEVInfo = EVStation & {
  distanceMeters: number
}

export type EVTaggedPlace = {
  lat: number
  lng: number
  hasNearbyEVCharging: boolean
  nearbyEV?: NearbyEVInfo
}

const API_RADIUS_KM = 20
const CACHE_TTL_MS = 10 * 60 * 1000
const MAX_NEARBY_DISTANCE_METERS = 350

type CacheEntry = {
  stations: EVStation[]
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const inFlight = new Map<string, Promise<EVStation[]>>()

const cacheKey = (lat: number, lng: number) =>
  `${lat.toFixed(2)},${lng.toFixed(2)}`

const isStation = (value: unknown): value is EVStation => {
  if (!value || typeof value !== 'object') return false
  const station = value as Partial<EVStation>
  return (
    (typeof station.stationId === 'number' || typeof station.stationId === 'string') &&
    typeof station.latitude === 'number' &&
    Number.isFinite(station.latitude) &&
    typeof station.longitude === 'number' &&
    Number.isFinite(station.longitude)
  )
}

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const earthRadiusMeters = 6_371_000
  const toRadians = (degrees: number) => degrees * Math.PI / 180
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2
  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function matchNearbyEV<T extends { lat: number; lng: number }>(
  places: T[],
  stations: EVStation[],
  maxDistanceMeters = MAX_NEARBY_DISTANCE_METERS,
): Array<T & EVTaggedPlace> {
  return places.map((place) => {
    let nearest: NearbyEVInfo | undefined

    for (const station of stations) {
      const distanceMeters = haversineMeters(
        place.lat,
        place.lng,
        station.latitude,
        station.longitude,
      )
      if (
        distanceMeters <= maxDistanceMeters &&
        (!nearest || distanceMeters < nearest.distanceMeters)
      ) {
        nearest = { ...station, distanceMeters: Math.round(distanceMeters) }
      }
    }

    return {
      ...place,
      hasNearbyEVCharging: !!nearest,
      ...(nearest ? { nearbyEV: nearest } : {}),
    }
  })
}

export async function fetchEVStations(lat: number, lng: number): Promise<EVStation[]> {
  const key = cacheKey(lat, lng)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.stations
  }

  const existingRequest = inFlight.get(key)
  if (existingRequest) return existingRequest

  const request = (async () => {
    try {
      const response = await fetch(
        `/api/ev-stations?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radiusKm=${API_RADIUS_KM}`,
      )
      if (!response.ok) return []
      const payload = await response.json()
      const stations = Array.isArray(payload?.stations)
        ? payload.stations.filter(isStation)
        : []
      cache.set(key, { stations, timestamp: Date.now() })
      return stations
    } catch {
      return []
    } finally {
      inFlight.delete(key)
    }
  })()

  inFlight.set(key, request)
  return request
}

