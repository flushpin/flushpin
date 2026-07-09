import { NextRequest, NextResponse } from 'next/server'

type TicketmasterEvent = {
  id?: string
  name?: string
  dates?: { start?: { localDate?: string; localTime?: string } }
  images?: Array<{ url?: string; width?: number; height?: number }>
  _embedded?: {
    venues?: Array<{
      name?: string
      address?: { line1?: string }
      city?: { name?: string }
      state?: { stateCode?: string; name?: string }
      location?: { latitude?: string; longitude?: string }
    }>
  }
}

function pickImage(images?: TicketmasterEvent['images']) {
  if (!images?.length) return ''
  const sorted = [...images].sort((a, b) => (b.width || 0) - (a.width || 0))
  return sorted[0]?.url || ''
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.TICKETMASTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Ticketmaster API key is not configured.' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates.' }, { status: 400 })
  }

  const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
  url.searchParams.set('apikey', apiKey)
  url.searchParams.set('latlong', `${lat},${lng}`)
  url.searchParams.set('radius', '30')
  url.searchParams.set('unit', 'miles')
  url.searchParams.set('size', '10')
  url.searchParams.set('sort', 'date,asc')

  const response = await fetch(url, { next: { revalidate: 300 } })
  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.fault?.faultstring || data?.message || 'Ticketmaster request failed.' },
      { status: response.status },
    )
  }

  const events = ((data?._embedded?.events || []) as TicketmasterEvent[]).map(event => {
    const venue = event._embedded?.venues?.[0]
    const city = venue?.city?.name || ''
    const state = venue?.state?.stateCode || venue?.state?.name || ''
    const line1 = venue?.address?.line1 || ''
    const address = [line1, city, state].filter(Boolean).join(', ')

    return {
      id: event.id || '',
      name: event.name || 'Untitled event',
      date: event.dates?.start?.localDate || '',
      time: event.dates?.start?.localTime || '',
      venue: {
        name: venue?.name || 'Venue TBA',
        address,
        lat: venue?.location?.latitude ? Number(venue.location.latitude) : null,
        lng: venue?.location?.longitude ? Number(venue.location.longitude) : null,
      },
      imageUrl: pickImage(event.images),
    }
  })

  return NextResponse.json({ events })
}
