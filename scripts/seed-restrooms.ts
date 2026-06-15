/**
 * Production-safe restroom seed importer.
 * Data source: OpenStreetMap via Overpass API (ODbL — https://www.openstreetmap.org/copyright)
 * INSERT-only — no DELETE, TRUNCATE, or destructive operations.
 *
 * Usage:
 *   npm run seed:restrooms -- --dry-run
 *   npm run seed:restrooms
 *   npm run seed:restrooms -- --city "Mission Viejo"
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { isPlausibleUsAddress } from '../lib/usAddressValidation'

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

function loadEnvFiles() {
  for (const file of ['.env.local', '.env']) {
    const path = resolve(process.cwd(), file)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (process.env[key] === undefined) process.env[key] = value
    }
  }
}

function requireEnv(): { supabaseUrl: string; supabaseServiceKey: string } {
  loadEnvFiles()

  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const missing: string[] = []
  if (!supabaseUrl) missing.push('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)')
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')

  if (missing.length) {
    console.error('Missing required environment variables:')
    for (const m of missing) console.error(`  - ${m}`)
    console.error('\nAdd them to .env.local (never commit real keys).')
    process.exit(1)
  }

  return {
    supabaseUrl: supabaseUrl!,
    supabaseServiceKey: supabaseServiceKey!,
  }
}

// ---------------------------------------------------------------------------
// Schema introspection (PostgREST OpenAPI — do not assume columns)
// ---------------------------------------------------------------------------

type ColumnMeta = {
  type?: string
  format?: string
  nullable?: boolean
}

type RestroomSchema = {
  columns: Set<string>
  meta: Record<string, ColumnMeta>
  placeIdColumn: 'place_id' | 'osm_id' | 'google_place_id' | 'external_id' | null
}

async function fetchRestroomSchema(
  supabaseUrl: string,
  serviceKey: string,
): Promise<RestroomSchema> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/openapi+json',
      },
    })

    if (!res.ok) {
      console.warn(`  ⚠ OpenAPI schema unavailable (${res.status}) — will infer from sample row`)
      return { columns: new Set<string>(), meta: {}, placeIdColumn: null }
    }

    const spec = (await res.json()) as Record<string, unknown>
    const definitions = spec.definitions as Record<string, { properties?: Record<string, ColumnMeta> }> | undefined
    const components = spec.components as { schemas?: Record<string, { properties?: Record<string, ColumnMeta> }> } | undefined

    const properties =
      definitions?.restroom?.properties ??
      components?.schemas?.restroom?.properties ??
      {}

    const columns = new Set(Object.keys(properties))
    const meta: Record<string, ColumnMeta> = { ...properties }

    let placeIdColumn: RestroomSchema['placeIdColumn'] = null
    if (columns.has('external_id')) placeIdColumn = 'external_id'
    else if (columns.has('place_id')) placeIdColumn = 'place_id'
    else if (columns.has('osm_id')) placeIdColumn = 'osm_id'
    else if (columns.has('google_place_id')) placeIdColumn = 'google_place_id'

    return { columns, meta, placeIdColumn }
  } catch (err) {
    console.warn('  ⚠ OpenAPI schema fetch failed — will infer from sample row')
    return { columns: new Set<string>(), meta: {}, placeIdColumn: null }
  }
}

async function enrichSchemaFromSample(
  supabase: SupabaseClient,
  schema: RestroomSchema,
): Promise<RestroomSchema> {
  const { data, error } = await supabase.from('restroom').select('*').limit(1)
  if (error) {
    throw new Error(
      `Cannot read restroom table (${error.message}). Add SUPABASE_SERVICE_ROLE_KEY to .env.local — anon key is not sufficient for seed inserts.`,
    )
  }
  if (data?.[0]) {
    for (const key of Object.keys(data[0])) {
      schema.columns.add(key)
    }
    if (!schema.placeIdColumn) {
      if (schema.columns.has('external_id')) schema.placeIdColumn = 'external_id'
      else if (schema.columns.has('place_id')) schema.placeIdColumn = 'place_id'
      else if (schema.columns.has('osm_id')) schema.placeIdColumn = 'osm_id'
      else if (schema.columns.has('google_place_id')) schema.placeIdColumn = 'google_place_id'
    }
  }
  if (!schema.columns.size) {
    throw new Error('Could not infer restroom schema — table may be empty and OpenAPI unavailable.')
  }
  return schema
}

// ---------------------------------------------------------------------------
// Seed areas
// ---------------------------------------------------------------------------

type SeedArea = {
  id: string
  label: string
  city: string
  lat: number
  lng: number
  radius: number
}

const SEED_AREAS: SeedArea[] = [
  { id: 'mission-viejo', label: 'Mission Viejo, CA', city: 'Mission Viejo', lat: 33.6, lng: -117.672, radius: 8000 },
  { id: 'laguna-beach', label: 'Laguna Beach, CA', city: 'Laguna Beach', lat: 33.5428, lng: -117.7854, radius: 6000 },
  { id: 'newport-beach', label: 'Newport Beach, CA', city: 'Newport Beach', lat: 33.6189, lng: -117.9289, radius: 8000 },
  { id: 'dana-point', label: 'Dana Point, CA', city: 'Dana Point', lat: 33.4672, lng: -117.6981, radius: 6000 },
  { id: 'sd-downtown', label: 'Downtown San Diego, CA', city: 'San Diego', lat: 32.7157, lng: -117.1611, radius: 2500 },
  { id: 'sd-gaslamp', label: 'Gaslamp Quarter, San Diego, CA', city: 'San Diego', lat: 32.7114, lng: -117.1600, radius: 1500 },
  { id: 'sd-little-italy', label: 'Little Italy, San Diego, CA', city: 'San Diego', lat: 32.7231, lng: -117.1684, radius: 1500 },
  { id: 'sd-mission-beach', label: 'Mission Beach, San Diego, CA', city: 'San Diego', lat: 32.7714, lng: -117.2523, radius: 2500 },
  { id: 'sd-pacific-beach', label: 'Pacific Beach, San Diego, CA', city: 'San Diego', lat: 32.7978, lng: -117.2344, radius: 2500 },
  { id: 'sd-la-jolla', label: 'La Jolla, San Diego, CA', city: 'San Diego', lat: 32.8328, lng: -117.2713, radius: 3500 },
  { id: 'sd-old-town', label: 'Old Town, San Diego, CA', city: 'San Diego', lat: 32.7549, lng: -117.1973, radius: 2000 },
]

/** OSM brand/chain names to match via name or brand tag */
const OSM_BRAND_NAMES = [
  'Starbucks',
  'Target',
  'Walmart',
  'CVS',
  'Walgreens',
  'Ralphs',
  'Albertsons',
  "Trader Joe",
]

