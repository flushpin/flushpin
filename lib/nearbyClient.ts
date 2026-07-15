import {
  haversineDistanceMeters,
  type NearbyPlaceResult,
} from './nearby'

export const NEARBY_MIN_REFETCH_DISTANCE_M = 50
export const NEARBY_MIN_REFETCH_INTERVAL_MS = 30_000

export type NearbyClientSuccess = {
  status: 'success'
  places: NearbyPlaceResult[]
  isEmpty: boolean
  fromCache: boolean
}

export type NearbyClientError = {
  status: 'error'
  httpStatus: number
  code: string
  message: string
}

export type NearbyClientAborted = { status: 'aborted' }

export type NearbyClientResult = NearbyClientSuccess | NearbyClientError | NearbyClientAborted

type SuccessCache = {
  lat: number
  lng: number
  at: number
  result: NearbyClientSuccess
}

type InFlightEntry = {
  key: string
  controller: AbortController
  promise: Promise<NearbyClientResult>
  seq: number
}

let lastSuccess: SuccessCache | null = null
let inFlight: InFlightEntry | null = null
let requestSeq = 0
let mountedUnmountController: AbortController | null = null

export function nearbyCoordKey(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`
}

export function shouldSkipNearbyRefetch(
  lat: number,
  lng: number,
  now = Date.now(),
  force = false,
): boolean {
  if (force || !lastSuccess) return false
  const dist = haversineDistanceMeters(lastSuccess.lat, lastSuccess.lng, lat, lng)
  const age = now - lastSuccess.at
  return dist < NEARBY_MIN_REFETCH_DISTANCE_M && age < NEARBY_MIN_REFETCH_INTERVAL_MS
}

export function registerNearbyUnmountAbort(controller: AbortController | null) {
  mountedUnmountController = controller
}

export function resetNearbyClientState() {
  lastSuccess = null
  inFlight?.controller.abort()
  inFlight = null
  requestSeq = 0
  mountedUnmountController = null
}

function parseNearbyResponse(data: unknown): NearbyPlaceResult[] {
  if (!data || typeof data !== 'object') return []
  const places = (data as { places?: unknown }).places
  return Array.isArray(places) ? (places as NearbyPlaceResult[]) : []
}

async function requestNearbyNetwork(
  lat: number,
  lng: number,
  signal: AbortSignal,
): Promise<NearbyClientResult> {
  const res = await fetch(`/api/nearby?lat=${lat}&lng=${lng}`, { signal })
  const data = await res.json().catch(() => ({}))

  if (res.status === 429) {
    return {
      status: 'error',
      httpStatus: 429,
      code: 'rate_limited',
      message: 'Please wait a moment and try again.',
    }
  }
  if (res.status === 500) {
    return {
      status: 'error',
      httpStatus: 500,
      code: typeof data?.error === 'string' ? data.error : 'server_error',
      message: 'Unable to load nearby locations right now. Please try again later.',
    }
  }
  if (res.status === 502) {
    return {
      status: 'error',
      httpStatus: 502,
      code: 'places_unavailable',
      message: 'Nearby places are temporarily unavailable.',
    }
  }
  if (!res.ok) {
    return {
      status: 'error',
      httpStatus: res.status,
      code: 'request_failed',
      message: 'Unable to load nearby locations right now. Please try again later.',
    }
  }

  const places = parseNearbyResponse(data)
  return {
    status: 'success',
    places,
    isEmpty: places.length === 0,
    fromCache: false,
  }
}

export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  options?: { force?: boolean },
): Promise<NearbyClientResult> {
  const force = options?.force ?? false

  if (shouldSkipNearbyRefetch(lat, lng, Date.now(), force)) {
    return { ...lastSuccess!.result, fromCache: true }
  }

  const key = nearbyCoordKey(lat, lng)
  if (inFlight?.key === key) {
    return inFlight.promise
  }

  inFlight?.controller.abort()

  const controller = new AbortController()
  const seq = ++requestSeq

  if (mountedUnmountController) {
    mountedUnmountController.signal.addEventListener(
      'abort',
      () => controller.abort(),
      { once: true },
    )
  }

  const promise = (async (): Promise<NearbyClientResult> => {
    try {
      const result = await requestNearbyNetwork(lat, lng, controller.signal)
      if (result.status === 'success') {
        lastSuccess = { lat, lng, at: Date.now(), result }
      }
      return result
    } catch (err) {
      if (controller.signal.aborted) {
        return { status: 'aborted' }
      }
      return {
        status: 'error',
        httpStatus: 0,
        code: 'network_error',
        message: 'Unable to load nearby locations right now. Please try again later.',
      }
    } finally {
      if (inFlight?.seq === seq) {
        inFlight = null
      }
    }
  })()

  inFlight = { key, controller, promise, seq }
  return promise
}

/** Test helper: count in-flight dedupe registrations. */
export function getNearbyInFlightKey(): string | null {
  return inFlight?.key ?? null
}
