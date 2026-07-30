'use client'

import Image from 'next/image'
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
import BusinessStickerSection from './BusinessStickerSection'
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
      goToMap({ category: slug })
    },
    [busy, goToMap],
  )

  return (
    <section className="relative overflow-hidden bg-[#0a0f0e] px-4 pb-14 pt-8 text-white md:px-6 md:pb-20 md:pt-12">
      <div
        className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-fp-teal/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-fp-teal/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/flushpin-logo-new.png"
            alt=""
            width={80}
            height={80}
            priority
            className="h-20 w-20 rounded-[22px] shadow-[0_12px_40px_rgba(0,168,134,0.25)]"
          />
          <p className="mt-4 text-2xl font-extrabold tracking-tight lowercase text-white md:text-3xl">
            flushpin
          </p>

          <h1 className="mt-8 text-[clamp(1.75rem,5.5vw,2.5rem)] font-extrabold leading-tight tracking-tight text-white">
            Find a restroom near you.
          </h1>
          <p className="mt-3 text-lg font-medium text-fp-teal">Fast. Easy. Private.</p>
        </div>

        <div className="mt-8">
          <NearbySearchButton loading={busy} disabled={busy} onClick={() => void handleGeoSearch()} />

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-wider text-white/40">or</span>
            <div className="h-px flex-1 bg-white/10" aria-hidden="true" />
          </div>

          <LocationSearch
            value={addressQuery}
            onChange={setAddressQuery}
            onSubmit={handleAddressSearch}
            disabled={busy}
            onUseLocation={() => void handleGeoSearch()}
          />
          <SearchStatus status={status} message={statusMessage} />
        </div>

        <CategoryShortcuts
          activeCategory={activeCategory}
          disabled={busy}
          onSelect={handleCategorySelect}
        />

        <AddFlushPinToPhone />

        <BusinessStickerSection />

        <div className="mt-8 rounded-2xl border border-fp-teal/30 bg-[#121816] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-fp-teal" aria-hidden="true" />
            <div className="text-left">
              <p className="font-semibold text-fp-teal">Private &amp; Community Driven</p>
              <p className="mt-1 text-sm leading-relaxed text-white/60">
                Real restroom info from real people. No awkward moments.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="mx-auto flex max-w-sm items-center justify-center gap-2 text-white/70">
            <Users className="h-5 w-5 shrink-0 text-fp-teal" aria-hidden="true" />
            <p className="text-sm leading-relaxed">
              Join thousands of people helping each other find restrooms wherever they go.
            </p>
          </div>

          <button
            type="button"
            onClick={() => openAuth('signup')}
            className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-fp-teal px-6 py-3.5 text-base font-bold text-white shadow-[0_10px_30px_rgba(0,168,134,0.35)] transition-all hover:bg-fp-teal-dark active:scale-[0.99]"
          >
            Sign Up Free
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <p className="mt-4 text-sm text-white/50">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => openAuth('signin')}
              className="font-semibold text-fp-teal hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>

        <div className="mt-12 grid gap-6 border-t border-white/10 pt-10 sm:grid-cols-3">
          <div className="text-center">
            <ShieldCheck className="mx-auto h-6 w-6 text-fp-teal" aria-hidden="true" />
            <h3 className="mt-2 text-sm font-semibold text-white">Verified Places</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/50">Trusted info you can rely on.</p>
          </div>
          <div className="text-center">
            <RefreshCw className="mx-auto h-6 w-6 text-fp-teal" aria-hidden="true" />
            <h3 className="mt-2 text-sm font-semibold text-white">Always Updated</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/50">Community keeps it fresh.</p>
          </div>
          <div className="text-center">
            <Lock className="mx-auto h-6 w-6 text-fp-teal" aria-hidden="true" />
            <h3 className="mt-2 text-sm font-semibold text-white">Private by Design</h3>
            <p className="mt-1 text-xs leading-relaxed text-white/50">Your privacy comes first.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
