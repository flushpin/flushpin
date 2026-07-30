'use client'
import { Suspense, useState, useEffect, useRef } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import RatingModal from '../../components/RatingModal'
import PromoModal from '../../components/PromoModal'
import { useLang } from '../../lib/LanguageContext'
import {
  MAP_CATEGORY_CONFIG,
  isMapCategorySlug,
  matchesMapCategory,
  type MapCategorySlug,
} from '../../lib/mapCategories'
import {
  ACCESS_METHOD_CHIPS,
  buildAccessPayload,
  formatUpdatedAt,
  getAccessListLabel,
  hasDbRestroomId,
  parseAccessEditState,
  parseAccessRecord,
  restroomHasAccessInfo,
  type AccessEditState,
  type AccessMethod,
} from '../../lib/accessType'
import { isGoogleDiscoveryOnlyPlace, type NearbyPlaceResult } from '../../lib/nearby'
import { fetchEVStations, matchNearbyEV } from '../../lib/nearbyEV'
import {
  fetchNearbyPlaces,
  registerNearbyUnmountAbort,
} from '../../lib/nearbyClient'
import {
  extractPlaceIdFromCard,
  findExistingRestroomId,
  loadRestroomAccessById,
} from '../../lib/findRestroom'
import {
  buildRestroomDetailHref,
  resolveCanonicalRestroomId,
  type MapAccessIntent,
} from '../../lib/mapRestroomNavigation'
import {
  PUBLIC_RESTROOM_ACCESS_FIELDS,
  requestAuthorizedRestroomAccess,
  stripSensitivePinFields,
  type AccessRpcClient,
} from '../../lib/restroomAccessSecurity'
import {
  MAP_DEFAULT_CENTER,
  requestMapGeolocationOnce,
  resolveMapMountLocation,
} from '../../lib/mapLocationInit'

async function recordPinView(restroom: { id?: unknown }) {
  if (!hasDbRestroomId(restroom.id)) return
  const { data } = await supabase.auth.getSession()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const accessToken = data.session?.access_token
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  await fetch('/api/pin-view', {
    method: 'POST',
    headers,
    body: JSON.stringify({ restroom_id: restroom.id }),
  }).catch(() => {})
}

function getDistance(lat1:number, lng1:number, lat2:number, lng2:number) {
  const R = 3958.8
  const dLat = (lat2-lat1) * Math.PI/180
  const dLng = (lng2-lng1) * Math.PI/180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

const RADIUS_MILES = 12

function EVChargingIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="2.5" width="11" height="19" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M14.5 7h2.2l2.8 3v7.5a2 2 0 0 0 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 8.6V5.8M21 11.2V8.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <text x="9" y="15.2" textAnchor="middle" fill="currentColor" fontSize="6.5" fontWeight="800" fontFamily="Arial, sans-serif">EV</text>
    </svg>
  )
}

type MapPlace = { name?: string; address?: string; lat: number; lng: number; [key: string]: unknown }

function matchesSearch(r: MapPlace, query: string) {
  if (!query.trim()) return true
  const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length >= 2)
  if (tokens.length === 0) return true
  const haystack = `${(r.name || '').toLowerCase()} ${(r.address || '').toLowerCase()}`
  return tokens.every(t => haystack.includes(t))
}

function withinRadius(r: MapPlace, lat: number, lng: number, miles: number) {
  return getDistance(lat, lng, r.lat, r.lng) <= miles
}

export default function FindPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: "'Inter',system-ui,sans-serif", padding: '24px' }}>
          <p style={{ color: '#999', fontSize: '15px', margin: 0 }}>Loading map…</p>
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  )
}

function MapPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { lang, setLang, t } = useLang()
  const [restrooms, setRestrooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userLat, setUserLat] = useState<number|null>(null)
  const [userLng, setUserLng] = useState<number|null>(null)
  const [locationName, setLocationName] = useState(MAP_DEFAULT_CENTER.label)
  const [filter, setFilter] = useState('all')
  const [unit, setUnit] = useState<'mi'|'km'>('mi')
  const [selected, setSelected] = useState<any>(null)
  const [showPin, setShowPin] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [showPromo, setShowPromo] = useState(false)
  const [promoTarget, setPromoTarget] = useState<any>(null)
  const [ratingTarget, setRatingTarget] = useState<any>(null)
  const [emergency, setEmergency] = useState(false)
  const [locating, setLocating] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [editMode, setEditMode] = useState<'update'|'correct'|'share'>('update')
  const [editEntry, setEditEntry] = useState<AccessEditState>({pin:'',accessible:false,hasBabyChanging:false,customersOnly:false,method:'no_code_needed'})
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [anchorLat, setAnchorLat] = useState<number | null>(null)
  const [anchorLng, setAnchorLng] = useState<number | null>(null)
  const [nearbyError, setNearbyError] = useState<string | null>(null)
  const [nearbyEmpty, setNearbyEmpty] = useState(false)
  const [showRetry, setShowRetry] = useState(false)
  const [openingCardId, setOpeningCardId] = useState<string | null>(null)
  const loadRequestIdRef = useRef(0)
  const unmountAbortRef = useRef<AbortController | null>(null)
  const locatingInFlightRef = useRef(false)
  const openingInFlightRef = useRef(false)

  const resolveCityLabel = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`)
      const data = await res.json()
      return data.label || 'Your area'
    } catch {
      return 'Your area'
    }
  }

  const resolveSearchLocation = async (query: string) => {
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (res.ok && data.lat && data.lng) {
        return { lat: data.lat as number, lng: data.lng as number, label: (data.label as string) || query }
      }
    } catch {
      // fall through
    }
    return null
  }

  const applyAnchor = async (lat: number, lng: number, label?: string) => {
    setAnchorLat(lat)
    setAnchorLng(lng)
    setLocationName(label || await resolveCityLabel(lat, lng))
  }

  const mapNearbyToCard = (p: NearbyPlaceResult) => {
    const isPublic = p.category_group === 'public_restroom'
    const discoveryOnly = isGoogleDiscoveryOnlyPlace(p)
    return {
      id: isPublic ? `public_${p.place_id}` : `google_${p.place_id}`,
      place_id: p.place_id,
      google_place_id: isPublic ? null : p.place_id,
      name: p.name,
      address: p.address,
      lat: p.lat,
      lng: p.lng,
      type: p.types[0] ?? 'other',
      types: p.types ?? [],
      status: discoveryOnly ? 'neutral' : p.verified ? 'green' : p.access_available ? 'amber' : 'red',
      source: p.source ?? (isPublic ? 'supabase' : 'google'),
      has_code: p.has_code,
      category_group: p.category_group,
      distance_m: p.distance_m,
      discovery_only: discoveryOnly,
      stars: 0,
      score: 0,
      verified: p.verified ? 'Community verified' : '',
      accessible: p.accessible === true,
      has_baby_changing: p.has_baby_changing === true,
    }
  }

  const fetchNearbyApi = async (lat: number, lng: number, force = false) => {
    return fetchNearbyPlaces(lat, lng, { force })
  }

  const fetchGooglePlaces = async (lat: number, lng: number, keyword: string) => {
    try {
      const q = keyword ? `&q=${encodeURIComponent(keyword)}` : ''
      const radiusMeters = Math.round(RADIUS_MILES * 1609.34)
      const res = await fetch(`/api/places?lat=${lat}&lng=${lng}&radius=${radiusMeters}${q}`)
      const data = await res.json()
      return (data.places || []).filter((p: { lat: number; lng: number }) =>
        withinRadius(p, lat, lng, RADIUS_MILES)
      )
    } catch {
      return []
    }
  }

  const hydrateRestroomForAccess = async (target: Record<string, unknown>) => {
    if (target.access_type && hasDbRestroomId(target.id)) {
      return target
    }

    const placeId = extractPlaceIdFromCard(target)
    const name = typeof target.name === 'string' ? target.name : null
    const lat = typeof target.lat === 'number' ? target.lat : Number(target.lat)
    const lng = typeof target.lng === 'number' ? target.lng : Number(target.lng)

    // 1) Fast path: restroom_public by place_id (same as before)
    if (placeId) {
      const { data } = await supabase
        .from('restroom_public')
        .select(PUBLIC_RESTROOM_ACCESS_FIELDS)
        .eq('place_id', placeId)
        .maybeSingle()
      if (data) {
        return { ...target, ...data, distance: target.distance }
      }
    }

    // 2) Discovery miss: resolve numeric restroom (place_id, then name+coords)
    //    so app-published PINs show on the web map too.
    const foundId = await findExistingRestroomId({
      placeId,
      name,
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
    })
    if (foundId == null) return target

    const row = await loadRestroomAccessById(foundId)
    if (!row) return target

    return { ...target, ...row, distance: target.distance }
  }

  const loadData = async (
    queryLat: number,
    queryLng: number,
    keyword: string = '',
    useKeywordGoogleFallback = false,
    options?: { force?: boolean },
  ) => {
    const force = options?.force ?? false
    const requestId = ++loadRequestIdRef.current
    if (restrooms.length === 0) setLoading(true)
    setNearbyError(null)
    setShowRetry(false)
    setNearbyEmpty(false)
    const trimmedKeyword = keyword.trim()

    if (useKeywordGoogleFallback && trimmedKeyword) {
      const googlePlaces = await fetchGooglePlaces(queryLat, queryLng, trimmedKeyword)
      if (requestId !== loadRequestIdRef.current) return
      const stations = await fetchEVStations(queryLat, queryLng)
      if (requestId !== loadRequestIdRef.current) return
      setRestrooms(matchNearbyEV(googlePlaces, stations))
      setLoading(false)
      return
    }

    const result = await fetchNearbyApi(queryLat, queryLng, force)
    if (requestId !== loadRequestIdRef.current) return

    if (result.status === 'aborted') {
      setLoading(false)
      return
    }

    if (result.status === 'error') {
      setNearbyError(result.message)
      setShowRetry(result.code === 'places_unavailable')
      setLoading(false)
      return
    }

    const mapped = result.places
      .map(mapNearbyToCard)
      .filter(
        (r) =>
          withinRadius(r, queryLat, queryLng, RADIUS_MILES) &&
          matchesSearch(r, trimmedKeyword),
      )

    const stations = await fetchEVStations(queryLat, queryLng)
    if (requestId !== loadRequestIdRef.current) return
    const mappedWithEV = matchNearbyEV(mapped, stations)

    setRestrooms(mappedWithEV)
    setNearbyEmpty(mapped.length === 0)
    setLoading(false)
  }

  const getLocation = (onSuccess: (lat: number, lng: number) => void) => {
    // User-gesture only. One in-flight request max; denial falls back once (no retry).
    if (locatingInFlightRef.current) return
    locatingInFlightRef.current = true

    const finish = async (lat: number, lng: number, fallbackLabel?: string) => {
      setUserLat(lat)
      setUserLng(lng)
      setLocating(false)
      locatingInFlightRef.current = false
      await applyAnchor(lat, lng, fallbackLabel)
      onSuccess(lat, lng)
    }

    setLocating(true)
    requestMapGeolocationOnce(navigator.geolocation, {
      onSuccess: (lat, lng) => {
        void finish(lat, lng)
      },
      onError: () => {
        void finish(MAP_DEFAULT_CENTER.lat, MAP_DEFAULT_CENTER.lng, MAP_DEFAULT_CENTER.label)
      },
    })
  }

  const queryLat = anchorLat ?? userLat ?? MAP_DEFAULT_CENTER.lat
  const queryLng = anchorLng ?? userLng ?? MAP_DEFAULT_CENTER.lng
  const sortLat = userLat ?? anchorLat ?? MAP_DEFAULT_CENTER.lat
  const sortLng = userLng ?? anchorLng ?? MAP_DEFAULT_CENTER.lng

  const categoryParam = searchParams.get('category')
  const activeCategory: MapCategorySlug | null = isMapCategorySlug(categoryParam) ? categoryParam : null
  const categoryApplies = !!activeCategory && !searchQuery.trim()
  const filterParam = searchParams.get('filter')
  const MAP_FILTER_IDS = new Set(['all', 'verified', 'accessible', 'pin', 'baby', 'nocode', 'ev'])

  const clearCategory = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('category')
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname)
  }

  useEffect(() => {
    if (filterParam && MAP_FILTER_IDS.has(filterParam)) {
      setFilter(filterParam)
    }
  }, [filterParam])

  useEffect(() => {
    const abortController = new AbortController()
    unmountAbortRef.current = abortController
    registerNearbyUnmountAbort(abortController)

    const params = new URLSearchParams(window.location.search)
    const q = params.get('q') || ''
    const near = params.get('near') || ''
    const urlLat = params.get('lat')
    const urlLng = params.get('lng')
    const urlFilter = params.get('filter')
    setSearchQuery(q)
    setSearchInput(q)
    if (urlFilter && MAP_FILTER_IDS.has(urlFilter)) setFilter(urlFilter)
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (!session) {
        setShowPin(false)
        setShowPromo(false)
        setPromoTarget(null)
        setSelected((current: Record<string, unknown> | null) =>
          current ? stripSensitivePinFields(current) : null,
        )
        setRestrooms((current) =>
          current.map((item) => stripSensitivePinFields(item)),
        )
      }
    })

    const init = async () => {
      const mounted = await resolveMapMountLocation(
        {
          lat: urlLat,
          lng: urlLng,
          q,
          near,
          category: params.get('category'),
        },
        { resolveSearchLocation },
      )
      // Mount never requests geolocation — only URL, geocode, or default center.
      await applyAnchor(mounted.lat, mounted.lng, mounted.label)
      await loadData(mounted.lat, mounted.lng, '', false)
    }

    init()

    return () => {
      abortController.abort()
      authSubscription.unsubscribe()
      registerNearbyUnmountAbort(null)
      unmountAbortRef.current = null
    }
  }, [])

  const handleSearch = async () => {
    const q = searchInput.trim()
    setSearchQuery(q)
    const url = new URL(window.location.href)

    if (!q) {
      url.searchParams.delete('q')
      url.searchParams.delete('lat')
      url.searchParams.delete('lng')
      url.searchParams.delete('near')
      window.history.replaceState({}, '', url.toString())
      getLocation((lat, lng) => { loadData(lat, lng, '', false, { force: true }) })
      return
    }

    setLoading(true)
    const located = await resolveSearchLocation(q)
    if (located) {
      await applyAnchor(located.lat, located.lng, located.label)
      url.searchParams.set('q', q)
      url.searchParams.set('lat', String(located.lat))
      url.searchParams.set('lng', String(located.lng))
      url.searchParams.set('near', located.label)
      window.history.replaceState({}, '', url.toString())
      await loadData(located.lat, located.lng, '', false)
      return
    }

    url.searchParams.set('q', q)
    window.history.replaceState({}, '', url.toString())
    await loadData(queryLat, queryLng, q, true)
  }
  const withDistance = restrooms
    .map(r => ({ ...r, distance: getDistance(sortLat, sortLng, r.lat, r.lng) }))
    .sort((a, b) => a.distance - b.distance)
  const statusFiltered = withDistance.filter(r => {
    if (emergency) return r.status==='green'
    if (filter==='verified') return r.status==='green'
    if (filter==='accessible') return r.accessible === true
    if (filter==='pin') return restroomHasAccessInfo(r)
    if (filter==='baby') return r.has_baby_changing === true
    if (filter==='nocode') {
      const type = typeof r.access_type === 'string' ? r.access_type : ''
      return type.includes('no_code_needed') && !type.includes('customers_only')
    }
    if (filter==='ev') return r.hasNearbyEVCharging === true
    return true
  })
  const displayed = categoryApplies
    ? statusFiltered.filter((r) => matchesMapCategory(r, activeCategory!))
    : statusFiltered

  const formatDist = (d:number) => unit==='mi'?`${d.toFixed(1)} mi`:`${(d*1.609).toFixed(1)} km`
  const formatEVDistance = (meters:number) => `${Math.round((meters * 3.28084) / 10) * 10} ft`
  const statusColor = (s:string) => s==='green'?'#1D9E75':s==='amber'?'#D97706':s==='neutral'?'#CBD5E1':'#DC2626'
  const statusLabel = (s:string) => s==='green'?'Community verified':s==='amber'?'Needs update':'Access info unknown'
  const openDirections = (r:any) => window.open(`https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}&travelmode=driving`,'_blank')
  const openEVDirections = (r: {
    nearbyEV?: { latitude: number; longitude: number }
  }) => {
    if (!r.nearbyEV) return
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${r.nearbyEV.latitude},${r.nearbyEV.longitude}&travelmode=driving`,
      '_blank',
    )
  }

  const localizedMethodChips = ACCESS_METHOD_CHIPS.map(chip => ({
    ...chip,
    label:
      chip.id === 'keypad_code' ? t.chipKeypad
      : chip.id === 'no_code_needed' ? t.chipOpen
      : chip.id === 'ask_staff' ? t.chipAskStaff
      : t.chipLocked,
  }))

  const selectAccessMethod = (method: AccessMethod) => {
    setEditEntry(p => ({
      ...p,
      method,
      customersOnly: method === 'locked' ? false : p.customersOnly,
      pin: method === 'keypad_code' ? p.pin : '',
    }))
  }

  const toggleCustomersOnly = () => {
    setEditEntry(p => ({
      ...p,
      customersOnly: p.method === 'locked' ? false : !p.customersOnly,
    }))
  }

  const closeEditForm = () => {
    setShowEditForm(false)
    setEditTarget(null)
    setEditMode('update')
    setEditError('')
  }

  const persistAccessUpdate = async (target: any, entry: typeof editEntry, userId?: string | null) => {
    if (!userId) {
      throw new Error('SIGN_IN_REQUIRED')
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      throw new Error('SIGN_IN_REQUIRED')
    }

    const res = await fetch('/api/share-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ target, entry }),
    })

    const json = (await res.json()) as {
      error?: string
      restroom?: Record<string, unknown>
      restroomId?: string | number
    }
    if (!res.ok) {
      throw new Error(json.error || 'Save failed')
    }

    return {
      ...target,
      ...(json.restroom ?? {}),
      id: json.restroomId ?? json.restroom?.id ?? target.id,
      distance: target.distance,
    }
  }

  const publishErrorMessage = (error?: string) => {
    if (!error) return t.saveError
    const lower = error.toLowerCase()
    if (lower.includes('not authenticated') || lower.includes('sign in') || lower.includes('jwt')) {
      return `❌ ${t.editForm.signInRequired}`
    }
    if (lower.includes('pin required')) return t.enterPinError
    return `❌ ${error}`
  }

  const ensureRestroomViaApi = async (target: Record<string, unknown>): Promise<number | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return null

    const res = await fetch('/api/ensure-restroom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        id: target.id,
        name: target.name,
        address: target.address,
        lat: target.lat,
        lng: target.lng,
        type: target.type,
        source: target.source,
        place_id: target.place_id ?? extractPlaceIdFromCard(target),
        google_place_id: target.google_place_id,
      }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { restroomId?: number }
    return typeof json.restroomId === 'number' ? json.restroomId : null
  }

  const openRestroomDetail = async (
    r: Record<string, unknown>,
    intent: MapAccessIntent,
    e?: React.MouseEvent,
  ) => {
    e?.stopPropagation()
    if (openingInFlightRef.current) return
    openingInFlightRef.current = true
    setOpeningCardId(String(r.id ?? ''))
    setNearbyError(null)
    // Phase 1: never open the legacy access modal / inline PIN reveal from these actions.
    setShowEditForm(false)
    setShowPromo(false)
    setShowPin(false)

    try {
      const hydrated = await hydrateRestroomForAccess(r)
      setRestrooms((prev) =>
        prev.map((item) =>
          String(item.id) === String(r.id)
            ? {
                ...item,
                access_type:
                  (hydrated as { access_type?: string }).access_type ??
                  (item as { access_type?: string }).access_type,
                status: (hydrated as { status?: string }).status ?? item.status,
                pin_updated_at:
                  (hydrated as { pin_updated_at?: string }).pin_updated_at ??
                  (item as { pin_updated_at?: string }).pin_updated_at,
                has_code: (hydrated as { has_code?: boolean }).has_code ?? item.has_code,
                verified: (hydrated as { verified?: string }).verified ?? item.verified,
                id: (hydrated as { id?: unknown }).id ?? item.id,
              }
            : item,
        ),
      )

      const canonicalId = await resolveCanonicalRestroomId(
        hydrated as Record<string, unknown>,
        {
          findExisting: findExistingRestroomId,
          ensureRestroom: ensureRestroomViaApi,
        },
      )
      if (canonicalId == null) {
        setNearbyError(t.openRestroomFailed)
        openingInFlightRef.current = false
        setOpeningCardId(null)
        return
      }

      const href = buildRestroomDetailHref(canonicalId, {
        intent,
        discovery: {
          lat: queryLat,
          lng: queryLng,
          q: searchQuery,
          filter,
          category: activeCategory,
        },
      })
      router.push(href)
      // Keep Opening… until this page unmounts after navigation.
    } catch {
      setNearbyError(t.openRestroomFailed)
      openingInFlightRef.current = false
      setOpeningCardId(null)
    }
  }

  const handleEditOpen = (r: any, e: React.MouseEvent, mode: 'update' | 'correct' | 'share' = 'update') => {
    void openRestroomDetail(r, mode, e)
  }

  const handleAccessAction = (r: any, e: React.MouseEvent) => {
    const intent: MapAccessIntent = restroomHasAccessInfo(r) ? 'view' : 'share'
    void openRestroomDetail(r, intent, e)
  }

  const completePromoAccess = async () => {
    const target = promoTarget as Record<string, unknown> | null
    setShowPromo(false)
    if (!target) return

    const safeTarget = stripSensitivePinFields(target)
    const parsed = parseAccessRecord(safeTarget)
    const requiresCode = safeTarget.has_code === true || parsed.method === 'keypad_code'

    if (!requiresCode) {
      setSelected(safeTarget)
      setShowPin(true)
      void recordPinView(safeTarget)
      return
    }

    const restroomId = Number(safeTarget.id)
    const result = await requestAuthorizedRestroomAccess(
      restroomId,
      supabase as unknown as AccessRpcClient,
    )
    if (result.status === 'unauthenticated') {
      setShowPin(false)
      setNearbyError('Sign in to view restroom access codes.')
      return
    }
    if (result.status !== 'success') {
      setShowPin(false)
      setNearbyError(
        result.status === 'denied'
          ? result.message
          : 'This restroom access code could not be loaded securely.',
      )
      return
    }

    const authorizedTarget = {
      ...safeTarget,
      ...(result.pin ? { pin: result.pin } : {}),
    }
    setSelected(authorizedTarget)
    setShowPin(true)
    setPromoTarget(safeTarget)
    void recordPinView(safeTarget)
  }

  const handleEditSave = async () => {
    if (!editTarget || savingEdit) return
    if (!user?.id) {
      setEditError(`❌ ${t.editForm.signInRequired}`)
      return
    }
    if (editEntry.method === 'keypad_code' && !editEntry.pin.trim()) {
      setEditError(t.enterPinError)
      return
    }

    const target = editTarget
    const entry = editEntry
    setSavingEdit(true)
    setEditError('')

    try {
      const updated = await persistAccessUpdate(target, entry, user.id)
      const payload = buildAccessPayload(entry)
      const safeUpdated = stripSensitivePinFields(updated as Record<string, unknown>)

      setRestrooms(prev => {
        const idx = prev.findIndex(r => r.id === target.id || r.id === updated.id)
        if (idx < 0) return [...prev, safeUpdated]
        const next = [...prev]
        next[idx] = { ...prev[idx], ...safeUpdated, distance: prev[idx].distance }
        return next
      })

      closeEditForm()
      setSelected({
        ...safeUpdated,
        ...(entry.method === 'keypad_code' && entry.pin.trim() ? { pin: entry.pin.trim() } : {}),
      })
      setShowPin(true)
      void recordPinView(safeUpdated)
      setSuccessMsg(
        `${t.liveNow} — ${getAccessListLabel(updated).label} · ${formatUpdatedAt(payload.pin_updated_at)}`,
      )
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      if (err instanceof Error && err.message === 'SIGN_IN_REQUIRED') {
        setEditError(`❌ ${t.editForm.signInRequired}`)
      } else if (err instanceof Error && err.message) {
        setEditError(publishErrorMessage(err.message))
      } else {
        setEditError(t.saveError)
      }
    } finally {
      setSavingEdit(false)
    }
  }

  const renderAccessPanel = (r: any) => {
    const parsed = parseAccessRecord(r)
    const updatedAt = r.pin_updated_at ? formatUpdatedAt(r.pin_updated_at) : null
    const updatedLine = updatedAt ? `${t.updated} ${updatedAt}` : (r.verified || null)

    if (parsed.method === 'unknown') {
      return (
        <div style={{background:'#FEE2E2',borderRadius:'10px',padding:'14px',textAlign:'center',marginBottom:'10px'}}>
          <p style={{fontSize:'15px',fontWeight:'700',color:'#DC2626',margin:0}}>{t.unknownAccess}</p>
          <p style={{fontSize:'13px',color:'#888',margin:'4px 0 0'}}>{t.unknownDesc}</p>
          <button onClick={e=>handleEditOpen(r,e,'share')} style={{marginTop:'12px',background:'#1D9E75',color:'white',border:'none',padding:'10px 16px',borderRadius:'8px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>{t.shareAccess}</button>
        </div>
      )
    }

    if (parsed.method === 'locked') {
      return (
        <div style={{background:'#FEE2E2',borderRadius:'10px',padding:'14px',textAlign:'center',marginBottom:'10px'}}>
          <p style={{fontSize:'17px',fontWeight:'700',color:'#991B1B',margin:0}}>{t.locked}</p>
          <p style={{fontSize:'13px',color:'#DC2626',margin:'4px 0 0'}}>{t.lockedDesc}</p>
          {updatedLine&&<p style={{fontSize:'12px',color:'#888',margin:'8px 0 0'}}>{updatedLine}</p>}
        </div>
      )
    }

    return (
      <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'10px'}}>
        {parsed.customersOnly && (
          <div style={{background:'#EEF2FF',borderRadius:'10px',padding:'12px 14px',textAlign:'center'}}>
            <p style={{fontSize:'16px',fontWeight:'700',color:'#4338CA',margin:0}}>{t.customersOnly}</p>
            <p style={{fontSize:'13px',color:'#6366F1',margin:'4px 0 0'}}>{t.customersOnlyDesc}</p>
          </div>
        )}
        {parsed.method === 'keypad_code' && parsed.displayPin && (
          <div style={{background:'#E1F5EE',borderRadius:'10px',padding:'16px',textAlign:'center'}}>
            <p style={{fontSize:'12px',color:'#0F6E56',fontWeight:'600',margin:'0 0 4px',letterSpacing:'1px'}}>{t.customerCode}</p>
            <p style={{fontSize:'42px',fontWeight:'700',color:'#085041',letterSpacing:'10px',margin:'10px 0'}}>{parsed.displayPin}</p>
          </div>
        )}
        {parsed.method === 'no_code_needed' && (
          <div style={{background:'#D1FAE5',borderRadius:'10px',padding:'14px',textAlign:'center'}}>
            <p style={{fontSize:'17px',fontWeight:'700',color:'#065F46',margin:0}}>🚪 {t.openAccess}</p>
            <p style={{fontSize:'13px',color:'#047857',margin:'4px 0 0'}}>{t.openDesc}</p>
          </div>
        )}
        {parsed.method === 'ask_staff' && (
          <div style={{background:'#FEF3C7',borderRadius:'10px',padding:'14px',textAlign:'center'}}>
            <p style={{fontSize:'17px',fontWeight:'700',color:'#92400E',margin:0}}>{t.askStaff}</p>
            <p style={{fontSize:'13px',color:'#B45309',margin:'4px 0 0'}}>{t.askStaffDesc}</p>
          </div>
        )}
        {parsed.method === 'keypad_code' && !parsed.displayPin && (
          <div style={{background:'#FEE2E2',borderRadius:'10px',padding:'14px',textAlign:'center'}}>
            <p style={{fontSize:'15px',fontWeight:'700',color:'#DC2626',margin:0}}>{t.unknownAccess}</p>
            <p style={{fontSize:'13px',color:'#888',margin:'4px 0 0'}}>{t.unknownDesc}</p>
          </div>
        )}
        {updatedLine&&<p style={{fontSize:'12px',color:'#888',margin:0,textAlign:'center'}}>{updatedLine}</p>}
      </div>
    )
  }

  const renderAccessActions = (r: any) => {
    const parsed = parseAccessRecord(r)
    const hasPin = parsed.method === 'keypad_code' && !!parsed.displayPin
    const hasInfo = restroomHasAccessInfo(r)

    return (
      <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
        {hasPin && (
          <button onClick={e=>{e.stopPropagation();setRatingTarget({...r,_pinWorked:true});setShowRating(true)}} style={{flex:1,minWidth:'100px',background:'#f0faf6',color:'#1D9E75',border:'1px solid #9FE1CB',padding:'10px',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>{t.codeWorked}</button>
        )}
        {(hasPin || hasInfo) && (
          <button onClick={e=>handleEditOpen(r,e,'correct')} style={{flex:1,minWidth:'100px',background:'#FEE2E2',color:'#DC2626',border:'1px solid #FCA5A5',padding:'10px',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>{hasPin ? t.codeChanged : t.wrongInfo}</button>
        )}
        <button onClick={e=>handleEditOpen(r,e,'update')} style={{flex:1,minWidth:'100px',background:'#FEF3C7',color:'#D97706',border:'1px solid #FCD34D',padding:'10px',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>{t.update}</button>
      </div>
    )
  }

  const editFormTitle = editTarget
    ? `${editMode === 'correct' ? t.correctAccessTitle : editMode === 'share' ? t.shareAccessTitle : t.updateAccessTitle}: ${editTarget.name}`
    : ''

  const inputStyle = {width:'100%',padding:'12px 14px',borderRadius:'8px',border:'1px solid #e0e0e0',fontSize:'16px',boxSizing:'border-box' as const,outline:'none',fontFamily:"'Inter',system-ui,sans-serif",color:'#1a1a1a'}
  const labelStyle = {fontSize:'14px',fontWeight:'600' as const,color:'#555',marginBottom:'6px',display:'block' as const}

  return (
    <div style={{minHeight:'100vh',background:'#f8f9fa',fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{background:'white',borderBottom:'1px solid #f0f0f0',padding:'12px 20px',display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <div style={{display:'flex',background:'#f5f5f5',borderRadius:'8px',padding:'3px'}}>
            <button onClick={()=>setLang('en')} style={{padding:'5px 12px',borderRadius:'6px',border:'none',fontSize:'14px',cursor:'pointer',background:lang==='en'?'white':'transparent'}}>🇺🇸</button>
            <button onClick={()=>setLang('es')} style={{padding:'5px 12px',borderRadius:'6px',border:'none',fontSize:'14px',cursor:'pointer',background:lang==='es'?'white':'transparent'}}>🇲🇽</button>
          </div>
          <button onClick={()=>setUnit(unit==='mi'?'km':'mi')} style={{background:'#f5f5f5',border:'none',padding:'7px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',cursor:'pointer',color:'#555'}}>{unit==='mi'?'km':'mi'}</button>
          <button onClick={()=>setEmergency(!emergency)} style={{background:emergency?'#DC2626':'white',color:emergency?'white':'#DC2626',border:'2px solid #DC2626',padding:'7px 16px',borderRadius:'20px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>🚨 {emergency?'ON':'Urgent'}</button>
        </div>
      </div>

      <div style={{background:'white',padding:'12px 16px',borderBottom:'1px solid #f0f0f0'}}>
        <div style={{display:'flex',borderRadius:'12px',overflow:'hidden',border:'2px solid #1D9E75',boxShadow:'0 2px 8px rgba(29,158,117,0.15)'}}>
          <input type="text"
            placeholder={lang==='es'?"Busca Starbucks, burger, gas...":"Search Starbucks, burger, gas station..."}
            value={searchInput}
            onChange={e=>setSearchInput(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleSearch()}
            style={{flex:1,padding:'14px 16px',fontSize:'16px',border:'none',outline:'none',fontFamily:"'Inter',system-ui,sans-serif",color:'#1a1a1a',background:'white'}}
          />
          <button onClick={handleSearch} style={{background:'#1D9E75',color:'white',border:'none',padding:'14px 20px',fontSize:'16px',fontWeight:'700',cursor:'pointer'}}>🔍</button>
        </div>
        {searchQuery&&(
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'8px',flexWrap:'wrap'}}>
            <span style={{fontSize:'14px',color:'#555'}}>
              {lang === 'es' ? 'Resultados para ' : 'Results for '}<strong style={{color:'#0A2E1F'}}>{searchQuery}</strong>{lang === 'es' ? ' cerca de ' : ' near '}<strong style={{color:'#0A2E1F'}}>{locationName}</strong>
            </span>
            <button onClick={()=>{setSearchQuery('');setSearchInput('');const url=new URL(window.location.href);url.searchParams.delete('q');url.searchParams.delete('lat');url.searchParams.delete('lng');url.searchParams.delete('near');window.history.replaceState({},'',`${url.pathname}${url.search}`);getLocation((lat,lng)=>loadData(lat,lng,'',false,{force:true}))}} style={{background:'#f0f0f0',border:'none',borderRadius:'20px',padding:'3px 10px',fontSize:'13px',cursor:'pointer',color:'#666'}}>{lang === 'es' ? '✕ Limpiar' : '✕ Clear'}</button>
          </div>
        )}
        {categoryApplies && activeCategory && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#E1F5EE',
                color: '#0F6E56',
                border: '1px solid #9FE1CB',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              {MAP_CATEGORY_CONFIG[activeCategory].label}
              <button
                type="button"
                onClick={clearCategory}
                aria-label={`Remove ${MAP_CATEGORY_CONFIG[activeCategory].label} filter`}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0F6E56',
                  cursor: 'pointer',
                  fontSize: '14px',
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ✕
              </button>
            </span>
          </div>
        )}
      </div>

      <div style={{background:'white',padding:'10px 16px',borderBottom:'1px solid #f0f0f0'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
          <span style={{fontSize:'14px',color:'#1D9E75'}}>📍</span>
          <span style={{fontSize:'14px',color:'#555',fontWeight:'500'}}>
            {locating ? t.findingLocation : `${lang === 'es' ? 'Cerca de' : 'Near'} ${locationName}`}
          </span>
          <button onClick={()=>{window.history.replaceState({},'',window.location.pathname);getLocation((lat,lng)=>loadData(lat,lng,searchQuery,false,{force:true}))}} style={{background:'none',border:'none',color:'#1D9E75',fontSize:'13px',cursor:'pointer',fontWeight:'600',marginLeft:'auto'}}>{t.updateLocation}</button>
        </div>
        <div style={{display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'2px'}}>
          {[
            {id:'all',label:t.allFilter},
            {id:'verified',label:t.verifiedFilter},
            {id:'accessible',label:t.accessibleFilter},
            {id:'baby',label:lang === 'es' ? '🍼 Bebé' : '🍼 Baby'},
            {id:'nocode',label:lang === 'es' ? 'Sin código' : 'No code'},
            {id:'pin',label:t.pinFilter},
            {id:'ev',label:lang === 'es' ? 'EV cerca' : 'EV nearby'},
          ].map(f=>(
            <button key={f.id} onClick={()=>setFilter(f.id)} style={{background:filter===f.id?'#0A2E1F':'#f5f5f5',color:filter===f.id?'white':'#555',border:'none',padding:'8px 16px',borderRadius:'20px',fontSize:'13px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>{f.label}</button>
          ))}
        </div>
      </div>

      {emergency&&<div style={{background:'#FEF2F2',borderBottom:'1px solid #FCA5A5',padding:'10px 20px'}}><p style={{fontSize:'14px',fontWeight:'700',color:'#DC2626',margin:0}}>{t.urgentMode}</p></div>}
      {successMsg&&<div style={{background:'#E1F5EE',borderBottom:'1px solid #9FE1CB',padding:'10px 20px'}}><p style={{fontSize:'14px',fontWeight:'700',color:'#1D9E75',margin:0}}>{successMsg}</p></div>}
      {nearbyError&&<div style={{background:'#FEF3C7',borderBottom:'1px solid #FCD34D',padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',flexWrap:'wrap'}}>
        <p style={{fontSize:'14px',fontWeight:'600',color:'#92400E',margin:0}}>{nearbyError}</p>
        {showRetry&&(
          <button type="button" onClick={()=>loadData(queryLat,queryLng,searchQuery,false,{force:true})} style={{background:'#92400E',color:'white',border:'none',padding:'8px 14px',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>Retry</button>
        )}
      </div>}

      <div style={{padding:'16px 16px 100px'}}>
        <p style={{fontSize:'14px',color:'#999',fontWeight:'500',margin:'0 0 12px'}}>
          {loading
            ? t.loading
            : lang === 'es' ? `${displayed.length} lugar${displayed.length !== 1 ? 'es' : ''} dentro de ${RADIUS_MILES} mi de ${locationName}` : `${displayed.length} location${displayed.length !== 1 ? 's' : ''} within ${RADIUS_MILES} mi of ${locationName}`}
        </p>

        {loading&&<div style={{textAlign:'center',padding:'60px 20px'}}>
          <div style={{fontSize:'40px',marginBottom:'12px'}}>🚽</div>
          <p style={{color:'#999',fontSize:'15px'}}>{t.findingLocation}</p>
        </div>}

        {!loading && !nearbyError && nearbyEmpty && displayed.length === 0 && !searchQuery && !categoryApplies && (
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>📍</div>
            <p style={{color:'#555',fontSize:'17px',fontWeight:'700',marginBottom:'8px'}}>No nearby restroom locations found.</p>
          </div>
        )}

        {!loading && displayed.length === 0 && searchQuery && (
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>🔍</div>
            <p style={{color:'#555',fontSize:'17px',fontWeight:'700',marginBottom:'8px'}}>{lang === 'es' ? `No hay resultados para "${searchQuery}"` : `No results for "${searchQuery}"`}</p>
            <p style={{color:'#999',fontSize:'15px'}}>{lang === 'es' ? 'Prueba con otra búsqueda.' : 'Try a different search term.'}</p>
          </div>
        )}

        {!loading && displayed.length === 0 && !searchQuery && categoryApplies && activeCategory && (
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>📍</div>
            <p style={{color:'#555',fontSize:'17px',fontWeight:'700',marginBottom:'8px'}}>
              {lang === 'es'
                ? `No encontramos ${MAP_CATEGORY_CONFIG[activeCategory].label.toLowerCase()} cerca de ${locationName}`
                : `No ${MAP_CATEGORY_CONFIG[activeCategory].label.toLowerCase()} found near ${locationName}`}
            </p>
            <p style={{color:'#999',fontSize:'15px',marginBottom:'20px'}}>
              {lang === 'es' ? 'Prueba otra categoría o amplía la búsqueda.' : 'Try another category or browse everything nearby.'}
            </p>
            <button
              type="button"
              onClick={clearCategory}
              style={{background:'#1D9E75',color:'white',border:'none',padding:'12px 20px',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}
            >
              {lang === 'es' ? 'Mostrar todo cerca' : 'Show all nearby'}
            </button>
          </div>
        )}

        {displayed.some((restroom) => restroom.source === 'google') && (
          <p style={{color:'#777',fontSize:'12px',margin:'0 0 10px'}}>
            Place details provided by Google Maps. FlushPin access facts are community and
            first-party data.
          </p>
        )}

        {displayed.map(r=>(
          <div key={r.id} onClick={()=>{setSelected(r===selected?null:r);setShowPin(false)}} style={{background:'white',borderRadius:'14px',marginBottom:'10px',boxShadow:'0 1px 6px rgba(0,0,0,0.06)',overflow:'hidden',cursor:'pointer',border:selected?.id===r.id?'2px solid #1D9E75':'2px solid transparent'}}>
            <div style={{padding:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                    <div style={{width:'9px',height:'9px',borderRadius:'50%',background:statusColor(r.status||'red'),flexShrink:0}}/>
                    <span style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:'16px',fontWeight:'700',color:'#0A2E1F'}}>{r.name}</span>
                    {r.hasNearbyEVCharging && (
                      <>
                        <span
                          title="EV charging nearby"
                          aria-label="EV charging nearby"
                          style={{
                            width:'22px',
                            height:'22px',
                            borderRadius:'50%',
                            background:'#16A34A',
                            border:'2px solid white',
                            boxShadow:'0 1px 4px rgba(0,0,0,0.18)',
                            display:'inline-flex',
                            alignItems:'center',
                            justifyContent:'center',
                            color:'white',
                            flexShrink:0,
                          }}
                        >
                          <EVChargingIcon size={14} />
                        </span>
                        <span style={{fontSize:'11px',background:'#ECFDF5',color:'#166534',border:'1px solid #86EFAC',padding:'2px 7px',borderRadius:'10px',fontWeight:'700',whiteSpace:'nowrap'}}>
                          {r.nearbyEV?.operatorName || 'EV nearby'}
                        </span>
                      </>
                    )}
                    {r.category_group === 'public_restroom' && (
                      <span style={{fontSize:'11px',background:'#E0F2FE',color:'#0369A1',padding:'2px 8px',borderRadius:'10px',fontWeight:'600'}}>Public</span>
                    )}
                    {r.accessible&&<span style={{fontSize:'13px'}}>♿</span>}
                    {r.has_baby_changing&&<span style={{fontSize:'13px'}}>🍼</span>}
                  </div>
                  <p style={{fontSize:'13px',color:'#999',margin:'0 0 8px',paddingLeft:'17px'}}>{r.address}</p>
                  {r.opt_out&&<div style={{background:'#FEE2E2',borderRadius:'8px',padding:'6px 12px',marginLeft:'17px',marginBottom:'6px',display:'inline-flex',alignItems:'center',gap:'6px'}}><span>🚫</span><span style={{fontSize:'13px',fontWeight:'700',color:'#DC2626'}}>{lang === 'es' ? 'Baño no disponible al público' : 'Restroom not available to the public'}</span></div>}
                  <div style={{display:'flex',gap:'8px',alignItems:'center',paddingLeft:'17px',flexWrap:'wrap'}}>
                    {r.score>0&&r.stars>0&&!r.source&&<span style={{fontSize:'13px',color:'#D97706',fontWeight:'500'}}>{'★'.repeat(r.stars||0)}{'☆'.repeat(5-(r.stars||0))} {r.score}</span>}
                    {r.discovery_only ? (
                      <span style={{fontSize:'12px',color:'#64748B',fontWeight:'500'}}>
                        {lang === 'es' ? 'Detalles de acceso aún no agregados' : 'Access details not added yet'}
                      </span>
                    ) : r.category_group === 'public_restroom' ? (
                      <span style={{fontSize:'12px',background:'#E0F2FE',color:'#0369A1',padding:'3px 9px',borderRadius:'10px',fontWeight:'600'}}>
                        {lang === 'es' ? 'Baño público' : 'Public restroom'}
                      </span>
                    ) : r.verified ? (
                      <span style={{fontSize:'12px',background:'#D1FAE5',color:'#065F46',padding:'3px 9px',borderRadius:'10px',fontWeight:'600'}}>
                        {lang === 'es' ? 'Verificado' : 'Verified'}
                      </span>
                    ) : r.has_code ? (
                      <span style={{fontSize:'12px',background:'#E1F5EE',color:'#085041',padding:'3px 9px',borderRadius:'10px',fontWeight:'600'}}>
                        {lang === 'es' ? 'Código disponible' : 'Code available'}
                      </span>
                    ) : (() => {
                      const badge = getAccessListLabel(r)
                      const hasInfo = restroomHasAccessInfo(r)
                      if (hasInfo) {
                        return (
                          <>
                            <span style={{fontSize:'12px',background:badge.bg,color:badge.color,padding:'3px 9px',borderRadius:'10px',fontWeight:'600'}}>{badge.label}</span>
                            {r.pin_updated_at&&<span style={{fontSize:'11px',color:'#888'}}>{formatUpdatedAt(r.pin_updated_at)}</span>}
                          </>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0,marginLeft:'12px',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'6px'}}>
                  <p style={{fontSize:'15px',fontWeight:'700',color:'#0A2E1F',margin:'0 0 2px'}}>{formatDist(r.distance)}</p>
                  <p style={{fontSize:'12px',color:'#bbb',margin:0}}>away</p>
                  <button
                    type="button"
                    disabled={openingCardId === String(r.id)}
                    onClick={e=>handleEditOpen(r,e,'update')}
                    style={{background:'#f5f5f5',border:'none',borderRadius:'6px',padding:'5px 9px',fontSize:'12px',fontWeight:'600',color:'#555',cursor:openingCardId === String(r.id)?'wait':'pointer',opacity:openingCardId === String(r.id)?0.7:1}}
                  >
                    {openingCardId === String(r.id) ? t.openingRestroom : t.edit}
                  </button>
                </div>
              </div>
            </div>

            {selected?.id===r.id&&(
              <div style={{borderTop:'1px solid #f5f5f5',padding:'14px 16px',background:'#fafafa'}}>
                {r.nearbyEV && (
                  <button
                    type="button"
                    onClick={e=>{e.stopPropagation();openEVDirections(r)}}
                    style={{
                      width:'100%',
                      display:'flex',
                      alignItems:'center',
                      gap:'10px',
                      background:'#ECFDF5',
                      border:'1px solid #86EFAC',
                      borderRadius:'10px',
                      padding:'10px 12px',
                      marginBottom:'10px',
                      cursor:'pointer',
                      textAlign:'left',
                    }}
                  >
                    <span style={{width:'28px',height:'28px',borderRadius:'50%',background:'#16A34A',border:'2px solid white',display:'inline-flex',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>
                      <EVChargingIcon size={17} />
                    </span>
                    <span style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                      <strong style={{fontSize:'13px',color:'#166534'}}>
                        {lang === 'es' ? 'Carga de vehículos eléctricos cerca' : 'EV charging nearby'}
                      </strong>
                      <span style={{fontSize:'12px',color:'#15803D'}}>
                        {r.nearbyEV.operatorName || (lang === 'es' ? 'Carga EV' : 'EV charging')} · {formatEVDistance(r.nearbyEV.distanceMeters)} {lang === 'es' ? 'de distancia' : 'away'}
                      </span>
                    </span>
                  </button>
                )}
                {r.opt_out?(
                  <div style={{flex:1,background:'#FEE2E2',borderRadius:'9px',padding:'12px',textAlign:'center',fontSize:'14px',color:'#DC2626',fontWeight:'600'}}>🚫 This business has opted out of FlushPin</div>
                ):(
                  <div onClick={e=>e.stopPropagation()} style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                    <div style={{display:'flex',gap:'8px'}}>
                      <button
                        type="button"
                        disabled={openingCardId === String(r.id)}
                        onClick={e=>handleAccessAction(r,e)}
                        style={{flex:1,background:'#1D9E75',color:'white',border:'none',padding:'12px',borderRadius:'9px',fontSize:'15px',fontWeight:'700',cursor:openingCardId === String(r.id)?'wait':'pointer',opacity:openingCardId === String(r.id)?0.85:1}}
                      >
                        {openingCardId === String(r.id) ? t.openingRestroom : (restroomHasAccessInfo(r)?t.viewAccess:t.shareAccess)}
                      </button>
                      <button onClick={e=>{e.stopPropagation();setRatingTarget({...r,_pinWorked:undefined});setShowRating(true)}} style={{flex:1,background:'#F59E0B',color:'white',border:'none',padding:'12px',borderRadius:'9px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>{t.rate}</button>
                      <button onClick={e=>{e.stopPropagation();openDirections(r)}} style={{flex:1,background:'#0A2E1F',color:'white',border:'none',padding:'12px',borderRadius:'9px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>{t.go}</button>
                    </div>
                    {restroomHasAccessInfo(r) && renderAccessActions(r)}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showPromo&&promoTarget&&(
        <PromoModal restroom={promoTarget} onComplete={()=>{ void completePromoAccess() }}/>
      )}
      {showRating&&ratingTarget&&(<RatingModal restroom={ratingTarget} user={user} onClose={()=>setShowRating(false)} onDone={()=>{setShowRating(false);setSuccessMsg('✅ Thank you!');setTimeout(()=>setSuccessMsg(''),3000);loadData(queryLat,queryLng,searchQuery,false)}} initialPinWorked={ratingTarget?._pinWorked}/>)}

      {showEditForm&&editTarget&&(
        <div onClick={()=>{if(!savingEdit)closeEditForm()}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:50,display:'flex',alignItems:'flex-end'}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'white',borderRadius:'20px 20px 0 0',padding:'24px 20px',width:'100%',maxHeight:'85vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <h2 style={{margin:0,fontSize:'19px',fontWeight:'700',color:'#0A2E1F'}}>{editFormTitle}</h2>
              <button type="button" onClick={()=>{if(!savingEdit)closeEditForm()}} disabled={savingEdit} style={{background:'none',border:'none',fontSize:'26px',cursor:savingEdit?'not-allowed':'pointer',color:'#999',opacity:savingEdit?0.4:1}}>✕</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              {editMode === 'correct' && (
                <p style={{fontSize:'14px',color:'#DC2626',margin:0,fontWeight:'600',lineHeight:1.5}}>{t.correctAccessDesc}</p>
              )}
              <div>
                <label style={labelStyle}>{t.whoCanUse}</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'8px'}}>
                  <button
                    type="button"
                    onClick={toggleCustomersOnly}
                    disabled={editEntry.method === 'locked'}
                    style={{
                      background: editEntry.customersOnly ? '#EEF2FF' : '#f5f5f5',
                      color: editEntry.customersOnly ? '#4338CA' : '#555',
                      border: editEntry.customersOnly ? '2px solid #6366F1' : '2px solid transparent',
                      padding:'10px 12px',
                      borderRadius:'10px',
                      fontSize:'13px',
                      fontWeight:'600',
                      cursor: editEntry.method === 'locked' ? 'not-allowed' : 'pointer',
                      opacity: editEntry.method === 'locked' ? 0.45 : 1,
                    }}
                  >
                    🧾 {t.chipCustomers}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>{t.howDoesAccess}</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'8px'}}>
                  {localizedMethodChips.map(chip=>(
                    <button key={chip.id} type="button" onClick={()=>selectAccessMethod(chip.id)} style={{background:editEntry.method===chip.id?'#E1F5EE':'#f5f5f5',color:editEntry.method===chip.id?'#085041':'#555',border:editEntry.method===chip.id?'2px solid #1D9E75':'2px solid transparent',padding:'10px 12px',borderRadius:'10px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>{chip.emoji} {chip.label}</button>
                  ))}
                </div>
              </div>
              {editEntry.method==='keypad_code'&&(
                <div><label style={labelStyle}>{t.accessPinLabel}</label><input style={inputStyle} placeholder={t.accessPinPlaceholder} value={editEntry.pin} onChange={e=>setEditEntry(p=>({...p,pin:e.target.value}))}/></div>
              )}
              {editMode !== 'correct' && (
                <p style={{fontSize:'13px',color:'#888',margin:0,lineHeight:1.5}}>{t.correctAccessDesc}</p>
              )}
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <input type="checkbox" id="acc-edit" checked={editEntry.accessible} onChange={e=>setEditEntry(p=>({...p,accessible:e.target.checked}))} style={{width:'18px',height:'18px',cursor:'pointer'}}/>
                <label htmlFor="acc-edit" style={{fontSize:'15px',color:'#555',cursor:'pointer'}}>{t.wheelchair}</label>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <input type="checkbox" id="baby-edit" checked={!!editEntry.hasBabyChanging} onChange={e=>setEditEntry(p=>({...p,hasBabyChanging:e.target.checked}))} style={{width:'18px',height:'18px',cursor:'pointer'}}/>
                <label htmlFor="baby-edit" style={{fontSize:'15px',color:'#555',cursor:'pointer'}}>{lang === 'es' ? '🍼 Cambiador de bebés' : '🍼 Baby changing station'}</label>
              </div>
              {editError&&<p style={{fontSize:'14px',color:'#DC2626',margin:0,fontWeight:'600'}}>{editError}</p>}
              <button type="button" onClick={handleEditSave} disabled={savingEdit} style={{background:savingEdit?'#9CA3AF':'#1D9E75',color:'white',border:'none',padding:'16px',borderRadius:'10px',fontSize:'16px',fontWeight:'700',cursor:savingEdit?'wait':'pointer'}}>{savingEdit?t.publishing:t.publishNow}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
