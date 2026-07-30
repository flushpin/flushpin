import { NextRequest, NextResponse } from 'next/server'
import { INCLUDED_TYPES, haversineDistanceMeters } from '../../../lib/nearby'
import {
  PLACE_PROVIDER_FIELD_MASKS,
  assessCoverage,
  executeProviderCall,
  getPlaceIntelligenceConfig,
  providerRequestFingerprint,
} from '../../../lib/placeIntelligence'
import { assertPinFreePayload } from '../../../lib/restroomAccessSecurity'
import { getServiceClient } from '../../../lib/supabaseService'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 3
const requestLog = new Map<string, number[]>()

type ProviderPlace = {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  location?: { latitude?: number; longitude?: number }
  primaryType?: string
}

function getClientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') || 'unknown'
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const hits = (requestLog.get(key) || []).filter((t) => t > windowStart)
  if (hits.length >= RATE_LIMIT_MAX) {
    requestLog.set(key, hits)
    return true
  }
  hits.push(now)
  requestLog.set(key, hits)
  return false
}

export async function GET(request: NextRequest) {
  const clientKey = getClientKey(request)
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: 'Too many requests. Try again in a minute.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = Math.min(5_000, Math.max(100, parseFloat(searchParams.get('radius') || '3000')))
  const keyword = (searchParams.get('q') || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 160)
  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
  }
  const center = { lat: Number(lat), lng: Number(lng) }
  if (!Number.isFinite(center.lat) || !Number.isFinite(center.lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const service = getServiceClient()
  let internalPlaces: Array<Record<string, unknown>> = []
  if ('client' in service && service.client) {
    const latDelta = radius / 110_540
    const lngDelta = radius / (111_320 * Math.max(0.2, Math.cos((center.lat * Math.PI) / 180)))
    const query = service.client
      .from('restroom_public')
      .select('id,name,address,lat,lng,status,verified,accessible,access_type,has_code,source,external_id,pin_updated_at')
      .gte('lat', center.lat - latDelta)
      .lte('lat', center.lat + latDelta)
      .gte('lng', center.lng - lngDelta)
      .lte('lng', center.lng + lngDelta)
      .limit(50)
    const { data } = await query
    internalPlaces = (data ?? [])
      .filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lng))
      .filter((row) => {
        if (!keyword) return true
        const haystack = `${row.name ?? ''} ${row.address ?? ''}`.toLowerCase()
        return keyword
          .toLowerCase()
          .split(/\s+/)
          .filter((token) => token.length >= 2)
          .every((token) => haystack.includes(token))
      })
      .filter(
        (row) =>
          row.has_code === true ||
          row.status === 'green' ||
          (typeof row.access_type === 'string' &&
            !['', 'unknown', 'pin'].includes(row.access_type.trim().toLowerCase())) ||
          (typeof row.verified === 'string' &&
            row.verified.trim() !== '' &&
            !/unknown|unverified|pending|not yet verified/i.test(row.verified)),
      )
      .filter(
        (row) =>
          haversineDistanceMeters(center.lat, center.lng, row.lat as number, row.lng as number) <=
          radius,
      )
      .map((row) => ({
        id: `flushpin_${row.id}`,
        restroom_id: row.id,
        name: row.name || 'Restroom',
        address: row.address || '',
        lat: row.lat,
        lng: row.lng,
        type: 'restroom',
        status: row.status || 'red',
        stars: 0,
        score: 0,
        verified: row.verified || 'Not yet verified',
        accessible: row.accessible === true,
        access_type: row.access_type,
        has_code: row.has_code === true,
        source: row.source || 'flushpin',
        external_id: row.external_id,
        pin_updated_at: row.pin_updated_at,
        provenance: [
          {
            provider:
              row.source === 'google'
                ? 'google'
                : row.source === 'openstreetmap' || row.source === 'osm'
                  ? 'openstreetmap'
                  : row.source === 'overture'
                    ? 'overture'
                  : 'flushpin',
            ownership:
              row.source === 'google'
                ? 'legacy_unknown'
                : row.source === 'openstreetmap' || row.source === 'osm'
                  ? 'open_public'
                  : row.source == null || row.source === 'manual'
                    ? 'flushpin_owned'
                    : 'legacy_unknown',
            providerObjectId: row.external_id || undefined,
            sourceDataset: row.source || undefined,
          },
        ],
      }))
  }

  const providerConfig = getPlaceIntelligenceConfig()
  const coverage = assessCoverage(
    center,
    internalPlaces.map((place) => ({
      lat: place.lat as number,
      lng: place.lng as number,
      verifiedAt: place.pin_updated_at as string | null,
      confidence: place.has_code || place.status === 'green' ? 'community' : 'unverified',
    })),
    providerConfig.nearbyCoverage,
  )
  const providerAllowed =
    providerConfig.externalFallbackEnabled && providerConfig.googlePlacesEnabled
  if (coverage.sufficient || !providerAllowed) {
    assertPinFreePayload(internalPlaces, 'Places API internal response')
    return NextResponse.json({
      places: internalPlaces,
      source: coverage.sufficient ? 'internal' : 'provider_disabled',
    })
  }

  const url = keyword
    ? 'https://places.googleapis.com/v1/places:searchText'
    : 'https://places.googleapis.com/v1/places:searchNearby'
  const body = keyword
    ? {
        textQuery: keyword,
        locationBias: {
          circle: {
            center: { latitude: center.lat, longitude: center.lng },
            radius,
          },
        },
        maxResultCount: 20,
      }
    : {
        includedTypes: [...INCLUDED_TYPES],
        maxResultCount: 20,
        rankPreference: 'DISTANCE',
        locationRestriction: {
          circle: {
            center: { latitude: center.lat, longitude: center.lng },
            radius,
          },
        },
      }
  let places: ProviderPlace[] = []
  try {
    places = await executeProviderCall({
      provider: 'google',
      feature: keyword ? 'places_text' : 'places_nearby',
      requestKey: `places:${providerRequestFingerprint({
        keyword: keyword || 'nearby',
        lat: center.lat.toFixed(4),
        lng: center.lng.toFixed(4),
        radius,
      })}`,
      sessionKey: `places:${clientKey}`,
      config: providerConfig,
      log: (event) => console.info('[place-intelligence]', JSON.stringify(event)),
      call: async (signal) => {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.GOOGLE_MAPS_KEY!,
            'X-Goog-FieldMask': PLACE_PROVIDER_FIELD_MASKS.nearby,
          },
          body: JSON.stringify(body),
          signal,
        })
        if (!res.ok) throw new Error(`places_provider_error:${res.status}`)
        const data = await res.json()
        return (data.places || []) as ProviderPlace[]
      },
    })
  } catch (error) {
    console.warn('[places] external fallback unavailable:', error)
  }

  const mapped = places.flatMap((p) => {
    const providerId = p.id?.replace(/^places\//, '') || ''
    const placeLat = p.location?.latitude
    const placeLng = p.location?.longitude
    if (!providerId || !Number.isFinite(placeLat) || !Number.isFinite(placeLng)) return []
    return [{
      id: `google_${providerId}`,
      place_id: providerId,
      name: p.displayName?.text || 'Unknown',
      address: p.formattedAddress || '',
      lat: placeLat as number,
      lng: placeLng as number,
      type: p.primaryType || 'other',
      status: 'red',
      stars: 0,
      score: 0,
      verified: 'Not yet verified',
      accessible: false,
      source: 'google',
      provenance: [
        {
          provider: 'google',
          ownership: 'temporary_provider',
          providerObjectId: providerId,
        },
      ],
    }]
  })
  const knownProviderIds = new Set(
    internalPlaces
      .map((place) => place.external_id)
      .filter((id): id is string => typeof id === 'string' && !!id),
  )
  const merged = [
    ...internalPlaces,
    ...mapped.filter((place) => !knownProviderIds.has(place.place_id)),
  ]
  assertPinFreePayload(merged, 'Places API response')
  return NextResponse.json({ places: merged, source: mapped.length ? 'mixed' : 'internal' })
}