// ---------------------------------------------------------------------------
// OpenStreetMap / Overpass API (free, no API key)
// ---------------------------------------------------------------------------

type OsmElement = {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

type NormalizedPlace = {
  externalId: string
  name: string
  address: string
  lat: number
  lng: number
  type: string
  areaCity: string
  areaLabel: string
}

const OVERPASS_URL =
  process.env.OVERPASS_API_URL ?? 'https://overpass-api.de/api/interpreter'

const OVERPASS_USER_AGENT =
  process.env.OVERPASS_USER_AGENT ??
  'FlushPin-Seed/1.0 (https://www.flushpin.com; restroom community map seed importer)'

/** Overpass public instances: max ~1 req/s — use conservative pacing + retry on 429 */
const REQUEST_DELAY_MS = 5000
const OVERPASS_MAX_RETRIES = 4
const INSERT_BATCH_SIZE = 40

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function escapeOverpassRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildAround(area: SeedArea) {
  return `(around:${area.radius},${area.lat},${area.lng})`
}

function buildAmenitiesQuery(area: SeedArea): string {
  const around = buildAround(area)
  return `[out:json][timeout:90];
(
  nwr["amenity"~"^(cafe|restaurant|fast_food|fuel|pharmacy|library)$"]${around};
);
out center tags;`
}

function buildShopsQuery(area: SeedArea): string {
  const around = buildAround(area)
  return `[out:json][timeout:90];
(
  nwr["shop"~"^(supermarket|department_store|convenience|mall|general)$"]${around};
);
out center tags;`
}

function buildHotelsParksBeachesQuery(area: SeedArea): string {
  const around = buildAround(area)
  return `[out:json][timeout:90];
(
  nwr["tourism"="hotel"]${around};
  nwr["building"="hotel"]${around};
  nwr["leisure"~"^(park|beach_resort|marina)$"]${around};
  nwr["natural"="beach"]${around};
);
out center tags;`
}

function buildBrandsQuery(area: SeedArea): string {
  const around = buildAround(area)
  const namePattern = OSM_BRAND_NAMES.map(escapeOverpassRegex).join('|')
  const brandPattern = OSM_BRAND_NAMES.map(escapeOverpassRegex).join('|')
  return `[out:json][timeout:90];
(
  nwr["name"~"^(${namePattern})",i]${around};
  nwr["brand"~"^(${brandPattern})",i]${around};
  nwr["operator"~"^(${brandPattern})",i]${around};
);
out center tags;`
}

const OVERPASS_QUERIES: { label: string; build: (area: SeedArea) => string }[] = [
  { label: 'amenities (cafe, restaurant, fuel, pharmacy, library)', build: buildAmenitiesQuery },
  { label: 'shops (supermarket, retail, mall)', build: buildShopsQuery },
  { label: 'hotels, parks, beaches', build: buildHotelsParksBeachesQuery },
  { label: 'named chains (Starbucks, Target, Walmart, …)', build: buildBrandsQuery },
]

async function overpassQuery(query: string, label: string): Promise<OsmElement[]> {
  for (let attempt = 0; attempt <= OVERPASS_MAX_RETRIES; attempt++) {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': OVERPASS_USER_AGENT,
      },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (res.status === 429) {
      const waitMs = REQUEST_DELAY_MS * (attempt + 2)
      console.warn(`  ⚠ Overpass rate limited (${label}) — waiting ${waitMs / 1000}s…`)
      await sleep(waitMs)
      continue
    }

    if (!res.ok) {
      const errText = await res.text()
      console.warn(`  ⚠ Overpass failed (${label}): ${res.status} ${errText.slice(0, 160)}`)
      return []
    }

    const data = (await res.json()) as { elements?: OsmElement[] }
    return data.elements ?? []
  }

  console.warn(`  ⚠ Overpass gave up after retries (${label})`)
  return []
}

