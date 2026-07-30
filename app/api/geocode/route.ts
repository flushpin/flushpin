import { NextRequest, NextResponse } from 'next/server'
import {
  PLACE_PROVIDER_FIELD_MASKS,
  executeProviderCall,
  getPlaceIntelligenceConfig,
  providerRequestFingerprint,
} from '../../../lib/placeIntelligence'
import { getServiceClient } from '../../../lib/supabaseService'

type AddressComponent = { types: string[]; long_name?: string; short_name?: string }

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
const requestLog = new Map<string, number[]>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (requestLog.get(key) ?? []).filter(
    (timestamp) => timestamp > now - RATE_LIMIT_WINDOW_MS,
  )
  if (recent.length >= RATE_LIMIT_MAX) {
    requestLog.set(key, recent)
    return true
  }
  recent.push(now)
  requestLog.set(key, recent)
  return false
}

function extractLabel(addressComponents: AddressComponent[], formattedAddress?: string) {
  const city =
    addressComponents.find(c => c.types.includes('locality'))?.long_name ||
    addressComponents.find(c => c.types.includes('sublocality'))?.long_name ||
    addressComponents.find(c => c.types.includes('administrative_area_level_2'))?.long_name
  const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.short_name
  return city && state ? `${city}, ${state}` : city || formattedAddress || 'Your area'
}

async function reverseWithNominatim(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: { 'User-Agent': 'FlushPin/1.0 (https://www.flushpin.com)' },
        signal: AbortSignal.timeout(5_000),
      },
    )
    const data = await res.json()
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality ||
      data.address?.county
    const state = data.address?.state
    if (city && state) {
      const shortState = state.length === 2 ? state : state.replace(/^California$/, 'CA')
      return `${city}, ${shortState}`
    }
    return data.display_name?.split(',').slice(0, 2).join(',').trim() || null
  } catch {
    return null
  }
}

async function resolveInternalLocation(query: string) {
  const service = getServiceClient()
  if (!('client' in service) || !service.client) return null
  const { data, error } = await service.client
    .from('restroom_public')
    .select('id,name,address,lat,lng')
    .ilike('name', query)
    .limit(3)
  if (error) return null
  const exact = (data ?? []).find(
    (row) =>
      typeof row.name === 'string' &&
      row.name.trim().localeCompare(query, undefined, { sensitivity: 'base' }) === 0 &&
      Number.isFinite(row.lat) &&
      Number.isFinite(row.lng),
  )
  if (!exact) return null
  return {
    lat: exact.lat as number,
    lng: exact.lng as number,
    label: exact.address || exact.name || query,
    source: 'flushpin',
  }
}

async function forwardWithPlaces(query: string, key: string, sessionKey: string) {
  const config = getPlaceIntelligenceConfig()
  return executeProviderCall({
    provider: 'google',
    feature: 'places_text',
    requestKey: `geocode-forward:${providerRequestFingerprint(query.toLowerCase())}`,
    sessionKey,
    config,
    log: (event) => console.info('[place-intelligence]', JSON.stringify(event)),
    call: async (signal) => {
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': PLACE_PROVIDER_FIELD_MASKS.textResolution,
        },
        body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
        signal,
      })
      const data = await res.json()
      const place = data.places?.[0]
      if (!place?.location) return null

      return {
        lat: place.location.latitude as number,
        lng: place.location.longitude as number,
        label: place.formattedAddress || place.displayName?.text || query,
        source: 'google',
      }
    },
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || searchParams.get('address')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  const key = process.env.GOOGLE_MAPS_KEY
  const forwarded = request.headers.get('x-forwarded-for')
  const clientKey =
    forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  const sessionKey = `geocode:${clientKey}`
  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  if (query && !lat && !lng) {
    const cleanedQuery = query.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 160)
    if (cleanedQuery.length < 3) {
      return NextResponse.json({ error: 'Enter at least 3 characters' }, { status: 400 })
    }
    const internal = await resolveInternalLocation(cleanedQuery)
    if (internal) return NextResponse.json(internal)
    if (key) {
      try {
        const located = await forwardWithPlaces(cleanedQuery, key, sessionKey)
        if (located) return NextResponse.json(located)
      } catch (error) {
        console.warn('[geocode] external forward lookup unavailable:', error)
      }
    }
    return NextResponse.json({ error: 'Location not found' }, { status: 404 })
  }

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates or query' }, { status: 400 })
  }

  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)

  if (key) {
    try {
      const config = getPlaceIntelligenceConfig()
      const data = await executeProviderCall({
        provider: 'google',
        feature: 'geocoding',
        requestKey: `geocode-reverse:${providerRequestFingerprint({
          lat: latNum.toFixed(4),
          lng: lngNum.toFixed(4),
        })}`,
        sessionKey,
        config,
        log: (event) => console.info('[place-intelligence]', JSON.stringify(event)),
        call: async (signal) => {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`,
            { signal },
          )
          return res.json()
        },
      })
      const comp = (data.results?.[0]?.address_components || []) as AddressComponent[]
      const label = extractLabel(comp, data.results?.[0]?.formatted_address)
      if (label !== 'Your area') {
        return NextResponse.json({
          label,
          city:
            comp.find(c => c.types.includes('locality'))?.long_name ||
            comp.find(c => c.types.includes('sublocality'))?.long_name ||
            null,
          state: comp.find(c => c.types.includes('administrative_area_level_1'))?.short_name || null,
          lat: latNum,
          lng: lngNum,
        })
      }
    } catch {
      // fall through
    }
  }

  const nominatimEnabled =
    process.env.NOMINATIM_FALLBACK_ENABLED?.trim().toLowerCase() === 'true'
  const fallbackLabel = nominatimEnabled
    ? await reverseWithNominatim(latNum, lngNum)
    : null
  return NextResponse.json({
    label: fallbackLabel || 'Your area',
    lat: latNum,
    lng: lngNum,
  })
}
