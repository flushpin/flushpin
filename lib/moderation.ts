const BLOCKED_WORDS = [
  'fuck','shit','ass','bitch','damn','crap','bastard','dick','pussy','cock',
  'piss','slut','whore','nigger','faggot','retard',
  'puta','mierda','cabron','chinga','pendejo','culero','pinche','joto',
  'orospu','göt','sik','amk','bok','oç','piç','yarrak','salak'
]

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase()
  return BLOCKED_WORDS.some(word => lower.includes(word))
}

export async function geocodeAddress(address: string, apiKey: string): Promise<{lat: number, lng: number} | null> {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    )
    const data = await res.json()
    if (data.results && data.results[0]) {
      const loc = data.results[0].geometry.location
      return { lat: loc.lat, lng: loc.lng }
    }
    return null
  } catch {
    return null
  }
}
