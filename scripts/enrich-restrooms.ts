/**
 * Enrich existing restroom rows for Orange County target cities.
 * UPDATE-only — no INSERT, DELETE, or TRUNCATE.
 *
 * Prerequisite: run scripts/sql/enrich-restroom-schema.sql in Supabase SQL Editor
 *
 * Usage (dry-run is DEFAULT):
 *   npm run enrich:restrooms
 *   npm run enrich:restrooms -- --city "Newport Beach"
 *   npm run enrich:restrooms -- --apply
 *   npm run enrich:restrooms -- --apply --city "Mission Viejo"
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

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

function requireEnv(dryRun: boolean) {
  loadEnvFiles()
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = serviceKey ?? (dryRun ? anonKey : undefined)

  const missing: string[] = []
  if (!supabaseUrl) missing.push('SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)')
  if (!supabaseServiceKey) {
    missing.push(
      dryRun
        ? 'SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY'
        : 'SUPABASE_SERVICE_ROLE_KEY',
    )
  }
  if (missing.length) {
    console.error('Missing required environment variables:')
    for (const m of missing) console.error(`  - ${m}`)
    process.exit(1)
  }
  return { supabaseUrl: supabaseUrl!, supabaseServiceKey: supabaseServiceKey! }
}

function assertServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString())
    if (payload.role !== 'service_role') {
      console.error('SUPABASE_SERVICE_ROLE_KEY must be the service_role key (not anon).')
      process.exit(1)
    }
  } catch {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not a valid JWT.')
    process.exit(1)
  }
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

type RestroomSchema = {
  columns: Set<string>
}

async function fetchRestroomSchema(
  supabaseUrl: string,
  serviceKey: string,
  sampleRow: Record<string, unknown> | null,
): Promise<RestroomSchema> {
  const columns = new Set<string>()
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/openapi+json',
      },
    })
    if (res.ok) {
      const spec = (await res.json()) as Record<string, unknown>
      const definitions = spec.definitions as Record<string, { properties?: Record<string, unknown> }> | undefined
      const components = spec.components as { schemas?: Record<string, { properties?: Record<string, unknown> }> } | undefined
      const properties =
        definitions?.restroom?.properties ??
        components?.schemas?.restroom?.properties ??
        {}
      for (const k of Object.keys(properties)) columns.add(k)
    }
  } catch {
    // fall back to sample row
  }
  if (sampleRow) {
    for (const k of Object.keys(sampleRow)) columns.add(k)
  }
  return { columns }
}

// ---------------------------------------------------------------------------
// City parsing
// ---------------------------------------------------------------------------

const TARGET_CITIES = [
  'Mission Viejo',
  'Newport Beach',
  'Laguna Beach',
  'Dana Point',
] as const

const CITY_NORMALIZATION: Record<string, (typeof TARGET_CITIES)[number]> = {
  'mission viejo': 'Mission Viejo',
  'newport beach': 'Newport Beach',
  'laguna beach': 'Laguna Beach',
  'dana point': 'Dana Point',
}

const JUNK_CITY_EXACT = new Set([
  '',
  'suite a',
  'suite b',
  'ste a',
  'ste b',
  'ste c',
  'pch',
  's coast hwy',
  'n coast hwy',
  'coast hwy',
  '26001',
])

const JUNK_CITY_PATTERNS = [
  /^suite\s+[a-z0-9-]+$/i,
  /^ste\.?\s+[a-z0-9-]+$/i,
  /^unit\s+[a-z0-9-]+$/i,
  /^#\s*[a-z0-9-]+$/i,
  /^pch$/i,
  /^s\s+coast\s+hwy$/i,
  /^n\s+coast\s+hwy$/i,
  /^\d{1,6}$/,
  /^\d+\s+[a-z]/i,
  /\b(hwy|highway|blvd|boulevard|ave|avenue|st|street|rd|road|dr|drive|ln|lane|way|pkwy|parkway|ct|court|pl|place)\b/i,
]

function isJunkCity(value: string | null | undefined): boolean {
  const v = value?.trim() ?? ''
  if (!v) return true
  if (JUNK_CITY_EXACT.has(v.toLowerCase())) return true
  return JUNK_CITY_PATTERNS.some((re) => re.test(v))
}

function titleCaseWords(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function normalizeCityName(value: string): string {
  const key = value.trim().toLowerCase()
  return CITY_NORMALIZATION[key] ?? titleCaseWords(value)
}

function isGoodCity(value: string | null | undefined): boolean {
  if (!value?.trim()) return false
  if (isJunkCity(value)) return false
  return true
}

function parseStateFromAddress(address: string | null | undefined): string | null {
  if (!address?.trim()) return null
  if (/\bCA\b/.test(address) || /California/i.test(address)) return 'CA'
  return null
}

function parseCityFromAddress(address: string | null | undefined): string | null {
  if (!address?.trim()) return null

  const parts = address.split(',').map((s) => s.trim()).filter(Boolean)
  if (!parts.length) return null

  for (const part of parts) {
    for (const key of Object.keys(CITY_NORMALIZATION)) {
      if (part.toLowerCase().includes(key)) {
        return CITY_NORMALIZATION[key]
      }
    }
  }

  for (let i = 0; i < parts.length; i++) {
    const next = parts[i + 1] ?? ''
    if (/^CA(\s+\d{5}(-\d{4})?)?$/i.test(next)) {
      const candidate = parts[i]
      if (!isJunkCity(candidate)) return normalizeCityName(candidate)
    }
    const inline = parts[i].match(/^(.+?)\s+CA(?:\s+\d{5}(-\d{4})?)?$/i)
    if (inline && !isJunkCity(inline[1])) return normalizeCityName(inline[1])
  }

  if (parts.length >= 2) {
    const last = parts[parts.length - 1]
    if (/^CA(\s+\d{5}(-\d{4})?)?$/i.test(last)) {
      const candidate = parts[parts.length - 2]
      if (!isJunkCity(candidate)) return normalizeCityName(candidate)
    }
  }

  return null
}

function rowInTargetArea(row: {
  city?: string | null
  address?: string | null
}): boolean {
  const city = row.city?.trim()
  if (city && TARGET_CITIES.some((t) => t.toLowerCase() === city.toLowerCase())) {
    return true
  }
  const parsed = parseCityFromAddress(row.address)
  if (parsed && TARGET_CITIES.includes(parsed as (typeof TARGET_CITIES)[number])) {
    return true
  }
  const addr = row.address?.toLowerCase() ?? ''
  return Object.keys(CITY_NORMALIZATION).some((k) => addr.includes(k))
}

function resolveCityUpdate(
  currentCity: string | null | undefined,
  address: string | null | undefined,
): { value: string | null; action: 'keep' | 'fix' | 'skip_junk' } {
  if (isGoodCity(currentCity)) {
    const normalized = normalizeCityName(currentCity!)
    if (normalized !== currentCity!.trim()) return { value: normalized, action: 'fix' }
    return { value: normalized, action: 'keep' }
  }

  const parsed = parseCityFromAddress(address)
  if (!parsed) return { value: null, action: 'skip_junk' }
  if (isJunkCity(parsed)) return { value: null, action: 'skip_junk' }
  return { value: parsed, action: 'fix' }
}

// ---------------------------------------------------------------------------
// Row enrichment
// ---------------------------------------------------------------------------

type RestroomRow = Record<string, unknown> & {
  id: string | number
  address?: string | null
  city?: string | null
  state?: string | null
  access_type?: string | null
  verified?: string | null
  verified_note?: string | null
  status_note?: string | null
  last_verified_at?: string | null
  pin?: string | null
  pin_updated_at?: string | null
}

type EnrichStats = {
  rowsScanned: number
  rowsMatched: number
  rowsUpdated: number
  cityValuesFixed: number
  junkCityGuessesSkipped: number
  verifiedTextPreserved: number
  accessTypeNormalized: number
  stateFilled: number
  statusNotesAdded: number
}

function hasRealAccess(row: RestroomRow): boolean {
  const pin = typeof row.pin === 'string' ? row.pin.trim() : ''
  if (pin && !['', 'open', 'n/a', 'none'].includes(pin.toLowerCase())) return true
  const accessType = row.access_type?.toString().trim()
  return !!accessType && accessType !== 'unknown'
}

function buildEnrichmentUpdate(
  row: RestroomRow,
  schema: RestroomSchema,
): { patch: Record<string, unknown>; stats: Partial<EnrichStats> } | null {
  const patch: Record<string, unknown> = {}
  const delta: Partial<EnrichStats> = {}

  const cityResult = resolveCityUpdate(
    typeof row.city === 'string' ? row.city : null,
    typeof row.address === 'string' ? row.address : null,
  )

  if (schema.columns.has('city')) {
    if (cityResult.action === 'fix' && cityResult.value && row.city !== cityResult.value) {
      patch.city = cityResult.value
      delta.cityValuesFixed = 1
    } else if (cityResult.action === 'skip_junk' && !isGoodCity(row.city as string)) {
      delta.junkCityGuessesSkipped = 1
    }
  }

  if (schema.columns.has('state')) {
    const state = typeof row.state === 'string' ? row.state.trim() : ''
    if (!state) {
      const parsed = parseStateFromAddress(row.address as string)
      if (parsed) {
        patch.state = parsed
        delta.stateFilled = 1
      }
    }
  }

  if (schema.columns.has('access_type')) {
    const current = row.access_type?.toString().trim()
    if (!current) {
      patch.access_type = 'unknown'
      delta.accessTypeNormalized = 1
    }
  }

  if (schema.columns.has('verified_note')) {
    const note = typeof row.verified_note === 'string' ? row.verified_note.trim() : ''
    if (!note) {
      const legacy = typeof row.verified === 'string' ? row.verified.trim() : ''
      if (legacy) {
        patch.verified_note = legacy
        delta.verifiedTextPreserved = 1
      }
    }
  }

  if (schema.columns.has('status_note')) {
    const note = typeof row.status_note === 'string' ? row.status_note.trim() : ''
    if (!note && !hasRealAccess(row)) {
      patch.status_note = 'Community seed listing — access not yet verified'
      delta.statusNotesAdded = 1
    }
  }

  if (
    schema.columns.has('last_verified_at') &&
    !row.last_verified_at &&
    row.pin_updated_at
  ) {
    patch.last_verified_at = row.pin_updated_at
  }

  if (!Object.keys(patch).length) return null
  return { patch, stats: delta }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function* fetchRestroomRows(supabase: SupabaseClient) {
  let from = 0
  const pageSize = 1000
  while (true) {
    const { data, error } = await supabase
      .from('restroom')
      .select('*')
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) throw new Error(`Failed to fetch restrooms: ${error.message}`)
    if (!data?.length) break
    yield data as RestroomRow[]
    from += data.length
    if (data.length < pageSize) break
  }
}

function parseArgs(argv: string[]) {
  const apply = argv.includes('--apply')
  const dryRun = !apply
  const cityIdx = argv.indexOf('--city')
  const cityFilter = cityIdx >= 0 ? argv[cityIdx + 1] : undefined
  return { dryRun, apply, cityFilter }
}

async function main() {
  const { dryRun, apply, cityFilter } = parseArgs(process.argv.slice(2))
  const env = requireEnv(dryRun)
  if (apply) assertServiceRoleKey()

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: sample } = await supabase.from('restroom').select('*').limit(1)
  const schema = await fetchRestroomSchema(
    env.supabaseUrl,
    env.supabaseServiceKey,
    sample?.[0] ?? null,
  )

  console.log('FlushPin restroom enrichment (Phase A — mobile-safe)')
  console.log(`Mode: ${dryRun ? 'DRY RUN (default — pass --apply to write)' : 'LIVE UPDATE'}`)
  console.log(`Target cities: ${TARGET_CITIES.join(', ')}`)
  if (cityFilter) console.log(`Filter: ${cityFilter}`)
  console.log(`Columns detected: ${Array.from(schema.columns).sort().join(', ')}`)

  const recommended = ['verified_note', 'status_note', 'city', 'state', 'access_type']
  const missing = recommended.filter((c) => !schema.columns.has(c))
  if (missing.length) {
    console.warn(`\n⚠  Missing columns: ${missing.join(', ')}`)
    console.warn('   Run scripts/sql/enrich-restroom-schema.sql in Supabase SQL Editor first.\n')
  }

  const stats: EnrichStats = {
    rowsScanned: 0,
    rowsMatched: 0,
    rowsUpdated: 0,
    cityValuesFixed: 0,
    junkCityGuessesSkipped: 0,
    verifiedTextPreserved: 0,
    accessTypeNormalized: 0,
    stateFilled: 0,
    statusNotesAdded: 0,
  }

  const cityNeedle = cityFilter?.toLowerCase()

  for await (const batch of fetchRestroomRows(supabase)) {
    for (const row of batch) {
      stats.rowsScanned++
      if (!rowInTargetArea(row)) continue

      if (cityNeedle) {
        const city = (row.city as string) || parseCityFromAddress(row.address as string) || ''
        if (!city.toLowerCase().includes(cityNeedle)) continue
      }

      stats.rowsMatched++
      const result = buildEnrichmentUpdate(row, schema)
      if (!result) continue

      stats.rowsUpdated++
      stats.cityValuesFixed += result.stats.cityValuesFixed ?? 0
      stats.junkCityGuessesSkipped += result.stats.junkCityGuessesSkipped ?? 0
      stats.verifiedTextPreserved += result.stats.verifiedTextPreserved ?? 0
      stats.accessTypeNormalized += result.stats.accessTypeNormalized ?? 0
      stats.stateFilled += result.stats.stateFilled ?? 0
      stats.statusNotesAdded += result.stats.statusNotesAdded ?? 0

      if (dryRun) continue

      const { error } = await supabase
        .from('restroom')
        .update(result.patch)
        .eq('id', row.id)

      if (error) {
        console.warn(`  ⚠ Update failed for id=${row.id}: ${error.message}`)
        stats.rowsUpdated--
      }
    }
  }

  console.log('\n========== Enrichment summary ==========')
  if (dryRun) {
    console.log('DRY RUN — no rows were updated in Supabase.')
    console.log('Re-run with --apply to write changes.')
  }
  console.log(`Rows scanned:              ${stats.rowsScanned}`)
  console.log(`Rows matched (target area): ${stats.rowsMatched}`)
  console.log(`Rows updated:              ${dryRun ? `${stats.rowsUpdated} (would update)` : stats.rowsUpdated}`)
  console.log(`City values fixed:         ${stats.cityValuesFixed}`)
  console.log(`Junk city guesses skipped: ${stats.junkCityGuessesSkipped}`)
  console.log(`Verified text preserved:   ${stats.verifiedTextPreserved}`)
  console.log(`Access type normalized:    ${stats.accessTypeNormalized}`)
  console.log(`State filled:              ${stats.stateFilled}`)
  console.log(`Status notes added:        ${stats.statusNotesAdded}`)
  console.log('========================================\n')
}

main().catch((err) => {
  console.error('Enrichment failed:', err)
  process.exit(1)
})
