export type EVStation = {
  stationId: number | string
  operatorName?: string
  latitude: number
  longitude: number
}

type OpenChargeMapAddressInfo = {
  Latitude?: unknown
  Longitude?: unknown
}

type OpenChargeMapOperatorInfo = {
  Title?: unknown
}

type OpenChargeMapStation = {
  ID?: unknown
  UUID?: unknown
  AddressInfo?: OpenChargeMapAddressInfo | null
  OperatorInfo?: OpenChargeMapOperatorInfo | null
}

const cleanOperatorName = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const cleaned = value.replace(/\s+/g, ' ').trim()
  return cleaned || undefined
}

const validCoordinate = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max

export function normalizeOpenChargeMapStations(payload: unknown): EVStation[] {
  if (!Array.isArray(payload)) return []

  return payload.flatMap((raw: OpenChargeMapStation) => {
    const latitude = raw?.AddressInfo?.Latitude
    const longitude = raw?.AddressInfo?.Longitude
    const stationId = raw?.ID ?? raw?.UUID

    if (
      (typeof stationId !== 'number' && typeof stationId !== 'string') ||
      !validCoordinate(latitude, -90, 90) ||
      !validCoordinate(longitude, -180, 180)
    ) {
      return []
    }

    return [{
      stationId,
      operatorName: cleanOperatorName(raw?.OperatorInfo?.Title),
      latitude,
      longitude,
    }]
  })
}

