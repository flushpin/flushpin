'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useLang } from '@/lib/LanguageContext'
import ContributionThankYouModal from '@/components/ContributionThankYouModal'
import {
  buildMapHrefFromDetailParams,
  parseMapAccessIntent,
} from '@/lib/mapRestroomNavigation'
import {
  Accessibility,
  Baby,
  Check,
  ChevronLeft,
  ExternalLink,
  KeyRound,
  Lock,
  Navigation,
  Share2,
  Ticket,
  Users,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { directionsLinks, isIOS, type AccessDisplay } from '@/lib/restroomAccess'
import {
  requestAuthorizedRestroomAccess,
  type AccessRpcClient,
} from '@/lib/restroomAccessSecurity'
import {
  openExternalOffer,
  resolveBrandPromotion,
  type BrandPromotion,
} from '@/lib/brandPromotions'
import {
  buildRestroomAttributes,
  explanationForAttributes,
  lastConfirmedLabel,
  type RestroomAttribute,
} from '@/lib/restroomDetailUx'
import {
  RESTROOM_AVAILABILITY_OPTIONS,
  type RestroomAvailability,
  type TriBool,
} from '@/lib/restroomAmenities'
import styles from './page.module.css'

type Phase =
  | 'idle'
  | 'checking'
  | 'need-login'
  | 'loading'
  | 'done'
  | 'error'
  | 'add'
  | 'adding'
  | 'added'

interface Props {
  id: number
  name: string
  address: string | null
  lat: number | null
  lng: number | null
  hasRevealableCode: boolean
  accessType: string | null
  hasCode: boolean | null
  accessible: boolean | null
  hasBabyChanging: boolean | null
  access: AccessDisplay
  confidenceDetail: string
  confidenceLabel: string
  isVerified: boolean
}

function openAuth(mode: 'signin' | 'signup' = 'signin') {
  window.dispatchEvent(new CustomEvent('flushpin:open-auth', { detail: { mode } }))
}

function AttrIcon({ id }: { id: string }) {
  const props = { className: styles.attrIcon, 'aria-hidden': true as const }
  switch (id) {
    case 'accessible':
      return <Accessibility {...props} />
    case 'baby':
      return <Baby {...props} />
    case 'customer_only':
      return <Users {...props} />
    case 'ask_staff':
      return <Users {...props} />
    case 'open':
      return <Lock {...props} />
    default:
      return <KeyRound {...props} />
  }
}

function amenityStatusLabel(value: TriBool): string {
  if (value === true) return 'Confirmed'
  if (value === false) return 'Not reported here'
  return 'Unknown'
}

export default function AccessPanel({
  id,
  name,
  address,
  lat,
  lng,
  hasRevealableCode,
  accessType,
  hasCode,
  accessible: accessibleProp,
  hasBabyChanging: babyProp,
  access,
  confidenceDetail,
  confidenceLabel,
  isVerified,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<Phase>(() => {
    const intent = parseMapAccessIntent(searchParams.get('intent'))
    if (intent === 'share' || intent === 'update' || intent === 'correct') return 'add'
    return 'idle'
  })
  const [code, setCode] = useState<string | null>(null)
  const [openAccess, setOpenAccess] = useState(false)
  const [err, setErr] = useState('')
  const [used, setUsed] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [accessible, setAccessible] = useState<TriBool>(accessibleProp)
  const [hasBabyChanging, setHasBabyChanging] = useState<TriBool>(babyProp)
  const { t } = useLang()
  const [amenityBusy, setAmenityBusy] = useState<'accessible' | 'baby' | 'availability' | null>(null)
  const [amenityError, setAmenityError] = useState('')
  const [showThanks, setShowThanks] = useState(false)
  const [persistedHint, setPersistedHint] = useState(false)
  const [availability, setAvailability] = useState<RestroomAvailability | ''>('')
  const [confirmAvailability, setConfirmAvailability] = useState<RestroomAvailability | null>(null)

  function handleBack() {
    const from = searchParams.get('from')
    if (from === 'map') {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back()
        return
      }
      router.push(buildMapHrefFromDetailParams(searchParams))
      return
    }
    router.push('/map')
  }

  const attributes = useMemo(
    () =>
      buildRestroomAttributes(
        { accessible, has_baby_changing: hasBabyChanging, access_type: accessType, has_code: hasCode },
        access,
      ),
    [accessible, hasBabyChanging, accessType, hasCode, access],
  )
  const primaryAttrs = attributes.slice(0, 4)
  const extraAttrs = attributes.slice(4)
  const explanation = explanationForAttributes(attributes, access)
  const confirmed = lastConfirmedLabel(confidenceDetail)
  const promo = useMemo(() => resolveBrandPromotion(name), [name])
  const revealing = phase === 'done' || phase === 'loading'

  async function requireSession(): Promise<string | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setPhase('need-login')
      return null
    }
    return session.access_token
  }

  async function reportAmenity(body: Record<string, unknown>) {
    const token = await requireSession()
    if (!token) return null
    const res = await fetch('/api/report-amenity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ restroomId: id, ...body }),
    })
    const json = (await res.json()) as {
      error?: string
      confirmMessage?: string
      restroom?: {
        accessible?: boolean | null
        has_baby_changing?: boolean | null
      }
    }
    if (!res.ok) {
      return { ok: false as const, error: json.error || 'Could not save', confirmMessage: json.confirmMessage }
    }
    return { ok: true as const, restroom: json.restroom }
  }

  async function confirmAmenity(kind: 'accessible' | 'baby', value: boolean) {
    setAmenityError('')
    setShowThanks(false)
    setAmenityBusy(kind)
    const body =
      kind === 'accessible'
        ? { accessible: value }
        : { has_baby_changing: value }
    const result = await reportAmenity(body)
    setAmenityBusy(null)
    if (!result) return
    if (!result.ok) {
      setAmenityError(result.error)
      return
    }
    if (result.restroom) {
      if (typeof result.restroom.accessible === 'boolean' || result.restroom.accessible === null) {
        setAccessible(result.restroom.accessible ?? null)
      }
      if (
        typeof result.restroom.has_baby_changing === 'boolean' ||
        result.restroom.has_baby_changing === null
      ) {
        setHasBabyChanging(result.restroom.has_baby_changing ?? null)
      }
    }
    // Modal only after confirmed API success (canonical re-read on server).
    setPersistedHint(true)
    setShowThanks(true)
  }

  async function submitAvailability(option: RestroomAvailability, confirmedFlag = false) {
    const meta = RESTROOM_AVAILABILITY_OPTIONS.find((o) => o.id === option)
    if (meta?.requiresConfirm && !confirmedFlag) {
      setConfirmAvailability(option)
      return
    }
    setConfirmAvailability(null)
    setAmenityError('')
    setShowThanks(false)
    setAmenityBusy('availability')
    const result = await reportAmenity({
      availability: option,
      confirmed: confirmedFlag || !meta?.requiresConfirm,
    })
    setAmenityBusy(null)
    if (!result) return
    if (!result.ok) {
      setAmenityError(result.error)
      return
    }
    setAvailability(option)
    setPersistedHint(true)
    setShowThanks(true)
  }

  async function reveal() {
    setErr('')
    setPhase('checking')
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      setPhase('need-login')
      return
    }

    setPhase('loading')
    const result = await requestAuthorizedRestroomAccess(
      id,
      supabase as unknown as AccessRpcClient,
    )
    if (result.status === 'unauthenticated') {
      setPhase('need-login')
      return
    }
    if (result.status !== 'success') {
      setErr(
        result.status === 'denied'
          ? result.message
          : 'Could not load the access code.',
      )
      setPhase('error')
      return
    }

    const pin = result.pin
    if (!pin || pin.toLowerCase() === 'open') {
      setOpenAccess(true)
      setCode(null)
    } else {
      setCode(pin)
      setOpenAccess(false)
    }
    setPhase('done')
  }

  function openDirections() {
    if (lat == null || lng == null) return
    const links = directionsLinks(lat, lng, name)
    window.open(isIOS() ? links.apple : links.google, '_blank', 'noopener,noreferrer')
  }

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const payload = { title: 'FlushPin', text: `Restroom access at ${name} — FlushPin`, url }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(payload)
      } catch {
        /* cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setErr('Link copied')
        setTimeout(() => setErr(''), 1500)
      } catch {
        /* ignore */
      }
    }
  }

  async function submitCode() {
    setErr('')
    const cleaned = newCode.replace(/\s+/g, '').trim()
    if (!/^[A-Za-z0-9#*-]{2,16}$/.test(cleaned)) {
      setErr('Enter a valid restroom code (2–16 characters).')
      return
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setPhase('need-login')
      return
    }

    setPhase('adding')
    try {
      const res = await fetch('/api/share-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          target: {
            id,
            name,
            address: address ?? '',
            lat: lat ?? 0,
            lng: lng ?? 0,
          },
          entry: {
            method: 'keypad_code',
            pin: cleaned,
            customersOnly: (accessType ?? '').includes('customers_only'),
            accessible: accessible === true,
          },
        }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) {
        setErr(json.error || 'Could not submit the code.')
        setPhase('add')
        return
      }
      setPhase('added')
      setNewCode('')
    } catch {
      setErr('Could not submit the code. Try again.')
      setPhase('add')
    }
  }

  function onPromo(promoItem: BrandPromotion) {
    openExternalOffer(promoItem.url)
  }

  const header = (
    <div className={styles.topBar}>
      <button type="button" className={styles.iconBtn} onClick={handleBack} aria-label="Back to map">
        <ChevronLeft size={22} />
      </button>
      <Link href="/" className={styles.brandMark} aria-label="FlushPin home">
        <Image src="/flushpin-logo-new.png" alt="" width={28} height={28} />
        <span>flushpin</span>
      </Link>
      <button type="button" className={styles.iconBtn} onClick={() => void share()} aria-label="Share">
        <Share2 size={18} />
      </button>
    </div>
  )

  const identity = (
    <header className={styles.identity}>
      <div className={styles.nameRow}>
        <h1 className={styles.name}>{name}</h1>
        {isVerified && (
          <span className={styles.verified} title="Verified" aria-label="Verified">
            <Check size={14} strokeWidth={3} />
          </span>
        )}
      </div>
      {address && <p className={styles.meta}>{address}</p>}
    </header>
  )

  function renderPromoCard() {
    if (!promo || revealing) return null
    return (
      <button
        type="button"
        className={styles.promoCard}
        onClick={() => onPromo(promo)}
        aria-label={`${promo.label} (opens in a new tab)`}
      >
        <span className={styles.promoIcon}>
          <Ticket size={20} />
        </span>
        <span className={styles.promoBody}>
          <p className={styles.promoKicker}>Promotions &amp; Special Offers</p>
          <p className={styles.promoLabel}>{promo.label}</p>
          <p className={styles.promoSupport}>{promo.supportingLine}</p>
        </span>
        <ExternalLink className={styles.promoExternal} size={18} aria-hidden />
      </button>
    )
  }

  function renderAttributes(items: RestroomAttribute[]) {
    if (items.length === 0) return null
    return (
      <div className={styles.attrGrid} role="list" aria-label="Restroom attributes">
        {items.map((attr) => (
          <div key={attr.id} className={styles.attrTile} role="listitem" aria-label={attr.label} title={attr.short}>
            <AttrIcon id={attr.id} />
            <span className={styles.attrLabel} aria-hidden="true">{attr.label}</span>
          </div>
        ))}
      </div>
    )
  }

  function renderPriorityAmenities() {
    return (
      <section className={styles.amenityPanel} aria-label="Key restroom amenities">
        <p className={styles.sectionTitle}>Key amenities</p>
        <div className={styles.amenityActions}>
          <div className={styles.amenityCard}>
            <div className={styles.amenityHead}>
              <Baby className={styles.attrIcon} aria-hidden />
              <div>
                <p className={styles.amenityTitle}>Baby Changing Station</p>
                <p className={styles.amenityStatus}>{amenityStatusLabel(hasBabyChanging)}</p>
              </div>
            </div>
            <div className={styles.amenityButtons}>
              <button
                type="button"
                className={styles.amenityBtn}
                disabled={amenityBusy != null}
                onClick={() => void confirmAmenity('baby', true)}
              >
                {amenityBusy === 'baby' ? 'Saving…' : 'Confirm yes'}
              </button>
              <button
                type="button"
                className={styles.amenityBtnGhost}
                disabled={amenityBusy != null}
                onClick={() => void confirmAmenity('baby', false)}
              >
                No
              </button>
            </div>
          </div>
          <div className={styles.amenityCard}>
            <div className={styles.amenityHead}>
              <Accessibility className={styles.attrIcon} aria-hidden />
              <div>
                <p className={styles.amenityTitle}>Accessible</p>
                <p className={styles.amenityStatus}>{amenityStatusLabel(accessible)}</p>
              </div>
            </div>
            <div className={styles.amenityButtons}>
              <button
                type="button"
                className={styles.amenityBtn}
                disabled={amenityBusy != null}
                onClick={() => void confirmAmenity('accessible', true)}
              >
                {amenityBusy === 'accessible' ? 'Saving…' : 'Confirm yes'}
              </button>
              <button
                type="button"
                className={styles.amenityBtnGhost}
                disabled={amenityBusy != null}
                onClick={() => void confirmAmenity('accessible', false)}
              >
                No
              </button>
            </div>
          </div>
        </div>

        <div className={styles.availabilityBox}>
          <p className={styles.amenityTitle}>Restroom Availability</p>
          <p className={styles.amenityStatus}>
            Report whether a usable restroom exists here. These states stay distinct.
          </p>
          <label className={styles.addLabel} htmlFor="fp-availability">
            Availability
          </label>
          <select
            id="fp-availability"
            className={styles.addInput}
            value={availability}
            disabled={amenityBusy != null}
            onChange={(e) => {
              const value = e.target.value as RestroomAvailability | ''
              setAvailability(value)
              if (value) void submitAvailability(value)
            }}
          >
            <option value="">Select…</option>
            {RESTROOM_AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {confirmAvailability && (
          <div className={styles.confirmBox} role="alertdialog" aria-labelledby="fp-avail-confirm">
            <p id="fp-avail-confirm">
              {
                RESTROOM_AVAILABILITY_OPTIONS.find((o) => o.id === confirmAvailability)
                  ?.confirmMessage
              }
            </p>
            <div className={styles.amenityButtons}>
              <button
                type="button"
                className={styles.amenityBtn}
                onClick={() => void submitAvailability(confirmAvailability, true)}
              >
                Yes, submit
              </button>
              <button
                type="button"
                className={styles.amenityBtnGhost}
                onClick={() => {
                  setConfirmAvailability(null)
                  setAvailability('')
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {amenityError && <p className={styles.error}>{amenityError}</p>}
        {persistedHint && !showThanks && (
          <p className={styles.trustNote}>{t.amenityThanks.persistedHint}</p>
        )}
        {phase === 'need-login' && (
          <p className={styles.signInHint}>Sign in to confirm amenities for other users.</p>
        )}
        <ContributionThankYouModal open={showThanks} onClose={() => setShowThanks(false)} />
      </section>
    )
  }

  function renderManage() {
    return (
      <div className={styles.manage}>
        <p className={styles.manageTitle}>Manage This Restroom</p>
        <p className={styles.manageSupport}>
          Own or manage this location? Request a code update or removal.
        </p>
        <Link href="/business/claim" className={styles.manageLink}>
          Contact FlushPin →
        </Link>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div>
        {header}
        {identity}
        <section className={`${styles.card} ${styles.codeReveal}`} aria-live="polite">
          <div className={styles.keypadBadge} aria-hidden>
            <KeyRound size={26} />
          </div>
          <p className={styles.codeLabel}>Access Code</p>
          {openAccess ? (
            <p className={styles.codeValue} style={{ letterSpacing: '0.02em', fontSize: '1.75rem' }}>
              Open access
            </p>
          ) : (
            <p className={styles.codeValue} aria-label={`Access code ${code}`}>
              {code}
            </p>
          )}
          <p className={styles.codeInstruction}>
            {openAccess
              ? 'No keypad code needed — walk in.'
              : 'Enter this code on the door keypad.'}
          </p>
          <p className={styles.statusLine}>
            <Check size={14} color="#9fe1cb" aria-hidden />
            <span>{confirmed}</span>
            {isVerified && <strong>· Verified</strong>}
          </p>
        </section>

        <button
          type="button"
          className={styles.primary}
          onClick={() => setUsed(true)}
          disabled={used}
          style={{ marginBottom: 14 }}
        >
          <Lock size={18} aria-hidden />
          {used ? 'Thanks — noted' : 'I Used This Code'}
        </button>

        <button
          type="button"
          className={styles.ghost}
          onClick={() => {
            setPhase('add')
            setErr('')
          }}
          style={{ marginBottom: 14 }}
        >
          Code wrong? Update it
        </button>

        {renderPriorityAmenities()}
        {renderManage()}
      </div>
    )
  }

  if (phase === 'add' || phase === 'adding' || phase === 'added') {
    return (
      <div>
        {header}
        {identity}
        <section className={`${styles.card} ${styles.heroCard}`}>
          {phase === 'added' ? (
            <>
              <div className={styles.keypadBadge} aria-hidden>
                <Check size={26} />
              </div>
              <h2 className={styles.emptyTitle}>Code submitted</h2>
              <p className={styles.emptySupport}>
                Thanks — your code helps the next person get in. FlushPin will review community updates.
              </p>
              <button type="button" className={styles.primary} onClick={() => setPhase('idle')}>
                Done
              </button>
            </>
          ) : (
            <>
              <div className={styles.keypadBadge} aria-hidden>
                <KeyRound size={26} />
              </div>
              <h2 className={styles.emptyTitle}>Add the Code</h2>
              <p className={styles.emptySupport}>Help the next person get in.</p>
              <div className={styles.addForm}>
                <label className={styles.addLabel} htmlFor="fp-add-code">
                  Restroom code
                </label>
                <input
                  id="fp-add-code"
                  className={styles.addInput}
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={16}
                  placeholder="••••"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  disabled={phase === 'adding'}
                  aria-describedby="fp-add-help"
                />
                <p id="fp-add-help" className={styles.trustNote}>
                  Shared codes are reviewed and updated by the FlushPin community.
                </p>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => void submitCode()}
                  disabled={phase === 'adding'}
                >
                  {phase === 'adding' ? 'Submitting…' : 'Submit Code'}
                </button>
                <button
                  type="button"
                  className={styles.ghost}
                  onClick={() => {
                    setPhase('idle')
                    setErr('')
                    setNewCode('')
                  }}
                  disabled={phase === 'adding'}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
          {err && phase !== 'added' && <p className={styles.error}>{err}</p>}
        </section>
        {renderManage()}
      </div>
    )
  }

  return (
    <div>
      {header}
      {identity}

      {hasRevealableCode ? (
        <section className={`${styles.card} ${styles.heroCard}`}>
          <div className={styles.keypadBadge} aria-hidden>
            <KeyRound size={26} />
          </div>
          <p className={styles.heroKicker}>Access</p>
          <h2 className={styles.heroTitle}>Access Code</h2>
          <p className={styles.heroSupport}>Current restroom code</p>

          {phase === 'need-login' ? (
            <div className={styles.loginBox}>
              <p>Sign in to view the access code.</p>
              <button type="button" className={styles.primary} onClick={() => openAuth('signin')}>
                Sign In
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.primary}
              onClick={() => void reveal()}
              disabled={phase === 'checking' || phase === 'loading'}
              aria-busy={phase === 'checking' || phase === 'loading'}
            >
              <KeyRound size={18} aria-hidden />
              {phase === 'checking' || phase === 'loading' ? 'Loading…' : 'Show Code'}
            </button>
          )}

          <p className={styles.statusLine}>
            <Check size={14} color="#9fe1cb" aria-hidden />
            <span>{confirmed}</span>
            {isVerified && <strong>· {confidenceLabel}</strong>}
          </p>
          {phase === 'need-login' && (
            <p className={styles.signInHint}>Your privacy comes first — codes stay behind sign-in.</p>
          )}
          {phase === 'error' && (
            <p className={styles.error}>
              {err || 'Something went wrong.'}{' '}
              <button type="button" className={styles.manageLink} onClick={() => void reveal()}>
                Try again
              </button>
            </p>
          )}
        </section>
      ) : access.icon === 'open' || access.icon === 'staff' || access.icon === 'cart' || access.icon === 'restricted' ? (
        <section className={`${styles.card} ${styles.heroCard}`}>
          <div className={styles.keypadBadge} aria-hidden>
            <KeyRound size={26} />
          </div>
          <h2 className={styles.emptyTitle}>{access.label}</h2>
          <p className={styles.emptySupport}>{access.hint}</p>
          <p className={styles.statusLine}>
            <Check size={14} color="#9fe1cb" aria-hidden />
            <span>{confirmed}</span>
          </p>
          <button
            type="button"
            className={styles.ghost}
            style={{ marginTop: 14 }}
            onClick={() => {
              setErr('')
              setPhase('add')
            }}
          >
            Know a code? Add it
          </button>
        </section>
      ) : (
        <section className={`${styles.card} ${styles.heroCard}`}>
          <div className={styles.keypadBadge} aria-hidden>
            <KeyRound size={26} />
          </div>
          <h2 className={styles.emptyTitle}>No access code yet</h2>
          <p className={styles.emptySupport}>Know the code for this restroom?</p>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              setErr('')
              setPhase('add')
            }}
          >
            Add the Code
          </button>
          <p className={styles.heroSupport} style={{ marginTop: 10, marginBottom: 0 }}>
            Help the next person get in.
          </p>
          <p className={styles.trustNote}>
            Shared codes are reviewed and updated by the FlushPin community.
          </p>
        </section>
      )}

      {renderPriorityAmenities()}

      {primaryAttrs.length > 0 && (
        <>
          <p className={styles.sectionTitle}>Restroom details</p>
          {renderAttributes(primaryAttrs)}
          {extraAttrs.length > 0 && (
            <>
              <button
                type="button"
                className={styles.moreBtn}
                onClick={() => setShowMore((v) => !v)}
                aria-expanded={showMore}
              >
                {showMore ? 'Hide details' : 'More details'}
              </button>
              {showMore && renderAttributes(extraAttrs)}
            </>
          )}
        </>
      )}

      <p className={styles.explain}>{explanation}</p>

      {renderPromoCard()}

      <div className={styles.directions}>
        <button
          type="button"
          className={styles.primary}
          onClick={openDirections}
          disabled={lat == null || lng == null}
        >
          <Navigation size={18} aria-hidden />
          Get Directions
        </button>
      </div>

      {renderManage()}
      {err === 'Link copied' && <p className={styles.trustNote}>Link copied</p>}
    </div>
  )
}
