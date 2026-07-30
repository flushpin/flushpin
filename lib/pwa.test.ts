import assert from 'node:assert/strict'
import {
  A2HS_DISMISSED_KEY,
  canOfferPwaInstall,
  markInstallDismissed,
  wasInstallDismissed,
} from './pwa'

const store: Record<string, string> = {}
;(globalThis as typeof globalThis & { sessionStorage: Storage }).sessionStorage = {
  getItem: (key) => store[key] ?? null,
  setItem: (key, value) => {
    store[key] = value
  },
  removeItem: (key) => {
    delete store[key]
  },
  clear: () => {
    for (const key of Object.keys(store)) delete store[key]
  },
  key: () => null,
  length: 0,
}

assert.equal(wasInstallDismissed(), false)
markInstallDismissed()
assert.equal(wasInstallDismissed(), true)
sessionStorage.removeItem(A2HS_DISMISSED_KEY)

assert.equal(canOfferPwaInstall(false), false)
assert.equal(canOfferPwaInstall(true), true)

console.log('lib/pwa.test.ts passed')
