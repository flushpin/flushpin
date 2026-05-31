import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = parseFloat(searchParams.get('radius') || '3000')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 })
  }

  const url = 'https://places.googleapis.com/v1/places:searchNearby'

  const body = {
    includedTypes: [
      'restaurant', 'cafe', 'coffee_shop',
      'gas_station', 'convenience_store',
      'shopping_mall', 'supermarket', 'grocery_store',
      'pharmacy', 'hospital', 'park',
      'tourist_attraction', 'visitor_center',
      'movie_theater', 'library', 'museum',
      'hotel', 'lodging', 'gym', 'stadium'
    ],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
        radius: radius
      }
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_MAPS_KEY!,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.primaryType'
    },
    body: JSON.stringify(body)
  })

  const data = await res.json()

  if (!data.places) {
    return NextResponse.json({ places: [] })
  }

  const places = data.places.map((p: any) => ({
    id: `google_${p.id}`,
    name: p.displayName?.text || 'Unknown',
    address: p.formattedAddress || '',
    lat: p.location?.latitude || 0,
    lng: p.location?.longitude || 0,
    type: p.primaryType || 'other',
    status: 'red',
    pin: '',
    stars: 0,
    score: 0,
    verified: 'Not yet verified',
    accessible: false,
    source: 'google',
  }))

  return NextResponse.json({ places })
}
