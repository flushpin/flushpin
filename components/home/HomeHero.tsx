'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import {
  ArrowRight,
  Lock,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react'
import AddFlushPinToPhone from './AddFlushPinToPhone'
import CategoryShortcuts from './CategoryShortcuts'
import LocationSearch from './LocationSearch'
import NearbySearchButton from './NearbySearchButton'
import SearchStatus from './SearchStatus'
import { buildMapSearchUrl, requestUserLocation } from '../../lib/homeNavigate'
import type { MapCategorySlug } from '../../lib/mapCategories'

type SearchUiStatus = 'idle' | 'loading' | 'error'

function openAuth(mode: 'signin' | 'signup') {
  window.dispatchEvent(new CustomEvent('flushpin:open-auth', { detail: { mode } }))
}

export default function HomeHero() {
  const router = useRouter()
  const [addressQuery, setAddressQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<MapCategorySlug | null>(null)
  const [status, setStatus] = useState<SearchUiStatus>('idle')
  const [statusMessage, setStatusMessage] = useState<string | undefined>()
  const busy = status === 'loading'

  const goToMap = useCallback(
    (opts: {
      lat?: number
      lng?: number
      near?: string
      q?: string
      category?: MapCategorySlug | null
    }) => {
      router.push(
        buildMapSearchUrl({
          lat: opts.lat,
          lng: opts.lng,
          near: opts.near,
          q: opts.q,
          category: opts.category ?? activeCategory,
        }),
      )
    },
    [router, activeCategory],
  )

  const handleGeoSearch = useCallback(
    async (categoryOverride?: MapCategorySlug | null) => {
      if (busy) return
      setStatus('loading')
      setStatusMessage('Finding restrooms near you…')

      const geo = await requestUserLocation()
      if (!geo.ok) {
        setStatus('error')
        if (geo.reason === 'unsupported' || geo.reason === 'denied') {
          setStatusMessage('Location access is off. Enable it or search by address.')
        } else {
          setStatusMessage('Could not get your location. Search by address instead.')
        }
        return
      }

      goToMap({
        lat: geo.lat,
        lng: geo.lng,
        near: 'Your location',
        category: categoryOverride !== undefined ? categoryOverride : activeCategory,
      })
    },
    [activeCategory, busy, goToMap],
  )

  const handleAddressSearch = useCallback(() => {
    if (busy) return
    const q = addressQuery.trim()
    if (!q) {
      setStatus('error')
      setStatusMessage('Enter an address, neighborhood, or place to search.')
      return
    }
    setStatus('idle')
    setStatusMessage(undefined)
    goToMap({ q, category: activeCategory })
  }, [addressQuery, activeCategory, busy, goToMap])

  const handleCategorySelect = useCallback(
    async (slug: MapCategorySlug | null) => {
      setActiveCategory(slug)
      if (busy) return
      setStatus('loading')
      setStatusMessage('Finding restrooms near you…')

      const geo = await requestUserLocation()
      if (geo.ok) {
        goToMap({
          lat: geo.lat,
          lng: geo.lng,
          near: 'Your location',
          category: slug,
        })
        return
      }

      setStatus('error')
      setStatusMessage('Location access is off. Enable it or search by address.')
    },
    [busy, goToMap],
  )

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7faf9_42%,#eef7f3_100%)] px-4 pb-16 pt-10 text-fp-ink md:px-6 md:pb-24 md:pt-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,168,134,0.14)_0%,transparent_58%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-fp-teal/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-[rgba(15,110,86,0.06)] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-2xl">
        {/* Hero — headline, support, CTA, privacy, then search */}
        <div className="flex flex-col items-center px-1 pt-4 text-center animate-[fpFadeUp_0.7s_ease-out_both] md:pt-8">
          <h1 className="max-w-[16ch] text-[clamp(2.35rem,7vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.045em] text-fp-ink md:max-w-[18ch]">
            Find a restroom. Know before you go.
          </h1>
          <p className="mt-5 max-w-[34ch] text-[1.0625rem] leading-relaxed text-fp-gray-600 md:max-w-[40ch] md:text-lg md:leading-relaxed">
            See nearby restrooms, access details, door codes, and what to expect before you arrive.
          </p>
        </div>

        <div className="mx-auto mt-9 max-w-lg animate-[fpFadeUp_0.75s_ease-out_0.08s_both] md:mt-11">
          <NearbySearchButton loading={busy} disabled={busy} onClick={() => void handleGeoSearch()} />

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-fp-border" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fp-gray-400">or</span>
            <div className="h-px flex-1 bg-fp-border" aria-hidden="true" />
          </div>

          <LocationSearch
            value={addressQuery}
            onChange={setAddressQuery}
            onSubmit={handleAddressSearch}
            disabled={busy}
          />
          <SearchStatus status={status} message={statusMessage} />
        </div>

        <div className="mt-12 animate-[fpFadeUp_0.8s_ease-out_0.14s_both]">
          <CategoryShortcuts
            activeCategory={activeCategory}
            disabled={busy}
            onSelect={handleCategorySelect}
          />
        </div>

        <AddFlushPinToPhone />

        <div className="mt-10 rounded-[1.35rem] border border-fp-border/80 bg-white/80 p-5 shadow-[0_8px_30px_rgba(27,27,33,0.04)] backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-fp-teal-tint text-fp-teal-dark">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="text-left">
              <p className="text-[15px] font-semibold tracking-tight text-fp-ink">Private &amp; community driven</p>
              <p className="mt-1 text-sm leading-relaxed text-fp-gray-600">
                Real restroom info from real people. No awkward moments.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="mx-auto flex max-w-md items-start justify-center gap-2.5 text-fp-gray-600">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-fp-teal-dark" aria-hidden="true" />
            <p className="text-sm leading-relaxed">
              Join thousands of people helping each other find restrooms wherever they go.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openAuth('signup')}
            className="mt-6 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-fp-teal px-6 py-3.5 text-[17px] font-semibold text-white shadow-[0_12px_32px_rgba(0,168,134,0.28)] transition-all hover:bg-fp-teal-dark active:scale-[0.99]"
          >
            Sign Up Free
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <p className="mt-4 text-sm text-fp-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => openAuth('signin')}
              className="font-semibold text-fp-teal-dark hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>

        <div className="mt-16 grid gap-8 border-t border-fp-border pt-12 sm:grid-cols-3 sm:gap-6">
          <div className="text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-fp-teal-tint text-fp-teal-dark">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-fp-ink">Verified places</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-fp-gray-600">Trusted info you can rely on.</p>
          </div>
          <div className="text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-fp-teal-tint text-fp-teal-dark">
              <RefreshCw className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-fp-ink">Always updated</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-fp-gray-600">Community keeps it fresh.</p>
          </div>
          <div className="text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-fp-teal-tint text-fp-teal-dark">
              <Lock className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-fp-ink">Private by design</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-fp-gray-600">Your privacy comes first.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