function buildOsmAddress(tags: Record<string, string>, fallbackCity: string): string {
  const line1 =
    tags['addr:housenumber'] && tags['addr:street']
      ? `${tags['addr:housenumber']} ${tags['addr:street']}`
      : tags['addr:street'] || tags['addr:place'] || ''

  const city = tags['addr:city'] || tags['addr:suburb'] || fallbackCity
  const state = tags['addr:state'] || 'CA'
  const postcode = tags['addr:postcode']

  const parts = [line1, city, state, postcode].filter(Boolean)
  if (parts.length >= 2) return parts.join(', ')
  return `${fallbackCity}, CA`
}

function osmPrimaryType(tags: Record<string, string>): string {
  return tags.amenity || tags.shop || tags.tourism || tags.leisure || tags.natural || 'other'
}

function osmDisplayName(tags: Record<string, string>): string {
  if (tags.name?.trim()) return tags.name.trim()
  if (tags.brand?.trim()) return tags.brand.trim()
  if (tags.operator?.trim()) return tags.operator.trim()
  if (tags['addr:housenumber'] && tags['addr:street']) {
    return `${tags['addr:housenumber']} ${tags['addr:street']}`.trim()
  }
  return ''
}

function normalizeOsmElement(element: OsmElement, area: SeedArea): NormalizedPlace | null {
  const tags = element.tags ?? {}
  const name = osmDisplayName(tags)
  if (!name) return null

  const lat = element.lat ?? element.center?.lat
  const lng = element.lon ?? element.center?.lon
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return null

  const externalId = `osm:${element.type}/${element.id}`
  const address = buildOsmAddress(tags, area.city)

  return {
    externalId,
    name,
    address,
    lat,
    lng,
    type: osmPrimaryType(tags),
    areaCity: area.city,
    areaLabel: area.label,
  }
}

function isValidSeedPlace(place: NormalizedPlace): boolean {
  if (!isPlausibleUsAddress(place.address)) return false
  const addr = place.address.toLowerCase()
  if (!addr.includes('ca') && !addr.includes('california')) return false
  if (place.lat < 32.4 || place.lat > 34.2 || place.lng < -118.2 || place.lng > -116.9) return false
  return true
}

// ---------------------------------------------------------------------------
// Dedupe
// ---------------------------------------------------------------------------

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
}

function normalizeAddress(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function dedupeKey(place: NormalizedPlace, placeIdColumn: RestroomSchema['placeIdColumn']) {
  if (placeIdColumn) return `pid:${place.externalId}`
  return `na:${normalizeName(place.name)}|${normalizeAddress(place.address)}`
}

async function loadExistingDedupeKeys(
  supabase: SupabaseClient,
  schema: RestroomSchema,
): Promise<Set<string>> {
  const keys = new Set<string>()
  const selectCols = ['name', 'address']
  if (schema.placeIdColumn) selectCols.unshift(schema.placeIdColumn)

  let from = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('restroom')
      .select(selectCols.join(','))
      .range(from, from + pageSize - 1)

    if (error) {
      console.warn(`  ⚠ Could not load existing restrooms for dedupe: ${error.message}`)
      break
    }
    if (!data?.length) break

    for (const row of data as unknown as Record<string, string | null>[]) {
      const pid =
        (schema.placeIdColumn && row[schema.placeIdColumn]) ||
        row.external_id ||
        row.place_id ||
        row.osm_id ||
        row.google_place_id
      if (pid) {
        keys.add(`pid:${String(pid)}`)
      }
      if (row.name && row.address) {
        keys.add(`na:${normalizeName(row.name)}|${normalizeAddress(row.address)}`)
      }
    }

    from += data.length
    if (data.length < pageSize) break
  }

  return keys
}

