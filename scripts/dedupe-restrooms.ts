/**
 * Remove duplicate restroom rows (same normalized name + address).
 * Keeps the richest record; merges ratings/promotions; deletes the rest.
 *
 * Usage (dry-run is DEFAULT):
 *   npm run dedupe:restrooms
 *   npm run dedupe:restrooms -- --limit 20
 *   npm run dedupe:restrooms -- --name Starbucks
 *   npm run dedupe:restrooms -- --apply
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

type RestroomRow = Record<string, unknown> & {
  id: number | string
  name?: string | null
  address?: string | null
  pin?: string | null
  score?: number | null
  stars?: number | null
  status?: string | null
  verified?: string | null
  verified_note?: string | null
  external_id?: string | null
  access_type?: string | null
  created_at?: string | null
  pin_updated_at?: string | null
}

const PLACEHOLDER_PINS = new Set([
  'empty', 'no code', 'none', 'open', 'n/a', 'na', 'no pin', 'nocode', '',
])

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

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '').trim()
}

function normalizeAddress(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function groupKey(row: RestroomRow): string | null {
  const name = row.name?.trim()
  const address = row.address?.trim()
  if (!name || !address) return null
  return `${normalizeName(name)}|${normalizeAddress(address)}`
}

function hasRealPin(pin: unknown): boolean {
  if (pin == null) return false
  const s = String(pin).trim().toLowerCase()
  return s.length > 0 && !PLACEHOLDER_PINS.has(s)
}

function rowQuality(row: RestroomRow): number {
  let score = 0
  if (hasRealPin(row.pin)) score += 100
  if (typeof row.score === 'number' && row.score > 0) score += 50
  if (typeof row.stars === 'number' && row.stars > 0) score += 20
  if (row.status === 'green') score += 15
  if (row.verified_note && String(row.verified_note).trim()) score += 10
  if (row.verified && String(row.verified).trim()) score += 8
  if (row.external_id && String(row.external_id).trim()) score += 5
  if (row.access_type && String(row.access_type).trim() && row.access_type !== 'unknown') score += 5
  return score
}

function pickKeeper(rows: RestroomRow[]): RestroomRow {
  return [...rows].sort((a, b) => {
    const diff = rowQuality(b) - rowQuality(a)
    if (diff !== 0) return diff
    const aId = Number(a.id)
    const bId = Number(b.id)
    if (Number.isFinite(aId) && Number.isFinite(bId)) return aId - bId
    return String(a.id).localeCompare(String(b.id))
  })[0]
}

function mergeIntoKeeper(keeper: RestroomRow, duplicate: RestroomRow): Record<string, unknown> | null {
  const patch: Record<string, unknown> = {}

  if (!hasRealPin(keeper.pin) && hasRealPin(duplicate.pin)) {
    patch.pin = duplicate.pin
    if (duplicate.pin_updated_at) patch.pin_updated_at = duplicate.pin_updated_at
  }

  const keeperScore = typeof keeper.score === 'number' ? keeper.score : 0
  const dupScore = typeof duplicate.score === 'number' ? duplicate.score : 0
  if (dupScore > keeperScore) {
    patch.score = duplicate.score
    if (duplicate.stars != null) patch.stars = duplicate.stars
    if (duplicate.status) patch.status = duplicate.status
  }

  if (!keeper.verified_note && duplicate.verified_note) patch.verified_note = duplicate.verified_note
  if (!keeper.verified && duplicate.verified) patch.verified = duplicate.verified
  if (!keeper.external_id && duplicate.external_id) patch.external_id = duplicate.external_id
  if ((!keeper.access_type || keeper.access_type === 'unknown') && duplicate.access_type && duplicate.access_type !== 'unknown') {
    patch.access_type = duplicate.access_type
  }

  return Object.keys(patch).length ? patch : null
}

async function* fetchAllRestrooms(supabase: SupabaseClient) {
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

async function reassignRatings(
  supabase: SupabaseClient,
  keeperId: number | string,
  duplicateIds: Array<number | string>,
  dryRun: boolean,
): Promise<{ moved: number; dropped: number }> {
  let moved = 0
  let dropped = 0

  const { data: keeperRatings, error: keeperErr } = await supabase
    .from('rating')
    .select('user_id')
    .eq('restroom_id', keeperId)
  if (keeperErr) throw new Error(`rating lookup failed: ${keeperErr.message}`)

  const keeperUsers = new Set((keeperRatings ?? []).map((r) => r.user_id))

  for (const dupId of duplicateIds) {
    const { data: dupRatings, error } = await supabase
      .from('rating')
      .select('id, user_id')
      .eq('restroom_id', dupId)
    if (error) throw new Error(`rating fetch failed: ${error.message}`)

    for (const rating of dupRatings ?? []) {
      if (keeperUsers.has(rating.user_id)) {
        if (!dryRun) {
          const { error: delErr } = await supabase.from('rating').delete().eq('id', rating.id)
          if (delErr) throw new Error(`rating delete failed: ${delErr.message}`)
        }
        dropped++
      } else {
        if (!dryRun) {
          const { error: updErr } = await supabase
            .from('rating')
            .update({ restroom_id: keeperId })
            .eq('id', rating.id)
          if (updErr) throw new Error(`rating reassign failed: ${updErr.message}`)
        }
        keeperUsers.add(rating.user_id)
        moved++
      }
    }
  }

  return { moved, dropped }
}

async function reassignPromotions(
  supabase: SupabaseClient,
  keeperId: number | string,
  duplicateIds: Array<number | string>,
  dryRun: boolean,
): Promise<number> {
  let moved = 0
  for (const dupId of duplicateIds) {
    const { data, error } = await supabase
      .from('promotion')
      .select('id')
      .eq('restroom_id', dupId)
    if (error) {
      if (error.code === '42P01') return moved
      throw new Error(`promotion fetch failed: ${error.message}`)
    }
    for (const promo of data ?? []) {
      if (!dryRun) {
        const { error: updErr } = await supabase
          .from('promotion')
          .update({ restroom_id: keeperId })
          .eq('id', promo.id)
        if (updErr) throw new Error(`promotion reassign failed: ${updErr.message}`)
      }
      moved++
    }
  }
  return moved
}

function parseArgs(argv: string[]) {
  const apply = argv.includes('--apply')
  const dryRun = !apply
  const nameIdx = argv.indexOf('--name')
  const nameFilter = nameIdx >= 0 ? argv[nameIdx + 1] : undefined
  const limitIdx = argv.indexOf('--limit')
  const limit = limitIdx >= 0 ? Number(argv[limitIdx + 1]) : undefined
  return { dryRun, apply, nameFilter, limit: Number.isFinite(limit) ? limit : undefined }
}

async function main() {
  const { dryRun, apply, nameFilter, limit } = parseArgs(process.argv.slice(2))
  const env = requireEnv(dryRun)
  if (apply) assertServiceRoleKey()

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  console.log('FlushPin restroom dedupe (name + address)')
  console.log(`Mode: ${dryRun ? 'DRY RUN (default — pass --apply to delete duplicates)' : 'LIVE DELETE'}`)
  if (nameFilter) console.log(`Name filter: ${nameFilter}`)
  if (limit) console.log(`Group limit: ${limit}`)

  const groups = new Map<string, RestroomRow[]>()
  let totalRows = 0

  for await (const batch of fetchAllRestrooms(supabase)) {
    for (const row of batch) {
      totalRows++
      if (nameFilter && !row.name?.toLowerCase().includes(nameFilter.toLowerCase())) continue
      const key = groupKey(row)
      if (!key) continue
      const list = groups.get(key) ?? []
      list.push(row)
      groups.set(key, list)
    }
  }

  const duplicateGroups = [...groups.entries()]
    .filter(([, rows]) => rows.length > 1)
    .sort((a, b) => b[1].length - a[1].length)

  const groupsToProcess = limit ? duplicateGroups.slice(0, limit) : duplicateGroups

  let deleteCount = 0
  let mergePatches = 0
  let ratingsMoved = 0
  let ratingsDropped = 0
  let promosMoved = 0

  console.log('\nTop duplicate groups:')
  for (const [, rows] of groupsToProcess.slice(0, 15)) {
    const keeper = pickKeeper(rows)
    console.log(`  x${rows.length}  keep id=${keeper.id}  "${keeper.name}"  ${keeper.address}`)
  }
  if (duplicateGroups.length > 15) {
    console.log(`  ... and ${duplicateGroups.length - 15} more groups`)
  }

  for (const [, rows] of groupsToProcess) {
    const keeper = pickKeeper(rows)
    const duplicates = rows.filter((r) => r.id !== keeper.id)
    const duplicateIds = duplicates.map((r) => r.id)

    for (const dup of duplicates) {
      const patch = mergeIntoKeeper(keeper, dup)
      if (patch) {
        mergePatches++
        if (!dryRun) {
          const { error } = await supabase.from('restroom').update(patch).eq('id', keeper.id)
          if (error) throw new Error(`keeper merge failed id=${keeper.id}: ${error.message}`)
          Object.assign(keeper, patch)
        }
      }
    }

    const ratingStats = await reassignRatings(supabase, keeper.id, duplicateIds, dryRun)
    ratingsMoved += ratingStats.moved
    ratingsDropped += ratingStats.dropped
    promosMoved += await reassignPromotions(supabase, keeper.id, duplicateIds, dryRun)

    deleteCount += duplicateIds.length

    if (!dryRun && duplicateIds.length) {
      for (let i = 0; i < duplicateIds.length; i += 100) {
        const chunk = duplicateIds.slice(i, i + 100)
        const { error } = await supabase.from('restroom').delete().in('id', chunk)
        if (error) throw new Error(`delete failed: ${error.message}`)
      }
    }
  }

  const extraRows = duplicateGroups.reduce((sum, [, rows]) => sum + rows.length - 1, 0)

  console.log('\n========== Dedupe summary ==========')
  if (dryRun) console.log('DRY RUN — no rows deleted.')
  console.log(`Rows scanned:           ${totalRows}`)
  console.log(`Duplicate groups:       ${duplicateGroups.length}`)
  console.log(`Groups processed:       ${groupsToProcess.length}`)
  console.log(`Rows ${dryRun ? 'would delete' : 'deleted'}:     ${deleteCount}`)
  console.log(`Extra duplicate rows:   ${extraRows} (across all groups)`)
  console.log(`Keeper merges:          ${mergePatches}`)
  console.log(`Ratings reassigned:     ${ratingsMoved}`)
  console.log(`Ratings dropped (dup):  ${ratingsDropped}`)
  console.log(`Promotions reassigned:  ${promosMoved}`)
  console.log('====================================\n')

  if (dryRun && duplicateGroups.length > 0) {
    console.log('Re-run with --apply to delete duplicates after review.')
    console.log('Example: npm run dedupe:restrooms -- --name Starbucks --apply')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
