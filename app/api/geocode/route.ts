import { NextRequest, NextResponse } from 'next/server'

type AddressComponent = { types: string[]; long_name?: string; short_name?: string }

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
      { headers: { 'User-Agent': 'FlushPin/1.0 (https://www.flushpin.com)' } }
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

async function forwardWithPlaces(query: string, key: string) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.location,places.formattedAddress,places.displayName,places.addressComponents',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
  })
  const data = await res.json()
  const place = data.places?.[0]
  if (!place?.location) return null

  const comp = (place.addressComponents || []) as AddressComponent[]
  return {
    lat: place.location.latitude as number,
    lng: place.location.longitude as number,
    label: extractLabel(comp, place.formattedAddress || place.displayName?.text),
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || searchParams.get('address')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  const key = process.env.GOOGLE_MAPS_KEY

  if (query && !lat && !lng) {
    if (key) {
      const located = await forwardWithPlaces(query, key)
      if (located) return NextResponse.json(located)
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
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`
      )
      const data = await res.json()
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

  const fallbackLabel = await reverseWithNominatim(latNum, lngNum)
  return NextResponse.json({
    label: fallbackLabel || 'Your area',
    lat: latNum,
    lng: lngNum,
  })
}
