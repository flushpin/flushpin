import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 300

function extractCity(address: string | null | undefined): string | null {
  if (!address) return null
  const caMatch = address.match(/,\s*([^,]+?)\s*,?\s*(?:CA|California)\s*\d{5}/i)
  if (caMatch) return caMatch[1].trim()
  const inlineMatch = address.match(/([A-Za-z .'-]+)\s+CA\s+\d{5}/)
  if (inlineMatch) return inlineMatch[1].trim()
  return null
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({ accessIntel: 42, venues: 36, cities: 6, cityList: [] })
  }

  const supabase = createClient(url, key)

  const [accessRes, venuesRes, greenRes] = await Promise.all([
    supabase
      .from('restroom')
      .select('*', { count: 'exact', head: true })
      .eq('opt_out', false)
      .eq('status', 'green'),
    supabase
      .from('restroom')
      .select('*', { count: 'exact', head: true })
      .eq('opt_out', false)
      .or('source.eq.google,source.is.null'),
    supabase
      .from('restroom')
      .select('address')
      .eq('opt_out', false)
      .eq('status', 'green'),
  ])

  const citySet = new Set<string>()
  for (const row of greenRes.data ?? []) {
    const city = extractCity(row.address)
    if (city) citySet.add(city)
  }
  const cityList = [...citySet].sort()

  return NextResponse.json({
    accessIntel: accessRes.count ?? 0,
    venues: venuesRes.count ?? 0,
    cities: cityList.length,
    cityList,
  })
}
