import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { translations } from './translations'

const en = translations.en.amenityThanks
const es = translations.es.amenityThanks

assert.equal(en.title, 'Thank You')
assert.equal(
  en.body,
  'Because of you, the next person will have a better experience.',
)
assert.equal(
  en.support,
  'Your contribution helps families, travelers, and people with accessibility needs.',
)
assert.equal(en.button, 'Thanks')
assert.equal(en.footer, 'Every contribution makes FlushPin better.')

assert.equal(es.title, 'Gracias')
assert.equal(
  es.body,
  'Gracias a ti, la próxima persona tendrá una mejor experiencia.',
)
assert.equal(
  es.support,
  'Tu contribución ayuda a familias, viajeros y personas con necesidades de accesibilidad.',
)
assert.equal(es.button, 'Gracias')
assert.equal(es.footer, 'Cada contribución mejora FlushPin.')

// Locale surface remains en/es only
assert.deepEqual(Object.keys(translations).sort(), ['en', 'es'])
assert.equal('tr' in translations, false)

const panelSource = readFileSync(join(process.cwd(), 'app/restroom/[id]/AccessPanel.tsx'), 'utf8')
assert.equal(panelSource.includes('Saved — other users will see this after refresh.'), false)
assert.equal(panelSource.includes('Availability report saved.'), false)
assert.match(panelSource, /ContributionThankYouModal/)
assert.match(panelSource, /setShowThanks\(true\)/)
assert.match(panelSource, /t\.amenityThanks/)

console.log('amenityThanks.test.ts: ok')
