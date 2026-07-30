import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  buildMapHrefFromDetailParams,
  buildMapReturnParams,
  buildRestroomDetailHref,
  isCanonicalRestroomId,
  parseMapAccessIntent,
  resolveCanonicalRestroomId,
  toCanonicalRestroomId,
} from './mapRestroomNavigation'
import { translations } from './translations'

assert.equal(isCanonicalRestroomId(42), true)
assert.equal(isCanonicalRestroomId('42'), true)
assert.equal(isCanonicalRestroomId('google_ChIJ123'), false)
assert.equal(isCanonicalRestroomId('public_ChIJ123'), false)
assert.equal(isCanonicalRestroomId('abc'), false)
assert.equal(isCanonicalRestroomId(null), false)
assert.equal(isCanonicalRestroomId(0), false)

assert.equal(toCanonicalRestroomId('99'), 99)
assert.equal(toCanonicalRestroomId('google_x'), null)
assert.equal(toCanonicalRestroomId('public_x'), null)

const params = buildMapReturnParams({
  lat: 33.7,
  lng: -117.8,
  q: 'starbucks',
  filter: 'pin',
  category: 'coffee',
})
assert.equal(params.get('from'), 'map')
assert.equal(params.get('lat'), '33.7')
assert.equal(params.get('lng'), '-117.8')
assert.equal(params.get('q'), 'starbucks')
assert.equal(params.get('filter'), 'pin')
assert.equal(params.get('category'), 'coffee')

const hrefView = buildRestroomDetailHref(123, {
  intent: 'view',
  discovery: { lat: 1, lng: 2, q: 'x', filter: 'all' },
})
assert.match(hrefView, /^\/restroom\/123\?/)
assert.equal(hrefView.includes('intent='), false)
assert.equal(hrefView.includes('from=map'), true)
assert.equal(hrefView.includes('filter='), false) // all omitted

const hrefShare = buildRestroomDetailHref(7, {
  intent: 'share',
  discovery: { lat: 1, lng: 2 },
})
assert.match(hrefShare, /intent=share/)

assert.equal(parseMapAccessIntent('share'), 'share')
assert.equal(parseMapAccessIntent('add'), 'share')
assert.equal(parseMapAccessIntent('update'), 'update')
assert.equal(parseMapAccessIntent('correct'), 'correct')
assert.equal(parseMapAccessIntent('view'), 'view')
assert.equal(parseMapAccessIntent(null), null)

const mapHref = buildMapHrefFromDetailParams({
  get: (key) =>
    ({ lat: '33.1', lng: '-117.2', q: 'cafe', filter: 'baby', category: 'coffee' })[key] ?? null,
})
assert.equal(mapHref, '/map?lat=33.1&lng=-117.2&q=cafe&filter=baby&category=coffee')

assert.equal(buildMapHrefFromDetailParams({ get: () => null }), '/map')

assert.equal(translations.en.openingRestroom, 'Opening…')
assert.equal(translations.es.openingRestroom, 'Abriendo…')
assert.equal(translations.en.openRestroomFailed, 'Could not open this restroom. Try again.')
assert.equal(translations.es.openRestroomFailed, 'No se pudo abrir este baño. Intenta de nuevo.')

const mapSource = readFileSync(join(process.cwd(), 'app/map/page.tsx'), 'utf8')
assert.match(mapSource, /openRestroomDetail/)
assert.match(mapSource, /buildRestroomDetailHref/)
assert.match(mapSource, /router\.push\(href\)/)
assert.match(mapSource, /handleEditOpen = \(r: any, e: React\.MouseEvent, mode: 'update' \| 'correct' \| 'share' = 'update'\) => \{\s*void openRestroomDetail/)
assert.match(mapSource, /const intent: MapAccessIntent = restroomHasAccessInfo\(r\) \? 'view' : 'share'/)
// Migrated actions must not reopen the legacy modal.
assert.equal(mapSource.includes('setShowEditForm(true)'), false)

const panelSource = readFileSync(join(process.cwd(), 'app/restroom/[id]/AccessPanel.tsx'), 'utf8')
assert.match(panelSource, /parseMapAccessIntent/)
assert.match(panelSource, /router\.back\(\)/)
assert.match(panelSource, /buildMapHrefFromDetailParams/)

async function main() {
  const resolvedDirect = await resolveCanonicalRestroomId(
    { id: 'google_ChIJabc', name: 'Cafe', lat: 1, lng: 2 },
    {
      findExisting: async () => 555,
      ensureRestroom: async () => {
        throw new Error('ensure should not run when findExisting hits')
      },
    },
  )
  assert.equal(resolvedDirect, 555)

  const resolvedEnsure = await resolveCanonicalRestroomId(
    { id: 'google_ChIJxyz', name: 'Shop', lat: 3, lng: 4 },
    {
      findExisting: async () => null,
      ensureRestroom: async (target) => {
        assert.equal(String(target.id).startsWith('google_'), true)
        return 777
      },
    },
  )
  assert.equal(resolvedEnsure, 777)

  const rejectedNonNumeric = await resolveCanonicalRestroomId(
    { id: 'public_ChIJnope', name: 'Park', lat: 5, lng: 6 },
    { findExisting: async () => null },
  )
  assert.equal(rejectedNonNumeric, null)

  console.log('mapRestroomNavigation.test.ts: ok')
}

void main()
