import { NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SOCAL_BOUNDS, extractCityFromAddress, isValidCityName } from '../../../lib/socal'

export const revalidate = 300
export const maxDuration = 60

const PAGE_SIZE = 1000

async function fetchSoCalCityStats(supabase: SupabaseClient) {
  const cityCounts = new Map<string, number>()
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('restroom')
      .select('address')
      .eq('opt_out', false)
      .gte('lat', SOCAL_BOUNDS.latMin)
      .lte('lat', SOCAL_BOUNDS.latMax)
      .gte('lng', SOCAL_BOUNDS.lngMin)
      .lte('lng', SOCAL_BOUNDS.lngMax)
      .range(from, from + PAGE_SIZE - 1)

    if (error) break
    if (!data?.length) break

    for (const row of data) {
      const city = extractCityFromAddress(row.address)
      if (isValidCityName(city)) {
        cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1)
      }
    }

    if (data.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  const cityList = [...cityCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([city]) => city)

  return { cities: cityCounts.size, cityList }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({
      region: 'Southern California',
      venues: 0,
      cities: 0,
      communityAccess: 42,
      cityList: [],
    })
  }

  const supabase = createClient(url, key)

  const [venuesRes, communityRes, cityStats] = await Promise.all([
    supabase
      .from('restroom')
      .select('*', { count: 'exact', head: true })
      .eq('opt_out', false)
      .gte('lat', SOCAL_BOUNDS.latMin)
      .lte('lat', SOCAL_BOUNDS.latMax)
      .gte('lng', SOCAL_BOUNDS.lngMin)
      .lte('lng', SOCAL_BOUNDS.lngMax),
    supabase
      .from('restroom')
      .select('*', { count: 'exact', head: true })
      .eq('opt_out', false)
      .eq('status', 'green'),
    fetchSoCalCityStats(supabase),
  ])

  return NextResponse.json({
    region: 'Southern California',
    venues: venuesRes.count ?? 0,
    cities: cityStats.cities,
    communityAccess: communityRes.count ?? 0,
    cityList: cityStats.cityList.slice(0, 24),
  })
}