// ---------------------------------------------------------------------------
// Schema-aware row builder
// ---------------------------------------------------------------------------

function setIfPresent(
  row: Record<string, unknown>,
  columns: Set<string>,
  column: string,
  value: unknown,
) {
  if (columns.has(column) && value !== undefined) {
    row[column] = value
  }
}

function applyVerifiedDefault(row: Record<string, unknown>, columns: Set<string>) {
  if (columns.has('verified_note')) {
    row.verified_note = 'Not yet verified'
  }
}

function buildInsertRow(
  place: NormalizedPlace,
  schema: RestroomSchema,
): Record<string, unknown> {
  const { columns, placeIdColumn } = schema
  const row: Record<string, unknown> = {}

  setIfPresent(row, columns, 'name', place.name)
  setIfPresent(row, columns, 'address', place.address)
  setIfPresent(row, columns, 'lat', place.lat)
  setIfPresent(row, columns, 'lng', place.lng)
  setIfPresent(row, columns, 'type', place.type || 'other')
  setIfPresent(row, columns, 'city', place.areaCity)

  if (placeIdColumn) {
    setIfPresent(row, columns, placeIdColumn, place.externalId)
  }

  applyVerifiedDefault(row, columns)
  setIfPresent(row, columns, 'access_type', 'unknown')
  setIfPresent(row, columns, 'has_code', false)
  setIfPresent(row, columns, 'accessible', null)
  setIfPresent(row, columns, 'has_baby_changing', null)
  setIfPresent(row, columns, 'score', 0)
  setIfPresent(row, columns, 'stars', 0)
  setIfPresent(row, columns, 'status', 'unknown')
  setIfPresent(row, columns, 'opt_out', false)

  // Never seed PINs / access codes
  if (columns.has('pin')) row.pin = null
  if (columns.has('access_code')) row.access_code = null

  if (columns.has('source')) row.source = 'seed'
  if (columns.has('seed_source')) row.seed_source = 'openstreetmap'

  return row
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

type AreaStats = {
  fetched: number
  inserted: number
  skippedDuplicate: number
  skippedInvalid: number
}

type RunStats = {
  totalFetched: number
  inserted: number
  skippedDuplicate: number
  skippedInvalid: number
  byCity: Record<string, AreaStats>
}

function initStats(): RunStats {
  return {
    totalFetched: 0,
    inserted: 0,
    skippedDuplicate: 0,
    skippedInvalid: 0,
    byCity: {},
  }
}

function bumpCity(stats: RunStats, city: string): AreaStats {
  if (!stats.byCity[city]) {
    stats.byCity[city] = { fetched: 0, inserted: 0, skippedDuplicate: 0, skippedInvalid: 0 }
  }
  return stats.byCity[city]
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]) {
  const dryRun = argv.includes('--dry-run')
  const cityIdx = argv.indexOf('--city')
  const cityFilter = cityIdx >= 0 ? argv[cityIdx + 1] : undefined
  return { dryRun, cityFilter }
}

