/** Southern California geographic bounds for map coverage stats */
export const SOCAL_BOUNDS = {
  latMin: 32.45,
  latMax: 35.85,
  lngMin: -121.0,
  lngMax: -114.0,
} as const

export function extractCityFromAddress(address: string | null | undefined): string | null {
  if (!address) return null
  const caMatch = address.match(/,\s*([^,]+?)\s*,?\s*(?:CA|California)\s*\d{5}/i)
  if (caMatch) return caMatch[1].trim()
  const inlineMatch = address.match(/([A-Za-z .'-]+)\s+CA\s+\d{5}/)
  if (inlineMatch) return inlineMatch[1].trim()
  return null
}

export function isValidCityName(city: string | null | undefined): city is string {
  if (!city) return false
  if (city.length < 2 || city.length > 32) return false
  if (/^\d/.test(city)) return false
  if (/usa|county|blvd|street|drive|road|avenue/i.test(city)) return false
  return true
}
