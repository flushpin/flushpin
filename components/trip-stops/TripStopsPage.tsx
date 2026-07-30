'use client'

import {
  ArrowDownUp,
  BatteryCharging,
  Car,
  Check,
  ChevronRight,
  Coffee,
  ExternalLink,
  Fuel,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  ShoppingBag,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { requestUserLocation } from '../../lib/homeNavigate'
import {
  parseTripStopsUrl,
  restroomConfidenceLabel,
  type TripStop,
  type TripStopCategory,
  type TripStopsMode,
  type TripStopsResponse,
} from '../../lib/tripStops'
import TripStopsMap from './TripStopsMap'

const FILTERS: Array<{
  id: TripStopCategory
  label: string
  icon: typeof MapPin
}> = [
  { id: 'restrooms', label: 'Restrooms', icon: MapPin },
  { id: 'ev', label: 'EV Charging', icon: BatteryCharging },
  { id: 'gas', label: 'Gas', icon: Fuel },
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  { id: 'fast-food', label: 'Fast Food', icon: UtensilsCrossed },
  { id: 'stores', label: 'Stores', icon: ShoppingBag },
]

const DESTINATION_EXAMPLES = [
  'Disneyland Anaheim',
  'LEGOLAND California',
  'Irvine Spectrum',
  'Santa Monica Pier',
]

const LOADING_STEPS = [
  'Finding your route…',
  'Searching for restroom-friendly stops…',
  'Checking charging and nearby services…',
  'Ranking the best stops…',
]

function miles(meters: number): string {
  const value = meters / 1609.344
  return value < 0.1 ? 'Under 0.1 mi' : `${value.toFixed(value < 10 ? 1 : 0)} mi`
}

function minutesOffRoute(meters: number): string {
  return `${Math.max(1, Math.round((meters / 1609.344 / 25) * 60))} min off route`
}

function openMaps(stop: TripStop) {
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${stop.lat},${stop.lng}&query_place_id=${encodeURIComponent(stop.placeId ?? '')}`,
    '_blank',
    'noopener,noreferrer',
  )
}

function serviceLabel(category: TripStopCategory): string {
  return {
    restrooms: 'Restroom',
    ev: 'EV charging',
    gas: 'Gas',
    coffee: 'Coffee',
    restaurants: 'Food',
    'fast-food': 'Fast food',
    stores: 'Store',
  }[category]
}

function StopCard({
  stop,
  index,
  selected,
  mode,
  result,
  onSelect,
}: {
  stop: TripStop
  index: number
  selected: boolean
  mode: TripStopsMode
  result: TripStopsResponse
  onSelect: () => void
}) {
  const distanceText =
    mode === 'route'
      ? `${miles(stop.distanceAlongRouteMeters ?? 0)} ahead`
      : `${miles(stop.destinationDistanceMeters ?? 0)} from destination`

  const addToRoute = () => {
    if (!result.route) return
    const origin = `${result.route.origin.lat},${result.route.origin.lng}`
    const destination = `${result.route.destination.lat},${result.route.destination.lng}`
    const waypoint = `${stop.lat},${stop.lng}`
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoint)}&travelmode=driving`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  return (
    <article
      id={`trip-stop-${stop.id}`}
      className={`rounded-2xl border bg-white p-4 text-[#13201d] shadow-sm transition ${
        selected ? 'border-fp-teal ring-2 ring-fp-teal/20' : 'border-[#dce5e2]'
      }`}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fp-teal text-sm font-extrabold text-white">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold leading-snug">{stop.name}</h3>
                {stop.address && <p className="mt-1 text-xs leading-relaxed text-[#62716d]">{stop.address}</p>}
              </div>
              <div className="shrink-0 rounded-xl bg-[#e8f8f4] px-2.5 py-2 text-center">
                <div className="text-lg font-extrabold leading-none text-fp-teal">{stop.score}</div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-wide text-[#3b6258]">Stop Score</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-[#edf3f1] px-2.5 py-1">{distanceText}</span>
              {mode === 'route' && (
                <span className="rounded-full bg-[#edf3f1] px-2.5 py-1">
                  {minutesOffRoute(stop.routeDistanceMeters ?? 0)}
                </span>
              )}
              <span
                className={`rounded-full px-2.5 py-1 ${
                  stop.restroomConfidence === 'flushpin_verified'
                    ? 'bg-[#dff7ef] text-[#08785f]'
                    : 'bg-[#fff5db] text-[#8a5b00]'
                }`}
              >
                {restroomConfidenceLabel(stop.restroomConfidence)}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {stop.services.map((service) => (
                <span
                  key={service}
                  className="rounded-lg border border-[#dce5e2] bg-[#f8faf9] px-2 py-1 text-[11px] font-medium text-[#43534f]"
                >
                  {serviceLabel(service)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </button>

      {selected && (
        <div className="mt-4 border-t border-[#e6ecea] pt-4">
          <p className="text-xs leading-relaxed text-[#62716d]">{stop.scoreExplanation}</p>
          {stop.ev && (
            <div className="mt-3 rounded-xl bg-[#edf9f5] p-3 text-xs text-[#31564c]">
              <strong>{stop.ev.network || 'EV charging'}</strong>
              <span className="mt-1 block">Static charger data · Live charger availability unavailable</span>
            </div>
          )}
          {stop.clusterMembers.length > 0 && (
            <div className="mt-3 text-xs text-[#53635f]">
              <strong>At this stop:</strong>{' '}
              {stop.clusterMembers.map((member) => member.name).join(', ')}
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex">
            {stop.restroomId ? (
              <Link
                href={`/restroom/${stop.restroomId}`}
                className="flex min-h-11 items-center justify-center rounded-xl bg-fp-teal px-3 text-sm font-bold text-white no-underline"
              >
                View Stop
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openMaps(stop)}
                className="min-h-11 rounded-xl bg-fp-teal px-3 text-sm font-bold text-white"
              >
                View Stop
              </button>
            )}
            {mode === 'route' && (
              <button
                type="button"
                onClick={addToRoute}
                className="min-h-11 rounded-xl border border-fp-teal px-3 text-sm font-bold text-fp-teal"
              >
                Add to Route
              </button>
            )}
            <button
              type="button"
              onClick={() => openMaps(stop)}
              className="col-span-2 flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#cdd9d5] px-3 text-sm font-bold text-[#29463e]"
            >
              Open in Maps <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

export default function TripStopsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initial = useMemo(() => parseTripStopsUrl(new URLSearchParams(searchParams.toString())), [searchParams])
  const [mode, setMode] = useState<TripStopsMode>(initial.mode)
  const [origin, setOrigin] = useState(initial.from)
  const [destination, setDestination] = useState(initial.mode === 'destination' ? initial.query : initial.to)
  const [radiusMiles, setRadiusMiles] = useState(initial.radiusMiles)
  const [categories, setCategories] = useState<TripStopCategory[]>([
    'restrooms',
    'ev',
    'gas',
    'coffee',
    'restaurants',
    'fast-food',
    'stores',
  ])
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<TripStopsResponse | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!loading) return
    const timer = window.setInterval(() => setLoadingStep((step) => Math.min(step + 1, LOADING_STEPS.length - 1)), 1800)
    return () => window.clearInterval(timer)
  }, [loading])

  useEffect(() => () => abortRef.current?.abort(), [])

  const changeMode = (nextMode: TripStopsMode) => {
    setMode(nextMode)
    setError('')
    setResult(null)
    setSelectedId(null)
    const params = new URLSearchParams()
    params.set('mode', nextMode)
    router.replace(`/trip-stops?${params}`)
  }

  const toggleCategory = (category: TripStopCategory) => {
    if (category === 'restrooms') return
    setCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    )
  }

  const handleUseMyLocation = async () => {
    setLocating(true)
    setError('')
    const location = await requestUserLocation()
    if (!location.ok) {
      setLocating(false)
      setError(
        location.reason === 'denied'
          ? 'Location access is off. Enable it or enter your starting point.'
          : 'We could not get your location. Enter your starting point instead.',
      )
      return
    }
    try {
      const response = await fetch(`/api/geocode?lat=${location.lat}&lng=${location.lng}`, { cache: 'no-store' })
      const payload = await response.json()
      setOrigin(payload.label || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`)
    } catch {
      setOrigin(`${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`)
    } finally {
      setLocating(false)
    }
  }

  const submit = useCallback(async () => {
    const from = origin.trim()
    const to = destination.trim()
    if (mode === 'route' && !from) {
      setError('Enter a starting point.')
      return
    }
    if (!to) {
      setError(mode === 'route' ? 'Enter a destination.' : 'Enter a destination or area.')
      return
    }
    if (mode === 'route' && from.toLowerCase() === to.toLowerCase()) {
      setError('Starting point and destination must be different.')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setLoadingStep(0)
    setError('')
    setResult(null)
    setSelectedId(null)

    const params = new URLSearchParams()
    params.set('mode', mode)
    if (mode === 'route') {
      params.set('from', from)
      params.set('to', to)
    } else {
      params.set('q', to)
      params.set('radius', String(radiusMiles))
    }
    router.replace(`/trip-stops?${params}`)

    try {
      const response = await fetch('/api/trip-stops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          origin: mode === 'route' ? from : undefined,
          destination: to,
          radiusMiles,
          categories,
        }),
        signal: controller.signal,
        cache: 'no-store',
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || 'Unable to search for Trip Stops.')
      const next = payload as TripStopsResponse
      setResult(next)
      setSelectedId(next.stops[0]?.id ?? null)
      setMobileView('list')
      if (next.stops.length === 0) {
        setError('No approved restroom-friendly stops were found. Try a larger area or different filters.')
      }
    } catch (requestError) {
      if (controller.signal.aborted) return
      setError(requestError instanceof Error ? requestError.message : 'Unable to search for Trip Stops.')
    } finally {
      if (abortRef.current === controller) setLoading(false)
    }
  }, [origin, destination, mode, radiusMiles, categories, router])

  const selectStop = (id: string) => {
    setSelectedId(id)
    document.getElementById(`trip-stop-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <main className="min-h-screen bg-[#09110f] text-white">
      <section className="border-b border-white/10 px-4 pb-10 pt-8 md:px-6 md:pb-14">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-fp-teal">FlushPin Trip Stops</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Find restroom-friendly stops along your route or near your destination.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
              Plan useful stops for restrooms, EV charging, gas, coffee, and food without filling your map with unrelated businesses.
            </p>
          </div>

          <div className="mt-7 inline-grid w-full grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1 sm:max-w-md">
            <button
              type="button"
              onClick={() => changeMode('route')}
              aria-pressed={mode === 'route'}
              className={`min-h-11 rounded-xl px-3 text-sm font-bold ${
                mode === 'route' ? 'bg-fp-teal text-white' : 'text-white/65'
              }`}
            >
              Along My Route
            </button>
            <button
              type="button"
              onClick={() => changeMode('destination')}
              aria-pressed={mode === 'destination'}
              className={`min-h-11 rounded-xl px-3 text-sm font-bold ${
                mode === 'destination' ? 'bg-fp-teal text-white' : 'text-white/65'
              }`}
            >
              Near a Destination
            </button>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[#111a17] p-4 shadow-2xl sm:p-6">
            {mode === 'route' ? (
              <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end">
                <div>
                  <label htmlFor="trip-origin" className="mb-2 block text-sm font-bold">
                    Starting point
                  </label>
                  <div className="flex min-h-12 items-center rounded-xl border border-white/15 bg-black/20 px-3 focus-within:border-fp-teal">
                    <LocateFixed className="h-5 w-5 shrink-0 text-fp-teal" aria-hidden="true" />
                    <input
                      id="trip-origin"
                      value={origin}
                      onChange={(event) => setOrigin(event.target.value)}
                      placeholder="Irvine, CA"
                      className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-white outline-none placeholder:text-white/35"
                      maxLength={160}
                    />
                    {origin && (
                      <button type="button" onClick={() => setOrigin('')} className="min-h-11 min-w-11 text-white/55" aria-label="Clear starting point">
                        <X className="mx-auto h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleUseMyLocation()}
                    disabled={locating}
                    className="mt-2 flex min-h-11 items-center gap-2 text-sm font-bold text-fp-teal disabled:opacity-60"
                  >
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                    {locating ? 'Finding your location…' : 'Use My Location'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOrigin(destination)
                    setDestination(origin)
                  }}
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-fp-teal hover:text-fp-teal"
                  aria-label="Swap starting point and destination"
                >
                  <ArrowDownUp className="h-5 w-5 md:rotate-90" />
                </button>

                <div>
                  <label htmlFor="trip-destination" className="mb-2 block text-sm font-bold">
                    Destination
                  </label>
                  <div className="flex min-h-12 items-center rounded-xl border border-white/15 bg-black/20 px-3 focus-within:border-fp-teal">
                    <MapPin className="h-5 w-5 shrink-0 text-fp-teal" aria-hidden="true" />
                    <input
                      id="trip-destination"
                      value={destination}
                      onChange={(event) => setDestination(event.target.value)}
                      placeholder="San Francisco, CA"
                      className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-white outline-none placeholder:text-white/35"
                      maxLength={160}
                    />
                    {destination && (
                      <button type="button" onClick={() => setDestination('')} className="min-h-11 min-w-11 text-white/55" aria-label="Clear destination">
                        <X className="mx-auto h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="area-destination" className="mb-2 block text-sm font-bold">
                  Destination or area
                </label>
                <div className="flex min-h-12 items-center rounded-xl border border-white/15 bg-black/20 px-3 focus-within:border-fp-teal">
                  <Search className="h-5 w-5 shrink-0 text-fp-teal" aria-hidden="true" />
                  <input
                    id="area-destination"
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder="Disneyland Anaheim"
                    className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-white outline-none placeholder:text-white/35"
                    maxLength={160}
                  />
                  {destination && (
                    <button type="button" onClick={() => setDestination('')} className="min-h-11 min-w-11 text-white/55" aria-label="Clear destination">
                      <X className="mx-auto h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DESTINATION_EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setDestination(example)}
                      className="min-h-9 rounded-full border border-white/12 bg-white/5 px-3 text-xs font-semibold text-white/70 hover:border-fp-teal"
                    >
                      {example}
                    </button>
                  ))}
                </div>
                <fieldset className="mt-5">
                  <legend className="mb-2 text-sm font-bold">Search radius</legend>
                  <div className="flex flex-wrap gap-2">
                    {[0.5, 1, 2, 5].map((radius) => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => setRadiusMiles(radius as 0.5 | 1 | 2 | 5)}
                        className={`min-h-11 rounded-xl border px-4 text-sm font-bold ${
                          radiusMiles === radius
                            ? 'border-fp-teal bg-fp-teal text-white'
                            : 'border-white/12 text-white/65'
                        }`}
                      >
                        {radius} {radius === 1 ? 'mile' : 'miles'}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            <fieldset className="mt-6">
              <legend className="text-sm font-bold">Useful stops</legend>
              <p className="mt-1 text-xs text-white/50">Restrooms always remain part of your search.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {FILTERS.map(({ id, label, icon: Icon }) => {
                  const active = categories.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleCategory(id)}
                      aria-pressed={active}
                      aria-disabled={id === 'restrooms'}
                      className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${
                        active
                          ? 'border-fp-teal/70 bg-fp-teal/15 text-white'
                          : 'border-white/10 text-white/45'
                      }`}
                    >
                      {active ? <Check className="h-4 w-4 text-fp-teal" /> : <Icon className="h-4 w-4" />}
                      {label}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="mt-5 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void submit()}
              disabled={loading}
              className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-fp-teal px-5 text-base font-extrabold text-white shadow-[0_12px_30px_rgba(0,168,134,0.25)] hover:bg-fp-teal-dark disabled:cursor-wait disabled:opacity-65 sm:max-w-sm"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Car className="h-5 w-5" />}
              {loading
                ? LOADING_STEPS[loadingStep]
                : mode === 'route'
                  ? 'Find Trip Stops'
                  : 'Explore Nearby Stops'}
            </button>
          </div>
        </div>
      </section>

      {result && (
        <section className="bg-[#eff5f2] px-4 py-8 text-[#13201d] md:px-6 md:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-fp-teal">Top recommendations</p>
                <h2 className="mt-2 text-2xl font-extrabold">
                  {result.stops.length} stop suggestion{result.stops.length === 1 ? '' : 's'}
                </h2>
                <p className="mt-1 text-sm text-[#61716c]">
                  {result.mode === 'route'
                    ? `${miles(result.route?.distanceMeters ?? 0)} route · ${result.meta.sampledPoints} route areas checked`
                    : `Within ${result.meta.radiusMiles} miles of ${result.anchor?.label}`}
                </p>
              </div>
              {result.meta.mapDisplay === 'maplibre' && (
              <div className="grid grid-cols-2 rounded-xl border border-[#cdd9d5] bg-white p-1 md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold ${mobileView === 'list' ? 'bg-[#13201d] text-white' : ''}`}
                >
                  <ChevronRight className="h-4 w-4" /> List
                </button>
                <button
                  type="button"
                  onClick={() => setMobileView('map')}
                  className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold ${mobileView === 'map' ? 'bg-[#13201d] text-white' : ''}`}
                >
                  <MapIcon className="h-4 w-4" /> Map
                </button>
              </div>
              )}
            </div>

            {result.partialWarnings.map((warning) => (
              <p key={warning} className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {warning}
              </p>
            ))}
            {(result.meta.mapDisplay === 'external_only' ||
              result.stops.some((stop) => stop.source === 'google')) && (
              <p className="mt-3 text-xs text-[#61716c]">
                Route and place details provided by Google Maps. FlushPin access facts are
                community and first-party data.
              </p>
            )}
            {result.meta.mapDisplay === 'external_only' && (
              <p className="mt-3 rounded-xl border border-[#cdd9d5] bg-white px-4 py-3 text-sm text-[#41534e]">
                The interactive map is unavailable for provider-sourced routes and places. Use
                each stop&apos;s Google Maps link for map and directions.
              </p>
            )}

            <div className={`mt-6 grid gap-6 ${result.meta.mapDisplay === 'maplibre' ? 'md:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]' : ''}`}>
              <div className={`${result.meta.mapDisplay === 'maplibre' && mobileView === 'map' ? 'hidden md:block' : ''} space-y-3`}>
                {result.stops.map((stop, index) => (
                  <StopCard
                    key={stop.id}
                    stop={stop}
                    index={index}
                    selected={selectedId === stop.id}
                    mode={result.mode}
                    result={result}
                    onSelect={() => setSelectedId(stop.id)}
                  />
                ))}
              </div>
              {result.meta.mapDisplay === 'maplibre' && (
              <div className={`${mobileView === 'list' ? 'hidden md:block' : ''} md:sticky md:top-24 md:self-start`}>
                <TripStopsMap
                  route={result.route}
                  anchor={result.anchor}
                  stops={result.stops}
                  selectedId={selectedId}
                  onSelect={selectStop}
                />
              </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
