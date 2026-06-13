import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { restroomHasAccessInfo } from '../../../lib/accessType'

export const revalidate = 300

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({ accessIntel: 0, venues: 0, cities: 0 })
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('restroom')
    .select('pin, access_code, access_type, has_code, status, city, opt_out')

  if (error || !data) {
    return NextResponse.json({ accessIntel: 0, venues: 0, cities: 0 })
  }

  const active = data.filter(r => !r.opt_out)
  const accessIntel = active.filter(r =>
    restroomHasAccessInfo({
      pin: r.pin ?? r.access_code,
      access_type: r.access_type,
      has_code: r.has_code,
      status: r.status,
    })
  ).length

  const citySet = new Set(
    active.map(r => r.city?.trim()).filter((c): c is string => Boolean(c && c !== 'Unknown'))
  )

  return NextResponse.json({
    accessIntel,
    venues: active.length,
    cities: citySet.size,
  })
}