function filterAreas(areas: SeedArea[], cityFilter?: string) {
  if (!cityFilter) return areas
  const needle = cityFilter.toLowerCase()
  return areas.filter(
    (a) =>
      a.city.toLowerCase().includes(needle) ||
      a.label.toLowerCase().includes(needle) ||
      a.id.toLowerCase().includes(needle),
  )
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function fetchOsmPlacesForArea(area: SeedArea): Promise<NormalizedPlace[]> {
  const byId = new Map<string, NormalizedPlace>()

  console.log(`\n📍 ${area.label}`)

  for (const { label, build } of OVERPASS_QUERIES) {
    process.stdout.write(`  · overpass: ${label}\n`)
    const query = build(area)
    const elements = await overpassQuery(query, label)

    for (const element of elements) {
      const normalized = normalizeOsmElement(element, area)
      if (normalized) byId.set(normalized.externalId, normalized)
    }

    await sleep(REQUEST_DELAY_MS)
  }

  return Array.from(byId.values())
}

async function insertEntries(
  supabase: SupabaseClient,
  entries: { row: Record<string, unknown>; city: string }[],
  stats: RunStats,
): Promise<{ inserted: number; failed: number }> {
  if (!entries.length) return { inserted: 0, failed: 0 }

  let inserted = 0
  let failed = 0

  for (let i = 0; i < entries.length; i += INSERT_BATCH_SIZE) {
    const batchEntries = entries.slice(i, i + INSERT_BATCH_SIZE)
    const batch = batchEntries.map((entry) => entry.row)

    const { data, error } = await supabase.from('restroom').insert(batch).select('id')
    if (!error && data?.length === batch.length) {
      inserted += data.length
      for (const entry of batchEntries) {
        bumpCity(stats, entry.city).inserted++
      }
      continue
    }

    for (const entry of batchEntries) {
      const { data: one, error: oneErr } = await supabase
        .from('restroom')
        .insert(entry.row)
        .select('id')
      if (oneErr || !one?.length) {
        failed++
      } else {
        inserted++
        bumpCity(stats, entry.city).inserted++
      }
    }
  }

  return { inserted, failed }
}

async function main() {
  const { dryRun, cityFilter } = parseArgs(process.argv.slice(2))
  const env = requireEnv()

  const areas = filterAreas(SEED_AREAS, cityFilter)
  if (!areas.length) {
    console.error(`No seed areas matched --city "${cityFilter}"`)
    process.exit(1)
  }

  console.log('FlushPin restroom seed importer')
  console.log('Data source: OpenStreetMap via Overpass API')
  console.log('License: ODbL — https://www.openstreetmap.org/copyright')
  console.log(`Overpass endpoint: ${OVERPASS_URL}`)
  console.log(`Mode: ${dryRun ? 'DRY RUN (no inserts)' : 'LIVE INSERT'}`)
  console.log(`Areas: ${areas.map((a) => a.label).join(', ')}`)

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  console.log('\nInspecting restroom schema from Supabase…')
  let schema = await fetchRestroomSchema(env.supabaseUrl, env.supabaseServiceKey)
  schema = await enrichSchemaFromSample(supabase, schema)

  console.log(`  Columns (${schema.columns.size}): ${Array.from(schema.columns).sort().join(', ')}`)
  console.log(
    `  Dedupe: ${schema.placeIdColumn ? `id column "${schema.placeIdColumn}"` : 'normalized name + address'}`,
  )

  const existingKeys = await loadExistingDedupeKeys(supabase, schema)
  console.log(`  Existing dedupe keys loaded: ${existingKeys.size}`)

  const stats = initStats()
  const runKeys = new Set(existingKeys)
  const pendingInserts: { row: Record<string, unknown>; city: string }[] = []

  for (const area of areas) {
    const cityStats = bumpCity(stats, area.city)
    const places = await fetchOsmPlacesForArea(area)
    cityStats.fetched += places.length
    stats.totalFetched += places.length

    for (const place of places) {
      if (!isValidSeedPlace(place)) {
        stats.skippedInvalid++
        cityStats.skippedInvalid++
        continue
      }

      const key = dedupeKey(place, schema.placeIdColumn)
      if (runKeys.has(key)) {
        stats.skippedDuplicate++
        cityStats.skippedDuplicate++
        continue
      }

      runKeys.add(key)
      pendingInserts.push({ row: buildInsertRow(place, schema), city: place.areaCity })
    }
  }

  if (dryRun) {
    stats.inserted = pendingInserts.length
    for (const pending of pendingInserts) {
      bumpCity(stats, pending.city).inserted++
    }
  } else {
    console.log(`\nInserting ${pendingInserts.length} new restroom rows…`)
    const { inserted, failed } = await insertEntries(supabase, pendingInserts, stats)
    stats.inserted = inserted
    stats.skippedInvalid += failed
  }

  console.log('\n========== Seed summary ==========')
  if (dryRun) {
    console.log('DRY RUN — no rows were written to Supabase.')
  }
  console.log(`Total fetched:       ${stats.totalFetched}`)
  console.log(`Inserted:            ${dryRun ? `${pendingInserts.length} (would insert)` : stats.inserted}`)
  console.log(`Skipped duplicates:  ${stats.skippedDuplicate}`)
  console.log(`Skipped invalid:     ${stats.skippedInvalid}`)
  console.log('\nCity breakdown:')
  for (const [city, s] of Object.entries(stats.byCity).sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(
      `  ${city}: fetched=${s.fetched}, inserted=${dryRun ? s.inserted : s.inserted}, dupes=${s.skippedDuplicate}, invalid=${s.skippedInvalid}`,
    )
  }
  console.log('==================================\n')
}

main().catch((err) => {
  console.error('Seed importer failed:', err)
  process.exit(1)
})
